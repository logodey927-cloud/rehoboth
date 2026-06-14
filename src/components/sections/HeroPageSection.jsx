import React from "react";
import HeroSectionPageUI from "../ui/HeroSectionPageUI";
import { Box, Container } from "@mui/material";
import DefaultBgImg from "../../assets/images/hero-section-img.png";

function HeroPageSection({ title, breadcrumb = [], BgImg, borderRadius = false, children }) {
  const resolvedTitle = title || (breadcrumb[breadcrumb.length - 1]?.label || "");
  const resolvedBg = BgImg || DefaultBgImg;

  return (
    <Box
      component="section"
      className="HeroPageSection"
      sx={{
        py: 0,
        px: 0,
        ...(borderRadius && {
          borderRadius: 2,
          overflow: "hidden",
        }),
      }}
    >
      <Container maxWidth="false" style={{ padding: "0" }}>
        <HeroSectionPageUI
          BgImg={resolvedBg}
          title={resolvedTitle}
          breadcrumb={breadcrumb.length ? breadcrumb : [{ label: "Home", link: "/" }, { label: resolvedTitle || "" }]}
        >
          {children}
        </HeroSectionPageUI>
      </Container>
    </Box>
  );
}

export default HeroPageSection;


   