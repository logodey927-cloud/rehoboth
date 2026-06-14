import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import { motion } from "framer-motion";
import NewArrivalCard from "../common09/NewArrivalCard";
import InfoSection from "../common09/InfoSection";
import newArrivalsData from "../../data/newArrivalsData";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import BgImg from "../../assets/images/bg-light-01.webp";

const NewArrivalsSection = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate the data to create seamless infinite scroll
  const duplicatedData = [...newArrivalsData, ...newArrivalsData];

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, sm: 10 },
        px: { xs: 2, sm: 6 },
        minHeight: { xs: "auto", md: "100vh" },
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        {/* Section Header with InfoSection */}
        <InfoSection
          data-aos="fade-up"
          subtitle="Latest Collection"
          title="New Arrivals"
          description={[
            "Discover our newest collection of premium spa products and wellness essentials. Each item is carefully curated to enhance your self-care routine and bring luxury into your daily life.",
          ]}
          colorBtn="#F58C00"
          // btnText="View All Products"
          align="center"
          btnAlign="center"
          imgIcon={sectionIcon}
        />

        {/* Infinite Scrolling Cards */}
        <Box
          sx={{
            mt: 6,
            position: "relative",
            overflow: "hidden",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "100px",
              zIndex: 2,
              pointerEvents: "none",
            },
            "&::before": {
              left: 0,
              background:
                "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
            },
            "&::after": {
              right: 0,
              background:
                "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
            },
          }}
        >
          <motion.div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            animate={{
              x: isPaused ? undefined : [0, -280 * newArrivalsData.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
            style={{
              display: "flex",
              gap: "24px",
              width: "max-content",
            }}
          >
            {duplicatedData.map((item, index) => (
              <motion.div
                key={`${item.title}-${index}`}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                style={{ flexShrink: 0 }}
              >
                <NewArrivalCard {...item} />
              </motion.div>
            ))}
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default NewArrivalsSection;
