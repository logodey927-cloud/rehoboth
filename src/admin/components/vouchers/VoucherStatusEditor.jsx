import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { updateVoucherIssueStatus } from "../../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../../utils/swal";

/**
 * VoucherStatusEditor Component
 * Allows admin to edit voucher_issues status
 * 
 * @param {Object} props
 * @param {string} props.voucherIssueId - Voucher issue ID
 * @param {string} props.currentStatus - Current voucher status
 * @param {Function} props.onStatusUpdate - Callback when status is updated
 */
export default function VoucherStatusEditor({ voucherIssueId, currentStatus, onStatusUpdate }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus || "issued");
  const [updating, setUpdating] = useState(false);

  const handleOpen = () => {
    setStatus(currentStatus || "issued");
    setOpen(true);
  };

  const handleClose = () => {
    if (!updating) {
      setOpen(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await ensureSweetAlertReady();

      const response = await updateVoucherIssueStatus(voucherIssueId, status);

      if (response.data?.success) {
        // Close dialog first so alert can display properly
        setOpen(false);
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Status Updated",
              `Voucher status has been updated to ${status}`
            );
            if (onStatusUpdate) {
              onStatusUpdate();
            }
          } catch (swalErr) {
            if (onStatusUpdate) {
              onStatusUpdate();
            }
          }
        }, 100);
      } else {
        throw new Error(response.data?.error || "Failed to update status");
      }
    } catch (err) {
      await swalError(
        "Update Failed",
        err.response?.data?.error || err.message || "Failed to update voucher status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (statusValue) => {
    const statusColors = {
      issued: { bg: "#2196f315", color: "#2196f3" },
      reserved: { bg: "#ff980015", color: "#ff9800" },
      client_completed: { bg: "#9c27b015", color: "#9c27b0" },
      used: { bg: "#4caf5015", color: "#4caf50" },
      expired: { bg: "#f4433615", color: "#f44336" },
    };
    return statusColors[statusValue] || { bg: "#e0e0e0", color: "#757575" };
  };

  const statusOptions = [
    { value: "issued", label: "Issued" },
    { value: "reserved", label: "Reserved" },
    { value: "client_completed", label: "Client Completed" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
  ];

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
        startIcon={<EditIcon />}
        sx={{
          borderRadius: 0,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "action.hover",
            borderColor: "secondary.main",
          },
        }}
      >
        Edit Status
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle>
          Edit Voucher Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Current Status:{" "}
              <Chip
                label={currentStatus || "issued"}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(currentStatus).bg,
                  color: getStatusColor(currentStatus).color,
                  fontWeight: 500,
                  borderRadius: 0,
                }}
              />
            </Typography>
            <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="New Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {status !== currentStatus && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "info.light", borderRadius: 0 }}>
                <Typography variant="body2" sx={{ color: "info.dark" }}>
                  Status will change from{" "}
                  <strong>{currentStatus || "issued"}</strong> to{" "}
                  <strong>{status}</strong>
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={updating}
            sx={{ 
              borderRadius: 0, 
              textTransform: "none",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={updating || status === currentStatus}
            sx={{ 
              borderRadius: 0, 
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": {
                backgroundColor: "secondary.dark",
              },
              "&:disabled": {
                backgroundColor: "action.disabledBackground",
              },
            }}
          >
            {updating ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

