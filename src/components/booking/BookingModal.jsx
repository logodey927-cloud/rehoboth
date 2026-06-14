import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close as CloseIcon, CalendarMonth } from "@mui/icons-material";
import AppointmentForm from "../AppointmentForm";

/**
 * Full-screen booking modal that wraps AppointmentForm.
 *
 * Props:
 *  open            – boolean controlling visibility
 *  onClose         – called when user closes the modal
 *  initialStep     – 0 = Personal Info, 1 = Service Selection (default 1 for logged-in flow)
 *  initialVoucherCode – voucher code to pre-apply
 *  title           – optional dialog title override
 */
export default function BookingModal({
  open,
  onClose,
  initialStep = 1,
  initialVoucherCode = "",
  title = "Book an Appointment",
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 0,
          maxHeight: "95vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
          px: 3,
          bgcolor: "secondary.main",
          color: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <CalendarMonth sx={{ fontSize: 22 }} />
        <Typography variant="h6" component="span" fontWeight={700} sx={{ flex: 1 }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#fff",
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          }}
          aria-label="Close booking modal"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, "&::-webkit-scrollbar": { width: 6 } }}>
        <Box sx={{ bgcolor: "#f9f6f2", minHeight: "100%" }}>
          <AppointmentForm
            initialStep={initialStep}
            initialVoucherCode={initialVoucherCode}
            isModal
            onComplete={onClose}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
