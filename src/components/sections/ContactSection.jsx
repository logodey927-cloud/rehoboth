import { Box, Container } from "@mui/material";
import Contact from "../ui/Contact";

export default function ContactSection() {
  return (
    <Box sx={{ position: "relative", px: 0 }}>
      <Container maxWidth="false" style={{ padding: "0" }}>
        <Contact />
      </Container>
    </Box>
  );
}
