import React from "react";
import { Box, Typography, Grid, Stack } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StyledButton from "../common09/StyledButton";

export default function OurTreatments() {
  //   const theme = useTheme();

  // const treatments = [
  //   ["Aromatherapy", "Myofascial Release"],
  //   ["Hydrotherapy", "Craniosacral Therapy"],
  //   ["Reflexology", "Thai Massage"],
  //   ["Stone Massage", "Massage"],
  // ];

  return (
    <Box
      sx={{
        textAlign: "center",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          mb: 1,
          fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
        }}
      >
        Classy Relaxing Treatments
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="subtitle2"
        sx={{
          letterSpacing: 3,
          mb: 6,
          color: "text.secondary",
          textTransform: "uppercase",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        RELAX, REVIVE, RECONNECT
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 3,
          color: "#757575",
          textAlign: "center",
          fontSize: { xs: "0.95rem", md: "1rem" },
        }}
      >
        Discover rejuvenating treatments designed to relax your body, calm your
        mind, and restore your natural balance. Every session at Rehoboth Health
        & Wellness Clinic is guided by skilled therapists dedicated to your
        wellbeing.
      </Typography>

      {/* Treatments List */}
      {/* <Grid container spacing={2} justifyContent="center" sx={{ mb: 6 }}>
        {treatments.map(([left, right], i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>✤ {left}</li>
                </ul>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li>✤ {right}</li>
                </ul>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid> */}

      {/* Button & Support Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="center"
        spacing={4}
      >
        <StyledButton to="/book-appointment" text="Book Appointment" />

        <Stack direction="row" spacing={2} alignItems="center">
          <ChatBubbleOutlineIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box textAlign="left">
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 2,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Get Support
            </Typography>
            <Typography variant="body2">
              07759221176
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
