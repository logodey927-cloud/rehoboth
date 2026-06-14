import React from "react";
import { Box, Typography, Button } from "@mui/material";
import StyledButton from "./StyledButton";

const InfoSection02 = ({
  title,
  description,
  imgIcon,
  btnText,
  btnLink,
  align = "center",
  btnAlign = "center",
  bgColor = "transparent",
  ...rest
}) => {
  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return (
    <Box
      {...rest}
      component="section"
      className="hoverParent"
      sx={{
        width: "100%",
        py: { xs: 4, sm: 6 },
        px: { xs: 4, sm: 6, lg: 8 },
        textAlign: align,
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: justifyMap[align],
        justifyContent: "center",
        position: "relative",

        // 💡 when the button is hovered, change the icon color
        "&:has(button:hover) img": {
          filter:
            "invert(51%) sepia(100%) saturate(1082%) hue-rotate(2deg) brightness(97%) contrast(105%)",
        },
      }}
    >
      {/* Image / Icon */}
      {imgIcon && (
        <Box
          component="img"
          src={imgIcon}
          alt={title || "icon"}
          sx={{
            width: { xs: "80px", sm: "90px" },
            height: { xs: "auto", sm: "90px" },
            mb: 3,
            objectFit: "contain",
            transition: "filter 0.4s ease",
            filter:
              "invert(40%) sepia(10%) saturate(900%) hue-rotate(100deg) brightness(95%) contrast(90%)",
          }}
        />
      )}

      {/* Title */}
      {title && (
        <Typography
          variant="h4"
          sx={{
            color: "#1a1f2e",
            fontWeight: 300,
            mb: 0,
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
      )}

      {/* Description */}
      {description && (
        <Typography
          variant="body1"
          sx={{
            color: "#757575",
            maxWidth: { xs: "100%", md: "600px" },
            mb: btnText ? 3 : 0,
            fontSize: { xs: "0.95rem", sm: "1rem" },
            lineHeight: 1.7,
            textAlign: align,
          }}
        >
          {description}
        </Typography>
      )}

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
          <StyledButton text={btnText} to={btnLink} variant="custom" />
        </Box>
      )}
    </Box>
  );
};

export default InfoSection02;
