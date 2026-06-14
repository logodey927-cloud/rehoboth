import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Lock, ArrowBack } from "@mui/icons-material";
import logo from "../../assets/images/logo.webp";
import { resetPassword } from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);

    try {
      await ensureSweetAlertReady();
      const response = await resetPassword(token, formData.password);
      
      if (response.data?.success) {
        setSuccess(true);
        await swalSuccess("Password Reset", response.data.message || "Your password has been reset successfully. You can now login.");
        setTimeout(() => {
          navigate("/admin/login");
        }, 2000);
      } else {
        const errorMsg = response.data?.error || "Failed to reset password";
        setError(errorMsg);
        await swalError("Reset Failed", errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to reset password. Please try again.";
      setError(errorMsg);
      await swalError("Reset Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f7fa",
          backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 2,
              backgroundColor: "#ffffff",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Rehoboth Health & Wellness Clinic"
                sx={{
                  maxWidth: { xs: 120, sm: 150 },
                  height: "auto",
                }}
              />
            </Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              Invalid reset link. Please request a new password reset.
            </Alert>
            <Button
              component={Link}
              to="/admin/login"
              variant="contained"
              startIcon={<ArrowBack />}
              sx={{
                backgroundColor: "secondary.main",
                color: "#ffffff",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "secondary.dark",
                },
              }}
            >
              Back to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f7fa",
          backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 2,
              backgroundColor: "#ffffff",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Rehoboth Health & Wellness Clinic"
                sx={{
                  maxWidth: { xs: 120, sm: 150 },
                  height: "auto",
                }}
              />
            </Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset successfully!
            </Alert>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Your password has been reset. Redirecting to login page...
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Rehoboth Health & Wellness Clinic"
              sx={{
                maxWidth: { xs: 120, sm: 150 },
                height: "auto",
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              fontWeight: 600,
              color: "secondary.dark",
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          >
            Reset Password
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "text.secondary",
              mb: 4,
            }}
          >
            Enter your new password below
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
              autoComplete="new-password"
              autoFocus
              helperText="Must be at least 8 characters"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              margin="normal"
              required
              autoComplete="new-password"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: "secondary.main",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  backgroundColor: "secondary.dark",
                },
                "&:disabled": {
                  backgroundColor: "action.disabledBackground",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>

            <Button
              component={Link}
              to="/admin/login"
              fullWidth
              variant="text"
              startIcon={<ArrowBack />}
              sx={{
                color: "text.secondary",
                textTransform: "none",
              }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

