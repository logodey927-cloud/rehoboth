import React from "react";
import BgImg from "../../assets/images/bg-light-06.webp";
import pImg from "../../assets/images/hot-stone.webp";
import { Box, Grid } from "@mui/material";
import RelaxingTreatments from "./RelaxingTreatments";

export default function WellnessTreatments() {
  return (
    <Grid
      container
      spacing={3}
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, sm: 10 },
        px: { xs: 2, sm: 6 },
        minHeight: { xs: "auto", md: "100vh" },
        overflow: "hidden",
      }}
    >
      <Grid size={{ xs: 12, md: 6 }}>
        <RelaxingTreatments />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} sx={{ p: 2 }}>
        <Box
          component="img"
          src={pImg}
          alt="Hot stone wellness treatment at Rehoboth Health & Wellness Clinic"
          sx={{
            // height: { xs: 60, md: 80 },
            width: "100%",
            mb: 2,
          }}
        />
      </Grid>
    </Grid>
  );
}
