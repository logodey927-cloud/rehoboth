import React from "react";
import Slider from "react-slick";
import StyledButton from "../common09/StyledButton";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import BlogCard from "../common09/BlogCard";
import InfoSection from "../common09/InfoSection";
import BgImg from "../../assets/images/bg-light-03.webp";

const LatestArticlesSection = ({
  articles,
  ctaText,
  imgIcon,
  subtitle = "Wellness Insights",
  title = "Latest Articles",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const settings = {
    dots: true,
    arrows: !isMobile,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 6000,
    slidesToShow: isMobile ? 1 : 2,
    slidesToScroll: 1,
    speed: 800,
    cssEase: "ease-in-out",
    adaptiveHeight: true,
    centerMode: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 6 },
        textAlign: "center",
        backgroundColor: "#e0f2d0",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(245, 140, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(132, 153, 79, 0.1) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <InfoSection
            subtitle={subtitle}
            title={title}
            description={[
              "Stay updated with the latest wellness trends, skincare tips, and self-care advice from our expert team.",
              "Our articles cover everything from aromatherapy science to meditation techniques, helping you on your wellness journey.",
            ]}
            align="center"
            btnAlign="center"
            imgIcon={imgIcon}
          />
        </motion.div>

        {/* Articles Carousel */}
        <Box sx={{ my: 8 }}>
          <Slider {...settings}>
            {articles.map((article, index) => (
              <Box key={article.id} sx={{ px: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <BlogCard {...article} />
                </motion.div>
              </Box>
            ))}
          </Slider>
        </Box>

        {/* CTA Button */}
        {ctaText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <StyledButton text={ctaText} color="#f58c00" />
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default LatestArticlesSection;
