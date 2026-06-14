import React from "react";
import { Box, Paper, Typography, useTheme, useMediaQuery, Backdrop } from "@mui/material";
import Calendar from "../../components/common09/Calendar";
import SubscribersDonutChart from "./SubscribersDonutChart";

export default function AdminRightSidebar({ subscribers = [], open = false, onClose }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  if (!isLargeScreen) {
    return null; // Don't render on small/medium screens
  }

  return (
    <>
      {/* Backdrop for overlay effect */}
      {open && (
        <Backdrop
          open={open}
          onClick={onClose}
          sx={{
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
      )}
      <Box
        sx={{
          position: "fixed",
          right: open ? 0 : -380,
          top: 64, // Height of AppBar
          width: 380,
          height: "calc(100vh - 64px)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          p: 3,
          backgroundColor: "#f5f7fa",
          borderLeft: "1px solid",
          borderColor: "divider",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: theme.zIndex.drawer,
          transition: theme.transitions.create("right", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#84994f",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#6b7a3f",
            },
          },
        }}
      >
      {/* Calendar Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          minHeight: 450,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontWeight: 600,
            color: "#1a1f2e",
            fontSize: "0.9375rem",
            flexShrink: 0,
          }}
        >
          Calendar
        </Typography>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            minHeight: 0,
            "& .MuiPaper-root": {
              boxShadow: "none",
              border: "none",
            },
            "& > div": {
              height: "auto",
              maxHeight: "none",
            },
          }}
        >
          <Calendar showInfoBox={false} compact={true} adminMode={false} />
        </Box>
      </Paper>

      {/* Subscribers Chart Section */}
      <Box sx={{ flexShrink: 0 }}>
        <SubscribersDonutChart subscribers={subscribers} />
      </Box>
    </Box>
    </>
  );
}

