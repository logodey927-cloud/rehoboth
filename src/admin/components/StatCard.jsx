import React from "react";
import { Box, Typography, Paper, CircularProgress, useTheme, useMediaQuery } from "@mui/material";

/**
 * StatCard Component
 * Reusable stat card with improved design and responsiveness
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Stat value
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.color - Theme color
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.children - Additional content (optional)
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading = false,
  children,
  onClick,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 3, sm: 2.5, md: 3 },
        cursor: onClick ? "pointer" : "default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 1.5, sm: 2 },
        height: "100%",
        width: "100%",
        minHeight: { xs: 130, sm: 140, md: 150 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, sm: 1.5, md: 2 },
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 2px 8px, rgba(0, 0, 0, 0.08) 0px 1px 4px",
        backgroundColor: "#ffffff",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          backgroundColor: color,
          opacity: 0.8,
        },
        "&:hover": {
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 16px, rgba(0, 0, 0, 0.12) 0px 2px 8px",
          transform: "translateY(-4px)",
          borderColor: color,
        },
      }}
    >
      {/* Header with Icon and Value */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start", md: "center" },
          gap: { xs: 2, sm: 1.5, md: 2 },
          flex: 1,
          flexDirection: { xs: "column", sm: "row", md: "column" },
          textAlign: { xs: "center", sm: "left", md: "center" },
        }}
      >
        {/* Icon Container */}
        <Box
          sx={{
            width: { xs: 64, sm: 52, md: 60 },
            height: { xs: 64, sm: 52, md: 60 },
            borderRadius: "50%",
            backgroundColor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s",
            "&:hover": {
              backgroundColor: `${color}25`,
              transform: "scale(1.05)",
            },
          }}
        >
          <Icon
            sx={{
              color: color,
              fontSize: { xs: 32, sm: 26, md: 30 },
            }}
          />
        </Box>

        {/* Value and Title */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: { xs: "center", sm: "flex-start", md: "center" } }}>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
              <CircularProgress
                size={isMobile ? 24 : isTablet ? 20 : 22}
                sx={{ color: color }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.8125rem", sm: "0.75rem", md: "0.8125rem" },
                }}
              >
                Loading...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant={isMobile ? "h4" : isTablet ? "h5" : "h4"}
                sx={{
                  fontWeight: 700,
                  color: "#1a1f2e",
                  mb: { xs: 0.75, sm: 0.5, md: 0.75 },
                  lineHeight: 1.2,
                  fontSize: {
                    xs: "1.5rem",      // Mobile: reduced
                    sm: "1.375rem",    // Tablet: reduced
                    md: "1.5rem",      // Desktop: reduced
                    lg: "1.625rem",
                  },
                }}
              >
                {value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: { 
                    xs: "0.75rem",     // Mobile: reduced
                    sm: "0.75rem",     // Tablet: reduced
                    md: "0.8125rem",   // Desktop: reduced
                  },
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {title}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Additional Content (e.g., chips for voucher stats) */}
      {children && (
        <Box
          sx={{
            mt: "auto",
            pt: { xs: 1.5, sm: 1, md: 1.5 },
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start", md: "center" },
          }}
        >
          {children}
        </Box>
      )}
    </Paper>
  );
}

