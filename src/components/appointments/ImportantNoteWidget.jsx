import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";

export default function ImportantNoteWidget() {
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
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <InfoOutlined sx={{ color: "secondary.dark", fontSize: 20, mt: 0.1, flexShrink: 0 }} />
        <Box>
          <Typography sx={{ ...profileSectionTitleSx, fontSize: "0.9rem", mb: 0.75 }}>
            Important Note
          </Typography>
          <Typography fontSize="0.8rem" color="text.secondary" lineHeight={1.6}>
            Please arrive 10 minutes before your appointment time. Cancellations must be made at
            least 24 hours in advance to avoid a cancellation fee. Late arrivals may result in
            reduced treatment time.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
