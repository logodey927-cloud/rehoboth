import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Alert,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SearchIcon from "@mui/icons-material/Search";
import { getAllBlogPostsAdmin, deleteBlogPost, updateBlogPost } from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { swalConfirm, swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, statusFilter, featuredFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.is_published = statusFilter === "published";
      if (featuredFilter) params.is_featured = featuredFilter === "true";

      const res = await getAllBlogPostsAdmin(params);
      if (res.data?.success) {
        setPosts(res.data.posts || []);
      } else {
        setError("Failed to load blog posts");
      }
    } catch (err) {
      setError("Failed to load blog posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post) => {
    await ensureSweetAlertReady();
    const result = await swalConfirm(
      "Delete Blog Post",
      `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
      "Delete",
      "Cancel"
    );

    if (result.isConfirmed) {
      try {
        const res = await deleteBlogPost(post.id);
        if (res.data?.success) {
          await swalSuccess("Post Deleted", "The blog post has been deleted successfully.");
          fetchPosts();
        } else {
          await swalError("Error", res.data?.error || "Failed to delete post");
        }
      } catch (err) {
        await swalError(
          "Error",
          err.response?.data?.error || "Failed to delete post. Please try again."
        );
      }
    }
  };

  const handleTogglePublished = async (post) => {
    try {
      const res = await updateBlogPost(post.id, {
        ...post,
        is_published: !post.is_published,
      });
      if (res.data?.success) {
        await swalSuccess(
          "Post Updated",
          `Post has been ${!post.is_published ? "published" : "unpublished"}.`
        );
        fetchPosts();
      }
    } catch (err) {
      await swalError("Error", "Failed to update post status.");
    }
  };

  const handleToggleFeatured = async (post) => {
    try {
      const res = await updateBlogPost(post.id, {
        ...post,
        is_featured: !post.is_featured,
      });
      if (res.data?.success) {
        await swalSuccess(
          "Post Updated",
          `Post has been ${!post.is_featured ? "marked as featured" : "unmarked as featured"}.`
        );
        fetchPosts();
      }
    } catch (err) {
      await swalError("Error", "Failed to update featured status.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique categories
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  // Filter posts by search term
  const filteredPosts = posts.filter((post) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower) ||
      post.category?.toLowerCase().includes(searchLower) ||
      (post.tags && Array.isArray(post.tags) && post.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    );
  });

  const columns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "title",
      label: "Title",
      render: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Thumbnail */}
          <Box
            sx={{
              width: 52,
              height: 52,
              flexShrink: 0,
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "#f3f4f6",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {row.featured_image_url ? (
              <Box
                component="img"
                src={row.featured_image_url}
                alt={value}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d1d5db",
                  fontSize: "1.25rem",
                }}
              >
                📄
              </Box>
            )}
          </Box>

          {/* Text */}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1f2e" }}>
                {value}
              </Typography>
              {row.is_featured && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: 16 }} />}
                  label="Featured"
                  size="small"
                  sx={{
                    backgroundColor: "#ffc10715",
                    color: "#ffc107",
                    fontSize: "0.7rem",
                    height: 20,
                    borderRadius: 0,
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              {row.excerpt && row.excerpt.length > 80
                ? `${row.excerpt.substring(0, 80)}...`
                : row.excerpt || "—"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {row.category && (
                <Chip
                  label={row.category}
                  size="small"
                  sx={{
                    backgroundColor: "secondary.light",
                    color: "secondary.dark",
                    fontSize: "0.7rem",
                    height: 20,
                    borderRadius: 0,
                  }}
                />
              )}
              {row.tags && Array.isArray(row.tags) && row.tags.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {row.tags.slice(0, 3).join(", ")}
                  {row.tags.length > 3 && ` +${row.tags.length - 3}`}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: "date",
      label: "Date",
      width: 120,
      render: (value) => (
        <Typography variant="body2">{formatDate(value)}</Typography>
      ),
    },
    {
      id: "is_published",
      label: "Status",
      width: 100,
      render: (value) => (
        <Chip
          label={value ? "Published" : "Draft"}
          size="small"
          sx={{
            backgroundColor: value ? "#4caf5015" : "#9e9e9e15",
            color: value ? "#4caf50" : "#9e9e9e",
            fontWeight: 500,
            borderRadius: 0,
          }}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      width: 200,
      align: "right",
      render: (value, row) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Tooltip title={row.is_featured ? "Unmark Featured" : "Mark Featured"}>
            <IconButton
              size="small"
              onClick={() => handleToggleFeatured(row)}
              sx={{ color: row.is_featured ? "warning.main" : "text.secondary" }}
            >
              {row.is_featured ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={row.is_published ? "Unpublish" : "Publish"}>
            <IconButton
              size="small"
              onClick={() => handleTogglePublished(row)}
              sx={{ color: row.is_published ? "success.main" : "warning.main" }}
            >
              {row.is_published ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/blog/edit/${row.id}`)}
              sx={{ color: "primary.main" }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(row)}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <HeroPageSection
        title="Blog Posts Management"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Blog Posts" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        {/* Header Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/blog/new")}
            sx={{
              borderRadius: 0,
              textTransform: "none",
              px: 3,
            }}
          >
            Add New Post
          </Button>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{ minWidth: 250, borderRadius: 0 }}
            size="small"
          />

          <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 180, borderRadius: 0 }}
            size="small"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150, borderRadius: 0 }}
            size="small"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </TextField>

          <TextField
            select
            label="Featured"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            sx={{ minWidth: 150, borderRadius: 0 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Featured</MenuItem>
            <MenuItem value="false">Not Featured</MenuItem>
          </TextField>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <DataTable
          columns={columns}
          rows={filteredPosts}
          loading={loading && posts.length === 0}
          searchable={false}
        />
      </Box>
    </Box>
  );
}

