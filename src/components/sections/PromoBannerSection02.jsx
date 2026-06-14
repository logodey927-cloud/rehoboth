// ExampleUsage.jsx
import React from "react";
import PromoBanner from "../common09/PromoBanner";
import promoImage from "../../assets/images/img-003.avif";

export default function ExampleUsage() {
  const handleBook = () => {
    // navigate to booking page or open modal
    window.location.href = "/booking";
  };

  return (
    <div style={{ padding: 0 }}>
      <PromoBanner
        variant="compact"
        headline="Nurture Your First Visit"
        subtext="Book your first session and enjoy a complimentary calming scalp massage, designed to ease tension and quiet the mind."
        ctaText="Reserve & Receive"
        tag="Welcome Gift"
        onCta={handleBook}
        img={promoImage}
      />
    </div>
  );
}
