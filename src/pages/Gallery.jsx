import React, { useState } from "react";
import HeroPageSection from "../components/sections/HeroPageSection";
import { Box, Grid, Pagination } from "@mui/material";
import CategoryCard from "../components/common09/CategoryCard";
import { galleryData } from "../data/GalleryData";
import SEO from "../components/common09/SEO";

export default function Gallery() {
  const [page, setPage] = useState(1);
  const imagesPerPage = 12;
  const totalPages = Math.ceil(galleryData.length / imagesPerPage);

  // Calculate the range of images to display
  const startIndex = (page - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = galleryData.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top of gallery when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box>
      <SEO 
        title="Gallery"
        description="Explore our gallery showcasing the serene environment and facilities at Rehoboth Health & Wellness Clinic. See our treatment rooms, relaxation areas, and wellness spaces in Rochdale, Greater Manchester."
        keywords="spa gallery, wellness clinic photos, treatment rooms, relaxation spaces, Rochdale spa gallery"
      />
      <HeroPageSection
        title=" Gallery"
        breadcrumb={[{ label: "Home", link: "/" }, { label: " Gallery" }]}
      />

      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Grid container spacing={2}>
          {currentImages.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
              <CategoryCard
                image={item.image}
                title=""
                subtitle=""
                align="center"
                height="400px"
              />
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
