import React, { useEffect, useState } from "react";
import {
  Box, Container, Typography, CircularProgress, Alert,
  Chip, Rating, Avatar, Divider, ToggleButtonGroup, ToggleButton, Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import HeroPageSection from "../components/sections/HeroPageSection";
import { getPublicReviews } from "../api/api";
import { testimonialsData } from "../data/testimonialsData";
import { useUserAuth } from "../contexts/UserAuthContext";
import ReviewForm from "../components/reviews/ReviewForm";
import sectionIcon from "../assets/effectImag/icon-section.webp";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
}

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarSx = {
  bgcolor: "secondary.dark",
  color: "primary.main",
  fontWeight: 700,
  border: "2px solid",
  borderColor: "primary.main",
};

// ── Grid card (existing compact layout) ──────────────────────────────────────
function GridCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
      viewport={{ once: true }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 3.5 },
          backgroundColor: "#fff",
          borderRadius: 0,
          boxShadow: "0 8px 28px rgba(0,0,0,0.07)",
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          border: "1px solid rgba(245,140,0,0.1)",
          transition: "all 0.3s ease",
          height: "100%",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "rgba(149,157,165,0.2) 0px 8px 24px",
            borderColor: "primary.main",
          },
        }}
      >
        <FormatQuoteIcon
          sx={{ fontSize: 38, color: "primary.main", opacity: 0.18, position: "absolute", top: 14, right: 14 }}
        />

        <Box sx={{ mb: 1.5 }}>
          <Rating value={review.rating} readOnly size="small"
            sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }} />
        </Box>

        <Typography
          variant="body1"
          sx={{ fontStyle: "italic", color: "text.primary", lineHeight: 1.75, mb: 2.5, flexGrow: 1, fontSize: { xs: "0.93rem", md: "0.98rem" } }}
        >
          "{review.quote}"
        </Typography>

        {review.service && (
          <Box sx={{ mb: 1.5 }}>
            <Chip label={review.service} size="small"
              sx={{ backgroundColor: "primary.light", color: "#fff", fontSize: "0.72rem", fontWeight: 500 }} />
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Avatar
            src={review.avatar || undefined}
            alt={review.name}
            imgProps={{ referrerPolicy: "no-referrer" }}
            sx={{ width: 44, height: 44, fontSize: "0.85rem", ...avatarSx }}
          >
            {getInitials(review.name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", fontFamily: '"Raleway", sans-serif' }}>
              {review.name}
            </Typography>
            {review.location && (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                {review.location}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.68rem" }}>
              {review.date}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// ── List card (full-width horizontal layout) ──────────────────────────────────
function ListCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: (index % 10) * 0.05 }}
      viewport={{ once: true }}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 4 },
          flexDirection: { xs: "column", sm: "row" },
          p: { xs: 3, md: 3.5 },
          backgroundColor: "#fff",
          border: "1px solid rgba(245,140,0,0.1)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          transition: "all 0.3s ease",
          position: "relative",
          "&:hover": {
            boxShadow: "rgba(149,157,165,0.2) 0px 8px 24px",
            borderColor: "primary.main",
          },
        }}
      >
        {/* Left — reviewer info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            alignItems: { xs: "center", sm: "center" },
            gap: { xs: 2, sm: 1.5 },
            minWidth: { sm: 160 },
            maxWidth: { sm: 180 },
            borderRight: { sm: "1px solid rgba(0,0,0,0.07)" },
            pr: { sm: 3 },
            textAlign: { sm: "center" },
          }}
        >
          <Avatar
            src={review.avatar || undefined}
            alt={review.name}
            imgProps={{ referrerPolicy: "no-referrer" }}
            sx={{ width: { xs: 48, sm: 60 }, height: { xs: 48, sm: 60 }, fontSize: { xs: "0.9rem", sm: "1.1rem" }, ...avatarSx }}
          >
            {getInitials(review.name)}
          </Avatar>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", fontFamily: '"Raleway", sans-serif', fontSize: "0.9rem" }}>
              {review.name}
            </Typography>
            {review.location && (
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                {review.location}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.67rem", display: "block", mt: 0.25 }}>
              {review.date}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Rating value={review.rating} readOnly size="small"
                sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }} />
            </Box>
          </Box>
        </Box>

        {/* Right — quote + service */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <FormatQuoteIcon
            sx={{ fontSize: 32, color: "primary.main", opacity: 0.15, mb: 0.5 }}
          />
          <Typography
            variant="body1"
            sx={{ fontStyle: "italic", color: "text.primary", lineHeight: 1.8, fontSize: { xs: "0.94rem", md: "1rem" }, mb: 2 }}
          >
            "{review.quote}"
          </Typography>
          {review.service && (
            <Chip label={review.service} size="small"
              sx={{ alignSelf: "flex-start", backgroundColor: "primary.light", color: "#fff", fontSize: "0.72rem", fontWeight: 500 }} />
          )}
        </Box>
      </Box>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Testimonials() {
  const { user } = useUserAuth();
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getPublicReviews({ limit: 100 });
      if (res.data?.success && res.data.reviews.length > 0) {
        setReviews(res.data.reviews.map((r) => ({ ...r, date: timeAgo(r.date) })));
      } else {
        setReviews(testimonialsData);
      }
    } catch {
      setReviews(testimonialsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  return (
    <Box>
      <HeroPageSection
        title="Client Testimonials"
        subtitle="What Our Guests Say"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Testimonials" }]}
        borderRadius={false}
      />

      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: "#fafafa" }}>
        <Container maxWidth="lg">

          {/* Section header */}
          <Box sx={{ textAlign: "center", mb: 5 }}>
            {sectionIcon && (
              <Box component="img" src={sectionIcon} alt=""
                sx={{ height: 40, mb: 1.5, opacity: 0.75 }} />
            )}
            <Typography variant="overline"
              sx={{ color: "primary.main", letterSpacing: 3, fontWeight: 600, display: "block", mb: 1 }}>
              Client Stories
            </Typography>
            <Typography variant="h3"
              sx={{ fontWeight: 800, color: "secondary.dark", mb: 2, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
              What Our Guests Say
            </Typography>
            <Divider sx={{ width: 60, borderWidth: 2, borderColor: "primary.main", mx: "auto", mb: 2.5 }} />
            <Typography variant="body1"
              sx={{ color: "text.secondary", maxWidth: 600, mx: "auto", lineHeight: 1.8 }}>
              Explore the real experiences of our clients who have enjoyed relaxation, healing,
              and personalised care at Rehoboth Health &amp; Wellness Clinic.
            </Typography>
          </Box>

          {/* Toolbar: view toggle + write review */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 4 }}>
            {/* Write review CTA */}
            <Box>
              {user ? (
                <Box
                  component="button"
                  onClick={() => setShowForm((v) => !v)}
                  sx={{
                    background: showForm ? "primary.main" : "none",
                    border: "2px solid", borderColor: "primary.main",
                    color: showForm ? "#fff" : "primary.main",
                    px: 3, py: 1, cursor: "pointer",
                    fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s",
                    "&:hover": { backgroundColor: "primary.main", color: "#fff" },
                  }}
                >
                  {showForm ? "Cancel" : "Write a Review"}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </Typography>
              )}
            </Box>

            {/* View mode toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => { if (val) setViewMode(val); }}
              size="small"
              sx={{ "& .MuiToggleButton-root": { borderRadius: 0, px: 1.5 } }}
            >
              <Tooltip title="Grid view">
                <ToggleButton value="grid" aria-label="grid view">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="List view">
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          {/* Review form */}
          {showForm && (
            <Box sx={{ maxWidth: 600, mb: 5 }}>
              <ReviewForm onSuccess={() => { setShowForm(false); fetchReviews(); }} />
            </Box>
          )}

          {/* Reviews */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : viewMode === "grid" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {reviews.map((review, i) => (
                <GridCard review={review} index={i} key={review.id || i} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {reviews.map((review, i) => (
                <ListCard review={review} index={i} key={review.id || i} />
              ))}
            </Box>
          )}

        </Container>
      </Box>
    </Box>
  );
}
