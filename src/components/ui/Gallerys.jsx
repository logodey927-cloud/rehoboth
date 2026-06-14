import React from "react";
import { Box, Grid } from "@mui/material";
import BgImg from "../../assets/images/bg-light-06.webp";
import Gallerys02 from "./Gallerys02";
import InfoSection from "../common09/InfoSection";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import StyledButton from "../common09/StyledButton";

export default function Gallerys() {
  return (
    <Box
      component="section"
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
      <InfoSection
        data-aos="fade-up"
        subtitle="Gallery"
        title="Moments of Relaxation & Renewal"
        description="Discover the serene spaces and soothing rituals that make Rehoboth Spa a sanctuary for your body and mind."
        imgIcon={sectionIcon}
        align="center"
        btnAlign="center"
        colorText="#000000"
      />

      {/* <Gallerys02 /> */}
      <Grid p={{ xs: 0, sm: 4 }} pt={0} mt={4} sx={{ height: "100%" }}>
        <Gallerys02 />
        <Box
          data-aos="fade-up"
          sx={{ display: "flex", justifyContent: "center", mt: 5 }}
        >
          <StyledButton
            text="View More Gallery"
            to="/gallery"
            variant="custom"
          />
        </Box>
      </Grid>
    </Box>
  );
}
