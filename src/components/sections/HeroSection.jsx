import { Box, Container } from "@mui/material";
import HeroCarousel from "../ui/HeroCarousel";

export default function HeroSection() {
  return (
    <Box sx={{ position: "relative", px: 0 }}>
      <Container maxWidth="false" style={{ padding: "0" }}>
        <HeroCarousel />
      </Container>
    </Box>
  );
}
