import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";

const STEPS = [
  "Choose your service and proceed to the booking checkout.",
  "Enter your voucher code in the promo code field.",
  "The discount will be applied to your total amount.",
];

export default function HowToUseVouchersWidget() {
  return (
    <Paper
      elevation={0}
      sx={{
        ...profileCardSx,
        bgcolor: "#f0f4e8",
        boxShadow: "none",
        border: "1px solid",
        borderColor: "secondary.light",
      }}
    >
      <Typography sx={{ ...profileSectionTitleSx, mb: 2 }}>How to Use Vouchers</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {STEPS.map((step, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                bgcolor: "secondary.main",
                display: "flex", alignItems: "center", justifyContent: "center",
                mt: 0.1,
              }}
            >
              <Typography fontSize="0.65rem" fontWeight={700} color="#fff">
                {i + 1}
              </Typography>
            </Box>
            <Typography fontSize="0.82rem" color="text.secondary" lineHeight={1.55}>
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
