import React from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * PaymentConfirmationStep Component
 * Reusable component for confirmation step showing "Waiting for Payment Confirmation"
 * 
 * @param {object} props
 * @param {object} props.appointmentData - Appointment data object
 * @param {function} props.onReturnHome - Callback to return to home page
 */
export default function PaymentConfirmationStep({
  appointmentData,
  paymentRequired = true,
  _onReturnHome,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
        }}
      >
        <CheckCircleIcon
          sx={{ fontSize: 80, color: "success.main", mb: 2 }}
        />

        <Typography variant="h5" gutterBottom>
          Appointment Request Submitted
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          {paymentRequired
            ? "Thank you for your booking request. We have received your payment proof."
            : "Thank you for your booking request. Your voucher has covered the full cost, so no additional payment is required."}
        </Typography>

        <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
          <Typography variant="body2">
            <strong>
              {paymentRequired ? "Waiting for Payment Confirmation" : "Booking Received"}
            </strong>
            <br />
            {paymentRequired
              ? "Your appointment is pending payment verification. Once our admin confirms your payment, you will receive a confirmation email with all appointment details."
              : "Your booking has been received. We will confirm your appointment and send you an email with all details."}
          </Typography>
        </Alert>

        {appointmentData && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              bgcolor: "grey.50",
              borderRadius: 1,
              textAlign: "left",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Appointment Summary
            </Typography>
            <Typography>
              <strong>Service:</strong> {appointmentData.service || "N/A"}
            </Typography>
            <Typography>
              <strong>Date:</strong> {formatDate(appointmentData.date)}
            </Typography>
            <Typography>
              <strong>Time:</strong> {appointmentData.time || "N/A"}
            </Typography>
            <Typography>
              <strong>Name:</strong> {appointmentData.full_name || "N/A"}
            </Typography>
            <Typography>
              <strong>Email:</strong> {appointmentData.email || "N/A"}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {appointmentData.phone || "N/A"}
            </Typography>
            <Typography sx={{ mt: 2 }}>
              <strong>Payment Status:</strong>{" "}
              {paymentRequired ? (
                <Chip label="Pending Verification" color="warning" size="small" />
              ) : (
                <Chip label="No payment required" color="success" size="small" />
              )}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

