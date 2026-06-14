import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Alert,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Autocomplete,
  Chip,
  FormHelperText,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { People as PeopleIcon, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ImageUploadField from "../vouchers/ImageUploadField";
import { uploadServiceImage, getAllTeamMembersAdmin } from "../../../api/api";

const validationSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
  description: yup.string().trim().required("Description is required"),
  category: yup.string().trim(),
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
  display_order: yup.number().min(0, "Display order must be 0 or greater"),
  is_active: yup.boolean(),
  benefits: yup.array().of(
    yup.object({
      heading: yup.string().trim(),
      description: yup.string().trim(),
      display_order: yup.number(),
    })
  ),
  items: yup.array().of(
    yup.object({
      name: yup.string().trim().required("Item name is required"),
      display_order: yup.number(),
      durations: yup.array().of(
        yup.object({
          minutes: yup
            .number()
            .required("Duration is required")
            .min(1, "Must be at least 1 minute"),
          price: yup
            .number()
            .required("Price is required")
            .min(0, "Price must be 0 or greater"),
          display_order: yup.number(),
        })
      ),
    })
  ),
});

/**
 * ServiceForm Component
 * Reusable form component for creating and editing services
 */
export default function ServiceForm({
  service = null,
  onSubmit,
  loading = false,
  error = null,
  showActions = true,
  onCancel,
  selectedTeamMembers = [],
  onTeamMembersChange,
}) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState(selectedTeamMembers || []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: service || {
      title: "",
      description: "",
      category: "",
      image_url: "",
      display_order: 0,
      is_active: true,
      benefits: [],
      items: [],
    },
  });

  // Fetch team members on mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Update selected team members when prop changes
  useEffect(() => {
    if (selectedTeamMembers) {
      setSelectedTeamMemberIds(selectedTeamMembers);
    }
  }, [selectedTeamMembers]);

  const fetchTeamMembers = async () => {
    try {
      setTeamMembersLoading(true);
      const response = await getAllTeamMembersAdmin({ is_active: true });
      if (response.data?.success) {
        setTeamMembers(response.data.teamMembers || []);
      }
    } catch (err) {
      // Error fetching team members - silently fail
    } finally {
      setTeamMembersLoading(false);
    }
  };

  // Helper function to format time from 24-hour to 12-hour
  const formatTime12Hour = (time24) => {
    if (!time24) return null;
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // Helper function to get availability summary
  const getAvailabilitySummary = (memberIds) => {
    if (!memberIds || memberIds.length === 0) {
      return { days: [], message: "No team members assigned. Default availability: Monday-Saturday, 8 AM - 10 PM" };
    }

    const selectedMembers = teamMembers.filter((tm) => memberIds.includes(tm.id));
    if (selectedMembers.length === 0) {
      return { days: [], message: "No availability data" };
    }

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayLabels = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };

    const availableDays = [];

    // For each day, find if any team member is available
    for (const day of days) {
      const availableMembers = selectedMembers.filter((member) => {
        const availability = member.availability || {};
        return availability[day]?.enabled === true;
      });

      if (availableMembers.length > 0) {
        // Find earliest start and latest end
        let earliestStart = null;
        let latestEnd = null;

        for (const member of availableMembers) {
          const dayAvailability = member.availability[day];
          if (dayAvailability?.start && dayAvailability?.end) {
            if (!earliestStart || dayAvailability.start < earliestStart) {
              earliestStart = dayAvailability.start;
            }
            if (!latestEnd || dayAvailability.end > latestEnd) {
              latestEnd = dayAvailability.end;
            }
          }
        }

        if (earliestStart && latestEnd) {
          availableDays.push({
            day: dayLabels[day],
            start: formatTime12Hour(earliestStart),
            end: formatTime12Hour(latestEnd),
          });
        }
      }
    }

    if (availableDays.length === 0) {
      return { days: [], message: "No team members have availability set" };
    }

    return { days: availableDays, message: null };
  };

  const handleTeamMembersChange = (newValue) => {
    setSelectedTeamMemberIds(newValue.map((tm) => tm.id));
    if (onTeamMembersChange) {
      onTeamMembersChange(newValue.map((tm) => tm.id));
    }
  };

  const availabilitySummary = getAvailabilitySummary(selectedTeamMemberIds);

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const handleImageUpload = async (file) => {
    const response = await uploadServiceImage(file);
    if (response.data?.success) {
      setValue("image_url", response.data.url);
      return response.data.url;
    }
    throw new Error("Failed to upload image");
  };

  const addBenefit = () => {
    appendBenefit({
      heading: "",
      description: "",
      display_order: benefitFields.length,
    });
  };

  const addItem = () => {
    appendItem({
      name: "",
      display_order: itemFields.length,
      durations: [],
    });
  };

  const addDuration = (itemIndex) => {
    const currentItem = watch(`items.${itemIndex}`);
    const durations = currentItem?.durations || [];
    setValue(`items.${itemIndex}.durations`, [
      ...durations,
      {
        minutes: 60,
        price: 0,
        display_order: durations.length,
      },
    ]);
  };

  const removeDuration = (itemIndex, durationIndex) => {
    const currentItem = watch(`items.${itemIndex}`);
    const durations = currentItem?.durations || [];
    durations.splice(durationIndex, 1);
    setValue(`items.${itemIndex}.durations`, durations);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {/* Sticky Save Button at Top */}
      {showActions && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            bgcolor: "background.paper",
            py: 2,
            mb: 3,
            borderBottom: "1px solid",
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
            {loading ? "Saving..." : "Save Service"}
          </Button>
        </Box>
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title *"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      fullWidth
                      placeholder="e.g., Massages, Facial Treatments"
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              

              <Grid size={{ xs: 12}}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description *"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? true}
                          onChange={field.onChange}
                          sx={{ borderRadius: 0 }}
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Grid>

              

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <ImageUploadField
                      label="Service Image"
                      value={field.value}
                      onChange={field.onChange}
                      onUpload={handleImageUpload}
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Benefits */}
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Benefits / Features
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addBenefit}
                size="small"
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Add Benefit
              </Button>
            </Box>

            {benefitFields.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No benefits added. Click "Add Benefit" to add one.
              </Typography>
            ) : (
              benefitFields.map((field, index) => (
                <Card
                  key={field.id}
                  sx={{
                    mb: 2,
                    borderRadius: 0,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Controller
                          name={`benefits.${index}.heading`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Heading"
                              fullWidth
                              size="small"
                              sx={{ mb: 2, borderRadius: 0 }}
                            />
                          )}
                        />
                        <Controller
                          name={`benefits.${index}.description`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Description"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              sx={{ borderRadius: 0 }}
                            />
                          )}
                        />
                      </Box>
                      <IconButton
                        onClick={() => removeBenefit(index)}
                        sx={{ color: "error.main" }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>

        {/* Service Items */}
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Service Items & Pricing
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                size="small"
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Add Item
              </Button>
            </Box>

            {itemFields.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No items added. Click "Add Item" to add one.
              </Typography>
            ) : (
              itemFields.map((field, itemIndex) => {
                const item = watch(`items.${itemIndex}`);
                const durations = item?.durations || [];

                return (
                  <Card
                    key={field.id}
                    sx={{
                      mb: 3,
                      borderRadius: 0,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Controller
                          name={`items.${itemIndex}.name`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Item Name *"
                              fullWidth
                              size="small"
                              error={!!errors.items?.[itemIndex]?.name}
                              helperText={
                                errors.items?.[itemIndex]?.name?.message
                              }
                              sx={{ borderRadius: 0 }}
                            />
                          )}
                        />
                        <IconButton
                          onClick={() => removeItem(itemIndex)}
                          sx={{ color: "error.main" }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{ ml: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            Durations & Pricing
                          </Typography>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addDuration(itemIndex)}
                            size="small"
                            sx={{ borderRadius: 0, textTransform: "none" }}
                          >
                            Add Duration
                          </Button>
                        </Box>

                        {durations.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic", mb: 2 }}
                          >
                            No durations added. Click "Add Duration" to add
                            pricing options.
                          </Typography>
                        ) : (
                          durations.map((duration, durationIndex) => (
                            <Box
                              key={durationIndex}
                              sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2,
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 0,
                              }}
                            >
                              <Controller
                                name={`items.${itemIndex}.durations.${durationIndex}.minutes`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Duration (minutes)"
                                    type="number"
                                    size="small"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    sx={{ width: 150, borderRadius: 0 }}
                                  />
                                )}
                              />
                              <Controller
                                name={`items.${itemIndex}.durations.${durationIndex}.price`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Price (£)"
                                    type="number"
                                    size="small"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    sx={{ width: 150, borderRadius: 0 }}
                                  />
                                )}
                              />
                              <IconButton
                                onClick={() =>
                                  removeDuration(itemIndex, durationIndex)
                                }
                                sx={{ color: "error.main" }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Paper>
        </Grid>

        {/* Team Member Assignment */}
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
              Team Member Assignment
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Select team members who can perform this service. When customers book this service, 
                  appointments will be automatically assigned to an available team member. If no team 
                  members are assigned, the service will use default availability (Monday-Saturday, 8 AM - 10 PM).
                </Typography>

                <Autocomplete
                  multiple
                  options={teamMembers}
                  getOptionLabel={(option) => option.title || ""}
                  value={teamMembers.filter((tm) => selectedTeamMemberIds.includes(tm.id))}
                  onChange={(event, newValue) => handleTeamMembersChange(newValue)}
                  loading={teamMembersLoading}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Team Members"
                      placeholder="Search and select team members..."
                      size="small"
                      sx={{ borderRadius: 0 }}
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
                          label={option.title}
                          size="small"
                          icon={<PeopleIcon />}
                          sx={{
                            borderRadius: 0,
                            fontSize: "0.813rem",
                            height: "28px",
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
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
                <FormHelperText sx={{ mt: 1, fontSize: "0.75rem" }}>
                  {selectedTeamMemberIds.length === 0
                    ? "No team members selected. Service will use default availability."
                    : `${selectedTeamMemberIds.length} team member(s) selected.`}
                </FormHelperText>
              </Grid>

              {/* Availability Summary */}
              {selectedTeamMemberIds.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: "grey.50",
                      borderRadius: 0,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <AccessTimeIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Combined Availability Summary
                      </Typography>
                    </Box>

                    {availabilitySummary.message ? (
                      <Typography variant="body2" color="text.secondary">
                        {availabilitySummary.message}
                      </Typography>
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Available days and times (union of all selected team members):
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {availabilitySummary.days.map((dayInfo, index) => (
                            <Chip
                              key={index}
                              label={`${dayInfo.day}: ${dayInfo.start} - ${dayInfo.end}`}
                              size="small"
                              sx={{
                                borderRadius: 0,
                                fontSize: "0.75rem",
                                backgroundColor: "rgba(76, 175, 80, 0.1)",
                                color: "rgba(76, 175, 80, 1)",
                                border: "1px solid rgba(76, 175, 80, 0.3)",
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Actions */}
        {showActions && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
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
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                disabled={loading}
                sx={{ borderRadius: 0, textTransform: "none", px: 3 }}
              >
                {loading ? "Saving..." : "Save Service"}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
