import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Rating, Button, Alert, CircularProgress,
  Paper, Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { CheckCircle, HourglassTop, Cancel, RateReview } from "@mui/icons-material";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { submitReview, getMyAppointmentReview } from "../../api/api";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

const REVIEW_STATUS_CONFIG = {
  pending: {
    icon: HourglassTop,
    bg: "#fff8e1",
    color: "#d97706",
    label: "Pending approval",
    message: "Thank you! Your review is pending approval and will appear publicly once approved by the clinic.",
  },
  approved: {
    icon: CheckCircle,
    bg: "#ecfdf5",
    color: "#059669",
    label: "Approved",
    message: "Your review has been approved and is now publicly visible.",
  },
  rejected: {
    icon: Cancel,
    bg: "#fef2f2",
    color: "#dc3545",
    label: "Not published",
    message: "Your review was not approved for publication. Please contact the clinic if you have questions.",
  },
};

function ReviewStatusBanner({ review }) {
  const cfg = REVIEW_STATUS_CONFIG[review.status] || REVIEW_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 2,
          py: 1.5,
          bgcolor: cfg.bg,
          borderLeft: `3px solid ${cfg.color}`,
        }}
      >
        <Icon sx={{ fontSize: 18, color: cfg.color, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize="0.82rem" fontWeight={700} color={cfg.color}>
            {cfg.label}
          </Typography>
          <Typography fontSize="0.78rem" color="text.secondary" lineHeight={1.5}>
            {cfg.message}
          </Typography>
        </Box>
      </Box>

      {/* Show what they submitted */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Rating
          value={review.rating}
          readOnly
          size="small"
          sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }}
        />
        <Typography fontSize="0.78rem" color="text.secondary">
          {RATING_LABELS[review.rating] || ""}
        </Typography>
        {review.edited_by_admin && (
          <Chip label="Edited by clinic" size="small" sx={{ height: 18, fontSize: "0.7rem" }} />
        )}
      </Box>
      <Typography
        fontSize="0.85rem"
        color="text.secondary"
        lineHeight={1.65}
        sx={{
          bgcolor: "#f9fafb",
          p: 1.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {review.comment}
      </Typography>
    </Box>
  );
}

export default function AppointmentTreatmentReview({ appointmentId, _serviceName, serviceId }) {
  const { user, accessToken } = useUserAuth();

  const [existingReview, setExistingReview] = useState(undefined); // undefined = loading
  const [fetchError, setFetchError]         = useState(null);

  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(-1);
  const [comment, setComment]         = useState("");
  const [displayName, setDisplayName] = useState(
    user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""
  );
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted]     = useState(false);

  useEffect(() => {
    if (!accessToken || !appointmentId) return;
    let cancelled = false;
    getMyAppointmentReview(accessToken, appointmentId)
      .then((res) => {
        if (!cancelled) setExistingReview(res.data?.review ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError("Could not load your review.");
          setExistingReview(null);
        }
      });
    return () => { cancelled = true; };
  }, [accessToken, appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!rating) return setSubmitError("Please select a star rating.");
    if (comment.trim().length < 50) return setSubmitError("Comment must be at least 50 characters.");

    setSubmitting(true);
    try {
      const res = await submitReview({
        appointment_id: appointmentId,
        ...(serviceId ? { service_id: serviceId } : {}),
        rating,
        comment: comment.trim(),
        display_name: displayName.trim() || undefined,
      });
      setSubmitted(true);
      setExistingReview(res.data?.review ?? { rating, comment: comment.trim(), status: "pending" });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit review. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ ...profileCardSx, mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <RateReview sx={{ fontSize: 18, color: "secondary.main" }} />
        <Typography sx={{ ...profileSectionTitleSx, mb: 0 }}>
          Rate your treatment
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={2.5}>
        Share your experience for this treatment. Your review will appear after clinic approval.
      </Typography>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{fetchError}</Alert>
      )}

      {existingReview === undefined && (
        <Box sx={{ py: 2, textAlign: "center" }}>
          <CircularProgress size={24} color="secondary" />
        </Box>
      )}

      {existingReview !== undefined && existingReview !== null && (
        <ReviewStatusBanner review={existingReview} />
      )}

      {existingReview === null && !submitted && (
        <Box component="form" onSubmit={handleSubmit}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {/* Rating */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={500} mb={0.75}>
              Rating <span style={{ color: "red" }}>*</span>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Rating
                value={rating}
                onChange={(_, val) => setRating(val)}
                onChangeActive={(_, val) => setHovered(val)}
                emptyIcon={<StarIcon style={{ opacity: 0.4 }} fontSize="inherit" />}
                size="large"
                sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }}
              />
              {(hovered !== -1 || rating > 0) && (
                <Typography variant="body2" color="text.secondary">
                  {RATING_LABELS[hovered !== -1 ? hovered : rating]}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Comment */}
          <TextField
            label="Your review *"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (min 50 characters)…"
            helperText={`${comment.length} / 2000 characters`}
            inputProps={{ maxLength: 2000 }}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          />

          {/* Display name */}
          <TextField
            label="Display name"
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should your name appear?"
            sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={submitting}
            sx={{ borderRadius: 0, textTransform: "none", fontWeight: 600, px: 4, py: 1.25 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Review"}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
