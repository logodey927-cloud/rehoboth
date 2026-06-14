import { useState } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import BlogCard from "../common09/BlogCard";
import { blogData } from "../../data/blogData";

export default function BlogCard2({ posts = [] }) {
  const [isPaused, setIsPaused] = useState(false);
  // Use posts from API if provided, otherwise fall back to static blogData
  const featuredArticles = posts.length > 0 
    ? posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author || "Team Rehoboth",
        date: post.date,
        readTime: post.read_time,
        category: post.category,
        image: post.featured_image_url || post.image,
        featured_image_url: post.featured_image_url,
        featured: post.is_featured,
        tags: post.tags || [],
      }))
    : blogData.filter((article) => article.featured);
  const duplicatedArticles = [...featuredArticles, ...featuredArticles];

  return (
    <Box
      sx={{
        mt: 6,
        position: "relative",
        overflow: "hidden",
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "100px",
          zIndex: 2,
          pointerEvents: "none",
        },
        "&::before": {
          left: 0,
          background:
            "linear-gradient(to right, rgba(250,250,250,1), rgba(250,250,250,0))",
        },
        "&::after": {
          right: 0,
          background:
            "linear-gradient(to left, rgba(250,250,250,1), rgba(250,250,250,0))",
        },
      }}
    >
      <motion.div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        animate={{
          x: isPaused ? undefined : [0, -320 * featuredArticles.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
        style={{
          display: "flex",
          gap: "24px",
          width: "max-content",
        }}
      >
        {duplicatedArticles.map((article, index) => (
          <motion.div
            key={`${article.id}-${index}`}
            style={{
              flexShrink: 0,
              width: "300px",
            }}
          >
            <BlogCard {...article} />
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
}
