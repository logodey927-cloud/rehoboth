import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import voucherFrontImage from "../../assets/images/Voucher_fornt_design.png";
import { getPublicSiteSettings } from "../../api/api";

/**
 * VoucherPopup Component
 * 
 * A dismissible popup that displays a voucher promotion image.
 * 
 * @param {Object} props
 * @param {number} props.delay - Delay in milliseconds before showing popup (default: 10000)
 * @param {string} props.image - Custom image URL (optional, defaults to voucher front design)
 * @param {string} props.navigateTo - Route to navigate to when image is clicked (default: "/vouchers")
 * @param {string} props.storageKey - SessionStorage key to track dismissal (default: "voucher_popup_dismissed")
 * @param {boolean} props.showOnLoad - Whether to show popup on page load (default: true)
 * @param {Function} props.onClose - Callback function when popup is closed
 * @param {Function} props.onImageClick - Callback function when image is clicked
 */
const VoucherPopup = ({
  delay = 5000, // 5 seconds default
  image: imageProp = voucherFrontImage,
  navigateTo = "/vouchers",
  storageKey = "voucher_popup_dismissed",
  showOnLoad = true,
  onClose,
  onImageClick,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resolvedImage, setResolvedImage] = useState(imageProp);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Fetch admin-configured popup settings
  useEffect(() => {
    getPublicSiteSettings()
      .then((res) => {
        if (res.data?.success) {
          const { popup_enabled, popup_image_url } = res.data.settings || {};
          // If admin disabled the popup, mark as dismissed permanently for this session
          if (popup_enabled === "false") {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(storageKey, "true");
            }
          }
          if (popup_image_url) {
            setResolvedImage(popup_image_url);
          }
        }
      })
      .catch(() => {
        // Silently fallback to default image
      })
      .finally(() => {
        setSettingsLoaded(true);
      });
  }, [storageKey]);

  // Check if popup was already dismissed in this session
  useEffect(() => {
    if (!settingsLoaded) return;
    if (typeof window !== "undefined") {
      const wasDismissed = sessionStorage.getItem(storageKey) === "true";
      setMounted(true);

      if (!wasDismissed && showOnLoad) {
        // Show popup after delay
        const timer = setTimeout(() => {
          setOpen(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }
  }, [delay, storageKey, showOnLoad, settingsLoaded]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Mark as dismissed in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "true");
    }
    if (onClose) {
      onClose();
    }
  }, [storageKey, onClose]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, handleClose]);

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick();
    }
    // Navigate to vouchers page
    try {
      // Show global preloader if available
      if (window.__setNavigating) {
        window.__setNavigating(true);
      }
    } catch {
      // ignore
    }
    navigate(navigateTo);
    handleClose(); // Close popup after navigation
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted || !open) {
    return null;
  }

  return (
    <Fade in={open} timeout={500}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 3 },
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark backdrop
          pointerEvents: "auto", // Enable backdrop clicks
        }}
        onClick={handleClose} // Close when clicking backdrop
      >
        <Paper
          elevation={8}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking popup
          sx={{
            position: "relative",
            maxWidth: { xs: "100%", sm: "600px", md: "700px" },
            width: "100%",
            borderRadius: 0,
            overflow: "hidden",
            pointerEvents: "auto", // Enable clicks on popup
            border: "2px solid",
            borderColor: "primary.main",
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            aria-label="Close voucher popup"
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 12 },
              right: { xs: 8, sm: 12 },
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "text.primary",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
              },
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              borderRadius: 0,
              transition: "all 0.3s ease",
            }}
          >
            <CloseIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>

          {/* Voucher Image - Clickable */}
          <Box
            component="img"
            src={resolvedImage}
            alt="Gift Cards & Vouchers Now Available - Click to learn more"
            onClick={handleImageClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Click to view vouchers"
            sx={{
              width: "100%",
              height: "auto",
              display: "block",
              cursor: "pointer",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                opacity: 0.95,
              },
              "&:focus": {
                outline: "3px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
              },
            }}
          />

          {/* Optional: Add a subtle text overlay or badge */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 8, sm: 12 },
              left: { xs: 8, sm: 12 },
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              borderRadius: 0,
              display: { xs: "none", sm: "block" },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              👉 Click to Learn More
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default VoucherPopup;

