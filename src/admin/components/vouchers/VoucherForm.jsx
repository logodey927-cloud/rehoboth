import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Alert,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Chip,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ImageUploadField from "./ImageUploadField";
import { getAllServicesAdmin } from "../../../api/api";

const validationSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
  description: yup.string().trim(),
  voucher_type: yup
    .string()
    .oneOf(["promo", "gift", "purchased"], "Invalid voucher type")
    .required("Voucher type is required"),
  discount_type: yup
    .string()
    .when("voucher_type", (voucherType, schema) => {
      if (voucherType === "purchased" || voucherType === "gift") {
        return schema
          .oneOf(["free_service", "full_coverage"], "Only Free Service or Full Coverage allowed")
          .required("Discount type is required");
      }
      if (voucherType === "promo") {
        return schema
          .oneOf(["percent", "free_service"], "Promo vouchers can only be percentage off or free service")
          .required("Discount type is required");
      }
      // Fallback for any other voucher types
      return schema
        .oneOf(["amount", "percent", "free_service", "full_coverage"], "Invalid discount type")
        .required("Discount type is required");
    }),
  discount_value: yup.string().when("discount_type", {
    is: (val) => val !== "free_service" && val !== "full_coverage",
    then: (schema) => schema.required("Discount value is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  purchase_price: yup.number().when("voucher_type", {
    is: (type) => type === "purchased" || type === "gift",
    then: (schema) =>
      schema
        .min(0.01, "Purchase price must be greater than 0")
        .required("Purchase price is required for purchasable vouchers"),
    otherwise: (schema) => schema.nullable(),
  }),
  eligible_services: yup
    .array()
    .of(
      yup
        .string()
        .matches(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          "Must be a valid UUID"
        )
    )
    .nullable(),
  expiry_days: yup.number().when("voucher_type", {
    is: (type) => type === "purchased" || type === "gift",
    then: (schema) => schema.min(1, "Expiry days must be at least 1").required("Expiry days is required for purchasable vouchers"),
    otherwise: (schema) => schema.nullable(),
  }),
  validity_start: yup.string().required("Start date is required"),
  validity_end: yup.string().required("End date is required"),
  allowed_days: yup.mixed().nullable(),
  first_time_only: yup.boolean(),
  usage_limit: yup.number().min(1, "Usage limit must be at least 1"),
  status: yup
    .string()
    .oneOf(["active", "inactive"])
    .required("Status is required"),
  image_front_url: yup
    .string()
    .test(
      "is-url-or-data",
      "Must be a valid URL or uploaded image",
      (value) => {
        if (!value) return true; // Optional field
        // Allow data URLs (base64 images) or valid URLs
        return (
          value.startsWith("data:image/") ||
          yup.string().url().isValidSync(value)
        );
      }
    )
    .nullable(),
});

/**
 * VoucherForm Component
 * Reusable form component for creating and editing vouchers
 *
 * @param {Object} props
 * @param {Object} props.voucher - Existing voucher data (for edit mode)
 * @param {Function} props.onSubmit - Submit handler (receives form data)
 * @param {boolean} props.loading - Whether form is submitting
 * @param {string} props.error - Error message to display
 * @param {boolean} props.showActions - Whether to show submit/cancel buttons (default: true)
 * @param {Function} props.onCancel - Cancel handler
 */
