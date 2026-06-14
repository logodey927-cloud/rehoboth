import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import { deleteVoucher } from "../../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../../utils/swal";

/**
 * VoucherActions Component
 * Reusable actions menu for voucher rows
 * 
 * @param {Object} props
 * @param {string} props.voucherId - Voucher ID
 * @param {Function} props.onDelete - Callback after successful delete
 * @param {Function} props.onViewDetails - Callback to view details
 * @param {Function} props.onViewHistory - Callback to view issuance history
 */
export default function VoucherActions({
  voucherId,
  onDelete,
  onViewDetails,
  onViewHistory,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/admin/vouchers/edit/${voucherId}`);
  };

  const handleViewDetails = () => {
    handleMenuClose();
    if (onViewDetails) {
      onViewDetails(voucherId);
    } else {
      navigate(`/admin/vouchers/${voucherId}`);
    }
  };

  const handleViewHistory = () => {
    handleMenuClose();
    if (onViewHistory) {
      onViewHistory(voucherId);
    } else {
      navigate(`/admin/vouchers/${voucherId}?tab=history`);
    }
  };

  const handleDeactivateClick = () => {
    handleMenuClose();
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    try {
      setDeactivating(true);
      await ensureSweetAlertReady();

      const response = await deleteVoucher(voucherId, false); // false = soft delete (deactivate)
      
      if (response.data && response.data.success) {
        // Close dialog first so alert can display properly
        setDeactivateDialogOpen(false);
        setDeactivating(false);
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Voucher Deactivated",
              "The voucher has been deactivated successfully. You can reactivate it by editing the voucher."
            );
            if (onDelete) {
              onDelete();
            }
          } catch (swalErr) {
            if (onDelete) {
              onDelete();
            }
          }
        }, 100);
      } else {
        // Close dialog first, then show error
        setDeactivateDialogOpen(false);
        setDeactivating(false);
        setTimeout(async () => {
          try {
            await swalError(
              "Deactivate Failed",
              response.data?.error || "Failed to deactivate voucher."
            );
          } catch (swalErr) {
            // Error showing alert - silently fail
          }
        }, 100);
      }
    } catch (err) {
      // Close dialog first, then show error
      setDeactivateDialogOpen(false);
      setDeactivating(false);
      setTimeout(async () => {
        try {
          await swalError(
            "Error",
            err.response?.data?.error ||
              err.message ||
              "Failed to deactivate voucher. Please try again."
          );
        } catch (swalErr) {
          // Error showing alert - silently fail
        }
      }, 100);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await ensureSweetAlertReady();

      const response = await deleteVoucher(voucherId, true); // true = hard delete
      
      if (response.data && response.data.success) {
        // Close dialog first so alert can display properly
        setDeleteDialogOpen(false);
        setDeleting(false);
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Voucher Deleted",
              "The voucher has been permanently deleted from the system."
            );
            if (onDelete) {
              onDelete();
            }
          } catch (swalErr) {
            if (onDelete) {
              onDelete();
            }
          }
        }, 100);
      } else {
        // Close dialog first, then show error
        setDeleteDialogOpen(false);
        setDeleting(false);
        setTimeout(async () => {
          try {
            await swalError(
              "Delete Failed",
              response.data?.error || "Failed to delete voucher."
            );
          } catch (swalErr) {
            // Error showing alert - silently fail
          }
        }, 100);
      }
    } catch (err) {
      // Close dialog first, then show error
      setDeleteDialogOpen(false);
      setDeleting(false);
      setTimeout(async () => {
        try {
          await swalError(
            "Error",
            err.response?.data?.error ||
              err.message ||
              "Failed to delete voucher. Please try again."
          );
        } catch (swalErr) {
          // Error showing alert - silently fail
        }
      }, 100);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{ borderRadius: 0 }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 0,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewHistory}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeactivateClick} sx={{ color: "warning.main" }}>
          <ListItemIcon>
            <VisibilityOffIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={() => {
          setDeactivateDialogOpen(false);
          setDeactivating(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>Deactivate Voucher?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate this voucher? This will set the voucher status to inactive.
            This action can be undone by editing the voucher and changing its status back to active.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeactivateDialogOpen(false);
              setDeactivating(false);
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
            onClick={handleDeactivateConfirm}
            variant="contained"
            color="warning"
            disabled={deactivating}
            sx={{ borderRadius: 0 }}
          >
            {deactivating ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Deactivating...
              </>
            ) : (
              "Deactivate"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleting(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>Permanently Delete Voucher?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Warning:</strong> This action cannot be undone. The voucher will be permanently deleted from the system.
            All associated voucher issues will also be deleted. Are you absolutely sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleting(false);
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
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ borderRadius: 0 }}
          >
            {deleting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

