import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";
import { blogData } from "../../data/blogData";
import { profileCardSx, profileSectionTitleSx, profileViewAllSx } from "../profile/profileStyles";

const POSTS_TO_SHOW = 4;

export default function RecentBlogPostsWidget() {
  const posts = [...blogData].slice(0, POSTS_TO_SHOW);

  return (
    <Paper elevation={0} sx={{ ...profileCardSx, p: { xs: 2, md: 2.5 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Typography sx={profileSectionTitleSx}>Recent from Our Blog</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
            Wellness tips and updates from Rehoboth.
          </Typography>
        </Box>
        <Typography
          component={RouterLink}
          to="/blog"
          sx={{ ...profileViewAllSx, fontSize: "0.8rem", whiteSpace: "nowrap", ml: 1 }}
        >
          View all
        </Typography>
      </Box>

      {/* Post list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {posts.map((post, i) => (
          <Box
            key={post.id}
            component={RouterLink}
            to={`/blog/${post.slug}`}
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
              py: 1.5,
              borderTop: i === 0 ? "none" : "1px solid",
              borderColor: "divider",
              textDecoration: "none",
              "&:hover .post-title": { color: "secondary.main" },
            }}
          >
            {/* Thumbnail */}
            <Box
              sx={{
                width: 60,
                height: 60,
                flexShrink: 0,
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "secondary.light",
                backgroundImage: post.image ? `url(${post.image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Text */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                className="post-title"
                fontSize="0.82rem"
                fontWeight={600}
                color="text.primary"
                lineHeight={1.35}
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  transition: "color 0.15s",
                }}
              >
                {post.title}
              </Typography>
              {post.excerpt && (
                <Typography
                  fontSize="0.73rem"
                  color="text.secondary"
                  lineHeight={1.4}
                  mt={0.4}
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.5 }}>
                <Typography fontSize="0.72rem" color="secondary.main" fontWeight={600}>
                  Read more
                </Typography>
                <ArrowForward sx={{ fontSize: 11, color: "secondary.main" }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
