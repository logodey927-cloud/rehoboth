import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Rating, Button, Alert, CircularProgress,
  Paper, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { submitReview, getServices } from "../../api/api";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

export default function ReviewForm({ serviceId: serviceIdProp, serviceName, onSuccess }) {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(!serviceIdProp);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceIdProp || "");
  const [selectedServiceName, setSelectedServiceName] = useState(serviceName || "");

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(-1);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState(
    user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""
  );
  const [reviewLocation, setReviewLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const serviceId = serviceIdProp || selectedServiceId;
  const resolvedServiceName =
    serviceName ||
    selectedServiceName ||
    services.find((s) => s.id === selectedServiceId)?.title ||
    "";

  useEffect(() => {
    if (serviceIdProp) {
      setSelectedServiceId(serviceIdProp);
      if (serviceName) setSelectedServiceName(serviceName);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setServicesLoading(true);
        const res = await getServices();
        if (!cancelled && res.data?.success) {
          setServices(res.data.services || []);
        }
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setServicesLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [serviceIdProp, serviceName]);

  const handleServiceChange = (id) => {
    setSelectedServiceId(id);
    const svc = services.find((s) => s.id === id);
    setSelectedServiceName(svc?.title || "");
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
          Please sign in to leave a review.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/login", { state: { from: location.pathname } })}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Sign In to Review
        </Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Alert severity="success" sx={{ borderRadius: 0 }}>
        Thank you! Your review has been submitted and will appear after approval.
      </Alert>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!serviceId) return setError("Please select a service to review.");
    if (!rating) return setError("Please select a star rating.");
    if (comment.trim().length < 50)
      return setError("Comment must be at least 50 characters.");

    setSubmitting(true);
    try {
      await submitReview({
        service_id: serviceId,
        rating,
        comment: comment.trim(),
        display_name: displayName.trim() || undefined,
        location: reviewLocation.trim() || undefined,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit review. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "secondary.dark" }}>
        Write a Review{resolvedServiceName ? ` for ${resolvedServiceName}` : ""}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        Your experience matters. Share it to help others.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {!serviceIdProp && (
          <FormControl fullWidth required sx={{ mb: 2.5 }} disabled={servicesLoading}>
            <InputLabel id="review-service-label">Service *</InputLabel>
            <Select
              labelId="review-service-label"
              label="Service *"
              value={selectedServiceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              sx={{ borderRadius: 0 }}
            >
              {services.map((svc) => (
                <MenuItem key={svc.id} value={svc.id}>
                  {svc.title}
                </MenuItem>
              ))}
            </Select>
            {servicesLoading && (
              <Typography variant="caption" sx={{ mt: 0.5, color: "text.secondary" }}>
                Loading services…
              </Typography>
            )}
            {!servicesLoading && services.length === 0 && (
              <Typography variant="caption" sx={{ mt: 0.5, color: "error.main" }}>
                No services available. Please try again later.
              </Typography>
            )}
          </FormControl>
        )}

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {RATING_LABELS[hovered !== -1 ? hovered : rating]}
              </Typography>
            )}
          </Box>
        </Box>

        <TextField
          label="Your Review *"
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (min 50 characters)..."
          helperText={`${comment.length} / 2000 characters`}
          inputProps={{ maxLength: 2000 }}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />

        <TextField
          label="Display Name"
          fullWidth
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should your name appear?"
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />

        <TextField
          label="Location (optional)"
          fullWidth
          value={reviewLocation}
          onChange={(e) => setReviewLocation(e.target.value)}
          placeholder="e.g. London, UK"
          sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={submitting || servicesLoading || (!serviceIdProp && !selectedServiceId)}
          sx={{ borderRadius: 0, textTransform: "none", fontWeight: 600, px: 4, py: 1.25 }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Review"}
        </Button>
      </Box>
    </Paper>
  );
}
