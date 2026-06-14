import React from "react";
import { Box, Container } from "@mui/material";
import OurTeamUI from "../ui/OurTeamUI";
import BgImg from "../../assets/images/bg-light-03.webp";

export default function OurTeamSec() {
  return (
    <Box
      component="section"
      className="OurTeamSec"
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
      <Container maxWidth="false" style={{ padding: "0" }}>
        <OurTeamUI />
      </Container>
    </Box>
  );
}
