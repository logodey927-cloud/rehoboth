import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  CardGiftcard as CardGiftcardIcon,
  LocalOffer as LocalOfferIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VisibilityOff as VisibilityOffIcon,
  History as HistoryIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { deleteVoucher } from "../../../api/api";
import { swalConfirm, swalSuccess, swalError, ensureSweetAlertReady } from "../../../utils/swal";

const BRAND = {
  green: "#84994f",
  greenDark: "#47672f",
  greenLight: "#a8b86d",
  greenMuted: "#84994f18",
  orange: "#f58c00",
};

const ACTION_BTN_SX = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.8125rem",
  whiteSpace: "nowrap",
  borderColor: BRAND.green,
  color: BRAND.greenDark,
  px: 1.75,
  minHeight: 36,
  bgcolor: "#fff",
  "&:hover": { borderColor: BRAND.greenDark, bgcolor: BRAND.greenMuted },
};

function DetailField({ label, value, children, fullWidth = false, styled = false }) {
  const valueContent = children ?? (
    <Typography
      variant="body2"
      sx={{ color: "#1a1f2e", fontWeight: 700, fontSize: "0.875rem", wordBreak: "break-word", lineHeight: 1.45 }}
    >
      {value ?? "—"}
    </Typography>
  );

  return (
    <Box sx={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: styled ? BRAND.greenDark : "text.secondary",
          fontSize: "0.6875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={
          styled
            ? { py: 1.1, px: 1.35, bgcolor: BRAND.greenMuted, borderLeft: `3px solid ${BRAND.green}`, borderRadius: 0 }
            : { mt: 0.25 }
        }
      >
        {valueContent}
      </Box>
    </Box>
  );
}

