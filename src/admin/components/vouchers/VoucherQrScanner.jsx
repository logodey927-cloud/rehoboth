import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, Button, Typography, Alert, Paper } from "@mui/material";
import { QrCodeScanner, Stop } from "@mui/icons-material";
import { Html5Qrcode } from "html5-qrcode";
import { parseVoucherCodeFromScan } from "../../../utils/voucherQr";

const SCANNER_ELEMENT_ID = "voucher-qr-scanner-region";

export default function VoucherQrScanner({ onScan, disabled = false }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const lastScanRef = useRef({ code: "", at: 0 });

  const stopScanner = useCallback(async () => {
    const instance = scannerRef.current;
    scannerRef.current = null;
    if (instance) {
      try {
        await instance.stop();
      } catch {
        // ignore if already stopped
      }
      try {
        instance.clear();
      } catch {
        // ignore clear errors
      }
    }
    setScanning(false);
  }, []);

  const handleDecoded = useCallback(
    (decodedText) => {
      const code = parseVoucherCodeFromScan(decodedText);
      if (!code) return;

      const now = Date.now();
      if (lastScanRef.current.code === code && now - lastScanRef.current.at < 2500) {
        return;
      }
      lastScanRef.current = { code, at: now };

      onScan?.(code);
      stopScanner();
    },
    [onScan, stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (disabled || scanning) return;

    setScanError(null);
    await stopScanner();

    const config = { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 };
    // Try rear camera first (phones), then front camera (laptops/desktops).
    const facingModes = ["environment", "user"];
    let lastErr;

    for (const facingMode of facingModes) {
      try {
        const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = html5Qr;
        await html5Qr.start({ facingMode }, config, handleDecoded, () => {});
        setScanning(true);
        return;
      } catch (err) {
        lastErr = err;
        await stopScanner();
        // Permission denied — no point trying the other camera.
        if (err?.name === "NotAllowedError" || err?.message?.includes("NotAllowed")) break;
      }
    }

    const msg = lastErr?.message ?? "";
    if (lastErr?.name === "NotAllowedError" || msg.includes("NotAllowed")) {
      setScanError("Camera permission denied. Allow camera access or enter the code manually.");
    } else if (!window.isSecureContext) {
      setScanError("Camera requires HTTPS or localhost. Enter the code manually.");
    } else {
      setScanError(
        import.meta.env.DEV
          ? `Could not start camera (${msg || lastErr}). Try another browser or enter the code manually.`
          : "Could not start camera. Try another browser or enter the code manually."
      );
    }
  }, [disabled, scanning, stopScanner, handleDecoded]);

  useEffect(() => () => {
    stopScanner();
  }, [stopScanner]);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, mb: 3, bgcolor: "#fafafa" }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Scan voucher QR code
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 360, mx: "auto", mb: 2 }}>
        <Box
          id={SCANNER_ELEMENT_ID}
          sx={{
            width: "100%",
            minHeight: scanning ? 300 : 100,
            bgcolor: "#111",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        />
        {!scanning && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, textAlign: "center" }}>
            Press “Start camera scan” to activate the camera.
          </Typography>
        )}
      </Box>

      {scanError && (
        <Alert severity="warning" sx={{ borderRadius: 0, mb: 2 }}>
          {scanError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {!scanning ? (
          <Button
            variant="contained"
            startIcon={<QrCodeScanner />}
            onClick={startScanner}
            disabled={disabled}
            sx={{
              borderRadius: 0,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "secondary.main",
              "&:hover": { bgcolor: "secondary.dark" },
            }}
          >
            Start camera scan
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Stop />}
            onClick={stopScanner}
            sx={{ borderRadius: 0, textTransform: "none", fontWeight: 600 }}
          >
            Stop scanner
          </Button>
        )}
      </Box>
    </Paper>
  );
}
