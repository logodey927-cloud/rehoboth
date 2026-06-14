import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";

const STEPS = [
  "Share your unique referral link or let friends scan your QR code.",
  "Your friend visits rehobothhealthmassage.com and books or registers.",
  "You earn a reward when they complete their first appointment.",
];

const TERMS = [
  "One reward per referred friend.",
  "Referral must be a new Rehoboth customer.",
  "Reward is issued after the friend's first completed appointment.",
];

export default function HowReferralsWorkWidget() {
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
      <Typography sx={{ ...profileSectionTitleSx, mb: 2 }}>How It Works</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
        {STEPS.map((step, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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

      <Typography fontSize="0.78rem" fontWeight={600} color="secondary.dark" sx={{ mb: 1 }}>
        Terms
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {TERMS.map((t, i) => (
          <Typography key={i} component="li" fontSize="0.78rem" color="text.secondary" lineHeight={1.5}>
            {t}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
