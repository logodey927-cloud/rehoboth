import React from "react";
import { Box, Grid } from "@mui/material";
import ContactForm from "../common09/ContactForm";
import ContactMap from "../common09/ContactMap";
// import BgImg from "../../assets/images/bg-light-01.webp";

export default function ContactUi() {
  return (
    <Box
      className=""
      sx={{
        p: 0,
      }}
    >
      <Grid
        container
        spacing={4}
        sx={{
          height: "100%",
          position: "relative",
          zIndex: 1,
          alignItems: "center",
          p: { xs: 0, sm: 4, md: 6 },
          pt: { xs: 4 },
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <ContactForm headline="Free Consultation" btnText="Send Message" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ContactMap />
        </Grid>
      </Grid>
    </Box>
  );
}
