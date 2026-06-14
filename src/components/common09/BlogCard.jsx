import React from "react";
import { Box, Typography, Chip, Avatar } from "@mui/material";
import { CalendarToday, AccessTime, Person } from "@mui/icons-material";
import { motion } from "framer-motion";
import defaultBlogImage from "../../assets/backgroundImg/rehoboth-spa-bg.png";

const BlogCard = ({ 
  _id,
  title, 
  excerpt, 
  author, 
  date, 
  readTime, 
  category, 
  image, 
  featured_image_url,
  featured, 
  tags 
}) => {
  // Use default image if no image is provided
  const displayImage = featured_image_url || image || defaultBlogImage;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      style={{ height: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "white",
          borderRadius: 0, // No radius as requested
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Image Section */}
        <Box
          sx={{
            position: "relative",
            height: 200,
            backgroundImage: `url(${displayImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "hidden",
          }}
        >
          {/* Featured Badge */}
          {featured && (
            <Chip
              label="Featured"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                backgroundColor: "#0C6E6D",
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}

          {/* Category Badge */}
          <Chip
            label={category}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#0C6E6D",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
            }}
          />
        </Box>

        {/* Content Section */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#222",
              fontSize: "1.1rem",
              lineHeight: 1.3,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              "&:hover": {
                color: "#222", // keep title color consistent on hover
              },
            }}
          >
            {title}
          </Typography>

          {/* Excerpt */}
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: "0.9rem",
              lineHeight: 1.5,
              mb: 3,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {excerpt}
          </Typography>

          {/* Author and Date Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "#0C6E6D",
                fontSize: "0.8rem",
              }}
            >
              {author.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#666",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Person sx={{ fontSize: 14 }} />
                {author}
              </Typography>
            </Box>
          </Box>

          {/* Date and Read Time */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#999",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <CalendarToday sx={{ fontSize: 14 }} />
              {formatDate(date)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#999",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <AccessTime sx={{ fontSize: 14 }} />
              {readTime}
            </Typography>
          </Box>

          {/* Tags */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            {tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: 20,
                  borderColor: "#0C6E6D",
                  color: "#0C6E6D",
                  "&:hover": {
                    backgroundColor: "#0C6E6D",
                    color: "white",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default BlogCard;
