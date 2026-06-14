import React from "react";
import { Box, Grid } from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import PricingPack from "../components/common09/PricingPack/PricingPack";
import OurTeamSec from "../components/sections/OurTeamSec";
import OurTreatments from "../components/sections/OurTreatments";
// import RelaxingTreatments from "../components/sections/RelaxingTreatments";
import BgImg from "../assets/images/hot-stone-1.webp";
import BgImg2 from "../assets/images/bg-light-01.webp";
import WellnessTreatments from "../components/sections/WellnessTreatments";
import SEO from "../components/common09/SEO";

const offers = [
  {
    days: "MON - TUE",
    timing: "10AM - 4PM",
    offer: "20% OFF IN INDIVIDUAL BILL",
  },
  {
    days: "WED - FRI",
    timing: "10AM - 4PM",
    offer: "30% OFF IN INDIVIDUAL BILL",
  },
  { days: "SATURDAY", timing: "10AM - 4PM", offer: "15% OFF IN GROUP BILL" },
];

function About() {
  return (
    <Box>
      <SEO
        title="About Us"
        description="Learn about Rehoboth Health & Wellness Clinic. Your trusted wellness destination in Rochdale, Greater Manchester. Discover our team, treatments, and commitment to your health and relaxation."
        keywords="about us, wellness clinic, spa team, Rochdale, Manchester, health and wellness, spa treatments"
      />
      {/* Hero Section */}
      <HeroPageSection
        title="About Us"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "About Us" }]}
      />

      <Box>
        <Grid
          container
          spacing={3}
          sx={{
            position: "relative",
            backgroundImage: `url(${BgImg2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            py: { xs: 6, sm: 10 },
            px: { xs: 2, sm: 6 },
            minHeight: { xs: "auto", md: "100vh" },
            overflow: "hidden",
          }}
        >
          <Grid size={{ xs: 12, md: 6 }} sx={{ p: 2 }}>
            <Box
              component="img"
              src={BgImg}
              alt="Hot stone massage therapy treatment at Rehoboth Health & Wellness Clinic"
              sx={{
                // height: { xs: 60, md: 80 },
                width: "100%",
                mb: 2,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{}}>
            <OurTreatments />
          </Grid>
        </Grid>

        {/* Treatments 2 */}
        <WellnessTreatments />

        {/* Pricing Pack */}
        <PricingPack
          title="Comprehensive Wellness & Therapy Pricing"
          subtitle="Our Services"
          description="Explore a wide range of professional treatments designed to restore balance, beauty, and relaxation. From therapeutic massages to advanced skincare and holistic wellness, each session is tailored to meet your unique needs."
          buttonText="BOOK A SESSION"
          // onButtonClick={() => alert("Redirecting to booking...")}
          offers={offers}
        />

        {/* Our Team */}
        <OurTeamSec />
      </Box>
    </Box>
  );
}

export default About;
