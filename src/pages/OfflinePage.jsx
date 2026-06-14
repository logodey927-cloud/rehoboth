import React from "react";
import { Box, Typography, Button } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";

export default function OfflinePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        px: 3,
        textAlign: "center",
      }}
    >
      <WifiOffIcon sx={{ fontSize: 72, color: "#0C6E6D", mb: 2 }} />
      <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
        You&apos;re offline
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 360 }}>
        This page isn&apos;t available offline. Check your connection and try again.
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
        sx={{ bgcolor: "#0C6E6D", "&:hover": { bgcolor: "#0a5a59" } }}
      >
        Try Again
      </Button>
    </Box>
  );
}
