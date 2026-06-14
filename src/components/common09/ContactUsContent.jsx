import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Phone, Email, LocationOn } from "@mui/icons-material";
import footerData from "../../data/footerData";
import SocialLinksRow from "./SocialLinksRow";

function ContactUsContent() {
  const { contact } = footerData;

  return (
    <Box sx={{ pr: { xs: 0 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          mb: 2,
          fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
        }}
      >
        Get in Touch
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#757575",
          mb: 3,
          lineHeight: 1.7,
          textAlign: "justify",
          fontSize: { xs: "0.95rem", sm: "1rem" },
        }}
      >
        We’re Rehoboth Health & Wellness Clinic, a warm and professional spa
        dedicated to relaxation, relief, and personalized care. From soothing
        massages and rejuvenating facials to holistic therapies that nurture
        both body and mind, we offer treatments designed to leave you feeling
        refreshed and balanced.
        <br />
        <br />
        Whether you’re booking a treatment, exploring our wellness programs, or
        simply have a question about our services, our friendly and
        knowledgeable team is here to guide you every step of the way. We
        believe in creating a serene, welcoming environment where your comfort
        and well-being are our top priorities.
        <br />
        <br />
        At Rehoboth, every visit is tailored to your needs. We listen carefully,
        adapt our treatments, and provide expert guidance so you can achieve
        lasting wellness and inner calm. Come experience a spa journey that
        soothes, restores, and revitalizes because you deserve to feel your best
        every day.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Phone sx={{ color: "secondary.dark" }} fontSize="small" />
          <Typography sx={{ color: "#757575" }}>{contact.phone}</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Email sx={{ color: "secondary.dark" }} fontSize="small" />
          <Typography sx={{ color: "#757575" }}>{contact.email}</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <LocationOn
            fontSize="small"
            sx={{ mt: 0.3, color: "secondary.dark" }}
          />
          <Typography sx={{ color: "#757575" }}>{contact.address}</Typography>
        </Stack>
      </Stack>

      <SocialLinksRow sx={{ justifyContent: "flex-start" }} />
    </Box>
  );
}

export default ContactUsContent;
