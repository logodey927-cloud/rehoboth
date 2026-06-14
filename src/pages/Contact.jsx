import React from "react";
import { Box, Grid } from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import ContactUsContent from "../components/common09/ContactUsContent";
import ContactForm from "../components/common09/ContactForm";
import FullWidthCTA from "../components/common09/FullWidthCTA";
import ContactMap from "../components/common09/ContactMap";
import BgImg from "../assets/images/promo-1.webp";
import SEO from "../components/common09/SEO";

export default function Contact() {
  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#fafafa", p: 0 }}
    >
      <SEO 
        title="Contact Us"
        description="Get in touch with Rehoboth Health & Wellness Clinic in Rochdale, Greater Manchester. Contact us to book an appointment, ask questions, or learn more about our wellness services."
        keywords="contact us, spa contact, wellness clinic contact, Rochdale, book appointment, get in touch"
      />
      <HeroPageSection
        title="Contact Us"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Contact Us" }]}
      />

      <Box>
        <Grid
          container
          spacing={3}
          sx={{
            height: "100%",
            position: "relative",
            zIndex: 1,
            alignItems: "center",
            py: { xs: 6, sm: 10 },
            px: { xs: 2, sm: 6 },
          }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <ContactUsContent />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ContactForm btnText="Send Message" variantColor="secondary" />
          </Grid>
        </Grid>
      </Box>

      <FullWidthCTA
        title="Relax and Rejuvenate"
        description="Experience the ultimate spa treatments in a serene environment. From calming massages to revitalising facials, our therapists tailor each session to your needs so you leave refreshed, restored and glowing."
        buttonText="Book Appointment"
        to="/book-appointment"
        BgImg={BgImg}
      />

      <Box sx={{ width: "100%" }}>
        <ContactMap />
      </Box>
    </Box>
  );
}
