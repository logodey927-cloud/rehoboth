import React from "react";
import { Box, Typography } from "@mui/material";
import StyledButton from "../common09/StyledButton";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const CarouselSlide = ({
  img,
  imgMobile,
  title,
  subtitle,
  subtitleImg = false,
  subtitleImgUrl = "",
  description,
  titleWidthxs,
  titleWidthsm,
  titleWidthmd,
  descriptionWidthxs,
  descriptionWidthsm,
  descriptionWidthmd,
  btn,
  href,
  align,
  colorText,
  isActive,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "600px", sm: "800px", md: "100%" },
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: align },
        p: { xs: 2, sm: 4, md: 10 },
        color: "#fff",
        textAlign: { xs: align },
      }}
    >
      {/* Background image */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: { xs: `url(${imgMobile})`, lg: `url(${img})` },
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "transform 0.6s ease, filter 0.4s ease",
          zIndex: 0,
        }}
      />

      {/* Gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          // background:
          //   "linear-gradient(to bottom right, rgba(0,0,0,0.1), rgba(0,0,0,0.1))",
          zIndex: 1,
        }}
      />

      {/* Light flash / glass effect */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-150%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-20deg)",
            animation: "flash 3s infinite  ",
          },
        }}
      />

      {/* Foreground content */}
      <MotionBox
        key={isActive} // remount to replay animation
        sx={{ position: "relative", zIndex: 3, px: { xs: 2, sm: 4 } }}
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.4 }}
      >
        {/* Subtitle OR Image */}
        {subtitleImg && subtitleImgUrl ? (
          <Box sx={{ mb: 1 }}>
            <img
              src={subtitleImgUrl}
              alt="subtitle graphic"
              style={{
                width: "100px", // adjust to fit your design
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          subtitle && (
            <Typography
              variant="subtitle2"
              sx={{
                letterSpacing: 1,
                mb: 0,
                color: `${colorText}`,
                fontFamily: '"Mr De Haviland", cursive',
                fontSize: { xs: "1.2rem", sm: "1.8rem", md: "2rem" },
              }}
            >
              {subtitle}
            </Typography>
          )
        )}

        {/* logo image */}

        {title && (
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.6rem", sm: "2.2rem", md: "2.4rem" },
              color: `${colorText}`,
              fontFamily: `"Raleway", sans-serif`,
              width: {
                xs: `${titleWidthxs}`,
                sm: `${titleWidthsm}`,
                md: `${titleWidthmd}`,
              },
              align,
            }}
          >
            {title}
          </Typography>
        )}

        {description && (
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.7rem", sm: "1rem", md: "1.2rem" },
              mb: 3,
              width: {
                xs: `${descriptionWidthxs}`,
                sm: `${descriptionWidthsm}`,
                md: `${descriptionWidthmd}`,
              },

              color: `${colorText}`,
            }}
          >
            {description}
          </Typography>
        )}

        {btn && <StyledButton text={btn} to={href} variant="Primary" />}
      </MotionBox>

      {/* CSS Keyframes for flash effect */}
      <style>
        {`
          @keyframes flash {
            0% { left: -150%; }
            50% { left: 150%; }
            100% { left: 150%; }
          }
        `}
      </style>
    </Box>
  );
};

export default CarouselSlide;
