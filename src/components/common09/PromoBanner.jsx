// PromoBanner.jsx
import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button } from "@mui/material";
import StyledButton from "./StyledButton";

/**
 * Reusable Promotional Banner
 *
 * Props:
 * - headline: main title (string)
 * - subtext: supporting text (string)
 * - ctaText: call-to-action label (string)
 * - onCta: function called when CTA clicked
 * - img: optional background image URL (string)
 * - tag: optional small tag/label (string) e.g. "Limited Time"
 * - variant: 'large' | 'compact' (controls layout scale)
 */

const PromoBanner = ({ headline, subtext, img, tag, variant = "large" }) => {
  const isLarge = variant === "large";

  return (
    <Box
      component="section"
      aria-label={headline}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        px: { xs: 3, md: 8 },
        py: { xs: 6, md: 8 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
        minHeight: isLarge ? { xs: 220, md: 280 } : { xs: 140, md: 160 },
        color: "common.white",
        // background: gradient overlay — image sits below it
        background:
          "linear-gradient(135deg, rgba(32, 27, 61, 0.75) 0%, rgba(58, 40, 90, 0.75) 100%)",
      }}
    >
      {/* background image overlay */}
      {img && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.45) saturate(0.95)",
            transform: "scale(1.05)",
            transition: "transform 600ms ease",
            "&:hover": {
              transform: "scale(1.08)",
            },
            zIndex: 0,
          }}
        />
      )}

      {/* subtle animated light flare */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: "-20%",
          top: "-10%",
          width: "60%",
          height: "120%",
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.06), transparent 40%)",
          transform: "rotate(25deg)",
          zIndex: 1,
          pointerEvents: "none",
          animation: "float 8s ease-in-out infinite",
          "@keyframes float": {
            "0%": { transform: "rotate(25deg) translateY(0px)" },
            "50%": { transform: "rotate(25deg) translateY(-18px)" },
            "100%": { transform: "rotate(25deg) translateY(0px)" },
          },
        }}
      />

      {/* content (zIndex 2 to sit above background) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          maxWidth: { xs: "100%", md: "62%" },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {tag && (
          <Typography
            component="span"
            variant="overline"
            sx={{
              color: "secondary.light",
              background: "rgba(255,255,255,0.06)",
              width: "max-content",
              px: 1.2,
              py: 0.4,
              borderRadius: 1,
              fontWeight: 700,
              letterSpacing: 0.8,
            }}
          >
            {tag}
          </Typography>
        )}

        <Typography
          variant={isLarge ? "h4" : "h5"}
          sx={{
            fontWeight: 300,
             fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
            lineHeight: 1.04,
            letterSpacing: -0.5,
            mt: tag ? 0.6 : 0,
            color: "#f58c00",
            fontFamily: `"Raleway", sans-serif`,
            textShadow: "0 6px 18px rgba(10,10,25,0.45)",
            transformOrigin: "left",
            animation: "slideUp .6s cubic-bezier(.2,.9,.2,1)",
            "@keyframes slideUp": {
              "0%": { opacity: 0, transform: "translateY(10px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {headline}
        </Typography>

        <Typography
          variant={isLarge ? "subtitle1" : "body2"}
          sx={{
            color: "rgba(255,255,255,0.9)",
            maxWidth: { xs: "100%", md: "85%" },
            mt: 1,
            fontWeight: 500,
          }}
        >
          {subtext}
        </Typography>

        <Box sx={{ mt: isLarge ? 2.5 : 1.5 }}>
          <StyledButton
            text="Book Appointment"
            to="/book-appointment"
            variant="secondary"
          />
        </Box>
      </Box>

      {/* right-side visual (could be product image / people) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: { xs: "none", md: "block" },
          flex: "0 0 36%",
          maxWidth: "36%",
          alignSelf: "stretch",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 18px 60px rgba(5,8,20,0.6)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          {/* Decorative placeholder: recommend passing a prop with an image component if you want */}
          <Box
            sx={{
              width: "100%",
              height: 180,
              borderRadius: 2,
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              fontSize: 18,
              textAlign: "center",
            }}
          >
            {/* Replace with product/person image */}
            <img
              src={
                img ||
                "https://images.unsplash.com/photo-1556228453-7c1b2f1fbfd2?auto=format&fit=crop&w=800&q=60"
              }
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

PromoBanner.propTypes = {
  headline: PropTypes.string.isRequired,
  subtext: PropTypes.string,
  ctaText: PropTypes.string,
  onCta: PropTypes.func,
  img: PropTypes.string,
  tag: PropTypes.string,
  variant: PropTypes.oneOf(["large", "compact"]),
};

PromoBanner.defaultProps = {
  subtext: "",
  ctaText: "Book Now",
  onCta: () => {},
  img: "",
  tag: "",
  variant: "large",
};

export default PromoBanner;
