import React from "react";
import { Box, Container } from "@mui/material";
import AboutUs from "../ui/AboutUs";

export default function AboutUsSection() {
  return (
    <Box
      className="AboutUsSection"
      sx={{
        px: 0,
      }}
    >
      <Container maxWidth="false" style={{ padding: "0" }}>
        <AboutUs />
      </Container>
    </Box>
  );
}
