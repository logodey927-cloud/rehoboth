import React from "react";
import { Box, Container } from "@mui/material";
import Bestsellers from "../ui/Bestsellers";

export default function BestsellersSection() {
  return (
    <Box
      sx={{
        px: 0,
      }}
    >
      <Container maxWidth="false" style={{ padding: "0" }}>
        <Bestsellers />
      </Container>
    </Box>
  );
}
