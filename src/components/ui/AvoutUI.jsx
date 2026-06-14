import React from "react";
import { Grid, Box } from "@mui/material";
// import { motion } from "framer-motion";
import CategoryCard from "../../components/common09/CategoryCard";
import ImagesData01 from "../../data/ImagesData01";

const AboutUi = () => {
  return (
    <Box
      component="section"
      sx={{
        height: { xs: "auto", md: "100vh" },
        overflow: "hidden",
        p: { xs: 0, sm: 0 },
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          height: "100%",
        }}
      >
        {/* Left full-height card */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <CategoryCard {...ImagesData01[0]} align="left" />
        </Grid>

        {/* Center column split into two cards (top and bottom) */}
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 2,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box>
            <CategoryCard {...ImagesData01[1]} align="right" />
          </Box>

          <Box sx={{ display: { xs: "block", sm: "none", md: "block" } }}>
            <CategoryCard {...ImagesData01[2]} align="left" />
          </Box>
        </Grid>

        {/*  */}
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            gap: 2,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <CategoryCard {...ImagesData01[1]} align="right" />

          <CategoryCard {...ImagesData01[2]} align="left" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutUi;
