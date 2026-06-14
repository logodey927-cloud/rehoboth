import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { isStandalone, isIOS } from "../../utils/pwa";
import { useLocation } from "react-router-dom";

const DISMISSED_KEY = "pwa-install-dismissed";

// Only show on public / account paths — not admin or team dashboard
function shouldShowOnPath(pathname) {
  return (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/team/dashboard") &&
    !pathname.startsWith("/team/appointments") &&
    !pathname.startsWith("/team/calendar") &&
    !pathname.startsWith("/team/profile") &&
    !pathname.startsWith("/team/change-password")
  );
}

export default function InstallPwaBanner() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    if (
      isStandalone() ||
      localStorage.getItem(DISMISSED_KEY) ||
      !shouldShowOnPath(location.pathname)
    )
      return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Chrome/Edge on Android, desktop, etc. — not only Android
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — show helper after a short delay
    if (isIOS() && !isStandalone()) {
      const t = setTimeout(() => setShowIOS(true), 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [location.pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShowInstallBanner(false);
    setShowIOS(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") localStorage.setItem(DISMISSED_KEY, "1");
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Chrome / Edge install banner (Android, desktop, etc.)
  if (showInstallBanner) {
    return (
      <Slide direction="up" in={showInstallBanner}>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1400,
            bgcolor: "#0C6E6D",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            gap: 1.5,
            boxShadow: "0 -4px 16px rgba(0,0,0,0.2)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          }}
        >
          <Box component="img" src="/icons/icon-192.png" alt="Rehoboth" sx={{ width: 44, height: 44, borderRadius: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
              Install Rehoboth app
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Add to your home screen for quick access
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<GetAppIcon />}
            onClick={handleInstall}
            sx={{
              color: "#0C6E6D",
              bgcolor: "#fff",
              fontWeight: 700,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#e0f2f2" },
            }}
          >
            Install
          </Button>
          <IconButton size="small" onClick={dismiss} sx={{ color: "#fff" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Slide>
    );
  }

  // iOS instructions modal
  if (showIOS) {
    return (
      <Dialog open={showIOS} onClose={dismiss} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="img" src="/icons/icon-192.png" alt="Rehoboth" sx={{ width: 36, height: 36, borderRadius: 1 }} />
            <Typography fontWeight={700}>Add to Home Screen</Typography>
          </Box>
          <IconButton size="small" onClick={dismiss}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Install Rehoboth for quick access to bookings and wellness services:
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 1.5 }}>
            <IosShareIcon sx={{ color: "#0C6E6D", fontSize: 28 }} />
            <Typography variant="body2">
              Tap the <strong>Share</strong> button in Safari&apos;s toolbar
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 1.5 }}>
            <AddBoxIcon sx={{ color: "#0C6E6D", fontSize: 28 }} />
            <Typography variant="body2">
              Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 1.5 }}>
            <Box sx={{ width: 28, height: 28, bgcolor: "#0C6E6D", borderRadius: 1, flexShrink: 0 }} />
            <Typography variant="body2">
              Tap <strong>Add</strong> — the app will appear on your home screen
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={dismiss} size="small" sx={{ color: "#0C6E6D" }}>
            Maybe later
          </Button>
          <Button onClick={dismiss} variant="contained" size="small" sx={{ bgcolor: "#0C6E6D" }}>
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
}
