import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import { getTeamMemberProfile, updateTeamMemberProfile, uploadTeamImage } from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";
import ImageUploadField from "../../admin/components/vouchers/ImageUploadField";
import AvailabilitySelector from "../../admin/components/team/AvailabilitySelector";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { Controller, useForm } from "react-hook-form";

export default function MyProfile() {
  const { updateMember } = useTeamMemberAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      phone: "",
      description: "",
      availability: "",
      image_url: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getTeamMemberProfile();
        const profileData = response.data?.profile;
        setProfile(profileData);
        setValue("title", profileData.title || "");
        setValue("phone", profileData.phone || "");
        setValue("description", profileData.description || "");
        setValue("availability", profileData.availability || "");
        setValue("image_url", profileData.image_url || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setValue]);

  const handleImageUpload = async (file) => {
    const response = await uploadTeamImage(file);
    if (response.data?.success) {
      setValue("image_url", response.data.url);
      return response.data.url;
    }
    throw new Error("Failed to upload image");
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError(null);

    try {
      await ensureSweetAlertReady();
      const response = await updateTeamMemberProfile(data);
      
      if (response.data?.success) {
        const updatedProfile = response.data.profile;
        updateMember(updatedProfile);
        setProfile(updatedProfile);
        await swalSuccess("Profile Updated", "Your profile has been updated successfully.");
      } else {
        const errorMsg = response.data?.error || "Failed to update profile";
        setError(errorMsg);
        await swalError("Update Failed", errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update profile";
      setError(errorMsg);
      await swalError("Update Failed", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="My Profile"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Team", link: "/team" },
          { label: "Profile" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Profile Image Section */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#ffffff",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1f2e",
                    fontSize: "0.9375rem",
                    mb: 3,
                  }}
                >
                  Profile Image
                </Typography>
                <Box sx={{ textAlign: "center" }}>
                  <Avatar
                    src={profile?.image_url}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      border: "3px solid",
                      borderColor: "secondary.main",
                    }}
                  >
                    {profile?.title?.charAt(0).toUpperCase() || "T"}
                  </Avatar>
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
                </Box>
              </Paper>
            </Grid>

            {/* Personal Information Section */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#ffffff",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1f2e",
                    fontSize: "0.9375rem",
                    mb: 3,
                  }}
                >
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: "Name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Full Name"
                          required
                          error={!!errors.title}
                          helperText={errors.title?.message}
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
                          fullWidth
                          size="small"
                          label="Description"
                          multiline
                          rows={4}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Contact Information Section */}
            <Grid size={{ xs: 12}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#ffffff",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1f2e",
                    fontSize: "0.9375rem",
                    mb: 3,
                  }}
                >
                  Contact & Account Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Phone Number"
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      value={profile?.email || ""}
                      disabled
                      helperText="Email cannot be changed. Contact admin to update."
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Role"
                      value={profile?.role || ""}
                      disabled
                      helperText="Role cannot be changed. Contact admin to update."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Availability Section */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#ffffff",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1f2e",
                    fontSize: "0.9375rem",
                    mb: 3,
                  }}
                >
                  Availability
                </Typography>
                <Controller
                  name="availability"
                  control={control}
                  render={() => (
                    <AvailabilitySelector
                      control={control}
                      errors={errors}
                      name="availability"
                    />
                  )}
                />
              </Paper>
            </Grid>

            {/* Specialisations Section */}
            {profile?.team_member_specialisations && profile.team_member_specialisations.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1a1f2e",
                      fontSize: "0.9375rem",
                      mb: 3,
                    }}
                  >
                    Specialisations
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1.5}>
                    {profile.team_member_specialisations.map((spec) => {
                      // Get the service or service item name
                      const specName = spec.service_items?.name || spec.services?.title || "Unknown";
                      
                      return (
                        <Chip
                          key={spec.id}
                          label={specName}
                          variant="outlined"
                          disabled
                          sx={{
                            borderRadius: 0,
                            borderColor: "secondary.main",
                            color: "text.primary",
                            "&.Mui-disabled": {
                              opacity: 0.7,
                              borderColor: "divider",
                            },
                          }}
                        />
                      );
                    })}
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 2,
                      fontStyle: "italic",
                    }}
                  >
                    Specialisations are managed by the admin. Contact admin to update.
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  size="small"
                  sx={{
                    py: 1,
                    px: 4,
                    backgroundColor: "secondary.main",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "secondary.dark",
                    },
                    "&:disabled": {
                      backgroundColor: "action.disabledBackground",
                    },
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

