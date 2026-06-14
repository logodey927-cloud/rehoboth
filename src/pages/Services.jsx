// client/src/pages/Services.jsx
import React, { useState, useEffect } from "react";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import Sidebar from "../components/Services/Sidebar";
import TreatmentDetails from "../components/Services/TreatmentDetails";
import { getServices } from "../api/api";
import PromoBannerSection02 from "../components/sections/PromoBannerSection02";
import HeroPageSection from "../components/sections/HeroPageSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([50, 200]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServices();
      if (response.data?.success) {
        setServices(response.data.services || []);
      } else {
        setError("Failed to load services");
      }
    } catch (err) {
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(services.map((t) => t.title))];

  const filteredTreatments = services.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const inTitle = t.title.toLowerCase().includes(q);
    const inBenefits = (t.benefits || []).some((b) => {
      if (typeof b === "string") return b.toLowerCase().includes(q);
      if (b && typeof b === "object") {
        const text = `${b.heading || ""} ${b.description || ""}`.toLowerCase();
        return text.includes(q);
      }
      return false;
    });
    const inItems = (t.items || []).some((it) =>
      (it.name || "").toLowerCase().includes(q)
    );
    const matchQuery = q === "" || inTitle || inBenefits || inItems;

    const matchCategory = selectedCategory
      ? t.title === selectedCategory
      : true;

    const anyItemInRange = (t.items || []).some((it) =>
      (it.durations || []).some(
        (d) => d.price >= priceRange[0] && d.price <= priceRange[1]
      )
    );
    
    // Calculate price range from items
    const allPrices = (t.items || []).flatMap((it) =>
      (it.durations || []).map((d) => d.price)
    );
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    const matchPrice =
      anyItemInRange ||
      (minPrice >= priceRange[0] && maxPrice <= priceRange[1]);

    return matchQuery && matchCategory && matchPrice;
  });

  const selectedTreatment = filteredTreatments[0] || services[0];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    // On mobile the page scrolls — scroll to top of viewport so details are visible
    if (window.innerWidth < 900) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Box>
      <SEO 
        title="Our Services"
        description="Explore our comprehensive range of spa treatments and wellness services at Rehoboth Health & Wellness Clinic. From therapeutic massages to holistic wellness treatments, discover the perfect service for your relaxation and rejuvenation needs."
        keywords="spa services, massage therapy, wellness treatments, therapeutic massage, holistic wellness, spa treatments"
      />
      {/* Hero */}
      <HeroPageSection
        title="Our Services"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Services" }]}
      />

      {loading ? (
        <Container maxWidth="xl" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      ) : error ? (
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {error}
          </Alert>
        </Container>
      ) : (
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 6, sm: 8 },
            px: { xs: 2, sm: 6 },
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "stretch" },
            height: { md: "calc(100vh)" },
            minHeight: { md: 480 },
            maxHeight: { md: "calc(100vh)" },
            overflow: { md: "hidden" },
          }}
        >
          {/* Sidebar */}
          <Sidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategorySelect}
            categories={categories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          {/* Treatment Details */}
          <TreatmentDetails treatment={selectedTreatment} />
        </Container>
      )}

      {/* Promotional banners */}
      <Box sx={{ mt: 0 }}>
        <PromoBannerSection02 />
      </Box>

      {/* Testimonials Section */}
      <TestimonialsSection />
    </Box>
  );
}

export default Services;
