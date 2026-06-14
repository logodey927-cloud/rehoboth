import React, { useEffect, useState } from "react";
import { Snackbar, Button, Box, Typography } from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

export default function PwaUpdatePrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("pwa:update-available", handler);
    return () => window.removeEventListener("pwa:update-available", handler);
  }, []);

  const handleUpdate = () => {
    setShow(false);
    if (typeof window.__pwaUpdateSW === "function") {
      window.__pwaUpdateSW(true);
    } else {
      window.location.reload();
    }
  };

  return (
    <Snackbar
      open={show}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ mb: { xs: 9, sm: 2 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "#0C6E6D",
          color: "#fff",
          px: 2.5,
          py: 1.5,
          borderRadius: 2,
          boxShadow: 6,
        }}
      >
        <SystemUpdateAltIcon fontSize="small" />
        <Typography variant="body2" fontWeight={600}>
          New version available
        </Typography>
        <Button
          size="small"
          onClick={handleUpdate}
          sx={{
            color: "#0C6E6D",
            bgcolor: "#fff",
            ml: 1,
            fontWeight: 700,
            "&:hover": { bgcolor: "#e0f2f2" },
          }}
        >
          Refresh
        </Button>
        <Button
          size="small"
          onClick={() => setShow(false)}
          sx={{ color: "#fff", minWidth: 0, px: 0.5 }}
        >
          ✕
        </Button>
      </Box>
    </Snackbar>
  );
}
