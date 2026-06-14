import React from "react";
import { Button, CircularProgress, Box } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const StyledButton = ({
  text,
  to,
  color,
  variant = "primary",
  onClick,
  isDisabled = false,
  type = "button",
  sx = {},
  loading = false,
  loadingText,
}) => {
  const navigate = useNavigate();

  const colorSchemes = {
    primary: {
      border: "#47672f",
      text: "#47672f",
      hoverBg: "#47672f",
      hoverText: "#ffffff",
    },
    secondary: {
      border: "#F58C00",
      text: "#F58C00",
      hoverBg:
        "linear-gradient(90deg, rgba(245, 140, 0, 0.3), rgba(245, 140, 0, 1), rgba(245, 140, 0, 0.3))",
      hoverText: "#ffffff",
    },
    custom: {
      border: color || "#47672f",
      text: color || "#47672f",
      hoverBg: color || "#47672f",
      hoverText: "#ffffff",
    },
    danger: {
      border: "#dc3545",
      text: "#dc3545",
      hoverBg: "#dc3545",
      hoverText: "#ffffff",
    },
    muted: {
      border: "#9ca3af",
      text: "#6b7280",
      hoverBg: "#6b7280",
      hoverText: "#ffffff",
    },
  };

  const scheme = colorSchemes[variant] || colorSchemes.custom;

  const handleClick = (e) => {
    // If type is submit, don't prevent default form submission
    if (type === "submit") {
      if (onClick) onClick(e);
      // Don't navigate if it's a submit button - let form handle it
      return;
    }
    
    if (onClick) onClick(e);
    if (to) {
      e.preventDefault();
      // Show global preloader instantly if available
      try {
        window.__setNavigating && window.__setNavigating(true);
      } catch {
        // ignore
      }
      navigate(to);
    }
  };

  const isActuallyDisabled = isDisabled || loading;
  const displayText = loading && loadingText ? loadingText : text;

  return (
    <Button
      component={type === "submit" ? "button" : to ? RouterLink : "button"}
      to={type === "submit" ? undefined : to}
      onClick={handleClick}
      disabled={isActuallyDisabled}
      type={type}
      sx={{
        position: "relative",
        px: 3,
        py: 1,
        border: isDisabled
          ? `1px solid #d1d1d1ff`
          : `1px solid ${scheme.border}`,
        color: scheme.text,
        borderRadius: 0,
        fontSize: "0.9rem",
        overflow: "hidden",
        transition: "all 0.3s ease",
        textTransform: "none",
        fontWeight: 500,
        backdropFilter: "blur(10px)",
        backgroundColor: "transparent",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.3))",
          transition: "all 0.5s ease",
        },
        "&:hover::before": { left: "100%" },
        "&:hover": {
          color: scheme.hoverText,
          border: `1px solid ${scheme.border}`,
          background: scheme.hoverBg,
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${scheme.border}40`,
        },
        ...sx,
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} thickness={4} sx={{ color: "inherit" }} />
          {displayText}
        </Box>
      ) : (
        text
      )}
    </Button>
  );
};

export default StyledButton;
