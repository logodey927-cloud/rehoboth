import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { subscribeNewsletter } from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    await ensureSweetAlertReady();

    try {
      const res = await subscribeNewsletter(email);
      if (res.data && res.data.success) {
        await swalSuccess(
          "Subscribed!",
          "Thank you for subscribing! Please check your email for confirmation."
        );
        setEmail("");
      } else {
        await swalError(
          "Subscription failed",
          res.data?.error || "Please try again."
        );
      }
    } catch (err) {
      await swalError(
        "Network or server error",
        err.response?.data?.error ||
          err.message ||
          "Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Join Our Wellness Updates
      </Typography>

      <Typography sx={{ mb: 2 }}>
        Subscribe to receive wellness tips, offers & updates.
      </Typography>

      <Box component="form" onSubmit={handleSubscribe}>
        <TextField
          fullWidth
          placeholder="Your Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(""); // Clear error when user types
          }}
          error={!!error}
          helperText={error}
          disabled={isSubmitting}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: "#f58c00",
                    },
                    "&:disabled": {
                      opacity: 0.5,
                    },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ArrowForward />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
