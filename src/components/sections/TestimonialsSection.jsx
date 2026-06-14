import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TestimonialsCarousel from "../common09/TestimonialsCarousel";
import { testimonialsData } from "../../data/testimonialsData";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import { getPublicReviews } from "../../api/api";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
}

export default function TestimonialsSection() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState(testimonialsData);

  useEffect(() => {
    getPublicReviews({ limit: 10 })
      .then((res) => {
        if (res.data?.success && res.data.reviews.length > 0) {
          setTestimonials(
            res.data.reviews.map((r) => ({ ...r, date: timeAgo(r.date) }))
          );
        }
      })
      .catch(() => {}); // keep static fallback on error
  }, []);

  return (
    <TestimonialsCarousel
      testimonials={testimonials}
      subtitle="Client Stories"
      title="What Our Guests Say"
      description="Explore the experiences of our wonderful clients who have enjoyed relaxation, healing, and truly personalised care at Rehoboth Spa. Their kind words reflect our commitment to comfort, professionalism, and exceptional service."
      ctaText="View Full Reviews"
      imgIcon={sectionIcon}
      onCta={() => navigate("/testimonials")}
    />
  );
}
