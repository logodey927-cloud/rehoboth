import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Link, Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { loginUser, getApiErrorMessage, unwrapApiData } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import logo from "../../assets/images/logo.webp";
import spaImage from "../../assets/images/about-2.webp";
import SEO from "../../components/common09/SEO";
import AuthPanelAside from "../../components/auth/AuthPanelAside";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useUserAuth();

  const from = location.state?.from || "/my-account/profile";

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, loading, navigate, from]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      if (res.data?.success) {
        const { accessToken, refreshToken, user } = unwrapApiData(res);
        login(accessToken, refreshToken, user);
        await swalSuccess("Welcome back!", `Hi ${user?.first_name || user?.email}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Login failed. Please try again.");
      setError(msg);
      swalError("Login Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <SEO title="Sign In | Rehoboth Health & Wellness Clinic" />

      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

        <AuthPanelAside backgroundImage={spaImage} flex="0 0 48%" />

        {/* ── Right — form panel ─────────────────────────────────── */}
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
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3.5}>
              Sign in to book appointments and manage your account
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Email Address" name="email" type="email"
                value={form.email} onChange={handleChange}
                required autoFocus size="small" sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Email fontSize="small" color="action" /></InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth label="Password" name="password"
                type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                required size="small" sx={{ mb: 1.5 }}
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
                <Link component={RouterLink} to="/forgot-password" variant="body2"
                  color="secondary.main" sx={{ fontWeight: 500 }}>
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
              <Typography variant="caption" color="text.secondary">New to Rehoboth?</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined" component={RouterLink} to="/register"
              sx={{
                textTransform: "none", fontWeight: 600, borderRadius: 0,
                borderColor: "secondary.main", color: "secondary.main",
                py: 1.1,
              }}
            >
              Create an Account
            </Button>
          </Box>
        </Box>

      </Box>
    </>
  );
}
