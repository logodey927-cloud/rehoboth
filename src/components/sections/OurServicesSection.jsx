import React from "react";
import { Box, Container } from "@mui/material";
import OurServices from "../ui/OurServices";

export default function OurServicesSection() {
  return (
    <Box
      className="OurServicesSection"
      sx={{
        py: 0,
        px: 0,
      }}
    >
      <Container maxWidth="false" style={{ padding: "0" }}>
        <OurServices />
      </Container>
    </Box>
  );
}
