import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Chip,
  Divider,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogPostBySlug, getBlogCategories, getBlogTags } from "../api/api";
import BlogSidebar from "../components/common09/BlogSidebar";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";
import defaultBlogImage from "../assets/backgroundImg/rehoboth-spa-bg.png";

const DEFAULT_DESCRIPTION = "Relax • Revive • Reconnect. Your premier destination for health and wellness in Rochdale, Greater Manchester, United Kingdom.";

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    fetchPost();
    fetchCategories();
    fetchTags();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBlogPostBySlug(slug);
      if (response.data?.success) {
        setPost(response.data.post);
      } else {
        setError("Post not found");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getBlogCategories();
      if (response.data?.success) {
        setCategories(["All", ...(response.data.categories || [])]);
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const fetchTags = async () => {
    try {
      const response = await getBlogTags();
      if (response.data?.success) {
        setTags(response.data.tags || []);
      }
    } catch (err) {
      // Error handled silently
    }
  };

  if (loading) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error || "Article not found."}
        </Alert>
      </Box>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://rehoboth.example/blog/${slug}`;
  const encodedShare = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#ffffff" }}
    >
      <SEO 
        title={post.title}
        description={post.excerpt || `Read ${post.title} on Rehoboth Health & Wellness Clinic blog. ${DEFAULT_DESCRIPTION}`}
        image={post.featured_image_url || post.image || defaultBlogImage}
        type="article"
        keywords={post.tags?.join(", ") || "wellness, health, spa, blog"}
      />
      <HeroPageSection
        title={post.title}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Blog", link: "/blog" },
          { label: post.title },
        ]}
      />

      <Grid
        container
        spacing={2}
        sx={{ py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 6 } }}
      >
        {/* Main content */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ px: { xs: 0, md: 2 }, py: { xs: 3, md: 4 } }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
            }}
          >
            {/* Top image - use default if no featured image */}
            <Box
              component="img"
              src={post.featured_image_url || post.image || defaultBlogImage}
              alt={post.title}
              sx={{
                width: "100%",
                height: { xs: 220, md: 500 },
                objectFit: "cover",
                mb: 2,
              }}
            />

            {/* Title and meta */}
            <Typography variant="overline" sx={{ color: "secondary.dark" }}>
              {post.category}
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 300,
                mb: 1,
                fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
              }}
            >
              {post.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.disabled", mb: 3 }}>
              {formattedDate}
              {post.read_time && ` • ${post.read_time} min read`}
            </Typography>

            {/* Intro / description */}
            {post.excerpt && (
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 500,
                  mb: 3,
                  color: "#757575",
                }}
              >
                {post.excerpt}
              </Typography>
            )}

            {/* Two images inside content */}
            {Array.isArray(post.images) && post.images.length > 0 && (
              <Grid container spacing={2} sx={{ my: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    component="img"
                    src={post.images[0]}
                    alt={`${post.title} - Wellness treatment image`}
                    sx={{ width: "100%", height: 260, objectFit: "cover" }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    component="img"
                    src={post.images[1] || post.images[0]}
                    alt={`${post.title} - Additional wellness image`}
                    sx={{ width: "100%", height: 260, objectFit: "cover" }}
                  />
                </Grid>
              </Grid>
            )}

            {/* Main body */}
            {(post.content_html || post.contentHtml) ? (
              <Box
                sx={{
                  mt: 3,
                  fontFamily: '"Raleway", sans-serif',
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    fontWeight: 600,
                    color: "#1a1f2e",
                    mt: 4,
                    mb: 2,
                    lineHeight: 1.3,
                    fontFamily: '"Raleway", sans-serif',
                  },
                  "& h1": {
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  },
                  "& h2": {
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  },
                  "& h4": {
                    fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                  },
                  "& h6": {
                    fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
                  },
                  "& p": {
                    color: "#495057",
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    lineHeight: 1.8,
                    mb: 2.5,
                    textAlign: "justify",
                    fontFamily: '"Raleway", sans-serif',
                  },
                  "& ul, & ol": {
                    mb: 2.5,
                    pl: 3,
                    fontFamily: '"Raleway", sans-serif',
                    "& li": {
                      color: "#495057",
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      lineHeight: 1.8,
                      mb: 1,
                      fontFamily: '"Raleway", sans-serif',
                    },
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    my: 3,
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                  },
                  "& blockquote": {
                    borderLeft: "4px solid #47672f",
                    pl: 3,
                    py: 2,
                    my: 3,
                    backgroundColor: "#f8f9fa",
                    fontStyle: "italic",
                    color: "#495057",
                    borderRadius: "0 8px 8px 0",
                    fontFamily: '"Raleway", sans-serif',
                  },
                  "& a": {
                    color: "#47672f",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  },
                  "& strong, & b": {
                    fontWeight: 600,
                    color: "#1a1f2e",
                    fontFamily: '"Raleway", sans-serif',
                  },
                  "& code": {
                    backgroundColor: "#f8f9fa",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.9em",
                    fontFamily: "monospace",
                    color: "#47672f",
                  },
                  "& pre": {
                    backgroundColor: "#f8f9fa",
                    padding: 2,
                    borderRadius: "8px",
                    overflow: "auto",
                    mb: 2.5,
                    "& code": {
                      backgroundColor: "transparent",
                      padding: 0,
                    },
                  },
                  "& hr": {
                    border: "none",
                    borderTop: "1px solid #e9ecef",
                    my: 4,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: post.content_html || post.contentHtml || "" }}
              />
            ) : (
              <Typography
                variant="body1"
                component="div"
                sx={{
                  color: "#495057",
                  mt: 3,
                  whiteSpace: "pre-line",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.8,
                  textAlign: "justify",
                  fontFamily: '"Raleway", sans-serif',
                  "& p": {
                    mb: 2.5,
                  },
                }}
              >
                {post.content}
              </Typography>
            )}

            {/* Tags */}
            {!!post.tags?.length && (
              <Stack direction="row" flexWrap="wrap" gap={1.2} sx={{ mt: 3 }}>
                {post.tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    variant="outlined"
                    sx={{ borderRadius: 0 }}
                  />
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Share icons */}
            <Stack direction="row" alignItems="center" gap={1}>
              <ShareIcon sx={{ color: "#888" }} />
              <Typography variant="body2" sx={{ color: "#666", mr: 1 }}>
                Share
              </Typography>
              <IconButton
                aria-label="share on facebook"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedShare}`,
                    "_blank"
                  )
                }
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="share on twitter"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodedShare}&text=${encodedTitle}`,
                    "_blank"
                  )
                }
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label="share on linkedin"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShare}`,
                    "_blank"
                  )
                }
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                aria-label="share on whatsapp"
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedShare}`,
                    "_blank"
                  )
                }
              >
                <WhatsAppIcon />
              </IconButton>
            </Stack>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
              p: { xs: 2, md: 3 },
              borderLeft: { xs: "none", md: "1px solid #eee" },
            }}
          >
            <BlogSidebar
              searchTerm={searchTerm}
              onSearchChange={(v) => setSearchTerm(v)}
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={(v) => {
                setActiveCategory(v);
                navigate("/blog");
              }}
              tags={tags}
              activeTag={activeTag}
              onTagChange={(t) => {
                setActiveTag(t);
                navigate("/blog");
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Testimonials */}
      <TestimonialsSection />
    </Box>
  );
}
