import React, { useMemo, useState, useEffect, useRef } from "react";
import { Box, Grid, Pagination, Typography, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeroPageSection from "../components/sections/HeroPageSection";
import BlogSidebar from "../components/common09/BlogSidebar";
import VoucherCard from "../components/vouchers/VoucherCard";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";
import { getAllVouchers } from "../api/api";
import VoucherRequestForm from "../components/vouchers/VoucherRequestForm";

export default function Vouchers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Request form is shown in VoucherDetails page (after clicking a card),
  // not on the /vouchers listing cards.
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const perPage = 8;
  const voucherListPanelRef = useRef(null);

  // Fetch vouchers from API with retry logic
  useEffect(() => {
    const fetchVouchers = async (retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds

      try {
        setLoading(true);
        setError(null);
        const response = await getAllVouchers();
        if (response.data && response.data.success) {
          setVouchers(response.data.vouchers || []);
        } else {
          setError("Failed to load vouchers");
        }
      } catch (err) {
        const errorData = err.response?.data;
        const isRetryable = errorData?.retryable === true;
        const errorMessage = errorData?.error || "Failed to load vouchers";

        // If error is retryable and we haven't exceeded max retries, retry
        if (isRetryable && retryCount < maxRetries) {
          setTimeout(() => {
            fetchVouchers(retryCount + 1);
          }, retryDelay * (retryCount + 1)); // Exponential backoff
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // Extract categories and tags from vouchers
  const categories = useMemo(() => {
    const cats = vouchers.map((v) => v.voucher_type || "Other");
    return [...new Set(cats)];
  }, [vouchers]);

  const tags = useMemo(() => {
    const tagList = vouchers.flatMap((v) => {
      const tags = [];
      if (v.discount_type) tags.push(v.discount_type);
      if (v.voucher_type) tags.push(v.voucher_type);
      return tags;
    });
    return [...new Set(tagList)];
  }, [vouchers]);

  // Filter vouchers
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return vouchers
      .filter((v) => {
        const matchesSearch =
          q === "" ||
          v.title?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q);
        const matchesCategory =
          selectedCategory === "All" || v.voucher_type === selectedCategory;
        const matchesTag =
          !activeTag ||
          v.discount_type === activeTag ||
          v.voucher_type === activeTag;
        return matchesSearch && matchesCategory && matchesTag;
      })
      .sort((a, b) => {
        // Sort by created_at if available, otherwise by title
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return (a.title || "").localeCompare(b.title || "");
      });
  }, [vouchers, searchTerm, selectedCategory, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const openVoucher = (id) => navigate(`/vouchers/${id}`);
  const _handleRequestVoucher = (voucherId) => {
    setSelectedVoucherId(voucherId);
    setRequestFormOpen(true);
  };

  const handleRequestFormClose = () => {
    setRequestFormOpen(false);
    setSelectedVoucherId(null);
  };

  return (
    <Box
      component="main"
      className="vouchers-page"
      sx={{ minHeight: "100vh", backgroundColor: "#fff", p: 0 }}
    >
      <SEO
        title="Gift Cards & Vouchers"
        description="Discover our special offers and gift cards at Rehoboth Health & Wellness Clinic. Perfect gifts for your loved ones or treat yourself to wellness."
        keywords="gift cards, wellness vouchers, spa vouchers, promotional offers"
      />
      <HeroPageSection
        title="Gift Cards & Vouchers"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Vouchers" }]}
      />

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ px: { xs: 2, sm: 6 }, py: 4 }}>
          <Alert 
            severity="error" 
            action={
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: '4px 8px'
                }}
              >
                Retry
              </button>
            }
          >
            {error}
          </Alert>
        </Box>
      ) : (
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
              id="voucher-list-panel"
              ref={voucherListPanelRef}
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
                  : "All Vouchers"}
              </Typography>
              {filtered.length === 0 ? (
                <Typography variant="body1" sx={{ color: "text.secondary", py: 4 }}>
                  No vouchers found. Please try different search criteria.
                </Typography>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {pageItems.map((voucher) => (
                      <Grid key={voucher.id} size={{ xs: 12, sm: 6 }}>
                        <VoucherCard
                          {...voucher}
                          onClick={() => openVoucher(voucher.id)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, v) => {
                        setPage(v);
                        if (voucherListPanelRef.current) {
                          voucherListPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      variant="outlined"
                      shape="rounded"
                      sx={{ "& .MuiPaginationItem-root": { borderRadius: 0 } }}
                    />
                  </Box>
                </>
              )}
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
                searchPlaceholder="Search vouchers..."
              />
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Voucher Request Form Modal */}
      <VoucherRequestForm
        open={requestFormOpen}
        onClose={handleRequestFormClose}
        voucherId={selectedVoucherId}
      />

      {/* TestimonialsSection */}
      <TestimonialsSection />
    </Box>
  );
}

