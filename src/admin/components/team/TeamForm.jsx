import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  Grid,
  Typography,
  Alert,
  Paper,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ImageUploadField from "../vouchers/ImageUploadField";
import AvailabilitySelector from "./AvailabilitySelector";
import {
  uploadTeamImage,
  getServices,
  getTeamMemberSpecialisations,
  checkEmailAvailability,
  checkUsernameAvailability,
} from "../../../api/api";

const validationSchema = yup.object({
  title: yup.string().trim().required("Full name is required"),
  role: yup.string().trim().required("Role is required"),
  username: yup
    .string()
    .trim()
    .matches(/^[a-z0-9.@-]+$/i, "Username can only contain letters, numbers, dots, @, and hyphens")
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  gender: yup.string().trim().nullable(),
  availability: yup.object().nullable(),
  specialisations: yup.array().nullable(), // Changed from string to array
  description: yup.string().trim().nullable(),
  image_url: yup
    .string()
    .test(
      "is-url-or-data",
      "Must be a valid URL or uploaded image",
      (value) => {
        if (!value) return true; // Optional field
        return (
          value.startsWith("data:image/") ||
          yup.string().url().isValidSync(value)
        );
      }
    )
    .nullable(),
  email: yup
    .string()
    .trim()
    .email("Must be a valid email")
    .required("Email is required"),
  phone: yup.string().trim().nullable(),
  display_order: yup
    .number()
    .typeError("Display order must be a number")
    .min(0, "Display order must be 0 or greater"),
  is_active: yup.boolean(),
});

/**
 * TeamForm Component
 * Reusable form component for creating and editing team members
 */
