import React from "react";
import { Box, Grid } from "@mui/material";
import InfoSection02 from "../../components/common09/infoSection02";
import serviceHighlights02 from "../../data/ServicesHighlight02";

export default function OurServicesCards() {
  return (
    <Box
      component="section"
      className="OurServicesCards"
      sx={{
        position: "relative",
        px: { xs: 2, sm: 6 },
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <Grid
        container
        spacing={0}
        justifyContent="center"
        sx={{ position: "relative", zIndex: 1 }} // make sure content is above overlay
      >
        <Grid container spacing={3} justifyContent="center">
          {serviceHighlights02.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoSection02
                data-aos="flip-left"
                {...item}
                sx={{ flexGrow: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}
