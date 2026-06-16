import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Link, Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { loginUser, resendVerificationEmail, getApiErrorMessage, unwrapApiData } from "../../api/api";
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
  const prefilledEmail = location.state?.email || "";

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, loading, navigate, from]);

  useEffect(() => {
    if (prefilledEmail) {
      setForm((prev) => ({ ...prev, email: prefilledEmail }));
    }
  }, [prefilledEmail]);

  const [form, setForm] = useState({ email: prefilledEmail, password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verifyNotice, setVerifyNotice] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleResendVerification = async () => {
    if (!form.email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    setResending(true);
    setResendSuccess("");
    setError("");
    try {
      await resendVerificationEmail(form.email.trim());
      setResendSuccess("Verification email sent. Please check your inbox and spam folder.");
      setVerifyNotice(`A verification link has been sent to ${form.email.trim()}.`);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to resend verification email.");
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setVerifyNotice("");
    setResendSuccess("");
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      if (res.data?.success) {
        const payload = unwrapApiData(res);
        if (payload?.requires2FA) {
          setError("Two-factor authentication is required. Please complete OTP verification.");
          return;
        }
        const { accessToken, refreshToken, user } = payload || {};
        if (!accessToken || !user) {
          const msg = "Login succeeded but session could not be established. Please try again.";
          setError(msg);
          swalError("Login Failed", msg);
          return;
        }
        login(accessToken, refreshToken, user);
        await swalSuccess("Welcome back!", `Hi ${user?.first_name || user?.email}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      const detailsEmail = err?.response?.data?.details?.email;
      const msg = getApiErrorMessage(err, "Login failed. Please try again.");

      if (code === "EMAIL_NOT_VERIFIED") {
        const displayEmail = detailsEmail || form.email;
        setVerifyNotice(
          `Please verify your email before signing in. A verification link has been sent to ${displayEmail}. Check your inbox and spam folder.`
        );
        setError("");
      } else {
        setError(msg);
        swalError("Login Failed", msg);
      }
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
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
              <Box component="img" src={logo} alt="Rehoboth" sx={{ height: 54, width: "auto" }} />
            </Box>

            <Typography variant="h4" fontWeight={800} color="secondary.dark" mb={0.75}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3.5}>
              Sign in to book appointments and manage your account
            </Typography>

            {verifyNotice && (
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 1 }}>
                {verifyNotice}
              </Alert>
            )}
            {resendSuccess && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: 1 }}>
                {resendSuccess}
              </Alert>
            )}
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

            {(verifyNotice || resendSuccess) && (
              <Button
                fullWidth variant="outlined" disabled={resending} onClick={handleResendVerification}
                sx={{
                  mt: 2, textTransform: "none", fontWeight: 600, borderRadius: 0,
                  borderColor: "secondary.main", color: "secondary.main",
                }}
              >
                {resending ? <CircularProgress size={20} /> : "Resend Verification Email"}
              </Button>
            )}

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
