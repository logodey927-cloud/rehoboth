import React from "react";
import { Box, Grid } from "@mui/material";
import CategoryCard from "../../components/common09/CategoryCard";
import AboutImageData from "../../data/AboutImagedata";

const Gallerys02 = () => {
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
        data-aos="zoom-in"
        sx={{
          height: "100%",
        }}
      >
        {/* Left full-height card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CategoryCard {...AboutImageData[0]} align="left" />
        </Grid>

        <Grid
          size={{ xs: 12, sm: 6, md: 4 }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <CategoryCard {...AboutImageData[1]} align="left" />
        </Grid>

        <Grid
          size={{ xs: 12, sm: 6, md: 4 }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <CategoryCard {...AboutImageData[2]} align="left" />
        </Grid>

        {/* Center column split into two cards (top and bottom) */}
        <Grid
          size={{ xs: 12, sm: 6, md: 4 }}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            gap: 2,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <CategoryCard {...AboutImageData[1]} align="right" />

          <CategoryCard {...AboutImageData[2]} align="left" />
        </Grid>

        {/* Right full-height card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CategoryCard {...AboutImageData[3]} align="right" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Gallerys02;
