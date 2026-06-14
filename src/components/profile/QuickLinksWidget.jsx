import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  CalendarMonth, PersonAdd, CalendarToday, Download, ChevronRight,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { quickLinks } from "../../data/profileData";
import { profileCardSx, profileSectionTitleSx } from "./profileStyles";

const ICON_MAP = {
  CalendarMonth,
  PersonAdd,
  CalendarToday,
  Download,
};

export default function QuickLinksWidget({ title = "Quick Links", links = quickLinks }) {
  return (
    <Paper elevation={0} sx={profileCardSx}>
      <Typography sx={{ ...profileSectionTitleSx, mb: 2 }}>{title}</Typography>

      {links.map((link) => {
        const Icon = ICON_MAP[link.icon] || CalendarMonth;
        const isButton = typeof link.onClick === "function";
        return (
          <Box
            key={link.id}
            component={isButton ? "button" : RouterLink}
            to={isButton ? undefined : link.path}
            onClick={isButton ? link.onClick : undefined}
            sx={{
              all: isButton ? "unset" : undefined,
              cursor: "pointer",
              display: "flex",
              width: "100%",
              boxSizing: "border-box",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderRadius: 0,
              mb: 1.25,
              bgcolor: "#fafafa",
              textDecoration: "none",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "secondary.main",
                borderColor: "secondary.main",
                "& .link-text": { color: "#fff" },
                "& .link-icon": { color: "#fff" },
                "& .link-icon-wrap": {
                  bgcolor: "rgba(255,255,255,0.2)",
                  boxShadow: "none",
                },
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                className="link-icon-wrap"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Icon className="link-icon" sx={{ fontSize: 20, color: "secondary.main", transition: "color 0.2s ease" }} />
              </Box>
              <Typography
                className="link-text"
                fontSize="0.875rem"
                fontWeight={600}
                color="text.primary"
                sx={{ transition: "color 0.2s ease" }}
              >
                {link.label}
              </Typography>
            </Box>
            <ChevronRight className="link-icon" sx={{ fontSize: 20, color: "text.disabled", transition: "color 0.2s ease" }} />
          </Box>
        );
      })}
    </Paper>
  );
}
