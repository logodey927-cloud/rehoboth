// components/PricingPack/PricingPack.jsx
import React from "react";
import { Box, Grid } from "@mui/material";
import SectionHeader from "./SectionHeader";
import PricingTable from "./PricingTable";
import BgImg from "../../../assets/images/bg-light-01.webp";

const PricingPack = ({
  title,
  subtitle,
  description,
  buttonText,
  // onButtonClick,
  offers,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, sm: 10 },
        px: { xs: 2, sm: 6 },
        minHeight: { xs: "auto" },
        overflow: "hidden",
      }}
    >
      <Grid container spacing={6} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader
            title={title}
            subtitle={subtitle}
            description={description}
            buttonText={buttonText}
            // onButtonClick={onButtonClick}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PricingTable offers={offers} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PricingPack;
