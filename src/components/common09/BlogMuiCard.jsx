import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import defaultBlogImage from "../../assets/backgroundImg/rehoboth-spa-bg.png";

export default function BlogMuiCard({
  title,
  excerpt,
  image,
  date,
  // readTime,
  category,
  onClick,
}) {
  const formatted = new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Use default image if no image is provided
  const displayImage = image || defaultBlogImage;

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
            bgcolor: "transparent !important",
            color: "inherit !important",
            "& .MuiTypography-root": {
              color: "inherit",
            },
          },
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={displayImage}
          alt={title}
          sx={{ objectFit: "cover" }}
        />
        <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Typography variant="overline" sx={{ color: "secondary.dark" }}>
            {category}
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
            {excerpt}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              color: "text.disabled",
              fontSize: ".85rem",
              mt: "auto",
            }}
          >
            <span>{formatted}</span>
            {/* <span>• {readTime} min</span> */}
            <Box
              component="span"
              sx={{
                ml: "auto",
                color: "secondary.dark",
                textDecoration: "underline",
              }}
            >
              Read more
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
