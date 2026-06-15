import React, { useEffect, useState } from "react";
import {
  Box, Container, Paper, Typography, CircularProgress, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import { CheckCircle, Error, MarkEmailRead } from "@mui/icons-material";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { verifyUserEmail, resendVerificationEmail, getApiErrorMessage, unwrapApiData } from "../../api/api";
import logo from "../../assets/images/logo.webp";
import SEO from "../../components/common09/SEO";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [resendOpen, setResendOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email.");
      return;
    }
    verifyUserEmail(token)
      .then((res) => {
        if (res.data?.success) {
          setStatus("success");
          setMessage(unwrapApiData(res)?.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage("Verification failed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "Verification failed. The link may have expired."));
      });
  }, [token]);

  const handleResendOpen = () => {
    setResendEmail("");
    setResendError("");
    setResent(false);
    setResendOpen(true);
  };

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      setResendError("Please enter your email address.");
      return;
    }
    setResending(true);
    setResendError("");
    try {
      await resendVerificationEmail(resendEmail.trim());
      setResent(true);
    } catch (err) {
      setResendError(getApiErrorMessage(err, "Failed to resend. Please try again."));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO title="Verify Email | Rehoboth" />
      <Box
        sx={{
          minHeight: "calc(100vh - 120px)", display: "flex",
          alignItems: "center", justifyContent: "center", py: 6, backgroundColor: "#f9f6f2",
        }}
      >
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box component="img" src={logo} alt="Rehoboth" sx={{ maxWidth: 90, height: "auto" }} />
            </Box>

            {status === "loading" && (
              <>
                <CircularProgress color="secondary" sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">Verifying your email…</Typography>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle sx={{ fontSize: 56, color: "success.main", mb: 1.5 }} />
                <Typography variant="h5" fontWeight={700} color="secondary.dark" mb={1}>Email Verified!</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>{message}</Typography>
                <Button
                  fullWidth variant="contained" component={RouterLink} to="/login"
                  sx={{ py: 1.2, backgroundColor: "secondary.main", textTransform: "none", fontWeight: 600 }}
                >
                  Sign In to Your Account
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <Error sx={{ fontSize: 56, color: "error.main", mb: 1.5 }} />
                <Typography variant="h5" fontWeight={700} color="secondary.dark" mb={1}>Verification Failed</Typography>
                <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>{message}</Alert>
                {resent ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    A new verification link has been sent to your email.
                  </Alert>
                ) : (
                  <Button
                    fullWidth variant="outlined" onClick={handleResendOpen}
                    sx={{ mb: 2, textTransform: "none", borderColor: "secondary.main", color: "secondary.main" }}
                  >
                    Resend Verification Email
                  </Button>
                )}
                <Button fullWidth variant="text" component={RouterLink} to="/login" sx={{ textTransform: "none" }}>
                  Back to Sign In
                </Button>
              </>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Branded resend verification modal */}
      <Dialog
        open={resendOpen}
        onClose={() => !resending && setResendOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MarkEmailRead sx={{ color: "secondary.main", fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={700} color="secondary.dark" lineHeight={1.2}>
                Verify Your Email Address
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Enter your email address to resend the verification link.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {resent ? (
            <Alert severity="success" sx={{ borderRadius: 0 }}>
              Verification link sent! Check your inbox.
            </Alert>
          ) : (
            <>
              {resendError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{resendError}</Alert>
              )}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResend()}
                disabled={resending}
                size="small"
                sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setResendOpen(false)}
            disabled={resending}
            sx={{ textTransform: "none" }}
          >
            {resent ? "Close" : "Cancel"}
          </Button>
          {!resent && (
            <Button
              variant="contained"
              onClick={handleResend}
              disabled={resending || !resendEmail.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "secondary.main",
                "&:hover": { backgroundColor: "secondary.dark" },
              }}
            >
              {resending ? <CircularProgress size={18} color="inherit" /> : "Resend Verification Email"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
