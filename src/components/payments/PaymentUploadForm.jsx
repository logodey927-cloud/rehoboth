import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

/**
 * PaymentUploadForm Component
 * Reusable component for uploading payment proof (name + screenshot)
 * 
 * @param {object} props
 * @param {function} props.onSubmit - Callback when form is submitted
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message to display
 */
export default function PaymentUploadForm({ onSubmit, loading = false, error }) {
  const [paymentName, setPaymentName] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [localError, setLocalError] = useState(null);

  const handleScreenshotUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setLocalError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setLocalError("File size must be less than 5MB");
        return;
      }
      setPaymentScreenshot(file);
      setLocalError(null);
    }
  };

  const handleSubmit = () => {
    if (!paymentName.trim()) {
      setLocalError("Please enter the name used for payment");
      return;
    }
    if (!paymentScreenshot) {
      setLocalError("Please upload payment screenshot");
      return;
    }

    setLocalError(null);
    onSubmit({
      payment_name: paymentName.trim(),
      payment_screenshot: paymentScreenshot,
    });
  };

  const displayError = error || localError;

  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: "white",
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Upload Payment Proof
      </Typography>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {displayError}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Payment Name"
        value={paymentName}
        onChange={(e) => setPaymentName(e.target.value)}
        placeholder="Enter the name used for bank transfer"
        required
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="payment-screenshot-upload"
          type="file"
          onChange={handleScreenshotUpload}
          disabled={loading}
        />
        <label htmlFor="payment-screenshot-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            fullWidth
            disabled={loading}
            sx={{ borderRadius: 0 }}
          >
            {paymentScreenshot
              ? paymentScreenshot.name
              : "Upload Payment Screenshot"}
          </Button>
        </label>
        {paymentScreenshot && (
          <Box sx={{ mt: 2 }}>
            <img
              src={URL.createObjectURL(paymentScreenshot)}
              alt="Payment screenshot preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "4px",
              }}
            />
          </Box>
        )}
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={loading || !paymentName || !paymentScreenshot}
        sx={{ borderRadius: 0 }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Uploading...
          </>
        ) : (
          "Submit Payment Proof"
        )}
      </Button>
    </Paper>
  );
}

