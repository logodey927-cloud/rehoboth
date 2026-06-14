import React from "react";
import { Box, Container } from "@mui/material";
import Gallerys from "../ui/Gallerys";

export default function GallerySection() {
  return (
    <Box
      sx={{
        px: 0,
      }}
    >
      <Container maxWidth="false" style={{ padding: "0" }}>
        <Gallerys />
      </Container>
    </Box>
  );
}
