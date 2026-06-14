import React from "react";
import { Box, Typography, Button } from "@mui/material";

const CategoryCard = ({ image, title, subtitle, align, height = "100%" }) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "300px", sm: "300px", md: height },
        width: "100%",
        borderRadius: 0,
        overflow: "hidden", // ✅ keeps scaling image inside bounds
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: align },
        p: { xs: 2, sm: 4 },
        color: "#fff",
        textAlign: { xs: "center", sm: align },
        // "&:hover .image-layer": {
        //   transform: "scale(1.1)", // ✅ only scale background layer, not content box
        // },
      }}
    >
      {/* Background image layer */}
      <Box
        className="image-layer"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "transform 0.6s ease, filter 0.4s ease",
          transformOrigin: "center",
          zIndex: 0,
        }}
      />

      {/* Gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom right, rgba(0,0,0,0), rgba(0,0,0,0.3))",
          zIndex: 1,
        }}
      />

      {/* Foreground content */}
      {(title || subtitle) && (
        <Box sx={{ position: "relative", zIndex: 2 }}>
          {subtitle && (
            <Typography
              variant="subtitle2"
              sx={{ letterSpacing: 1, mb: 0, color: "#000" }}
            >
              {subtitle}
            </Typography>
          )}

          {title && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                mb: 2,
                color: "#000",
                fontSize: { xs: "1.8rem", sm: "2.2rem" },
              }}
            >
              {title}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CategoryCard;
