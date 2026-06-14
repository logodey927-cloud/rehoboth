import React, { useState } from "react";
import {
  Box, Typography, Paper, TextField, Alert,
  InputAdornment, IconButton, CircularProgress,
} from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { changeMyPassword } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { swalSuccess, swalError } from "../../utils/swal";
import { useNavigate } from "react-router-dom";
import StyledButton from "../../components/common09/StyledButton";
import { profileCardSx, accountFieldSx, accountStyledButtonSx } from "../../components/profile/profileStyles";

export default function ChangePasswordPage() {
  const { accessToken, logout } = useUserAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match");
    if (form.newPassword.length < 8) return setError("New password must be at least 8 characters");

    setSubmitting(true);
    try {
      await changeMyPassword(accessToken, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      await swalSuccess("Password Changed", "Your password has been updated. Please sign in again.");
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to change password.";
      setError(msg);
      swalError("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (name, label) => ({
    fullWidth: true, label, name,
    type: showPasswords ? "text" : "password",
    value: form[name], onChange: handleChange,
    required: true, size: "small",
    InputProps: {
      startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
    },
  });

  return (
    <Box>
      <Typography data-aos="fade-down" data-aos-duration="600" variant="h5" fontWeight={700} color="secondary.dark" mb={3}>Change Password</Typography>

      <Paper data-aos="fade-up" data-aos-delay="100" data-aos-duration="600" elevation={0} sx={{ ...profileCardSx, maxWidth: 480 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField {...fieldProps("currentPassword", "Current Password")} sx={{ mb: 2, ...accountFieldSx }} />
          <TextField {...fieldProps("newPassword", "New Password")} helperText="At least 8 characters" sx={{ mb: 2, ...accountFieldSx }} />
          <TextField {...fieldProps("confirmPassword", "Confirm New Password")} sx={{ mb: 1, ...accountFieldSx }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <IconButton size="small" onClick={() => setShowPasswords(!showPasswords)}>
              {showPasswords ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {showPasswords ? "Hide" : "Show"} passwords
            </Typography>
          </Box>

          {submitting ? (
            <CircularProgress size={24} color="secondary" />
          ) : (
            <StyledButton
              text="Update Password"
              variant="primary"
              type="submit"
              sx={accountStyledButtonSx}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
