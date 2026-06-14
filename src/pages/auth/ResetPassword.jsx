import React, { useState } from "react";
import {
  Box, Container, Paper, TextField, Button, Typography,
  Alert, CircularProgress, Link, InputAdornment, IconButton,
} from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordUser } from "../../api/api";
import { swalSuccess } from "../../utils/swal";
import logo from "../../assets/images/logo.webp";
import SEO from "../../components/common09/SEO";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) return setError("Passwords do not match");
    if (form.newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (!token) return setError("Invalid reset link. Please request a new one.");

    setSubmitting(true);
    try {
      await resetPasswordUser({ token, newPassword: form.newPassword });
      await swalSuccess("Password Reset!", "Your password has been updated. Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Reset Password | Rehoboth" />
      <Box
        sx={{
          minHeight: "calc(100vh - 120px)", display: "flex",
          alignItems: "center", justifyContent: "center", py: 6, backgroundColor: "#f9f6f2",
        }}
      >
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box component="img" src={logo} alt="Rehoboth" sx={{ maxWidth: 90, height: "auto" }} />
            </Box>

            <Typography variant="h5" align="center" fontWeight={700} color="secondary.dark" mb={0.5}>
              Reset Password
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" mb={3}>
              Enter your new password below
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label="New Password" name="newPassword"
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required size="small" sx={{ mb: 2 }} helperText="At least 8 characters"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth label="Confirm New Password" name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required size="small" sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
                }}
              />

              <Button
                type="submit" fullWidth variant="contained" disabled={submitting || !token}
                sx={{
                  py: 1.2, backgroundColor: "secondary.main", fontWeight: 600,
                  textTransform: "none", fontSize: "1rem",
                  "&:hover": { backgroundColor: "secondary.dark" },
                }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Set New Password"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Link component={RouterLink} to="/login" variant="body2" color="secondary.main" fontWeight={500}>
                ← Back to Sign In
              </Link>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
