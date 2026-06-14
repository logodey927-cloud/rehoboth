import React from "react";
import { Box } from "@mui/material";

export default function ContactMap() {
  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "300px", sm: "450px", md: "500px", lg: "510px" },
        borderRadius: 0,
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <iframe
        title="Rehoboth Spa Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2960.536516146275!2d-72.49221402500359!3d42.09597905174638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e6e9e097eeecb1%3A0x887f2b47a3a2e8d2!2sProfessional%20Experts!5e0!3m2!1sen!2sng!4v1761656628146!5m2!1sen!2sng"
        width="100%"
        height="100%"
        style={{ border: 0 }} // ✅ style should be an object
        allowFullScreen // ✅ correct casing
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade" // ✅ correct casing
      ></iframe>
    </Box>
  );
}
