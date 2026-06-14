import React from "react";
import { Chip } from "@mui/material";

/**
 * PaymentStatusBadge Component
 * Reusable component to display payment status with color coding
 * 
 * @param {object} props
 * @param {string} props.status - Payment status: 'pending', 'paid', 'failed', 'refunded'
 */
export default function PaymentStatusBadge({ status }) {
  const colors = {
    pending: "warning",
    paid: "success",
    failed: "error",
    refunded: "default",
  };

  const statusLabel = status ? status.toUpperCase() : "PENDING";

  return (
    <Chip
      label={statusLabel}
      color={colors[status?.toLowerCase()] || "default"}
      size="small"
      sx={{
        fontWeight: 500,
        borderRadius: 0,
      }}
    />
  );
}

