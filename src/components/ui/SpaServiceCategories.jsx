import React from "react";
import { Box, Grid } from "@mui/material";
import SpaServiceCategoriesCard from "../common09/SpaServiceCategoriesCard";
import ServiceHighlights from "../../data/ServicesHighlight";

const SpaServiceCategories = () => {
  return (
    <Box
      className=""
      component="section"
      sx={{
        backgroundColor: "#fff",
      }}
    >
      <Grid container spacing={0} justifyContent="center">
        {ServiceHighlights.map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <SpaServiceCategoriesCard {...item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SpaServiceCategories;
