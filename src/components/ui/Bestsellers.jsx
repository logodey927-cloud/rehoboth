import React from "react";
import { Box, Grid } from "@mui/material";
import BgImg from "../../assets/images/bg-light-06.webp";
import BestsellerUi from "./BestsellerUi";
import InfoSection from "../common09/InfoSection";

export default function Bestsellers() {
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
      <Grid
        container
        spacing={4}
        sx={{
          height: "100%",
          position: "relative",
          zIndex: 1,
          alignItems: "center",
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid
            container
            spacing={0}
            justifyContent="center"
            sx={{ position: "relative", zIndex: 1 }} // make sure content is above overlay
          >
            <Grid item xs={12}>
              <InfoSection
                data-aos="fade-up"
                subtitle="Bestsellers"
                title="The Best Treatments We Trust"
                description="At Rehoboth Spa, we believe your skin and wellbeing deserve only the finest care. Every product we use has been carefully selected for its purity, gentle formulation and proven spa-grade results. Our collection includes botanical-rich skincare, therapeutic massage oils and nourishing beauty essentials that support natural balance and radiance. Free from harsh chemicals and thoughtfully sourced, these products work in harmony with our treatments to enhance relaxation, rejuvenate the skin and leave you feeling refreshed, renewed and beautifully cared for."
                align="center"
                btnAlign="center"
                descriptionAlign="justify"
                btnText="Explore Our Services"
                btnLink="/services"
                colorBtn="#47672f"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          pr={{ xs: 0, md: 4 }}
          size={{ xs: 12, md: 6 }}
          sx={{ height: "100%" }}
        >
          <BestsellerUi />
        </Grid>
      </Grid>
    </Box>
  );
}
