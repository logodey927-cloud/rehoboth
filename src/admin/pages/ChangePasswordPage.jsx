import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../../api/api";
import HeroPageSection from "../../components/sections/HeroPageSection";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword(
        user?.username || "rehoboth-admin",
        currentPassword,
        newPassword
      );

      if (response.data.success) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        setError(response.data.error || "Failed to change password");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Network error. Please try again.";
      setError(errorMessage);
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
          { label: "Admin", link: "/admin" },
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
            Update your admin account password. Make sure to use a strong password.
          </Typography>

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, fontSize: "0.875rem" }}>
              Password changed successfully! Redirecting to dashboard...
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
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                type="button"
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => navigate("/admin")}
                sx={{
                  py: 1,
                  textTransform: "none",
                  fontSize: "0.875rem",
                }}
              >
                Cancel
              </Button>
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

