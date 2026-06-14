import React from "react";
import { Box, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

/**
 * Reusable row for Appointments Summary (and similar stat lists).
 */
export default function AppointmentsSummaryRow({
  label,
  count,
  Icon,
  color,
  bg,
  onClick,
  clickable = false,
  active = false,
}) {
  return (
    <Box
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        cursor: clickable ? "pointer" : "default",
        border: "1px solid",
        borderColor: active ? color : "divider",
        bgcolor: active ? bg : "#fafafa",
        transition: "background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
        ...(clickable && {
          "&:hover": {
            bgcolor: bg,
            borderColor: color,
            transform: "translateX(3px)",
            "& .summary-label": { color, fontWeight: 600 },
            "& .summary-icon-wrap": {
              bgcolor: bg,
              boxShadow: `0 0 0 2px ${color}33`,
            },
            "& .summary-chevron": { color },
          },
          "&:focus-visible": {
            outline: `2px solid ${color}`,
            outlineOffset: 2,
          },
        }),
      }}
    >
      <Box
        className="summary-icon-wrap"
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "box-shadow 0.2s ease, background-color 0.2s ease",
        }}
      >
        <Icon sx={{ fontSize: 20, color }} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={700} fontSize="1.15rem" color="text.primary" lineHeight={1.1}>
          {count}
        </Typography>
        <Typography
          className="summary-label"
          fontSize="0.78rem"
          color={active ? color : "text.secondary"}
          fontWeight={active ? 600 : 500}
          sx={{ transition: "color 0.2s ease" }}
        >
          {label}
        </Typography>
      </Box>

      {clickable && (
        <ChevronRight className="summary-chevron" sx={{ fontSize: 18, color: "text.disabled", transition: "color 0.2s ease" }} />
      )}
    </Box>
  );
}
