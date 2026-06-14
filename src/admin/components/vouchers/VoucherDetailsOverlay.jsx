import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import VoucherStatusEditor from "./VoucherStatusEditor";

/**
 * VoucherDetailsOverlay Component
 * Displays detailed voucher information in a modal overlay
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.voucher - Voucher data object
 * @param {Function} props.onVoucherUpdate - Callback when voucher is updated (for refreshing data)
 */
export default function VoucherDetailsOverlay({ open, onClose, voucher, onVoucherUpdate }) {
  if (!voucher) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("D MMMM YYYY [at] HH:mm");
  };

  const formatDiscount = () => {
    if (voucher.discount_type === "percent") {
      return `${voucher.discount_value}% OFF`;
    } else if (voucher.discount_type === "amount") {
      return `£${voucher.discount_value} OFF`;
    } else if (voucher.discount_type === "free_service") {
      return "FREE SERVICE";
    }
    if (voucher.discount_type === "full_coverage") {
      return "FULL COVERAGE";
    }
    return "Special Offer";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      issued: { bg: "#2196f315", color: "#2196f3" },
      reserved: { bg: "#ff980015", color: "#ff9800" },
      client_completed: { bg: "#9c27b015", color: "#9c27b0" },
      used: { bg: "#4caf5015", color: "#4caf50" },
      expired: { bg: "#f4433615", color: "#f44336" },
    };
    return statusColors[status] || { bg: "#e0e0e0", color: "#757575" };
  };

  const statusColors = getStatusColor(voucher.status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Voucher Details
          </Typography>
          <Button
            onClick={onClose}
            sx={{ minWidth: "auto", p: 0.5, borderRadius: 0 }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Voucher Code Section */}
          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                minHeight: { xs: 100, sm: 120 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}>
                Voucher Code
              </Typography>
              <Chip
                label={voucher.code || "-"}
                size="medium"
                sx={{
                  backgroundColor: "#84994f",
                  color: "white",
                  fontWeight: 600,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  height: { xs: 32, sm: 36 },
                  borderRadius: 0,
                  "&:hover": {
                    backgroundColor: "#6b7d3f",
                  },
                }}
              />
            </Paper>
          </Grid>

          {/* Status Section */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                minHeight: { xs: 100, sm: 120 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Status
                </Typography>
                {voucher.id && (
                  <VoucherStatusEditor
                    voucherIssueId={voucher.id}
                    currentStatus={voucher.status || "issued"}
                    onStatusUpdate={() => {
                      // Refresh voucher data
                      if (onVoucherUpdate) {
                        onVoucherUpdate();
                      }
                    }}
                  />
                )}
              </Box>
              <Chip
                label={voucher.status || "issued"}
                size="medium"
                sx={{
                  backgroundColor: statusColors.bg,
                  color: statusColors.color,
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  height: { xs: 32, sm: 36 },
                  borderRadius: 0,
                  "&:hover": {
                    backgroundColor: statusColors.bg.replace("15", "25"),
                  },
                }}
              />
            </Paper>
          </Grid>

          {/* Discount Section */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                minHeight: { xs: 100, sm: 120 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}>
                Discount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "secondary.main" }}>
                {formatDiscount()}
              </Typography>
            </Paper>
          </Grid>

          {/* Validity Section */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                minHeight: { xs: 100, sm: 120 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}>
                Validity Period
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {formatDate(voucher.validity_start)}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                to {formatDate(voucher.validity_end)}
              </Typography>
            </Paper>
          </Grid>

          {/* Voucher Information Section */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Voucher Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {voucher.title || "-"}
                </Typography>
              </Grid>
              {voucher.description && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {voucher.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Client Information Section */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Client Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Client Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {voucher.client_name || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1">
                  {voucher.client_email || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Phone
                </Typography>
                <Typography variant="body1">
                  {voucher.client_phone || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Issued At
                </Typography>
                <Typography variant="body1">
                  {formatDate(voucher.issued_at)}
                </Typography>
              </Grid>
              {voucher.used_at && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
                    Used At
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(voucher.used_at)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{ 
              borderRadius: 0, 
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": {
                backgroundColor: "secondary.dark",
              },
            }}
          >
            Close
          </Button>
      </DialogActions>
    </Dialog>
  );
}

