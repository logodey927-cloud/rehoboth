import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { markAppointmentCompleted } from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

/**
 * MarkCompletedButton Component
 * Reusable button component for marking appointments as completed
 * 
 * @param {Object} props
 * @param {string} props.appointmentId - Appointment ID
 * @param {Function} props.onSuccess - Callback when successfully marked as completed
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.variant - Button variant (contained, outlined, etc.)
 * @param {string} props.size - Button size (small, medium, large)
 */
export default function MarkCompletedButton({
  appointmentId,
  onSuccess,
  disabled = false,
  variant = "contained",
  size = "medium",
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    // Always allow closing, even when submitting (user can cancel)
    setOpen(false);
    setSubmitting(false);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await ensureSweetAlertReady();

      const response = await markAppointmentCompleted(appointmentId);
      
      if (response.data && response.data.success) {
        // Close dialog first so alert can display properly
        setOpen(false);
        setSubmitting(false);
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Appointment Marked as Completed",
              "Your appointment has been marked as completed. Awaiting admin verification."
            );
            if (onSuccess) {
              onSuccess();
            }
          } catch (swalErr) {
            if (onSuccess) {
              onSuccess();
            }
          }
        }, 100);
      } else {
        // Close dialog first, then show error
        setOpen(false);
        setSubmitting(false);
        setTimeout(async () => {
          try {
            await swalError(
              "Failed to Mark as Completed",
              response.data?.error || "Please try again."
            );
          } catch (swalErr) {
            // Error handled silently
          }
        }, 100);
      }
    } catch (err) {
      // Close dialog first, then show error
      setOpen(false);
      setSubmitting(false);
      setTimeout(async () => {
        try {
          await swalError(
            "Error",
            err.response?.data?.error ||
              err.message ||
              "Failed to mark appointment as completed. Please try again."
          );
        } catch (swalErr) {
          // Error showing alert - silently fail
        }
      }, 100);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled || submitting}
        sx={{
          borderRadius: 0,
          backgroundColor: variant === "contained" ? "success.main" : undefined,
          "&:hover": {
            backgroundColor: variant === "contained" ? "success.dark" : undefined,
          },
        }}
      >
        {submitting ? (
          <>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            Processing...
          </>
        ) : (
          "Mark as Completed"
        )}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>Mark Appointment as Completed?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this appointment as completed? 
            This action will notify the admin for verification. Once verified, 
            your voucher (if applicable) will be marked as used.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              borderRadius: 0,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={submitting}
            sx={{
              borderRadius: 0,
              backgroundColor: "success.main",
              "&:hover": {
                backgroundColor: "success.dark",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

