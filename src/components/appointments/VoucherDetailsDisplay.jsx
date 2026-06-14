import React from "react";
import { Box, Typography, Paper, Chip, Divider } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

/**
 * VoucherDetailsDisplay Component
 * Reusable component to display voucher information in appointment summary
 * 
 * @param {Object} props
 * @param {Object} props.voucher - Voucher object from appointment
 * @param {string} props.voucherCode - Voucher code
 * @param {number} props.discountApplied - Discount amount applied
 */
export default function VoucherDetailsDisplay({
  voucher,
  voucherCode,
  discountApplied,
}) {
  if (!voucherCode && !voucher) {
    return null;
  }

  const formatDiscount = () => {
    if (!voucher) return "Discount Applied";
    if (voucher.discount_type === "percent") {
      return `${voucher.discount_value}% OFF`;
    } else if (voucher.discount_type === "amount") {
      return `£${voucher.discount_value} OFF`;
    } else if (voucher.discount_type === "free_service") {
      return "FREE SERVICE";
    }
    return "Special Offer";
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: "success.light",
        borderRadius: 0,
        border: "1px solid",
        borderColor: "success.main",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <LocalOfferIcon sx={{ color: "success.main", mr: 1 }} />
        <Typography variant="h6" sx={{ color: "success.dark", fontWeight: 600 }}>
          Voucher Applied
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {voucherCode && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Voucher Code:
            </Typography>
            <Chip
              label={voucherCode}
              size="small"
              sx={{
                backgroundColor: "success.main",
                color: "white",
                fontWeight: 600,
                borderRadius: 0,
              }}
            />
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Discount:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "success.dark" }}>
            {formatDiscount()}
          </Typography>
        </Box>
        {discountApplied !== undefined && discountApplied !== null && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Amount Saved:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "success.dark" }}>
              £{discountApplied.toFixed(2)}
            </Typography>
          </Box>
        )}
        {voucher && voucher.validity_end && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Valid Until:
            </Typography>
            <Typography variant="body2">
              {new Date(voucher.validity_end).toLocaleDateString("en-GB")}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

