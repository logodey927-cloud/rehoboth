import React, { useState } from "react";
import {
  Box, Container, Paper, TextField, Button, Typography,
  Alert, CircularProgress, Link,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { forgotPasswordUser } from "../../api/api";
import logo from "../../assets/images/logo.webp";
import SEO from "../../components/common09/SEO";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await forgotPasswordUser(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Forgot Password | Rehoboth" />
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
              Forgot Password
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" mb={3}>
              Enter your email and we&apos;ll send you a reset link
            </Typography>

            {sent ? (
              <Alert severity="success">
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox.
              </Alert>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth label="Email Address" type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required size="small" sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Email fontSize="small" color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  <Button
                    type="submit" fullWidth variant="contained" disabled={submitting}
                    sx={{
                      py: 1.2, backgroundColor: "secondary.main", fontWeight: 600,
                      textTransform: "none", fontSize: "1rem",
                      "&:hover": { backgroundColor: "secondary.dark" },
                    }}
                  >
                    {submitting ? <CircularProgress size={22} color="inherit" /> : "Send Reset Link"}
                  </Button>
                </Box>
              </>
            )}

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
