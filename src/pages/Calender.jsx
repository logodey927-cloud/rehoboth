import React from "react";
import { Box } from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import Calendar from "../components/common09/Calendar";
import SEO from "../components/common09/SEO";

export default function Calender() {
  return (
    <Box>
      <SEO 
        title="Available Dates"
        description="View available appointment dates at Rehoboth Health & Wellness Clinic. Check our calendar to find the perfect time for your wellness treatment in Rochdale, Greater Manchester."
        keywords="available dates, appointment calendar, spa availability, book appointment, schedule wellness treatment"
      />
      <HeroPageSection
        title="Available Dates"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Calendar" }]}
      />
      <Calendar showInfoBox={true} />
    </Box>
  );
}
