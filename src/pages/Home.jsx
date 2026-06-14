// client/src/pages/Home.jsx
import React from "react";
import NewArrivalsSection from "../components/sections/NewArrivalsSection";
//
import HeroSection from "../components/sections/HeroSection";
import OurServicesSection from "../components/sections/OurServicesSection";
import SpaServiceCategoriesSection from "../components/sections/SpaServiceCategoriesSection";
import AboutUsSection from "../components/sections/AboutUsSection";
import PromoBannerSection01 from "../components/sections/PromoBannerSection01";
import PromoBannerSection02 from "../components/sections/PromoBannerSection02";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import BestsellersSection from "../components/sections/BestsellersSection";
import GallerySection from "../components/sections/GallerySection";
import ContactSection from "../components/sections/ContactSection";
import ProductSection from "../components/sections/ProductSection";
import MassageSection from "../components/sections/MassageSection";
import ChristmasGreetingSection from "../components/sections/christmas/ChristmasGreetingSection";
import SEO from "../components/common09/SEO";

import { Box } from "@mui/material";

export default function Home() {
  return (
    <Box>
      <SEO
        title="Home"
        description="Welcome to Rehoboth Health & Wellness Clinic. Your premier destination for relaxation, wellness, and rejuvenation in Rochdale, Greater Manchester. Discover our range of spa treatments, massages, and holistic wellness services."
        keywords="spa, wellness, massage, health, relaxation, Rochdale, Manchester, holistic treatments"
      />
      {/* Hero Section */}
      <HeroSection />

      {/* Spa Service Categories Section */}
      <SpaServiceCategoriesSection />

      {/* Christmas Greeting Section */}
      <ChristmasGreetingSection />

      {/* Our Services Section */}
      <OurServicesSection />

      {/* About Us Section */}
      <AboutUsSection />

      {/* Promo Banner Section */}
      <PromoBannerSection01 />

      {/* Product Section */}
      <ProductSection />

      {/* Massage Section */}
      <MassageSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Bestsellers Section */}
      <BestsellersSection />

      {/* Promo Banner Section */}
      <PromoBannerSection02 />

      {/* Gallery Section */}
      <GallerySection />

      {/* New Arrivals Section */}
      <NewArrivalsSection />

      {/*  Contact Section*/}
      <ContactSection />
    </Box>
  );
}
