import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeroPageSection from "../../components/sections/HeroPageSection";
import BlogForm from "../components/blog/BlogForm";
import {
  createBlogPost,
  updateBlogPost,
  getBlogPostByIdAdmin,
} from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setFetching(true);
      const response = await getBlogPostByIdAdmin(id);
      if (response.data?.success) {
        setPost(response.data.post);
      } else {
        setError("Failed to load blog post");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load blog post");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await ensureSweetAlertReady();

      // Ensure all required fields are present
      const submitData = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
      };

      let response;
      if (isEditMode) {
        response = await updateBlogPost(id, submitData);
      } else {
        response = await createBlogPost(submitData);
      }

      if (response.data?.success) {
        await swalSuccess(
          isEditMode ? "Post Updated" : "Post Created",
          isEditMode
            ? "The blog post has been updated successfully."
            : "The blog post has been created successfully."
        );
        navigate("/admin/blog");
      } else {
        const errorMsg = response.data?.error || "Failed to save post";
        setError(errorMsg);
        await swalError("Error", errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to save post. Please try again.";
      setError(errorMsg);
      await swalError("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title={isEditMode ? "Edit Blog Post" : "Create Blog Post"}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Blog Posts", link: "/admin/blog" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/blog")}
          sx={{
            borderRadius: 0,
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to Blog Posts
        </Button>

        <BlogForm
          post={post}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onCancel={() => navigate("/admin/blog")}
        />
      </Box>
    </Box>
  );
}

