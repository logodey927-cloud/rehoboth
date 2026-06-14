import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";

const TERMS = [
  "Vouchers cannot be combined with other offers or promotions.",
  "Vouchers are non-refundable and non-transferable.",
  "Valid only for the specified services and period shown.",
  "Minimum spend requirements apply where stated.",
  "Expired vouchers cannot be reinstated or exchanged.",
];

export default function VoucherTermsWidget() {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
      <Typography sx={{ ...profileSectionTitleSx, mb: 2 }}>Terms & Conditions</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {TERMS.map((term, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 5, height: 5, borderRadius: "50%",
                bgcolor: "secondary.main", flexShrink: 0, mt: "6px",
              }}
            />
            <Typography fontSize="0.8rem" color="text.secondary" lineHeight={1.55}>
              {term}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
