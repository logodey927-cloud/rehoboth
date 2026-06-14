import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import { changePasswordTeamMember } from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";
import HeroPageSection from "../../components/sections/HeroPageSection";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      await ensureSweetAlertReady();
      const response = await changePasswordTeamMember({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data?.success) {
        setSuccess(true);
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        await swalSuccess("Password Changed", "Your password has been changed successfully.");
      } else {
        const errorMsg = response.data?.error || "Failed to change password";
        setError(errorMsg);
        await swalError("Change Failed", errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to change password. Please try again.";
      setError(errorMsg);
      await swalError("Change Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <HeroPageSection
        title="Change Password"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Team", link: "/team" },
          { label: "Change Password" },
        ]}
        borderRadius={true}
      />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          {/* Title */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Lock sx={{ fontSize: 24, color: "secondary.main", mr: 1.5 }} />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "secondary.dark",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Change Password
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 2.5,
              fontSize: "0.875rem",
            }}
          >
            Update your team member account password. Make sure to use a strong password.
          </Typography>

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, fontSize: "0.875rem" }}>
              Password changed successfully!
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              size="small"
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              autoComplete="current-password"
              sx={{ mb: 1.5 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              autoComplete="new-password"
              helperText="Must be at least 8 characters long"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="small"
                disabled={loading || success}
                sx={{
                  py: 1,
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
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Change Password"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

