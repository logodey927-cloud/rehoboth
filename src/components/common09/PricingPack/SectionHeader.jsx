// components/PricingPack/SectionHeader.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import StyledButton from "../StyledButton";

const SectionHeader = ({
  title,
  subtitle,
  description,
  buttonText,
  // onButtonClick,
}) => {
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          mb: 3,
          fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "secondary.dark",
            mb: 2,
          }}
        >
          {subtitle}
        </Typography>
      )}

      {description && (
        <Typography variant="body1" sx={{ color: "#757575", mb: 4 }}>
          {description}
        </Typography>
      )}

      {buttonText && (
        <StyledButton
          text={buttonText}
          to="/book-appointment"
          variant="custom"
        />
      )}
    </Box>
  );
};

export default SectionHeader;
