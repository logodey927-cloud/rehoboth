import React from "react";
import { Box, Grid } from "@mui/material";
import InfoSection from "../common09/InfoSection";
import BgImg from "../../assets/images/bg-light-06.webp";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import ContactUi from "./ContactUi";
import { motion } from "framer-motion";

export default function Contact() {
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
        {/* Heading section */}
        <Grid item component={motion.section} xs={12}>
          <InfoSection
            data-aos="fade-up"
            subtitle="Contact Us"
            title="Have Questions?"
            description="We’d love to hear from you."
            imgIcon={sectionIcon}
            align="center"
            btnAlign="center"
            // titleColor="#fff"
            // subtitleColor="#fff"
            // descriptionColor="#fff"
          />
        </Grid>

        <Grid
          sixze={{ xs: 12 }}
          component={motion.section}
          className="ContactUi"
        >
          <ContactUi />
        </Grid>
      </Grid>
    </Box>
  );
}
