import React from "react";
import { Box, Typography } from "@mui/material";

const ProductCard = ({ image, title, role, heightSize = "250px", ...rest }) => {
  return (
    <Box
      className="ProductCard"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mb: 4,
        cursor: "pointer",
        p: {
          sm: 2,
        },
      }}
    >
      {/* Image Wrapper */}
      <Box
        {...rest}
        sx={{
          width: "100%",
          height: { xs: "250px", sm: heightSize },
          position: "relative",
          overflow: "hidden",
          borderRadius: "0",
          transition: "transform 0.5s ease",
          bgcolor: "transparent",

          "&:hover .img": {
            transform: "scale(1.08)",
          },
          "&:hover .overlay": {
            opacity: 0.25,
          },
        }}
      >
        {/* Image */}
        <Box
          className="img"
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${image})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",

            transition: "transform 0.5s ease",
          }}
        />

        {/* Overlay */}
        <Box
          className="overlay"
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#47672f",
            opacity: 0,
            transition: "opacity 0.4s ease",
          }}
        />
      </Box>

      <Box>
        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 400,
            color: "#222",
            fontSize: { xs: "1rem", sm: "1.2rem", lg: "1.5rem" },
          }}
        >
          {title}
        </Typography>

        {/* Role */}
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            fontWeight: 400,
            fontSize: { xs: "0.75rem", sm: "1rem" },
            color: "#757575",
          }}
        >
          {role}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductCard;
