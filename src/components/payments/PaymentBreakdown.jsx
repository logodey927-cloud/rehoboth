import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";

/**
 * PaymentBreakdown Component
 * Reusable component to display payment breakdown (service price, voucher discount, final amount)
 * 
 * @param {object} props
 * @param {number} props.servicePrice - Original service price
 * @param {number} props.voucherDiscount - Voucher discount amount
 * @param {number} props.finalAmount - Final amount after discount
 * @param {string} props.serviceName - Name of the service (optional)
 */
export default function PaymentBreakdown({
  servicePrice,
  voucherDiscount = 0,
  finalAmount,
  serviceName,
}) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        bgcolor: "grey.50",
        borderRadius: 1,
      }}
    >
      {serviceName && (
        <Typography variant="h6" gutterBottom>
          Service: {serviceName}
        </Typography>
      )}

      <Box sx={{ mt: serviceName ? 2 : 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography>Service Price:</Typography>
          <Typography fontWeight="bold">£{servicePrice.toFixed(2)}</Typography>
        </Box>

        {voucherDiscount > 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                color: "success.main",
              }}
            >
              <Typography>Voucher Discount:</Typography>
              <Typography fontWeight="bold">-£{voucherDiscount.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            pt: 2,
            borderTop: "2px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="h6">Total Amount:</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            £{finalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

