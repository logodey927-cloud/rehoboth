import React, { useEffect, useState } from "react";
import { Box, Typography, Slide } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WifiIcon from "@mui/icons-material/Wifi";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setOnline(false);
      setShowBackOnline(false);
    };
    const handleOnline = () => {
      setOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (online && !showBackOnline) return null;

  return (
    <Slide direction="down" in={!online || showBackOnline}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          py: 0.75,
          px: 2,
          bgcolor: online ? "#2e7d32" : "#c62828",
          color: "#fff",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)",
        }}
      >
        {online ? (
          <WifiIcon fontSize="small" />
        ) : (
          <WifiOffIcon fontSize="small" />
        )}
        <Typography variant="caption" fontWeight={600}>
          {online
            ? "Back online"
            : "You're offline — some features unavailable"}
        </Typography>
      </Box>
    </Slide>
  );
}
