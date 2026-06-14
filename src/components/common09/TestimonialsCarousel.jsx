import React from "react";
import Slider from "react-slick";
import StyledButton from "./StyledButton";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";
import InfoSection from "./InfoSection";
import BgImg from "../../assets/images/bg-light-02.webp";

const TestimonialsCarousel = ({
  testimonials,
  ctaText,
  imgIcon,
  _onCta,
  subtitle = "Client Stories",
  title = "What People Say About Us",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const settings = {
    dots: true,
    arrows: !isMobile,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
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
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <InfoSection
            subtitle={subtitle}
            title={title}
            align="center"
            btnAlign="center"
            imgIcon={imgIcon}
          />
        </motion.div>

        {/* Testimonials Carousel */}
        <Box sx={{ my: 8 }}>
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <Box key={testimonial.id} sx={{ px: { xs: 0, md: 5 } }}>
                <TestimonialCard testimonial={testimonial} index={index} />
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

export default TestimonialsCarousel;
