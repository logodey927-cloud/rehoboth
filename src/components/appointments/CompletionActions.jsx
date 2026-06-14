import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  confirmAppointmentCompletion,
  rejectAppointmentCompletion,
} from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

/**
 * CompletionActions Component
 * Reusable component for admin to confirm or reject appointment completion
 * 
 * @param {Object} props
 * @param {string} props.appointmentId - Appointment ID
 * @param {Object} props.appointment - Appointment object with status and voucher info
 * @param {Function} props.onActionComplete - Callback when action is completed
 * @param {Function} props.onClose - Optional callback to close parent dialog/card
 */
export default function CompletionActions({
  appointmentId,
  appointment,
  onActionComplete,
  onClose,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmClick = () => {
    setConfirmOpen(true);
  };

  const handleRejectClick = () => {
    setRejectOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await ensureSweetAlertReady();

      const response = await confirmAppointmentCompletion(appointmentId);
      
      if (response.data && response.data.success) {
        // Close dialog first so alert can display properly
        setConfirmOpen(false);
        setSubmitting(false);
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Completion Confirmed",
              "The appointment has been marked as completed and the voucher has been used."
            );
            if (onActionComplete) {
              onActionComplete();
            }
            // Close parent dialog/card if callback provided
            if (onClose) {
              onClose();
            }
          } catch {
            if (onActionComplete) {
              onActionComplete();
            }
            // Close parent dialog/card even if alert fails
            if (onClose) {
              onClose();
            }
          }
        }, 100);
      } else {
        // Close dialog first, then show error
        setConfirmOpen(false);
        setSubmitting(false);
        // Refresh data in case status changed
        if (onActionComplete) {
          onActionComplete();
        }
        setTimeout(async () => {
          try {
            const errorMsg = response.data?.error || "Please try again.";
            // If appointment is already completed, show a more helpful message
            if (errorMsg.includes("already") || errorMsg.includes("COMPLETED")) {
              await swalError(
                "Already Completed",
                "This appointment has already been confirmed. The page will refresh to show the latest status."
              );
            } else {
              await swalError(
                "Failed to Confirm",
                errorMsg
              );
            }
            // Close parent dialog/card after showing error
            if (onClose) {
              onClose();
            }
          } catch {
            // Close parent dialog/card even if alert fails
            if (onClose) {
              onClose();
            }
          }
        }, 100);
      }
    } catch (err) {
      // Close dialog first, then show error
      setConfirmOpen(false);
      setSubmitting(false);
      // Refresh data in case status changed
      if (onActionComplete) {
        onActionComplete();
      }
      setTimeout(async () => {
        try {
          const errorMsg = err.response?.data?.error ||
            err.message ||
            "Failed to confirm completion. Please try again.";
          // If appointment is already completed, show a more helpful message
          if (errorMsg.includes("already") || errorMsg.includes("COMPLETED") || errorMsg.includes("expected CLIENT_COMPLETED")) {
            await swalError(
              "Already Completed",
              "This appointment has already been confirmed. The page will refresh to show the latest status."
            );
          } else {
            await swalError(
              "Error",
              errorMsg
            );
          }
          // Close parent dialog/card after showing error
          if (onClose) {
            onClose();
          }
        } catch {
          // Close parent dialog/card even if alert fails
          if (onClose) {
            onClose();
          }
        }
      }, 100);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      await ensureSweetAlertReady();

      const response = await rejectAppointmentCompletion(appointmentId);
      
      if (response.data && response.data.success) {
        // Close dialog first so alert can display properly
        setRejectOpen(false);
        setSubmitting(false);
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Completion Rejected",
              "The appointment status has been reverted and the voucher remains reserved."
            );
            if (onActionComplete) {
              onActionComplete();
            }
            // Close parent dialog/card if callback provided
            if (onClose) {
              onClose();
            }
          } catch {
            if (onActionComplete) {
              onActionComplete();
            }
            // Close parent dialog/card even if alert fails
            if (onClose) {
              onClose();
            }
          }
        }, 100);
      } else {
        // Close dialog first, then show error
        setRejectOpen(false);
        setSubmitting(false);
        // Refresh data in case status changed
        if (onActionComplete) {
          onActionComplete();
        }
        setTimeout(async () => {
          try {
            const errorMsg = response.data?.error || "Please try again.";
            // If appointment status changed, show a more helpful message
            if (errorMsg.includes("already") || errorMsg.includes("COMPLETED") || errorMsg.includes("expected CLIENT_COMPLETED")) {
              await swalError(
                "Status Changed",
                "This appointment's status has changed. The page will refresh to show the latest status."
              );
            } else {
              await swalError(
                "Failed to Reject",
                errorMsg
              );
            }
            // Close parent dialog/card after showing error
            if (onClose) {
              onClose();
            }
          } catch {
            // Close parent dialog/card even if alert fails
            if (onClose) {
              onClose();
            }
          }
        }, 100);
      }
    } catch (err) {
      // Close dialog first, then show error
      setRejectOpen(false);
      setSubmitting(false);
      // Refresh data in case status changed
      if (onActionComplete) {
        onActionComplete();
      }
      setTimeout(async () => {
        try {
          const errorMsg = err.response?.data?.error ||
            err.message ||
            "Failed to reject completion. Please try again.";
          // If appointment status changed, show a more helpful message
          if (errorMsg.includes("already") || errorMsg.includes("COMPLETED") || errorMsg.includes("expected CLIENT_COMPLETED")) {
            await swalError(
              "Status Changed",
              "This appointment's status has changed. The page will refresh to show the latest status."
            );
          } else {
            await swalError(
              "Error",
              errorMsg
            );
          }
          // Close parent dialog/card after showing error
          if (onClose) {
            onClose();
          }
        } catch {
          // Close parent dialog/card even if alert fails
          if (onClose) {
            onClose();
          }
        }
      }, 100);
    }
  };

  // Only show actions if appointment is in client_completed status
  if (!appointment || (appointment.status || "").toLowerCase() !== "client_completed") {
    return null;
  }

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={handleConfirmClick}
          disabled={submitting}
          sx={{ borderRadius: 0 }}
        >
          Confirm
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<CancelIcon />}
          onClick={handleRejectClick}
          disabled={submitting}
          sx={{ borderRadius: 0 }}
        >
          Reject
        </Button>
      </Box>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSubmitting(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>Confirm Appointment Completion?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to confirm this appointment as completed?
          </DialogContentText>
          {appointment?.voucher_code && (
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 0,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Voucher Information:
              </Typography>
              <Typography variant="body2">
                Code: <Chip label={appointment.voucher_code} size="small" sx={{ borderRadius: 0 }} />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This voucher will be marked as USED.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setSubmitting(false);
            }}
            sx={{ 
              borderRadius: 0,
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
            color="success"
            disabled={submitting}
            sx={{ borderRadius: 0 }}
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

      {/* Reject Dialog */}
      <Dialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setSubmitting(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>Reject Appointment Completion?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this completion? The appointment 
            status will be reverted and the voucher (if applicable) will remain 
            reserved for this booking.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setRejectOpen(false);
              setSubmitting(false);
            }}
            sx={{ 
              borderRadius: 0,
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="outlined"
            color="error"
            disabled={submitting}
            sx={{ borderRadius: 0 }}
          >
            {submitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

