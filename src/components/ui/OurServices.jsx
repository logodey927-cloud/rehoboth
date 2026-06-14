import React from "react";
import { Box, Grid } from "@mui/material";
import InfoSection from "../common09/InfoSection";
import BgImg from "../../assets/images/bg-light-02.webp";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import OurServicesCards from "../../components/common09/OurServicesCards";
import { motion } from "framer-motion";

export default function OurServices() {
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <Grid
        container
        spacing={0}
        justifyContent="center"
        sx={{ position: "relative", zIndex: 1 }} // make sure content is above overlay
      >
        <Grid component={motion.section} size={{ xs: 12 }}>
          <InfoSection
            data-aos="fade-up"
            subtitle="Skin & Beauty"
            title="Facials, Nails & Waxing"
            description="Discover our specialist beauty and skin treatments at Rehoboth. From precision facials and dermaplaning, to professional nails and expert waxing, each experience is delivered with care in a calm spa environment. Our focus is your comfort, your results and your wellbeing."
            imgIcon={sectionIcon}
            align="center"
            btnAlign="center"
            colorText="#fff"
          />
        </Grid>

        <Grid
          item
          xs={12}
          component={motion.section}
          className="ourservices-card-container"
        >
          <OurServicesCards />
        </Grid>
      </Grid>
    </Box>
  );
}