export default function VoucherForm({
  voucher = null,
  onSubmit,
  loading = false,
  error = null,
  showActions = true,
  onCancel,
}) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange", // Validate on change for better UX
    resolver: yupResolver(validationSchema),
    defaultValues: voucher || {
      title: "",
      description: "",
      voucher_type: "promo",
      discount_type: "percent",
      discount_value: "",
      purchase_price: null,
      eligible_services: [],
      expiry_days: 56,
      validity_start: "",
      validity_end: "",
      allowed_days: null,
      first_time_only: false,
      usage_limit: 1,
      status: "active",
      image_front_url: "",
    },
  });

  const discountType = watch("discount_type");
  const voucherType = watch("voucher_type");
  const allowedDaysValue = watch("allowed_days");

  // Enforce discount rules per voucher type and clear purchase price for non-purchased vouchers
  useEffect(() => {
    const enforceFullCoverageOrFreeService = () => {
      if (discountType !== "free_service" && discountType !== "full_coverage") {
        setValue("discount_type", "full_coverage", { shouldValidate: true });
      }
      setValue("discount_value", null, { shouldValidate: true });
    };

    if (voucherType === "purchased") {
      enforceFullCoverageOrFreeService();
    }
    if (voucherType === "promo") {
      if (discountType !== "percent" && discountType !== "free_service") {
        setValue("discount_type", "percent", { shouldValidate: true });
      }
      setValue("purchase_price", null, { shouldValidate: false });
    }
    if (voucherType === "gift") {
      enforceFullCoverageOrFreeService();
    }
  }, [voucherType, discountType, setValue]);

  const [servicesByCategory, setServicesByCategory] = useState({});
  const [servicesLoading, setServicesLoading] = useState(false);

  // State for allowed days UI
  const [useSpecificDays, setUseSpecificDays] = useState(
    () => voucher?.allowed_days !== null && voucher?.allowed_days !== undefined
  );
  const [selectedDays, setSelectedDays] = useState(() => {
    const days = voucher?.allowed_days || allowedDaysValue;
    if (days && typeof days === "object") {
      return Object.keys(days);
    }
    return [];
  });
  const [dayHours, setDayHours] = useState(() => {
    const days = voucher?.allowed_days || allowedDaysValue;
    if (days && typeof days === "object") {
      return days;
    }
    return {};
  });

  // Sync state when voucher prop changes (for edit mode)
  useEffect(() => {
    if (voucher?.allowed_days) {
      const days = voucher.allowed_days;
      if (days && typeof days === "object") {
        setUseSpecificDays(true);
        setSelectedDays(Object.keys(days));
        setDayHours(days);
      }
    }
  }, [voucher]);

  // Fetch services for eligible_services dropdown (for purchasable vouchers)
  useEffect(() => {
    const fetchServices = async () => {
      if (voucherType === "purchased" || voucherType === "gift") {
        try {
          setServicesLoading(true);
          const response = await getAllServicesAdmin();
          if (response.data?.success) {
            // Flatten services and service items
            const allServices = [];
            const byCategory = {};
            const serviceIdMap = new Map(); // Map service.id -> service
            const itemIdMap = new Map(); // Map service_item.id -> item
            
            response.data.services.forEach((service) => {
              const category = service.category || "Other";
              
              // Initialize category if not exists
              if (!byCategory[category]) {
                byCategory[category] = [];
              }
              
              // Store service in map
              serviceIdMap.set(service.id, service);
              
              // Add service itself (use service.id)
              const serviceOption = {
                id: service.id,
                name: service.title,
                category: category,
                type: "service",
              };
              allServices.push(serviceOption);
              byCategory[category].push(serviceOption);
              
              // Add service items (use service_item.id directly, not composite ID)
              if (service.items && service.items.length > 0) {
                service.items.forEach((item) => {
                  // Store item in map
                  itemIdMap.set(item.id, { ...item, service });
                  
                  const itemOption = {
                    id: item.id, // Use actual service_item.id, not composite
                    name: `${service.title} - ${item.name}`,
                    category: category,
                    service_id: service.id,
                    service_item_id: item.id,
                    type: "item",
                    parentService: service.title,
                  };
                  allServices.push(itemOption);
                  byCategory[category].push(itemOption);
                });
              }
            });
            
            setServicesByCategory(byCategory);
            
            // Normalize eligible_services from voucher if editing
            if (voucher?.eligible_services && Array.isArray(voucher.eligible_services)) {
              const currentValue = watch("eligible_services") || [];
              const validIds = new Set(allServices.map(s => s.id));
              
              // Normalize IDs: handle old composite IDs and filter invalid ones
              const normalizedIds = voucher.eligible_services
                .map((raw) => {
                  // Support object shapes { id } or { service_item_id }
                  if (raw && typeof raw === "object") {
                    if (raw.service_item_id) return raw.service_item_id;
                    if (raw.id) return raw.id;
                  }
                  const id = raw;
                  if (!id || typeof id !== "string") {
                    return null;
                  }
                  
                  // If it's a composite ID like "serviceId_itemId", extract the itemId
                  // Check if it contains underscore and is not a valid UUID
                  if (id.includes("_") && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    const parts = id.split("_");
                    if (parts.length >= 2) {
                      // Try the last part as itemId (in case of multiple underscores)
                      const possibleItemId = parts[parts.length - 1];
                      // Check if this itemId exists in our list
                      if (validIds.has(possibleItemId)) {
                        return possibleItemId;
                      }
                      // Also check if it's a valid UUID format
                      if (possibleItemId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                        // It's a UUID but might not be in our list (deleted item)
                        return null; // Filter it out
                      }
                    }
                    return null; // Invalid composite ID
                  }
                  
                  // If it's a valid UUID that exists in our list, keep it
                  if (validIds.has(id)) {
                    return id;
                  }
                  
                  // If it's a valid UUID format but not in our list, filter it out (deleted service/item)
                  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    return null; // Valid UUID but not in current services
                  }
                  
                  return null; // Invalid ID, filter it out
                })
                .filter(Boolean); // Remove nulls
              
              // Only update if the normalized IDs differ from current value
              if (normalizedIds.length !== currentValue.length || 
                  !normalizedIds.every(id => currentValue.includes(id))) {
                setValue("eligible_services", normalizedIds, { shouldValidate: false });
              }
            }
          }
        } catch (err) {
          // Error fetching services - silently fail
        } finally {
          setServicesLoading(false);
        }
      }
    };
    fetchServices();
  }, [voucherType, voucher?.eligible_services, setValue, watch]);

  // Helper function to build allowed_days object
  const buildAllowedDays = (days, hours) => {
    if (days.length === 0) {
      return null;
    }
    const allowedDaysObj = {};
    days.forEach((day) => {
      if (hours[day] && hours[day].length > 0) {
        allowedDaysObj[day] = hours[day];
      }
    });
    return Object.keys(allowedDaysObj).length > 0 ? allowedDaysObj : null;
  };

  const handleFormSubmit = (data, event) => {
    // Prevent default form submission
    if (event) {
      event.preventDefault();
    }

    // allowed_days is already an object from the UI, no need to parse
    let allowedDays = data.allowed_days;
    if (
      !allowedDays ||
      (typeof allowedDays === "object" && Object.keys(allowedDays).length === 0)
    ) {
      allowedDays = null;
    }

    // Format dates
    const isPurchasableType = data.voucher_type === "purchased" || data.voucher_type === "gift";
    const formattedData = {
      ...data,
      validity_start: data.validity_start
        ? dayjs(data.validity_start).toISOString()
        : null,
      validity_end: data.validity_end
        ? dayjs(data.validity_end).toISOString()
        : null,
      discount_value: data.discount_value || (data.discount_type === "full_coverage" ? "100" : null),
      purchase_price: isPurchasableType ? (data.purchase_price ?? null) : undefined,
      eligible_services: data.eligible_services && data.eligible_services.length > 0 ? data.eligible_services : [],
      expiry_days: data.expiry_days || (isPurchasableType ? 56 : null),
      allowed_days: allowedDays,
      image_front_url: data.image_front_url || null,
    };

    // Remove undefined fields so we don't send them to the API
    Object.keys(formattedData).forEach((key) => {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });

    if (onSubmit) {
      onSubmit(formattedData);
    }
  };

  // Handle form submission errors
  const onError = (errors) => {
    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit, onError)}
        noValidate
        sx={{ width: "100%" }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {/* Display validation errors summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Please fix the following errors:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <Typography variant="body2">
                    <strong>{field.replace(/_/g, " ")}:</strong>{" "}
                    {error?.message || "Invalid value"}
                  </Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Basic Information
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    required
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="voucher_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.voucher_type}>
                    <InputLabel>Voucher Type</InputLabel>
                    <Select
                      {...field}
                      label="Voucher Type"
                      sx={{ borderRadius: 0 }}
                    >
                      <MenuItem value="promo">Promotional</MenuItem>
                      <MenuItem value="gift">Gift Card</MenuItem>
                      <MenuItem value="purchased">Purchased</MenuItem>
                    </Select>
                    {errors.voucher_type && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.75 }}
                      >
                        {errors.voucher_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status" sx={{ borderRadius: 0 }}>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    {errors.status && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.75 }}
                      >
                        {errors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Purchase Information - purchasable vouchers (purchased or gift) */}
        {(voucherType === "purchased" || voucherType === "gift") && (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Purchase Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="purchase_price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Purchase Price (£)"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.purchase_price}
                      helperText={errors.purchase_price?.message || "Amount customer pays upfront to purchase this voucher"}
                      inputProps={{
                        min: 0.01,
                        step: 0.01,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="expiry_days"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expiry Days"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.expiry_days}
                      helperText={errors.expiry_days?.message || "Days from purchase date until voucher expires (default: 56 = 8 weeks)"}
                      inputProps={{
                        min: 1,
                        step: 1,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, fontWeight: 500 }}
                >
                  Eligible Services
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 2, display: "block" }}
                >
                  Select services this voucher can be used for. Leave all unchecked for all services.
                </Typography>

                <Controller
                  name="eligible_services"
                  control={control}
                  render={({ field: { value, onChange } }) => {
                    const selectedIds = value || [];
                    const hasSelection = selectedIds.length > 0;

                    const handleToggle = (serviceId) => {
                      const newValue = selectedIds.includes(serviceId)
                        ? selectedIds.filter((id) => id !== serviceId)
                        : [...selectedIds, serviceId];
                      onChange(newValue);
                    };

                    const handleSelectAll = (category) => {
                      const categoryServices = servicesByCategory[category] || [];
                      const categoryIds = categoryServices.map((s) => s.id);
                      const allSelected = categoryIds.every((id) =>
                        selectedIds.includes(id)
                      );

                      if (allSelected) {
                        // Deselect all in category
                        onChange(
                          selectedIds.filter((id) => !categoryIds.includes(id))
                        );
                      } else {
                        // Select all in category
                        const newIds = [
                          ...selectedIds.filter((id) => !categoryIds.includes(id)),
                          ...categoryIds,
                        ];
                        onChange(newIds);
                      }
                    };

                    if (servicesLoading) {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                          }}
                        >
                          <CircularProgress />
                        </Box>
                      );
                    }

                    const categories = Object.keys(servicesByCategory).sort();

                    return (
                      <Box
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          maxHeight: "500px",
                          overflowY: "auto",
                          backgroundColor: "background.paper",
                        }}
                      >
                        {categories.length === 0 ? (
                          <Box sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              No services available
                            </Typography>
                          </Box>
                        ) : (
                          categories.map((category) => {
                            const categoryServices =
                              servicesByCategory[category] || [];
                            const categoryIds = categoryServices.map(
                              (s) => s.id
                            );
                            const allSelected = categoryIds.every((id) =>
                              selectedIds.includes(id)
                            );
                            const someSelected = categoryIds.some((id) =>
                              selectedIds.includes(id)
                            );

                            return (
                              <Accordion
                                key={category}
                                defaultExpanded={false}
                                sx={{
                                  boxShadow: "none",
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  "&:before": { display: "none" },
                                  "&.Mui-expanded": {
                                    margin: 0,
                                  },
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  sx={{
                                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                                    minHeight: 48,
                                    "&.Mui-expanded": {
                                      minHeight: 48,
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      width: "100%",
                                      pr: 2,
                                    }}
                                  >
                                    <Checkbox
                                      checked={allSelected}
                                      indeterminate={someSelected && !allSelected}
                                      onChange={() =>
                                        handleSelectAll(category)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      sx={{ p: 0.5, mr: 1 }}
                                    />
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {category}
                                    </Typography>
                                    <Chip
                                      label={`${categoryServices.length} ${
                                        categoryServices.length === 1
                                          ? "item"
                                          : "items"
                                      }`}
                                      size="small"
                                      sx={{
                                        ml: "auto",
                                        height: 20,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                                  <List dense sx={{ py: 0 }}>
                                    {categoryServices.map((service) => (
                                      <ListItem
                                        key={service.id}
                                        sx={{
                                          py: 0.5,
                                          px: 2,
                                          "&:hover": {
                                            backgroundColor: "action.hover",
                                          },
                                        }}
                                      >
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={selectedIds.includes(
                                                service.id
                                              )}
                                              onChange={() =>
                                                handleToggle(service.id)
                                              }
                                              sx={{ borderRadius: 0 }}
                                            />
                                          }
                                          label={
                                            <Box>
                                              <Typography variant="body2">
                                                {service.name}
                                              </Typography>
                                              {service.type === "item" && (
                                                <Typography
                                                  variant="caption"
                                                  color="text.secondary"
                                                >
                                                  {service.parentService}
                                                </Typography>
                                              )}
                                            </Box>
                                          }
                                          sx={{ width: "100%", m: 0 }}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </AccordionDetails>
                              </Accordion>
                            );
                          })
                        )}

                        {hasSelection && (
                          <Box
                            sx={{
                              p: 2,
                              borderTop: "1px solid",
                              borderColor: "divider",
                              backgroundColor: "action.selected",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedIds.length} service
                              {selectedIds.length !== 1 ? "s" : ""} selected
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => onChange([])}
                              sx={{
                                mt: 1,
                                textTransform: "none",
                                fontSize: "0.75rem",
                              }}
                            >
                              Clear all
                            </Button>
                          </Box>
                        )}
                      </Box>
                    );
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Discount Information
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }} >
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    required
                    error={!!errors.discount_type}
                  >
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      {...field}
                      label="Discount Type"
                      sx={{ borderRadius: 0 }}
                    >
                      {voucherType === "promo" && (
                        <MenuItem value="percent">Percentage Off</MenuItem>
                      )}
                      {voucherType === "promo" && (
                        <MenuItem value="free_service">Free Service</MenuItem>
                      )}
                      {(voucherType === "gift" || voucherType === "purchased") && (
                        <MenuItem value="free_service">Free Service</MenuItem>
                      )}
                      {(voucherType === "gift" || voucherType === "purchased") && (
                        <MenuItem value="full_coverage">Full Coverage (100% Off)</MenuItem>
                      )}
                    </Select>
                    {errors.discount_type && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.75 }}
                      >
                        {errors.discount_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {discountType !== "free_service" && discountType !== "full_coverage" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="discount_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={
                        discountType === "percent"
                          ? "Percentage (%)"
                          : "Amount (£)"
                      }
                      type="number"
                      fullWidth
                      required
                      error={!!errors.discount_value}
                      helperText={errors.discount_value?.message}
                      inputProps={{
                        min: 0,
                        step: discountType === "percent" ? 1 : 0.01,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                    />
                  )}
                />
              </Grid>
            )}
            {discountType === "full_coverage" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  value="100"
                  label="Discount Value"
                  fullWidth
                  disabled
                  helperText="Full coverage means 100% discount (customer pays nothing at booking)"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Validity & Restrictions
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="validity_start"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Start Date"
                    value={value ? dayjs(value) : null}
                    onChange={(date) =>
                      onChange(date ? date.toISOString() : "")
                    }
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        error: !!errors.validity_start,
                        helperText: errors.validity_start?.message,
                        sx: { 
                          "& .MuiOutlinedInput-root": { borderRadius: 0 },
                          "& .MuiIconButton-root": { 
                            color: "#000 !important",
                            "&:hover": { color: "#000 !important" },
                          },
                        },
                      },
                      openPickerButton: {
                        sx: { 
                          color: "#000 !important",
                          "&:hover": { color: "#000 !important" },
                        },
                      },
                      day: {
                        sx: {
                          "&:hover": {
                            color: "#000 !important",
                            backgroundColor: "rgba(0, 0, 0, 0.04) !important",
                          },
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="validity_end"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="End Date"
                    value={value ? dayjs(value) : null}
                    onChange={(date) =>
                      onChange(date ? date.toISOString() : "")
                    }
                    minDate={
                      watch("validity_start")
                        ? dayjs(watch("validity_start"))
                        : dayjs()
                    }
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        error: !!errors.validity_end,
                        helperText: errors.validity_end?.message,
                        sx: { 
                          "& .MuiOutlinedInput-root": { borderRadius: 0 },
                          "& .MuiIconButton-root": { 
                            color: "#000 !important",
                            "&:hover": { color: "#000 !important" },
                          },
                        },
                      },
                      openPickerButton: {
                        sx: { 
                          color: "#000 !important",
                          "&:hover": { color: "#000 !important" },
                        },
                      },
                      day: {
                        sx: {
                          "&:hover": {
                            color: "#000 !important",
                            backgroundColor: "rgba(0, 0, 0, 0.04) !important",
                          },
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="usage_limit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Usage Limit"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                    error={!!errors.usage_limit}
                    helperText={errors.usage_limit?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="first_time_only"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        sx={{ borderRadius: 0 }}
                      />
                    }
                    label="First-time clients only"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                Allowed Days & Times
              </Typography>

              <Controller
                name="allowed_days"
                control={control}
                render={({ field }) => (
                  <Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Availability</InputLabel>
                      <Select
                        value={useSpecificDays ? "specific" : "all"}
                        onChange={(e) => {
                          const isSpecific = e.target.value === "specific";
                          setUseSpecificDays(isSpecific);
                          if (!isSpecific) {
                            setSelectedDays([]);
                            setDayHours({});
                            field.onChange(null);
                          } else {
                            // Initialize with empty state
                            field.onChange(null);
                          }
                        }}
                        label="Availability"
                        sx={{ borderRadius: 0 }}
                      >
                        <MenuItem value="all">Any day/time (default)</MenuItem>
                        <MenuItem value="specific">
                          Specific days and times
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {useSpecificDays && (
                      <Box
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 2,
                          backgroundColor: "background.paper",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 2, fontWeight: 600 }}
                        >
                          Select Days
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mb: 3,
                          }}
                        >
                          {[
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ].map((day) => {
                            const dayNames = {
                              Mon: "Monday",
                              Tue: "Tuesday",
                              Wed: "Wednesday",
                              Thu: "Thursday",
                              Fri: "Friday",
                              Sat: "Saturday",
                              Sun: "Sunday",
                            };
                            const isSelected = selectedDays.includes(day);
                            return (
                              <Chip
                                key={day}
                                label={dayNames[day]}
                                onClick={() => {
                                  let newSelectedDays, newDayHours;
                                  if (isSelected) {
                                    newSelectedDays = selectedDays.filter(
                                      (d) => d !== day
                                    );
                                    newDayHours = { ...dayHours };
                                    delete newDayHours[day];
                                  } else {
                                    newSelectedDays = [...selectedDays, day];
                                    newDayHours = { ...dayHours, [day]: [] };
                                  }
                                  setSelectedDays(newSelectedDays);
                                  setDayHours(newDayHours);
                                  field.onChange(
                                    buildAllowedDays(
                                      newSelectedDays,
                                      newDayHours
                                    )
                                  );
                                }}
                                color={isSelected ? "primary" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{ borderRadius: 0, cursor: "pointer" }}
                              />
                            );
                          })}
                        </Box>

                        {selectedDays.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 2, fontWeight: 600 }}
                            >
                              Select Times (24-hour format)
                            </Typography>
                            {selectedDays.map((day) => {
                              const dayNames = {
                                Mon: "Monday",
                                Tue: "Tuesday",
                                Wed: "Wednesday",
                                Thu: "Thursday",
                                Fri: "Friday",
                                Sat: "Saturday",
                                Sun: "Sunday",
                              };
                              const hours = dayHours[day] || [];
                              const availableHours = Array.from(
                                { length: 11 },
                                (_, i) => i + 8
                              ); // 8-18

                              return (
                                <Box key={day} sx={{ mb: 2 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ mb: 1, fontWeight: 500 }}
                                  >
                                    {dayNames[day]}:
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 1,
                                    }}
                                  >
                                    {availableHours.map((hour) => {
                                      const isSelected = hours.includes(hour);
                                      return (
                                        <Chip
                                          key={hour}
                                          label={`${hour}:00`}
                                          onClick={() => {
                                            const currentHours =
                                              dayHours[day] || [];
                                            let newDayHours;
                                            if (isSelected) {
                                              newDayHours = {
                                                ...dayHours,
                                                [day]: currentHours.filter(
                                                  (h) => h !== hour
                                                ),
                                              };
                                            } else {
                                              newDayHours = {
                                                ...dayHours,
                                                [day]: [
                                                  ...currentHours,
                                                  hour,
                                                ].sort((a, b) => a - b),
                                              };
                                            }
                                            setDayHours(newDayHours);
                                            field.onChange(
                                              buildAllowedDays(
                                                selectedDays,
                                                newDayHours
                                              )
                                            );
                                          }}
                                          color={
                                            isSelected ? "secondary" : "default"
                                          }
                                          variant={
                                            isSelected ? "filled" : "outlined"
                                          }
                                          size="small"
                                          sx={{
                                            borderRadius: 0,
                                            cursor: "pointer",
                                          }}
                                        />
                                      );
                                    })}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Images
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6}}>
              <Controller
                name="image_front_url"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    label="Voucher Image (Front)"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={!!errors.image_front_url}
                    helperText={
                      errors.image_front_url?.message ||
                      "This front image is the one that will be sent to the customer with their voucher email/code."
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {showActions && (
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}
          >
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                sx={{ borderRadius: 0 }}
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
              sx={{
                borderRadius: 0,
                backgroundColor: "secondary.main",
                "&:hover": {
                  backgroundColor: "secondary.dark",
                },
              }}
            >
              {voucher ? "Update Voucher" : "Create Voucher"}
            </Button>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}
