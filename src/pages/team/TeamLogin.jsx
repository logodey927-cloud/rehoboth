import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Alert, Link, Container, InputAdornment, CircularProgress } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Email, Lock, Person } from "@mui/icons-material";
import logo from "../../assets/images/logo.webp";
import { loginTeamMember } from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";

export default function TeamLogin() {
  const navigate = useNavigate();
  const { login } = useTeamMemberAuth();
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });
  const [loginType, setLoginType] = useState("email"); // "email" or "username"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await ensureSweetAlertReady();
      // Send either email or username based on login type
      const loginData = loginType === "username" 
        ? { username: formData.username, password: formData.password }
        : { email: formData.email, password: formData.password };
      const response = await loginTeamMember(loginData);
      if (response.data?.success) {
        // Update context state (this also stores in localStorage)
        login(response.data.token, response.data.teamMember);
        
        await swalSuccess("Login successful!", "Redirecting to your dashboard...");
        // Use replace to prevent going back to login page
        navigate("/team/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMsg);
      await swalError("Login Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 1.5,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Rehoboth Health & Wellness Clinic"
              sx={{
                maxWidth: { xs: 80, sm: 100 },
                height: "auto",
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            component="h1"
            align="center"
            sx={{
              fontWeight: 600,
              color: "secondary.dark",
              mb: 0.5,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Team Member Login
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "text.secondary",
              mb: 2,
              fontSize: "0.813rem",
            }}
          >
            Sign in to access your dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.813rem" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Login Type Toggle */}
            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
              <Button
                variant={loginType === "email" ? "contained" : "outlined"}
                size="small"
                onClick={() => setLoginType("email")}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  py: 0.5,
                  backgroundColor: loginType === "email" ? "secondary.main" : "transparent",
                  color: loginType === "email" ? "#fff" : "text.secondary",
                  borderColor: "divider",
                  "&:hover": {
                    backgroundColor: loginType === "email" ? "secondary.dark" : "action.hover",
                  },
                }}
              >
                Email
              </Button>
              <Button
                variant={loginType === "username" ? "contained" : "outlined"}
                size="small"
                onClick={() => setLoginType("username")}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  py: 0.5,
                  backgroundColor: loginType === "username" ? "secondary.main" : "transparent",
                  color: loginType === "username" ? "#fff" : "text.secondary",
                  borderColor: "divider",
                  "&:hover": {
                    backgroundColor: loginType === "username" ? "secondary.dark" : "action.hover",
                  },
                }}
              >
                Username
              </Button>
            </Box>

            {loginType === "email" ? (
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 18 }} color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <TextField
                fullWidth
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                margin="normal"
                required
                autoComplete="username"
                autoFocus
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ fontSize: 18 }} color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
              autoComplete="current-password"
              size="small"
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ fontSize: 18 }} color="action" />
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
                py: 1,
                backgroundColor: "secondary.main",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "none",
                mb: 1.5,
                "&:hover": {
                  backgroundColor: "secondary.dark",
                },
                "&:disabled": {
                  backgroundColor: "action.disabledBackground",
                },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Login"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 1.5 }}>
            <Link
              component={RouterLink}
              to="/team/forgot-password"
              sx={{
                textDecoration: "none",
                color: "secondary.main",
                fontSize: "0.813rem",
                fontWeight: 500,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Forgot Password?
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