export default function TeamForm({
  member = null,
  onSubmit,
  loading = false,
  error = null,
  onCancel,
}) {
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedSpecialisations, setSelectedSpecialisations] = useState([]);
  const [emailValidation, setEmailValidation] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const [usernameValidation, setUsernameValidation] = useState({
    checking: false,
    available: null,
    message: "",
  });

  // Function to get category-specific background color
  const getCategoryColor = (category) => {
    if (!category)
      return { bg: "rgba(0, 0, 0, 0.03)", optionBg: "rgba(0, 0, 0, 0.01)" };

    const categoryColors = {
      Massages: {
        bg: "rgba(132, 153, 79, 0.15)",
        optionBg: "rgba(132, 153, 79, 0.05)",
      },
      "Facial Treatments": {
        bg: "rgba(255, 152, 0, 0.15)",
        optionBg: "rgba(255, 152, 0, 0.05)",
      },
      "Waxing Treatments": {
        bg: "rgba(156, 39, 176, 0.15)",
        optionBg: "rgba(156, 39, 176, 0.05)",
      },
      "Manicure & Pedicure": {
        bg: "rgba(233, 30, 99, 0.15)",
        optionBg: "rgba(233, 30, 99, 0.05)",
      },
      "Holistic Spa Treatments": {
        bg: "rgba(3, 169, 244, 0.15)",
        optionBg: "rgba(3, 169, 244, 0.05)",
      },
      Other: {
        bg: "rgba(158, 158, 158, 0.15)",
        optionBg: "rgba(158, 158, 158, 0.05)",
      },
    };

    // Try exact match first
    if (categoryColors[category]) {
      return categoryColors[category];
    }

    // Hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate colors based on hash
    const hue = Math.abs(hash % 360);
    const bg = `hsla(${hue}, 70%, 90%, 0.15)`;
    const optionBg = `hsla(${hue}, 70%, 95%, 0.05)`;

    return { bg, optionBg };
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: member || {
      title: "",
      role: "",
      username: "",
      gender: "",
      availability: {
        monday: { enabled: false, start: null, end: null },
        tuesday: { enabled: false, start: null, end: null },
        wednesday: { enabled: false, start: null, end: null },
        thursday: { enabled: false, start: null, end: null },
        friday: { enabled: false, start: null, end: null },
        saturday: { enabled: false, start: null, end: null },
        sunday: { enabled: false, start: null, end: null },
      },
      specialisations: [],
      description: "",
      image_url: "",
      email: "",
      phone: "",
      display_order: 0,
      is_active: true,
    },
  });

  // Watch email and username for real-time validation
  const emailValue = watch("email");
  const usernameValue = watch("username");

  // Use refs to store debounce timers
  const emailDebounceTimer = useRef(null);
  const usernameDebounceTimer = useRef(null);

  // Email validation function (memoized)
  const validateEmail = useCallback(async (email) => {
    if (!email || email.trim() === "") {
      setEmailValidation({ checking: false, available: null, message: "" });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    setEmailValidation({ checking: true, available: null, message: "" });

    try {
      const response = await checkEmailAvailability(email, member?.id || null);
      if (response.data?.success) {
        setEmailValidation({
          checking: false,
          available: response.data.available,
          message: response.data.message,
        });
      }
    } catch (err) {
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
    }
  }, [member?.id]);

  // Username validation function (memoized)
  const validateUsername = useCallback(async (username) => {
    if (!username || username.trim() === "") {
      setUsernameValidation({ checking: false, available: null, message: "" });
      return;
    }

    // Basic format check
    const usernameRegex = /^[a-z0-9.@-]+$/i;
    if (!usernameRegex.test(username)) {
      setUsernameValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    if (username.length < 3) {
      setUsernameValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // If editing and username hasn't changed, skip availability check
    if (member?.id && member?.username && 
        username.trim().toLowerCase() === String(member.username).trim().toLowerCase()) {
      setUsernameValidation({
        checking: false,
        available: true,
        message: "",
      });
      return;
    }

    setUsernameValidation({ checking: true, available: null, message: "" });

    try {
      const response = await checkUsernameAvailability(
        username,
        member?.id || null
      );
      if (response.data?.success) {
        setUsernameValidation({
          checking: false,
          available: response.data.available,
          message: response.data.message,
        });
      }
    } catch (err) {
      // Don't show error if it's the same username in edit mode
      if (member?.id && member?.username && 
          username.trim().toLowerCase() === String(member.username).trim().toLowerCase()) {
        setUsernameValidation({
          checking: false,
          available: true,
          message: "",
        });
      } else {
        setUsernameValidation({
          checking: false,
          available: null,
          message: "",
        });
      }
    }
  }, [member?.id, member?.username]);

  // Watch for email changes with debouncing
  useEffect(() => {
    if (emailDebounceTimer.current) {
      clearTimeout(emailDebounceTimer.current);
    }

    if (!emailValue || emailValue.trim() === "") {
      setEmailValidation({ checking: false, available: null, message: "" });
      return;
    }

    emailDebounceTimer.current = setTimeout(() => {
      validateEmail(emailValue);
    }, 500);

    return () => {
      if (emailDebounceTimer.current) {
        clearTimeout(emailDebounceTimer.current);
      }
    };
  }, [emailValue, validateEmail]);

  // Watch for username changes with debouncing
  useEffect(() => {
    if (usernameDebounceTimer.current) {
      clearTimeout(usernameDebounceTimer.current);
    }

    if (!usernameValue || usernameValue.trim() === "") {
      setUsernameValidation({ checking: false, available: null, message: "" });
      return;
    }

    usernameDebounceTimer.current = setTimeout(() => {
      validateUsername(usernameValue);
    }, 500);

    return () => {
      if (usernameDebounceTimer.current) {
        clearTimeout(usernameDebounceTimer.current);
      }
    };
  }, [usernameValue, validateUsername]);

  // Update form values when member prop changes (for edit mode)
  useEffect(() => {
    if (member) {
      // Ensure username is properly set (handle null, undefined, or empty string)
      const usernameValue = member.username !== null && member.username !== undefined 
        ? String(member.username).trim() 
        : "";
      
      const formData = {
        title: member.title || "",
        role: member.role || "",
        username: usernameValue,
        gender: member.gender || "",
        availability: member.availability || "",
        specialisations: [],
        description: member.description || "",
        image_url: member.image_url || "",
        email: member.email || "",
        phone: member.phone || "",
        display_order: member.display_order || 0,
        is_active: member.is_active !== undefined ? member.is_active : true,
      };
      
      reset(formData);
      
      // Also explicitly set username using setValue as a fallback
      if (usernameValue) {
        setValue("username", usernameValue, { shouldValidate: false });
      }
      
      // Clear validation states when loading member data
      setEmailValidation({ checking: false, available: null, message: "" });
      setUsernameValidation({ checking: false, available: null, message: "" });
    }
  }, [member, reset, setValue]);

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await getServices();
        if (response.data?.success) {
          // Flatten services and service items into a single list
          const allServices = [];
          response.data.services.forEach((service) => {
            // Add service itself
            allServices.push({
              id: service.id,
              name: service.title,
              type: "service",
              category: service.category,
              service_id: service.id,
              service_item_id: null,
            });

            // Add service items
            if (service.items && service.items.length > 0) {
              service.items.forEach((item) => {
                allServices.push({
                  id: `${service.id}_${item.id}`,
                  name: item.name,
                  type: "item",
                  service_id: service.id,
                  service_item_id: item.id,
                  category: service.category,
                });
              });
            }
          });
          setServices(allServices);
        }
      } catch (err) {
        // Error fetching services - silently fail
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Load existing specialisations when member is provided (edit mode)
  useEffect(() => {
    if (member && member.id && services.length > 0) {
      // Fetch existing specialisations
      const fetchSpecialisations = async () => {
        try {
          const response = await getTeamMemberSpecialisations(member.id);
          if (response.data?.success && response.data.specialisations) {
            // Map specialisations to the format expected by Autocomplete
            const mappedSpecs = response.data.specialisations.map((spec) => {
              const serviceId = spec.service_id;
              const serviceItemId = spec.service_item_id;

              // Find matching service/item in our services list
              const match = services.find((s) => {
                if (serviceItemId) {
                  return (
                    s.service_id === serviceId &&
                    s.service_item_id === serviceItemId
                  );
                } else {
                  return (
                    s.service_id === serviceId && s.service_item_id === null
                  );
                }
              });

              if (match) {
                return match;
              }

              // Fallback if not found in services list
              return {
                id: serviceItemId ? `${serviceId}_${serviceItemId}` : serviceId,
                name:
                  spec.services?.title || spec.service_items?.name || "Unknown",
                type: serviceItemId ? "item" : "service",
                service_id: serviceId,
                service_item_id: serviceItemId,
                category: spec.services?.category || "Other",
              };
            });

            setSelectedSpecialisations(mappedSpecs);
            setValue("specialisations", mappedSpecs);
          }
        } catch (err) {
          // Error fetching specialisations - silently fail
        }
      };

      fetchSpecialisations();
    }
  }, [member, services, setValue]);

  const handleImageUpload = async (file) => {
    const response = await uploadTeamImage(file);
    if (response.data?.success) {
      setValue("image_url", response.data.url);
      return response.data.url;
    }
    throw new Error("Failed to upload image");
  };

  // Wrapper for form submission to check validation
  const handleFormSubmit = async (data) => {
    // Prevent submission if email is not available
    if (emailValue && emailValidation.available === false) {
      return; // Don't submit, error is already shown in the field
    }

    // Prevent submission if username is not available
    if (usernameValue && usernameValidation.available === false) {
      return; // Don't submit, error is already shown in the field
    }

    // If validation is still in progress, wait a moment
    if (emailValidation.checking || usernameValidation.checking) {
      // Wait for validation to complete (debounce is 500ms, so wait 600ms)
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      // Check again after waiting
      if (emailValue && emailValidation.available === false) {
        return;
      }
      if (usernameValue && usernameValidation.available === false) {
        return;
      }
    }

    // All validations passed, proceed with submission
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Role / Title"
                      fullWidth
                      error={!!errors.role}
                      helperText={errors.role?.message}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Username"
                      fullWidth
                      error={
                        !!errors.username ||
                        (usernameValidation.available === false &&
                          !usernameValidation.checking)
                      }
                      helperText={
                        errors.username?.message ||
                        (usernameValidation.checking
                          ? "Checking availability..."
                          : usernameValidation.available === false
                          ? usernameValidation.message
                          : usernameValidation.available === true
                          ? "✓ Username is available"
                          : "Must be unique for each team member")
                      }
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gender (optional)"
                      fullWidth
                      error={!!errors.gender}
                      helperText={errors.gender?.message}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Availability
                </Typography>
                <AvailabilitySelector
                  control={control}
                  errors={errors}
                  name="availability"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Display Order"
                      type="number"
                      fullWidth
                      error={!!errors.display_order}
                      helperText={
                        errors.display_order?.message ||
                        "Controls ordering on team pages"
                      }
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 10 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Specialisations
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontSize: "0.875rem" }}
                >
                  Select services and treatments this team member can perform.
                  This will be used for auto-assignment during appointment
                  booking.
                </Typography>
                <Box sx={{ width: "100%" }}>
                  <Autocomplete
                    multiple
                    options={services}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedSpecialisations}
                    onChange={(event, newValue) => {
                      setSelectedSpecialisations(newValue);
                      setValue("specialisations", newValue);
                    }}
                    loading={servicesLoading}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Services/Treatments"
                        placeholder="Search and select treatments..."
                        size="small"
                        error={!!errors.specialisations}
                        helperText={
                          errors.specialisations?.message ||
                          "Select all services and treatments this team member can perform"
                        }
                        sx={{
                          borderRadius: 0,
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            fontSize: "0.875rem",
                            minHeight: "40px",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                            "& .MuiAutocomplete-input": {
                              padding: "8px 4px 8px 0px !important",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "0.875rem",
                          },
                          "& .MuiFormHelperText-root": {
                            fontSize: "0.75rem",
                            marginTop: "4px",
                          },
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) => (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          width: "100%",
                          pt: 0.5,
                        }}
                      >
                        {value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.id}
                            label={option.name}
                            size="small"
                            sx={{
                              borderRadius: 0,
                              fontSize: "0.813rem",
                              height: "26px",
                              backgroundColor: "rgba(132, 153, 79, 0.1)",
                              color: "rgba(132, 153, 79, 1)",
                              border: "1px solid rgba(132, 153, 79, 0.3)",
                              "& .MuiChip-label": {
                                px: 1.25,
                                fontWeight: 500,
                              },
                              "& .MuiChip-deleteIcon": {
                                fontSize: "1rem",
                                color: "rgba(132, 153, 79, 0.7)",
                                "&:hover": {
                                  color: "rgba(132, 153, 79, 1)",
                                },
                              },
                              "&:hover": {
                                backgroundColor: "rgba(132, 153, 79, 0.15)",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    groupBy={(option) => option.category || "Other"}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => {
                      const category = option.category || "Other";
                      const colors = getCategoryColor(category);
                      return (
                        <Box
                          component="li"
                          {...props}
                          sx={{
                            backgroundColor: colors.optionBg,
                            "&:hover": {
                              backgroundColor: colors.optionBg.replace(
                                "0.05",
                                "0.12"
                              ),
                            },
                            "&[aria-selected='true']": {
                              backgroundColor: colors.optionBg.replace(
                                "0.05",
                                "0.2"
                              ),
                              fontWeight: 500,
                              "&:hover": {
                                backgroundColor: colors.optionBg.replace(
                                  "0.05",
                                  "0.25"
                                ),
                              },
                            },
                          }}
                        >
                          {option.name}
                        </Box>
                      );
                    }}
                    ListboxProps={{
                      style: {
                        maxHeight: 320,
                      },
                    }}
                    PaperComponent={(props) => (
                      <Paper
                        {...props}
                        sx={{
                          borderRadius: 0,
                          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "1px solid",
                          borderColor: "divider",
                          mt: 0.5,
                          width: "100%",
                        }}
                      />
                    )}
                    sx={{
                      mb: 2,
                      width: "100%",
                      display: "block",
                      "& .MuiAutocomplete-root": {
                        width: "100%",
                      },
                      "& .MuiAutocomplete-inputRoot": {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                        paddingLeft: "14px",
                        flexWrap: "wrap",
                        minHeight: "40px",
                        width: "100%",
                      },
                      "& .MuiAutocomplete-endAdornment": {
                        right: "12px",
                      },
                      "& .MuiAutocomplete-option": {
                        fontSize: "0.875rem",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                        minHeight: "42px",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": {
                          borderBottom: "none",
                        },
                      },
                      "& .MuiAutocomplete-groupLabel": {
                        fontSize: "0.813rem",
                        fontWeight: 600,
                        paddingTop: "12px",
                        paddingBottom: "8px",
                        paddingLeft: "16px",
                        color: "text.primary",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid",
                        borderColor: "divider",
                        // Dynamic background color based on category
                        // Note: This is overridden by renderGroup for category-specific colors
                        backgroundColor: "rgba(0, 0, 0, 0.03)",
                      },
                      "& .MuiAutocomplete-loading": {
                        padding: "12px 16px",
                        fontSize: "0.875rem",
                        color: "text.secondary",
                      },
                      "& .MuiAutocomplete-noOptions": {
                        padding: "16px",
                        fontSize: "0.875rem",
                        color: "text.secondary",
                        textAlign: "center",
                      },
                    }}
                    renderGroup={(params) => {
                      const category = params.group || "Other";
                      const colors = getCategoryColor(category);
                      return (
                        <Box key={params.key}>
                          <Box
                            component="div"
                            sx={{
                              fontSize: "0.813rem",
                              fontWeight: 600,
                              paddingTop: "12px",
                              paddingBottom: "8px",
                              paddingLeft: "16px",
                              backgroundColor: colors.bg,
                              color: "text.primary",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              borderBottom: "2px solid",
                              borderColor: "divider",
                            }}
                          >
                            {category}
                          </Box>
                          {params.children}
                        </Box>
                      );
                    }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bio / Description"
                      fullWidth
                      multiline
                      minRows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      sx={{
                        borderRadius: 0,
                        width: "100%",
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Contact & Image */}
        <Grid>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Contact & Image
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email (for notifications)"
                      fullWidth
                      error={
                        !!errors.email ||
                        (emailValidation.available === false &&
                          !emailValidation.checking)
                      }
                      helperText={
                        errors.email?.message ||
                        (emailValidation.checking
                          ? "Checking availability..."
                          : emailValidation.available === false
                          ? emailValidation.message
                          : emailValidation.available === true
                          ? "✓ Email is available"
                          : "")
                      }
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone (optional)"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <ImageUploadField
                      label="Profile Image"
                      value={field.value}
                      onChange={field.onChange}
                      onUpload={handleImageUpload}
                      error={!!errors.image_url}
                      helperText={errors.image_url?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={!!field.value}
                          color="primary"
                        />
                      }
                      label="Active (visible on public team pages)"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Actions */}
      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outlined"
            sx={{ borderRadius: 0, textTransform: "none", px: 3 }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
          sx={{ borderRadius: 0, textTransform: "none", px: 3 }}
        >
          {loading ? "Saving..." : "Save Team Member"}
        </Button>
      </Box>
    </Box>
  );
}
