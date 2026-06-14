import React, { useMemo, useState, useEffect } from "react";
import { Box, Grid, Pagination, Typography, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeroPageSection from "../components/sections/HeroPageSection";
import { getBlogPosts, getBlogCategories, getBlogTags } from "../api/api";
import BlogSidebar from "../components/common09/BlogSidebar";
import BlogMuiCard from "../components/common09/BlogMuiCard";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";

export default function Blog() {
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const perPage = 8;

  useEffect(() => {
    fetchBlogData();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBlogPosts({ limit: 100 });
      if (response.data?.success) {
        setBlogData(response.data.posts || []);
      } else {
        setError("Failed to load blog posts");
      }
    } catch (err) {
      setError("Failed to load blog posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getBlogCategories();
      if (response.data?.success) {
        setCategories(response.data.categories || []);
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

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return blogData
      .filter((a) => {
        const matchesSearch =
          q === "" ||
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          (a.tags && Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(q)));
        const matchesCategory =
          selectedCategory === "All" || a.category === selectedCategory;
        const matchesTag = !activeTag || (a.tags && Array.isArray(a.tags) && a.tags.includes(activeTag));
        return matchesSearch && matchesCategory && matchesTag;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [blogData, searchTerm, selectedCategory, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const openPost = (slug) => navigate(`/blog/${slug}`);

  return (
    <Box
      component="main"
      className="blog-page"
      sx={{ minHeight: "100vh", backgroundColor: "#fff", p: 0 }}
    >
      <SEO 
        title="Our Blog"
        description="Read our latest wellness articles, health tips, and spa insights from Rehoboth Health & Wellness Clinic. Discover expert advice on relaxation, self-care, and holistic wellness practices."
        keywords="wellness blog, health tips, spa articles, wellness advice, relaxation tips, holistic health"
      />
      <HeroPageSection
        title="Our Blog"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Blog" }]}
      />

      <Grid
        container
        spacing={2}
        sx={{ py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 6 } }}
      >
        {/* Main */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ px: { xs: 0, md: 2 }, py: { xs: 3, md: 4 } }}
        >
          <Box
            id="blog-list-panel"
            ref={React.useRef(null)}
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 300,
                mb: 3,
                fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
              }}
            >
              {searchTerm || selectedCategory !== "All" || activeTag
                ? "Search Results"
                : "All Articles"}
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 0 }}>
                {error}
              </Alert>
            ) : (
                <Grid container spacing={2}>
                  {pageItems.map((a) => (
                    <Grid key={a.id} size={{ xs: 12, sm: 6 }}>
                      <BlogMuiCard
                        {...a}
                        image={a.featured_image_url || a.image}
                        onClick={() => openPost(a.slug)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => {
                  setPage(v);
                  const panel = document.getElementById("blog-list-panel");
                  if (panel) panel.scrollTo({ top: 0, behavior: "smooth" });
                  else window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="outlined"
                shape="rounded"
                sx={{ "& .MuiPaginationItem-root": { borderRadius: 0 } }}
              />
            </Box>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
              onSearchChange={(v) => {
                setPage(1);
                setSearchTerm(v);
              }}
              categories={categories}
              activeCategory={selectedCategory}
              onCategoryChange={(v) => {
                setPage(1);
                setSelectedCategory(v);
              }}
              tags={tags}
              activeTag={activeTag}
              onTagChange={(t) => {
                setPage(1);
                setActiveTag(t);
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* TestimonialsSection */}
      <TestimonialsSection />
    </Box>
  );
}
