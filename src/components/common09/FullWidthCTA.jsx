import React from "react";
import { Box, Typography } from "@mui/material";
import StyledButton from "./StyledButton";

export default function FullWidthCTA({
  title,
  description,
  buttonText,
  to,
  BgImg,
}) {
  return (
    <Box
      sx={{
        position: "relative",
        backgroundImage: BgImg ? `url(${BgImg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 6 },
        textAlign: "center",
        color: "primary.main",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          mb: 3,
          fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          maxWidth: 800,
          mx: "auto",
          mb: 3,
          lineHeight: 1.8,
          color: "#fff",
        }}
      >
        {description}
      </Typography>
      {buttonText && (
        <StyledButton text={buttonText} to={to} variant="secondary" />
      )}
    </Box>
  );
}
