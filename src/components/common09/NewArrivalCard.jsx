import React from "react";
import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const NewArrivalCard = ({ image, hoverImage, title, rating, price }) => {
  // Function to render star rating
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} sx={{ color: "#f58c00", fontSize: 20 }} />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <StarBorderIcon
            key={`empty-${i}`}
            sx={{ color: "#f58c00", fontSize: 20 }}
          />
        ))}
      </>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        borderRadius: 0,
        overflow: "hidden",
        bgcolor: "#fff",
        width: 280,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          // boxShadow: "rgba(149, 157, 165, 0.1) 0px 8px 24px",
        },
        "&:hover .image-layer": {
          transform: "scale(1.1)",
          backgroundImage: hoverImage ? `url(${hoverImage})` : undefined,
        },
      }}
    >
      {/* Image Section */}
      <Box
        className="image-layer"
        sx={{
          flex: "0 0 200px",
          height: 200,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "transform 0.4s ease, background-image 0.4s ease",
        }}
      />

      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#222",
              fontSize: "1.1rem",
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            {renderStars()}
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0C6E6D",
            fontSize: "1.2rem",
            mt: "auto",
          }}
        >
          ${price.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default NewArrivalCard;
