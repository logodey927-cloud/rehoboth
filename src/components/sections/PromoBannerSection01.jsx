// ExampleUsage.jsx
import React from "react";
import PromoBanner from "../common09/PromoBanner";
import promoImage from "../../assets/images/promo-1.webp";

export default function ExampleUsage() {
  const handleBook = () => {
    // navigate to booking page or open modal
    window.location.href = "/booking";
  };

  return (
    <PromoBanner
      variant="compact"
      headline="Welcome Offer for New Guests"
      subtext="Enjoy a complimentary 10-minute scalp massage when you book your first treatment with us. A little gesture to help you unwind from the very start."
      ctaText="Book & Redeem"
      onCta={handleBook}
      tag="New Guest Gift"
      img={promoImage}
    />
  );
}
