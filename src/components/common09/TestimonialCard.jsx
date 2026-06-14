// client/src/components/common09/TestimonialCard.jsx
import React from "react";
import { Box, Typography, Avatar, Rating, Chip } from "@mui/material";
import { motion } from "framer-motion";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const TestimonialCard = ({ testimonial, index }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          backgroundColor: "#fff",
          borderRadius: 0,
          boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          border: "1px solid rgba(245, 140, 0, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
            borderColor: "primary.main",
          },
        }}
      >
        {/* Quote Icon */}
        <FormatQuoteIcon
          sx={{
            fontSize: 40,
            color: "primary.main",
            opacity: 0.2,
            position: "absolute",
            top: 16,
            right: 16,
          }}
        />

        {/* Rating */}
        <Box sx={{ mb: 2 }}>
          <Rating
            value={testimonial.rating}
            readOnly
            size="small"
            sx={{
              "& .MuiRating-iconFilled": {
                color: "primary.main",
              },
            }}
          />
        </Box>

        {/* Quote */}
        <Typography
          variant="body1"
          sx={{
            fontStyle: "italic",
            color: "text.primary",
            lineHeight: 1.7,
            mb: 3,
            fontSize: { xs: "0.95rem", md: "1rem" },
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          "{testimonial.quote}"
        </Typography>

        {/* Service Chip */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={testimonial.service}
            size="small"
            sx={{
              backgroundColor: "primary.light",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Client Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <Avatar
            src={testimonial.avatar || undefined}
            alt={testimonial.name}
            imgProps={{ referrerPolicy: "no-referrer" }}
            sx={{
              width: 50,
              height: 50,
              border: "2px solid",
              borderColor: "primary.main",
              bgcolor: "secondary.dark",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {getInitials(testimonial.name)}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              {testimonial.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
              }}
            >
              {testimonial.location}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                fontSize: "0.7rem",
              }}
            >
              {testimonial.date}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default TestimonialCard;
