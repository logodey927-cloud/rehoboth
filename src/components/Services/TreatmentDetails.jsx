// client/src/components/Services/TreatmentDetails.jsx
import React, { useRef, useEffect } from "react";
import { Box, Typography, Divider } from "@mui/material";
import PriceTable from "./PriceTable";
import StyledButton from "../common09/StyledButton";
import ServiceReviews from "../reviews/ServiceReviews";

const TreatmentDetails = ({ treatment }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [treatment?.id, treatment?.title]);

  if (!treatment) return null;

  return (
    <Box
      ref={scrollRef}
      sx={{
        flex: 1,
        minWidth: 0,
        height: { xs: "auto", md: "100%" },
        minHeight: { md: 0 },
        px: { xs: 2, md: 2 },
        py: { xs: 3, md: 4 },
        bgcolor: "transparent",
        overflowY: { xs: "visible", md: "auto" },
        overflowX: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          mb: 3,
          fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
          fontFamily: '"Raleway", sans-serif',
        }}
      >
        {treatment.title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#757575",
          mb: 3,
          fontSize: { xs: "0.95rem", sm: "1rem" },
          lineHeight: 1.7,
          textAlign: "justify",
          fontFamily: '"Raleway", sans-serif',
        }}
      >
        {treatment.description || treatment.desc}
      </Typography>

      {treatment.image_url && (
        <Box
          component="img"
          src={treatment.image_url}
          alt={treatment.title}
          sx={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 0,
            mb: 4,
            boxShadow: 2,
          }}
        />
      )}

      <Typography
        variant="h4"
        sx={{
          color: "secondary.dark",
          fontSize: { xs: "1rem", sm: "1.3rem", md: "1.6rem" },
          fontWeight: 400,
          mb: 2,
          fontFamily: '"Raleway", sans-serif',
        }}
      >
        Benefits & Detailed Explanations
      </Typography>

      {(treatment.benefits || []).map((benefit, index) => {
        const isObject = typeof benefit === "object" && benefit !== null;
        if (isObject) {
          return (
            <Box key={benefit.id || index} sx={{ mb: 2 }}>
              {benefit.heading && (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#2b3a42", fontFamily: '"Raleway", sans-serif' }}
                >
                  {benefit.heading}
                </Typography>
              )}
              {benefit.description && (
                <Typography
                  variant="body2"
                  sx={{ color: "#757575", lineHeight: 1.8, fontFamily: '"Raleway", sans-serif' }}
                >
                  {benefit.description}
                </Typography>
              )}
            </Box>
          );
        }
        // Fallback for legacy string benefits
        return (
          <Typography
            key={index}
            variant="body2"
            sx={{ mb: 2, lineHeight: 1.8, color: "#5a6b7a", fontFamily: '"Raleway", sans-serif' }}
          >
            <strong>{benefit}:</strong> This treatment enhances your relaxation,
            boosts energy, and promotes wellness.
          </Typography>
        );
      })}

      <PriceTable items={treatment.items} />

      <Divider sx={{ my: 4 }} />
      {(() => {
        // Calculate price range from items
        const allPrices = (treatment.items || []).flatMap((it) =>
          (it.durations || []).map((d) => d.price)
        );
        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
        
        if (minPrice > 0 && maxPrice > 0) {
          return (
            <Typography 
              variant="h4" 
              color="secondary.dark"
              sx={{ fontFamily: '"Raleway", sans-serif' }}
            >
              Price Range: £{minPrice} - £{maxPrice}
            </Typography>
          );
        }
        return null;
      })()}

      {treatment.title && (
        <Box sx={{ mt: 3 }}>
          <StyledButton
            text="Book Appointment"
            to={`/book-appointment?service=${encodeURIComponent(treatment.title)}`}
            variant="primary"
          />
        </Box>
      )}

      {treatment.id && (
        <ServiceReviews serviceId={treatment.id} serviceName={treatment.title} />
      )}
    </Box>
  );
};

export default TreatmentDetails;
