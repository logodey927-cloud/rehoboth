import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Alert,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ImageUploadField from "../vouchers/ImageUploadField";
import { uploadBlogImage } from "../../../api/api";
import StructuredContentEditor from "./StructuredContentEditor";

const validationSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
  excerpt: yup.string().trim().required("Excerpt is required"),
  content: yup.string().trim().required("Content is required"),
  content_html: yup.string().trim().required("HTML content is required"),
  category: yup.string().trim().required("Category is required"),
  tags: yup.array().of(yup.string()),
  author: yup.string().trim(),
  read_time: yup.number().min(1, "Read time must be at least 1 minute"),
  date: yup.string().required("Date is required"),
  is_featured: yup.boolean(),
  is_published: yup.boolean(),
  featured_image_url: yup
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
  slug: yup.string().trim(),
});

/**
 * BlogForm Component
 * Reusable form component for creating and editing blog posts
 */
export default function BlogForm({
  post = null,
  onSubmit,
  loading = false,
  error = null,
  showActions = true,
  onCancel,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [tagsInput, setTagsInput] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [contentPlain, setContentPlain] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      content_html: "",
      category: "",
      tags: [],
      author: "Team Rehoboth",
      read_time: null,
      date: dayjs().format("YYYY-MM-DD"),
      is_featured: false,
      is_published: true,
      featured_image_url: "",
      slug: "",
    },
  });

  const watchedTitle = watch("title");
  const watchedTags = watch("tags") || [];

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !post) {
      const slug = watchedTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [watchedTitle, post, setValue]);

  // Initialize form when post is loaded
  useEffect(() => {
    if (post) {
      // Reset form with post data
      reset({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        content_html: post.content_html || post.contentHtml || "",
        category: post.category || "",
        tags: post.tags || [],
        author: post.author || "Team Rehoboth",
        read_time: post.read_time || null,
        date: post.date || dayjs().format("YYYY-MM-DD"),
        is_featured: post.is_featured || false,
        is_published: post.is_published !== undefined ? post.is_published : true,
        featured_image_url: post.featured_image_url || post.image || "",
        slug: post.slug || "",
      });
      
      // Set local state for content editor
      setContentHtml(post.content_html || post.contentHtml || "");
      setContentPlain(post.content || "");
      setTagsInput((post.tags || []).join(", "));
    }
  }, [post, reset]);

  const handleImageUpload = async (file) => {
    const response = await uploadBlogImage(file);
    if (response.data?.success) {
      setValue("featured_image_url", response.data.url);
      return response.data.url;
    }
    throw new Error("Failed to upload image");
  };

  const handleTagsChange = (value) => {
    setTagsInput(value);
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setValue("tags", tags);
  };

  const handleContentChange = (value) => {
    setContentHtml(value);
    setValue("content_html", value);

    // Strip HTML tags for plain text content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = value;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    setContentPlain(plainText);
    setValue("content", plainText);
  };

  const handleFormSubmit = async (data) => {
    // Ensure content_html and content are set
    let submitData = {
      ...data,
      content_html: contentHtml || data.content_html,
      content: contentPlain || data.content,
    };

    // If featured_image_url is a data URL, try to upload it first
    // Data URLs can be very large and cause request failures
    if (submitData.featured_image_url && submitData.featured_image_url.startsWith("data:image/")) {
      try {
        // Check data URL size - if too large, remove it and continue
        if (submitData.featured_image_url.length > 5 * 1024 * 1024) { // 5MB
          submitData.featured_image_url = "";
          // Update form value to reflect removal
          setValue("featured_image_url", "");
        } else {
          // Convert data URL to blob
          const response = await fetch(submitData.featured_image_url);
          if (!response.ok) {
            throw new Error("Failed to convert data URL");
          }
          const blob = await response.blob();
          const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
          
          // Upload the image to get a proper URL
          const uploadResponse = await handleImageUpload(file);
          if (uploadResponse) {
            submitData.featured_image_url = uploadResponse;
            // Update form value with the new URL
            setValue("featured_image_url", uploadResponse);
          } else {
            // If upload fails, remove data URL and continue
            submitData.featured_image_url = "";
            setValue("featured_image_url", "");
          }
        }
      } catch (err) {
        // Remove data URL to prevent request failure and continue with submission
        submitData.featured_image_url = "";
        setValue("featured_image_url", "");
        // Note: We continue submission without the image rather than blocking it
        // The user can see the image is missing and re-upload if needed
      }
    }

    onSubmit(submitData);
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
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
                  name="slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug (URL)"
                      fullWidth
                      helperText="Auto-generated from title"
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="excerpt"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Excerpt *"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.excerpt}
                      helperText={errors.excerpt?.message}
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
                      label="Category *"
                      fullWidth
                      select
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      sx={{ borderRadius: 0 }}
                    >
                      <MenuItem value="Wellness">Wellness</MenuItem>
                      <MenuItem value="Skincare">Skincare</MenuItem>
                      <MenuItem value="Therapy">Therapy</MenuItem>
                      <MenuItem value="Beauty">Beauty</MenuItem>
                      <MenuItem value="Health">Health</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Tags"
                  fullWidth
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  helperText="Separate tags with commas"
                  sx={{ borderRadius: 0 }}
                />
                {watchedTags.length > 0 && (
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}
                  >
                    {watchedTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        onDelete={() => {
                          const newTags = watchedTags.filter(
                            (_, i) => i !== index
                          );
                          setValue("tags", newTags);
                          setTagsInput(newTags.join(", "));
                        }}
                        sx={{ borderRadius: 0 }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="author"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Author"
                      fullWidth
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Publication Date *"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue) => {
                          setValue(
                            "date",
                            newValue ? newValue.format("YYYY-MM-DD") : ""
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.date,
                            helperText: errors.date?.message,
                            sx: { borderRadius: 0 },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="read_time"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Read Time (minutes)"
                      type="number"
                      fullWidth
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      sx={{ borderRadius: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="is_published"
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
                      label="Published"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={field.onChange}
                          sx={{ borderRadius: 0 }}
                        />
                      }
                      label="Featured"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="featured_image_url"
                  control={control}
                  render={({ field }) => (
                    <ImageUploadField
                      label="Featured Image"
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

        {/* Content Editor */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Content Editor" />
              <Tab label="Preview" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Content *
                  </Typography>
                  <StructuredContentEditor
                    key={post?.id || 'new'} // Force re-mount when post changes
                    value={contentHtml}
                    onChange={handleContentChange}
                    error={errors.content_html?.message}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Preview
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 0,
                      minHeight: "400px",
                    }}
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </Box>
              )}
            </Box>
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
                {loading ? "Saving..." : "Save Post"}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
