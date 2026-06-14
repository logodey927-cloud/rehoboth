import React from "react";
import { Chip } from "@mui/material";

export default function PaymentActions({ paymentStatus }) {
  // Stripe-only: no manual verify action — webhooks are authoritative.

  if (paymentStatus === "paid") {
    return (
      <Chip
        label="Verified"
        color="success"
        size="small"
        sx={{ fontWeight: 500, borderRadius: 0 }}
      />
    );
  }

  if (paymentStatus === "failed") {
    return (
      <Chip
        label="Payment Failed"
        color="error"
        size="small"
        sx={{ fontWeight: 500, borderRadius: 0 }}
      />
    );
  }

  if (paymentStatus !== "pending") {
    return null;
  }

  return (
    <Chip
      label="Awaiting Stripe Confirmation"
      color="warning"
      size="small"
      sx={{ fontWeight: 600, borderRadius: 0 }}
    />
  );
}

