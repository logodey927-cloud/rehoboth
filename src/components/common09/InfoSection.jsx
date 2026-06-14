import React from "react";
import { Box, Typography } from "@mui/material";
import StyledButton from "./StyledButton";

// Reusable Section Component
const InfoSection = ({
  subtitle,
  subtitleColor = "#47672f",
  title,
  titleColor = "#1a1f2e",
  description,
  descriptionColor = "#757575",
  imgIcon,
  colorBtn: _colorBtn, // Accept but don't use - kept for backward compatibility
  btnText,
  btnLink,
  align = "center", // "left" | "right" | "center"
  btnAlign = "center", // "left" | "right" | "center"
  descriptionAlign = "center", // "left" | "right" | "center"
  bgColor = "transparent",
  variant = "custom",
  ...rest
}) => {
  // Remove colorBtn from rest to prevent it from being passed to DOM (in case it's passed but not destructured)
  const { colorBtn: __, ...domProps } = rest;
  // Determine flex direction based on alignment
  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return (
    <Box
      component="section"
      {...domProps}
      sx={{
        width: "100%",
        py: { xs: 0 },
        px: { xs: 0, sm: 6 },
        textAlign: align,
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: justifyMap[align],
        justifyContent: "center",
      }}
    >
      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="subtitle1"
          sx={{
            color: subtitleColor,
            opacity: 0.9,
            fontWeight: 500,
            mb: 0,
            fontFamily: '"Mr De Haviland", cursive',
            fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Title */}
      {title && (
        <Typography
          variant="h4"
          sx={{
            color: titleColor,
            fontWeight: 300,
            mb: 3,
            fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
          }}
        >
          {title}
        </Typography>
      )}

      {/* Image / Icon */}
      {imgIcon && (
        <Box
          component="img"
          src={imgIcon}
          alt={title || "icon"}
          sx={{
            width: { xs: "100px", sm: "180px" },
            height: "auto",
            mb: 1,
            objectFit: "contain",
          }}
        />
      )}

      {/* Description */}
      {description &&
        (Array.isArray(description) ? (
          description.map((para, i) => (
            <Typography
              key={i}
              variant="body1"
              sx={{
                color: "#757575",
                maxWidth: { xs: "100%", md: "600px" },
                mb: i === description.length - 1 ? (btnText ? 3 : 0) : 2, // spacing between paragraphs
                fontSize: { xs: "0.95rem", sm: "1rem" },
                lineHeight: 1.7,
                textAlign: descriptionAlign,
              }}
            >
              {para}
            </Typography>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: descriptionColor,
              maxWidth: { xs: "100%", md: "600px" },
              mb: btnText ? 3 : 0,
              fontSize: { xs: "0.95rem", sm: "1rem" },
              lineHeight: 1.7,
              textAlign: descriptionAlign,
            }}
          >
            {description}
          </Typography>
        ))}

      {/* Button */}
      {btnText && (
        <Box
          sx={{
            display: "flex",
            justifyContent: justifyMap[btnAlign],
            width: "100%",
            mt: 1,
          }}
        >
          {/* <Button
            onClick={onClick}
            variant="contained"
            sx={{
              backgroundColor: "#a38c69",
              color: "#fff",
              borderRadius: "30px",
              px: 4,
              py: 1.2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              "&:hover": { backgroundColor: "#8f7a59" },
            }}
          >
            {btnText}
          </Button> */}

          <StyledButton text={btnText} to={btnLink} variant={variant} />
        </Box>
      )}
    </Box>
  );
};

export default InfoSection;
