import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Alert, Container, InputAdornment, CircularProgress } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Email, ArrowBack } from "@mui/icons-material";
import logo from "../../assets/images/logo.webp";
import { forgotPasswordTeamMember } from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await ensureSweetAlertReady();
      const response = await forgotPasswordTeamMember({ email });
      
      if (response.data?.success) {
        setSuccess(true);
        await swalSuccess("Email Sent", response.data.message || "If an account exists with this email, a password reset link has been sent.");
      } else {
        const errorMsg = response.data?.error || "Failed to send reset email";
        setError(errorMsg);
        await swalError("Error", errorMsg);
      }
    } catch (_err) {
      // Still show success to prevent email enumeration
      setSuccess(true);
      await swalSuccess("Email Sent", "If an account exists with this email, a password reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

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
              Password reset email sent successfully!
            </Alert>

            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your email and follow the instructions to reset your password.
            </Typography>

            <Button
              component={RouterLink}
              to="/team/login"
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
            Forgot Password
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "text.secondary",
              mb: 4,
            }}
          >
            Enter your email address and we'll send you a link to reset your password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
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
                "Send Reset Link"
              )}
            </Button>

            <Button
              component={RouterLink}
              to="/team/login"
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