function SectionCard({ title, icon: Icon, children, variant = "default" }) {
  const accentColor = variant === "discount" ? BRAND.orange : BRAND.green;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 1,
        bgcolor: "#fff",
        boxShadow: "0 1px 4px rgba(71, 103, 47, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mb: 2,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: BRAND.greenMuted,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: accentColor,
            color: "#fff",
            borderRadius: 0,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark, letterSpacing: 0.3 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {children}
      </Box>
    </Paper>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDiscount(v) {
  if (!v) return "—";
  if (v.discount_type === "percent")      return `${v.discount_value}% OFF`;
  if (v.discount_type === "amount")       return `£${v.discount_value} OFF`;
  if (v.discount_type === "free_service") return "FREE SERVICE";
  if (v.discount_type === "full_coverage") return "FULL COVERAGE";
  return "SPECIAL OFFER";
}

export default function VoucherDetailsModal({ open, onClose, voucher, onMutated }) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(null);

  if (!voucher) return null;

  const isActive  = voucher.status === "active" || !voucher.status;
  const typeLabel = voucher.voucher_type === "promo" ? "Promo" : voucher.voucher_type === "gift" ? "Gift Card" : "Voucher";

  const handleDeactivate = async () => {
    try {
      setActionLoading("deactivate");
      const res = await deleteVoucher(voucher.id, false);
      if (res.data?.success) {
        onClose();
        setTimeout(async () => {
          await ensureSweetAlertReady();
          await swalSuccess("Voucher Deactivated", "The voucher has been deactivated successfully.");
          if (onMutated) onMutated();
        }, 100);
      } else {
        await swalError("Deactivate Failed", res.data?.error || "Failed to deactivate voucher.");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || "Failed to deactivate voucher.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    await ensureSweetAlertReady();
    const result = await swalConfirm(
      "Permanently Delete Voucher?",
      "This cannot be undone. All associated voucher issues will also be deleted.",
      "Delete Permanently",
      "Cancel"
    );
    if (!result.isConfirmed) return;
    try {
      setActionLoading("delete");
      const res = await deleteVoucher(voucher.id, true);
      if (res.data?.success) {
        onClose();
        setTimeout(async () => {
          await swalSuccess("Voucher Deleted", "The voucher has been permanently deleted.");
          if (onMutated) onMutated();
        }, 100);
      } else {
        await swalError("Delete Failed", res.data?.error || "Failed to delete voucher.");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || "Failed to delete voucher.");
    } finally {
      setActionLoading(null);
    }
  };

  const discountTypeLabel =
    voucher.discount_type === "percent"       ? "Percentage"    :
    voucher.discount_type === "amount"        ? "Fixed Amount"  :
    voucher.discount_type === "free_service"  ? "Free Service"  :
    voucher.discount_type === "full_coverage" ? "Full Coverage" : "—";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden", maxHeight: "92vh" } }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          background: `linear-gradient(135deg, ${BRAND.greenDark} 0%, ${BRAND.green} 55%, ${BRAND.greenLight} 100%)`,
          color: "#fff",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close"
          sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", pr: 4 }}>
          <Box
            sx={{
              width: 64, height: 64,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.35)",
              borderRadius: 1, flexShrink: 0,
            }}
          >
            <CardGiftcardIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>
              Voucher
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.5 }}>
              {voucher.title || "Untitled Voucher"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              <Chip
                label={isActive ? "Active" : "Inactive"}
                size="small"
                sx={{ backgroundColor: isActive ? "#4caf5018" : "#9e9e9e18", color: isActive ? "#4caf50" : "#9e9e9e", fontWeight: 600, borderRadius: 0 }}
              />
              <Chip
                label={typeLabel}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600, borderRadius: 0, border: "1px solid rgba(255,255,255,0.35)" }}
              />
              <Chip
                label={formatDiscount(voucher)}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, borderRadius: 0 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Summary strip */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.5, mt: 2.5, pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {[
            { label: "Code",           value: voucher.code || "—" },
            { label: "Purchase Price", value: voucher.purchase_price ? `£${Number(voucher.purchase_price).toFixed(2)}` : "Free" },
            { label: "Usage Limit",    value: voucher.usage_limit != null ? String(voucher.usage_limit) : "Unlimited" },
            { label: "Valid Until",    value: formatDate(voucher.validity_end) },
          ].map((item) => (
            <Box key={item.label} sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", display: "block" }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", fontSize: "0.8125rem" }} noWrap>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Body ── */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f4f5f7" }}>
        <Grid container spacing={2}>
          {/* Overview */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Overview" icon={DescriptionIcon}>
              <DetailField styled label="Voucher Type" value={typeLabel} />
              <DetailField styled label="Status">
                <Chip
                  label={isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{ backgroundColor: isActive ? "#4caf5018" : "#9e9e9e18", color: isActive ? "#4caf50" : "#9e9e9e", fontWeight: 600, borderRadius: 0 }}
                />
              </DetailField>
              <DetailField styled label="Valid From"  value={formatDate(voucher.validity_start)} />
              <DetailField styled label="Valid Until" value={formatDate(voucher.validity_end)} />
              {voucher.description && (
                <DetailField styled label="Description" fullWidth>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#1a1f2e", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                    {voucher.description}
                  </Typography>
                </DetailField>
              )}
            </SectionCard>
          </Grid>

          {/* Discount & Rules */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Discount & Rules" icon={LocalOfferIcon} variant="discount">
              <DetailField styled label="Discount Type"  value={discountTypeLabel} />
              <DetailField styled label="Discount Value" value={formatDiscount(voucher)} />
              <DetailField styled label="Voucher Code"   value={voucher.code || "—"} />
              <DetailField styled label="Purchase Price" value={voucher.purchase_price ? `£${Number(voucher.purchase_price).toFixed(2)}` : "Free"} />
              {voucher.usage_limit != null && (
                <DetailField styled label="Usage Limit" value={String(voucher.usage_limit)} />
              )}
              {voucher.min_purchase_amount != null && (
                <DetailField styled label="Min. Purchase" value={`£${Number(voucher.min_purchase_amount).toFixed(2)}`} />
              )}
            </SectionCard>
          </Grid>

          {/* Timestamps row */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, px: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Created {formatDateTime(voucher.created_at)}
                </Typography>
              </Box>
              {voucher.updated_at && (
                <Typography variant="caption" color="text.secondary">
                  Updated {formatDateTime(voucher.updated_at)}
                </Typography>
              )}
              {voucher.id && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  ID: {voucher.id}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Admin actions */}
        <Paper
          elevation={0}
          sx={{
            mt: 2.5, p: 2.5,
            border: "2px solid", borderColor: BRAND.greenLight,
            borderRadius: 1, bgcolor: BRAND.greenMuted,
          }}
        >
          <Box
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              mb: 2, pb: 1.5,
              borderBottom: "1px solid", borderColor: "rgba(132, 153, 79, 0.25)",
            }}
          >
            <Box sx={{ width: 8, height: 8, bgcolor: BRAND.orange, borderRadius: "50%" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
              Admin actions
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              gap: 1,
              "& .MuiButton-root": { ...ACTION_BTN_SX, width: { xs: "100%", sm: "auto" } },
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => { onClose(); navigate(`/admin/vouchers/edit/${voucher.id}`); }}
            >
              Edit Voucher
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={() => { onClose(); navigate(`/admin/vouchers/${voucher.id}?tab=history`); }}
            >
              View History
            </Button>
            {isActive && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityOffIcon />}
                onClick={handleDeactivate}
                disabled={actionLoading === "deactivate"}
                sx={{ borderColor: "#ed6c02", color: "#e65100", "&:hover": { borderColor: "#e65100", bgcolor: "#ed6c0210" } }}
              >
                {actionLoading === "deactivate" ? "Deactivating…" : "Deactivate"}
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={actionLoading === "delete"}
              sx={{ borderColor: "#ef4444", color: "#dc2626", "&:hover": { borderColor: "#dc2626", bgcolor: "#ef444410" } }}
            >
              {actionLoading === "delete" ? "Deleting…" : "Delete"}
            </Button>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 1, textTransform: "none", fontSize: "0.875rem", px: 3,
            backgroundColor: "secondary.main", "&:hover": { backgroundColor: "secondary.dark" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
