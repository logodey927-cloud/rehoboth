import React from "react";
import { Box, Container, Grid } from "@mui/material";
import InfoSection from "../common09/InfoSection";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import ProductCard02 from "../common09/ProductCard02";
// import StyledButton from "../common09/StyledButton";
import ProductDataSection from "../../data/ProductDataSection";
// import productData from "../../data/productData";

export default function ProductUI() {
  return (
    <Box className="ProductUI" component="section">
      <Container maxWidth={false} padding="0">
        {/* Section Header with InfoSection */}
        <InfoSection
          data-aos="fade-up"
          subtitle="Premium Quality"
          title="Natural Beauty Products"
          align="center"
          btnAlign="center"
          descriptionAlign="justify"
          imgIcon={sectionIcon}
        />

        {/* Section Content */}
        {/* /// */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {ProductDataSection.map((item) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.id}>
              <ProductCard02 data-aos="zoom-in" {...item} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
