import React from "react";
import { Box, Typography } from "@mui/material";
import logo from "../../assets/images/logo.webp";

const TAGLINES = ["Relax.", "Revive.", "Reconnect."];

const glassCard = {
  backgroundColor: "rgba(255, 255, 255, 0.42)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  borderRadius: 2,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
};

/**
 * Left-side panel for login / register: background image, logo top-left, tagline bottom-left.
 */
export default function AuthPanelAside({ backgroundImage, flex = "0 0 48%" }) {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        flex,
        position: "relative",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "calc(100vh - 64px)",
        p: { md: 4, lg: 5 },
      }}
    >
      {/* Logo — top corner */}
      <Box
        sx={{
          ...glassCard,
          alignSelf: "flex-start",
          p: { md: 2, lg: 2.5 },
          display: "inline-flex",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Rehoboth Health & Wellness Clinic"
          sx={{
            height: { md: 52, lg: 60 },
            width: "auto",
            maxWidth: 220,
            display: "block",
          }}
        />
      </Box>

      {/* Tagline — bottom corner */}
      <Box
        sx={{
          ...glassCard,
          alignSelf: "flex-start",
          maxWidth: 440,
          p: { md: 2.5, lg: 3 },
        }}
      >
        {TAGLINES.map((line) => (
          <Typography
            key={line}
            component="p"
            sx={{
              m: 0,
              fontWeight: 800,
              fontSize: { md: "2.5rem", lg: "3rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "secondary.dark",
            }}
          >
            {line}
          </Typography>
        ))}
        <Typography
          variant="body1"
          sx={{
            mt: 2.5,
            color: "text.primary",
            fontWeight: 400,
            fontSize: { md: "1rem", lg: "1.05rem" },
            lineHeight: 1.55,
            maxWidth: 340,
          }}
        >
          Join Rehoboth to book
          <br />
          appointments and manage
          <br />
          your wellness journey.
        </Typography>
      </Box>
    </Box>
  );
}
