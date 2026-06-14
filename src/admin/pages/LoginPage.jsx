import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import logo from "../../assets/images/logo.webp";
import spaImage from "../../assets/images/img-008.webp";

const glassCard = {
  backgroundColor: "rgba(255,255,255,0.42)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.55)",
  borderRadius: 2,
  boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username, password);
    if (result.success) {
      navigate("/admin", { replace: true });
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Left — image panel ─────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "0 0 48%",
          position: "relative",
          backgroundImage: `url(${spaImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 4, lg: 5 },
        }}
      >
        {/* Logo — top corner */}
        <Box sx={{ ...glassCard, alignSelf: "flex-start", p: { md: 2, lg: 2.5 }, display: "inline-flex" }}>
          <Box
            component="img"
            src={logo}
            alt="Rehoboth Health & Wellness Clinic"
            sx={{ height: { md: 52, lg: 60 }, width: "auto", maxWidth: 220, display: "block" }}
          />
        </Box>

        {/* Tagline — bottom corner */}
        <Box sx={{ ...glassCard, alignSelf: "flex-start", maxWidth: 440, p: { md: 2.5, lg: 3 } }}>
          {["Manage.", "Monitor.", "Grow."].map((line) => (
            <Typography
              key={line}
              component="p"
              sx={{
                m: 0, fontWeight: 800,
                fontSize: { md: "2.5rem", lg: "3rem" },
                lineHeight: 1.15, letterSpacing: "-0.02em",
                color: "secondary.dark",
              }}
            >
              {line}
            </Typography>
          ))}
          <Typography
            variant="body1"
            sx={{ mt: 2.5, color: "text.primary", fontWeight: 400, fontSize: { md: "1rem", lg: "1.05rem" }, lineHeight: 1.55, maxWidth: 340 }}
          >
            Admin portal for managing<br />
            appointments, users, and<br />
            clinic operations.
          </Typography>
        </Box>
      </Box>

      {/* ── Right — form panel ─────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          px: { xs: 3, sm: 5, md: 6 },
          py: { xs: 5, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
            <Box component="img" src={logo} alt="Rehoboth" sx={{ height: 54, width: "auto" }} />
          </Box>

          <Typography variant="h4" fontWeight={800} color="secondary.dark" mb={0.75}>
            Admin Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3.5}>
            Sign in to access the admin panel
          </Typography>

          {sessionExpired && !error && (
            <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 1 }}>
              Your session expired after 24 hours. Please sign in again.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required autoFocus autoComplete="username" size="small" sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Email fontSize="small" color="action" /></InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? "text" : "password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password" size="small" sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: "right", mb: 2.5 }}>
              <Link
                to="/admin/forgot-password"
                style={{ textDecoration: "none", color: "#47672f", fontSize: "0.813rem", fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" disabled={submitting}
              sx={{
                py: 1.3, backgroundColor: "secondary.main", fontWeight: 700,
                textTransform: "none", fontSize: "1rem", borderRadius: 0,
                "&:hover": { backgroundColor: "secondary.dark" },
              }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">Rehoboth Admin Portal</Typography>
          </Divider>

          <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
            Access restricted to authorised staff only.
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}
