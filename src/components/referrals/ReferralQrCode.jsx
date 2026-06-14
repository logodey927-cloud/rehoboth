import React from "react";
import { Box } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

export default function ReferralQrCode({ url, size = 180 }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        p: 1.5,
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "divider",
      }}
      aria-label="QR code to open Rehoboth referral link"
      role="img"
    >
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#47672f"
      />
    </Box>
  );
}
