import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Link, Divider, MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Person, Phone } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { registerUser, getApiErrorMessage, getApiFieldErrors, unwrapApiData } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import logo from "../../assets/images/logo.webp";
import registerBg from "../../assets/images/bg-r.png";
import SEO from "../../components/common09/SEO";
import AuthPanelAside from "../../components/auth/AuthPanelAside";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";
  const { isAuthenticated, loading } = useUserAuth();
  const redirectTo = location.state?.from || "/my-account/profile";

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, loading, navigate, redirectTo]);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    phone: "", gender: "", address: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name } = e.target;
    setForm({ ...form, [name]: e.target.value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setSubmitting(true);
    try {
      const res = await registerUser({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        gender: form.gender,
        address: form.address.trim(),
        ...(referralCode ? { referral_code: referralCode.toUpperCase() } : {}),
      });
      if (res.data?.success) {
        const payload = unwrapApiData(res);
        await swalSuccess(
          "Account Created!",
          payload?.message || "Please check your email to verify your address, then sign in."
        );
        navigate("/login", { replace: true, state: { email: form.email } });
      }
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      const msg = getApiErrorMessage(err, "Registration failed. Please try again.");
      setError(msg);
      swalError("Registration Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <SEO title="Create Account | Rehoboth Health & Wellness Clinic" />

      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

        <AuthPanelAside backgroundImage={registerBg} flex="0 0 44%" />

        {/* ── Right — form panel ─────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            px: { xs: 3, sm: 5, md: 6 },
            py: { xs: 5, md: 5 },
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 480 }}>
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
              <Box component="img" src={logo} alt="Rehoboth" sx={{ height: 54, width: "auto" }} />
            </Box>

            <Typography variant="h4" fontWeight={800} color="secondary.dark" mb={0.75}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3.5}>
              Join Rehoboth to book appointments and manage your wellness journey
            </Typography>

            {referralCode && (
              <Alert severity="info" sx={{ mb: 2.5, borderRadius: 1 }}>
                You're signing up with a friend's referral link. Your friend will earn a reward when you complete your first booking!
              </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Name row */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <TextField
                  fullWidth label="First Name" name="first_name"
                  value={form.first_name} onChange={handleChange}
                  required size="small"
                  error={Boolean(fieldErrors.first_name)}
                  helperText={fieldErrors.first_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth label="Last Name" name="last_name"
                  value={form.last_name} onChange={handleChange}
                  required size="small"
                  error={Boolean(fieldErrors.last_name)}
                  helperText={fieldErrors.last_name}
                />
              </Box>

              <TextField
                fullWidth label="Email Address" name="email" type="email"
                value={form.email} onChange={handleChange}
                required size="small" sx={{ mb: 2 }}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Email fontSize="small" color="action" /></InputAdornment>
                  ),
                }}
              />

              {/* Phone + Gender row */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <TextField
                  fullWidth label="Phone (optional)" name="phone"
                  value={form.phone} onChange={handleChange}
                  size="small"
                  error={Boolean(fieldErrors.phone)}
                  helperText={fieldErrors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth select label="Gender" name="gender"
                  value={form.gender} onChange={handleChange}
                  size="small"
                >
                  <MenuItem value=""><em>Not specified</em></MenuItem>
                  {GENDER_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                multiline
                minRows={2}
                size="small"
                sx={{ mb: 2 }}
                helperText="Required for your account profile"
              />

              <TextField
                fullWidth label="Password" name="password"
                type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                required size="small" sx={{ mb: 2 }}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
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

              <TextField
                fullWidth label="Confirm Password" name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword} onChange={handleChange}
                required size="small" sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit" fullWidth variant="contained" disabled={submitting}
                sx={{
                  py: 1.3, backgroundColor: "secondary.main", fontWeight: 700,
                  textTransform: "none", fontSize: "1rem", borderRadius: 0,
                  "&:hover": { backgroundColor: "secondary.dark" },
                }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">Already have an account?</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined" component={RouterLink} to="/login"
              sx={{
                textTransform: "none", fontWeight: 600, borderRadius: 0,
                borderColor: "secondary.main", color: "secondary.main", py: 1.1,
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

      </Box>
    </>
  );
}
