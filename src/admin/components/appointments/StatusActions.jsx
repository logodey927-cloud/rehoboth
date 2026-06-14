import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { updateAppointmentStatus } from "../../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../../utils/swal";

/**
 * StatusActions Component
 * Reusable component for managing appointment status in admin panel
 * 
 * @param {Object} props
 * @param {string} props.appointmentId - Appointment ID
 * @param {string} props.currentStatus - Current appointment status
 * @param {Function} props.onStatusUpdate - Callback when status is updated
 * @param {Function} props.onClose - Optional callback to close parent dialog/card
 */
export default function StatusActions({ appointmentId, currentStatus, onStatusUpdate, onClose }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [completionTime, setCompletionTime] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setCompletionTime(null);
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await ensureSweetAlertReady();

      const response = await updateAppointmentStatus(
        appointmentId,
        selectedStatus,
        selectedStatus === "completed"
          ? (completionTime ? completionTime.toISOString() : new Date().toISOString())
          : null
      );

      // Close status update dialog first so alert can display properly
      setStatusDialogOpen(false);
      setSelectedStatus("");
      setCompletionTime(null);

      if (response.data?.success) {
        // Close parent Appointment Details dialog immediately
        if (onClose) {
          onClose();
        }
        
        // Refresh appointments data
        if (onStatusUpdate) {
          onStatusUpdate();
        }
        
        // Show success alert after dialogs are closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Status Updated",
              `Appointment status has been updated to ${selectedStatus}`
            );
          } catch {
            // Error showing alert - silently fail
          }
        }, 200);
      } else {
        throw new Error(response.data?.error || "Failed to update status");
      }
    } catch (err) {
      // Close status update dialog first
      setStatusDialogOpen(false);
      setSelectedStatus("");
      setCompletionTime(null);
      
      // Close parent Appointment Details dialog immediately
      if (onClose) {
        onClose();
      }
      
      // Show error alert after dialogs are closed
      setTimeout(async () => {
        try {
          await swalError(
            "Update Failed",
            err.response?.data?.error || err.message || "Failed to update appointment status"
          );
        } catch {
          // Error showing alert - silently fail
        }
      }, 200);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusOptions = () => {
    const allStatuses = [
      { value: "pending", label: "Pending", icon: <CancelIcon fontSize="small" /> },
      { value: "confirmed", label: "Confirmed", icon: <CheckCircleIcon fontSize="small" /> },
      { value: "in_process", label: "In Process", icon: <PlayArrowIcon fontSize="small" /> },
      { value: "completed", label: "Completed", icon: <CheckCircleIcon fontSize="small" /> },
      { value: "cancelled", label: "Cancelled", icon: <CancelIcon fontSize="small" /> },
    ];

    // Filter out current status (normalize for comparison)
    const current = (currentStatus || "").toLowerCase();
    return allStatuses.filter((status) => status.value !== current);
  };

  const statusOptions = getStatusOptions();

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleMenuOpen}
        startIcon={<MoreVertIcon />}
        sx={{
          borderRadius: 0,
          textTransform: "none",
          minWidth: 100,
        }}
      >
        Change Status
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusClick(option.value)}
            sx={{ borderRadius: 0 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {option.icon}
              <Typography variant="body2">{option.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={statusDialogOpen}
        onClose={() => !updating && setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 0,
            maxHeight: "95vh",
            display: "flex",
            flexDirection: "column",
          } 
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <DialogTitle sx={{ flexShrink: 0 }}>
          Update Appointment Status
        </DialogTitle>
        <DialogContent 
          sx={{ 
            overflowY: "auto",
            flex: "1 1 auto",
            minHeight: 0,
          }}
        >
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Current Status:{" "}
              <Chip
                label={currentStatus}
                size="small"
                sx={{
                  borderRadius: 0,
                  fontWeight: 500,
                }}
              />
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              New Status:{" "}
              <Chip
                label={selectedStatus}
                size="small"
                color="primary"
                sx={{
                  borderRadius: 0,
                  fontWeight: 500,
                }}
              />
            </Typography>
            {selectedStatus === "completed" && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Completion Time (Optional)"
                  value={completionTime}
                  onChange={(newValue) => setCompletionTime(newValue)}
                  slotProps={{
                    popper: {
                      placement: "bottom",
                      disablePortal: false,
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 8],
                          },
                        },
                        {
                          name: "preventOverflow",
                          enabled: true,
                          options: {
                            boundary: "viewport",
                            padding: 20,
                            altAxis: true,
                          },
                        },
                        {
                          name: "flip",
                          enabled: true,
                          options: {
                            fallbackPlacements: ["top", "bottom-start", "top-start", "bottom-end", "top-end"],
                            altBoundary: true,
                          },
                        },
                        {
                          name: "computeStyles",
                          options: {
                            adaptive: true,
                            roundOffsets: true,
                          },
                        },
                      ],
                      sx: {
                        zIndex: 1400,
                        "& .MuiPickersPopper-paper": {
                          maxHeight: "calc(100vh - 120px)",
                          overflowY: "auto",
                          margin: "auto",
                        },
                      },
                    },
                    desktopPaper: {
                      sx: {
                        maxHeight: "calc(100vh - 120px)",
                        overflowY: "auto",
                      },
                    },
                    mobilePaper: {
                      sx: {
                        maxHeight: "calc(100vh - 120px)",
                        overflowY: "auto",
                      },
                    },
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      helperText: "Leave empty to use current time",
                      sx: { "& .MuiOutlinedInput-root": { borderRadius: 0 } },
                    },
                  }}
                  sx={{ width: "100%", mt: 2 }}
                />
              </LocalizationProvider>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexShrink: 0 }}>
          <Button
            onClick={() => setStatusDialogOpen(false)}
            disabled={updating}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updating}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            {updating ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

