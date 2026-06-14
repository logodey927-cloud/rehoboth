import React, { useEffect, useState } from "react";
import {
  Box, Typography, Rating, CircularProgress, Button, Divider,
} from "@mui/material";
import { getPublicReviews } from "../../api/api";
import ReviewForm from "./ReviewForm";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

export default function ServiceReviews({ serviceId, serviceName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    if (!serviceId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getPublicReviews({ service_id: serviceId, limit: 10 });
      if (res.data?.success) {
        setReviews(
          (res.data.reviews || []).map((r) => ({
            ...r,
            date: timeAgo(r.date),
          }))
        );
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  if (!serviceId) return null;

  return (
    <Box sx={{ mt: 5, pt: 4, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 400,
          color: "secondary.dark",
          mb: 2,
          fontFamily: '"Raleway", sans-serif',
          fontSize: { xs: "1.2rem", md: "1.5rem" },
        }}
      >
        Client Reviews
      </Typography>

      {loading ? (
        <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : reviews.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          {reviews.map((review) => (
            <Box
              key={review.id}
              sx={{
                p: 2,
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "#fafafa",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {review.name} · {review.date}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: "italic", lineHeight: 1.7 }}>
                "{review.quote}"
              </Typography>
              {review.location && (
                <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
                  {review.location}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          No approved reviews for this service yet. Be the first to share your experience.
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      <Button
        variant="outlined"
        color="primary"
        onClick={() => setShowForm((v) => !v)}
        sx={{ borderRadius: 0, textTransform: "none", mb: showForm ? 2 : 0 }}
      >
        {showForm ? "Cancel" : "Write a Review"}
      </Button>

      {showForm && (
        <ReviewForm
          serviceId={serviceId}
          serviceName={serviceName}
          onSuccess={() => {
            setShowForm(false);
            fetchReviews();
          }}
        />
      )}
    </Box>
  );
}
