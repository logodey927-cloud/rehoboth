import React from "react";
import { Box, Container } from "@mui/material";
import SpaServiceCategories from "../ui/SpaServiceCategories";

export default function SpaServiceCategoriesSection() {
  return (
    <Box
    className="SpaServiceCategoriesSection"
      sx={{
        color: "white",
        px: 0,
      }}
    >
      <Container maxWidth="false" style={{ padding: "0" }}>
        <SpaServiceCategories />
      </Container>
    </Box>
  );
}
