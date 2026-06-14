import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import defaultTeamImage from "../../assets/backgroundImg/rehoboth-spa-bg.png";

export default function TeamMuiCard({
  _id,
  title,
  role,
  image,
  specialisation,
  onClick,
}) {
  // Use default image if no image is provided
  const displayImage = image || defaultTeamImage;

  // Truncate specialisation for card display
  const truncatedSpecialisation = specialisation
    ? specialisation.length > 100
      ? specialisation.substring(0, 100) + "..."
      : specialisation
    : "";

  return (
    <Card
      sx={{
        borderRadius: 0,
        boxShadow: "none",
        height: "100%",
        transition: "transform 0.3s ease",
        border: "1px solid #eee",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          // "& .MuiTypography-root": {
          //   color: "#fff !important",
          // },
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          transition: "transform 0.3s ease",
          "&:hover": {
            boxShadow: "none",
            bgcolor: "#fff !important",
            color:"inherit !important",
            "& .MuiTypography-root": {
              color: "inherit",
            },
          },
        }}
      >
        <CardMedia
          component="img"
          height="350"
          image={displayImage}
          alt={title}
          sx={{ objectFit: "cover" }}
        />
        <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Typography variant="overline" sx={{ color: "secondary.dark" }}>
            {role}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "inherit",
              "&:hover": {
                color: "inherit",
              },
            }}
          >
            {title}
          </Typography>
          {truncatedSpecialisation && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {truncatedSpecialisation}
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              color: "text.disabled",
              fontSize: ".85rem",
              mt: "auto",
            }}
          >
            <Box
              component="span"
              sx={{
                ml: "auto",
                color: "secondary.dark",
                textDecoration: "underline",
              }}
            >
              View Profile
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
