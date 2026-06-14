import React from "react";
import { Box, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { buildVoucherQrValue } from "../../utils/voucherQr";

export default function VoucherQrCode({
  code,
  size = 160,
  showHint = true,
  title = "Scan at clinic",
}) {
  const value = buildVoucherQrValue(code);
  if (!value) return null;

  return (
    <Box sx={{ textAlign: "center" }}>
      {title && (
        <Typography
          fontSize="0.82rem"
          fontWeight={600}
          color="secondary.dark"
          sx={{ mb: 1.5 }}
        >
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: "inline-flex",
          p: 1.5,
          bgcolor: "#fff",
          border: "1px solid",
          borderColor: "divider",
        }}
        aria-label={`QR code for voucher ${value}`}
        role="img"
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#47672f"
        />
      </Box>
      {showHint && (
        <Typography fontSize="0.72rem" color="text.disabled" sx={{ mt: 1, maxWidth: 220, mx: "auto" }}>
          Staff can scan this code at reception to verify your voucher.
        </Typography>
      )}
    </Box>
  );
}
