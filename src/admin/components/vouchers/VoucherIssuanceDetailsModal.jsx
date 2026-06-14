import React, { useState, useEffect } from "react";
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
  Avatar,
  Divider,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CardGiftcard as GiftIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Image as ImageIcon,
  Event as EventIcon,
  Redeem as RedeemIcon,
  ZoomIn as ZoomInIcon,
} from "@mui/icons-material";
import { PaymentStatusChip } from "../payments/PaymentDetailsModal";
import { verifyVoucherPaymentAdmin } from "../../../api/api";

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
  borderColor: BRAND.green,
  color: BRAND.greenDark,
  px: 1.75,
  minHeight: 36,
  bgcolor: "#fff",
  "&:hover": { borderColor: BRAND.greenDark, bgcolor: BRAND.greenMuted },
};

const ISSUANCE_STATUS_COLORS = {
  issued: { bg: "#2196f318", color: "#2196f3" },
  reserved: { bg: "#ff980018", color: "#ff9800" },
  client_completed: { bg: "#f58c0018", color: BRAND.orange },
  used: { bg: "#4caf5018", color: "#4caf50" },
  expired: { bg: "#9e9e9e18", color: "#757575" },
};

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `£${n.toFixed(2)}`;
}

function extractProofUrl(issue) {
  if (issue?.payment_proof_url) return issue.payment_proof_url;
  if (typeof issue?.notes === "string") {
    return issue.notes.match(/Payment proof URL:\s*(\S+)/i)?.[1] || null;
  }
  return null;
}

function isLikelyImageUrl(url) {
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  return /\.(png|jpe?g|gif|webp)$/i.test(url);
}

function IssuanceStatusChip({ status }) {
  const s = (status || "issued").toLowerCase();
  const c = ISSUANCE_STATUS_COLORS[s] || { bg: "#e0e0e018", color: "#757575" };
  const label = s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <Chip
      label={label}
      size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600, borderRadius: 0 }}
    />
  );
}

function DetailField({ label, value, children, fullWidth = false, styled = false }) {
  const valueContent = children ?? (
    <Typography
      variant="body2"
      sx={{ color: "#1a1f2e", fontWeight: 700, fontSize: "0.875rem", wordBreak: "break-word" }}
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
            ? {
                py: 1.1,
                px: 1.35,
                bgcolor: BRAND.greenMuted,
                borderLeft: `3px solid ${BRAND.green}`,
                borderRadius: 0,
              }
            : { mt: 0.25 }
        }
      >
        {valueContent}
      </Box>
    </Box>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
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
            bgcolor: BRAND.green,
            color: "#fff",
            borderRadius: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {children}
      </Box>
    </Paper>
  );
}

export default function VoucherIssuanceDetailsModal({
  open,
  onClose,
  issue,
  onOpenVoucher,
  onVerified,
}) {
  const [verifying, setVerifying] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    if (!open) {
      setImageZoomed(false);
      setActionError(null);
    }
  }, [open]);

  if (!issue) return null;

  const proofUrl = extractProofUrl(issue);
  const amount =
    issue.payment_amount != null && issue.payment_amount !== ""
      ? Number(issue.payment_amount)
      : null;
  const paymentStatus = (issue.payment_status || "").toLowerCase().trim();
  const canVerify =
    paymentStatus === "pending" &&
    amount != null &&
    Number.isFinite(amount) &&
    amount > 0 &&
    Boolean(proofUrl);

  const handleVerify = async () => {
    try {
      setActionError(null);
      setVerifying(true);
      const resp = await verifyVoucherPaymentAdmin(issue.id, {});
      if (!resp.data?.success) {
        throw new Error(resp.data?.error || "Failed to verify voucher payment");
      }
      await onVerified?.();
      onClose?.();
    } catch (e) {
      setActionError(e.message || "Failed to verify voucher payment");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={verifying ? undefined : onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden", maxHeight: "92vh" } }}
    >
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
          disabled={verifying}
          size="small"
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "rgba(255,255,255,0.85)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", pr: 4 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.35)",
            }}
          >
            <GiftIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.65)" }}>
              Voucher issuance
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: 0.5, mb: 0.25 }}
            >
              {issue.code}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
              {issue.client_name || "Customer"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              <IssuanceStatusChip status={issue.status} />
              {issue.payment_status && <PaymentStatusChip status={issue.payment_status} />}
              {issue.voucher_title && (
                <Chip
                  label={issue.voucher_title}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 0,
                    border: "1px solid rgba(255,255,255,0.35)",
                    maxWidth: 220,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            mt: 2.5,
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {[
            { label: "Amount", value: formatCurrency(amount) },
            { label: "Issued", value: formatDateTime(issue.issued_at) },
            { label: "Expires", value: formatDateTime(issue.expires_at) },
            { label: "Type", value: issue.voucher_type || "—" },
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f4f5f7" }}>
        {actionError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {actionError}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Customer" icon={PersonIcon}>
              <DetailField styled label="Full name" value={issue.client_name} />
              <DetailField styled label="Email" value={issue.client_email} />
              <DetailField styled label="Phone" value={issue.client_phone} />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Voucher" icon={GiftIcon}>
              <DetailField
                styled
                label="Code"
                children={
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                    {issue.code}
                  </Typography>
                }
              />
              <DetailField styled label="Voucher" value={issue.voucher_title} />
              <DetailField styled label="Type" value={issue.voucher_type} />
              <DetailField styled label="Issuance status" children={<IssuanceStatusChip status={issue.status} />} />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Payment" icon={PaymentIcon}>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Payment summary
                    </Typography>
                    <PaymentStatusChip status={issue.payment_status} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
                    {formatCurrency(amount)}
                  </Typography>
                </Paper>
              </Box>
              <DetailField
                styled
                label="Method"
                value={
                  issue.payment_method === "stripe"
                    ? "Stripe"
                    : issue.payment_method === "bank_transfer"
                      ? "Bank Transfer"
                      : issue.payment_method || "—"
                }
              />
              <DetailField
                styled
                label="Reference"
                children={
                  issue.payment_transaction_id ? (
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600, wordBreak: "break-all" }}>
                      {issue.payment_transaction_id}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      —
                    </Typography>
                  )
                }
              />
              <DetailField styled label="Payment date" value={formatDateTime(issue.payment_date)} />
              <DetailField styled label="Verified at" value={formatDateTime(issue.payment_verified_at)} />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Payment proof" icon={ImageIcon}>
              <Box sx={{ gridColumn: "1 / -1" }}>
                {proofUrl ? (
                  <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
                    <Box sx={{ cursor: "pointer" }} onClick={() => setImageZoomed(!imageZoomed)}>
                      {isLikelyImageUrl(proofUrl) && (
                        <Box
                          component="img"
                          src={proofUrl}
                          alt="Payment proof"
                          sx={{
                            width: "100%",
                            maxHeight: imageZoomed ? "none" : 360,
                            objectFit: "contain",
                            display: "block",
                            bgcolor: "#fafafa",
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ p: 1, bgcolor: "#fff", display: "flex", justifyContent: "space-between" }}>
                      <Button
                        size="small"
                        href={proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ textTransform: "none", borderRadius: 0 }}
                      >
                        Open in new tab
                      </Button>
                      <IconButton size="small" onClick={() => window.open(proofUrl, "_blank")}>
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: 0 }}>
                    No payment proof uploaded yet.
                  </Alert>
                )}
              </Box>
            </SectionCard>
          </Grid>

          {(issue.used_at || issue.booking_id) && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Redemption" icon={RedeemIcon}>
                <DetailField styled label="Used at" value={formatDateTime(issue.used_at)} />
                <DetailField
                  styled
                  label="Booking ID"
                  value={issue.booking_id}
                  fullWidth
                />
              </SectionCard>
            </Grid>
          )}

          {issue.notes && (
            <Grid size={{ xs: 12, md: issue.used_at || issue.booking_id ? 6 : 12 }}>
              <SectionCard title="Notes" icon={EventIcon}>
                <DetailField label="Notes" fullWidth>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                    {issue.notes}
                  </Typography>
                </DetailField>
              </SectionCard>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
              Issue ID: {issue.id}
            </Typography>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: 2.5,
            border: "2px solid",
            borderColor: BRAND.greenLight,
            borderRadius: 1,
            bgcolor: BRAND.greenMuted,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid", borderColor: "rgba(132,153,79,0.25)" }}>
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
            {onOpenVoucher && issue.voucher_id && (
              <Button variant="outlined" size="small" onClick={() => onOpenVoucher(issue)}>
                View voucher
              </Button>
            )}
            {canVerify && (
              <Button
                variant="contained"
                size="small"
                disabled={verifying}
                onClick={handleVerify}
                startIcon={verifying ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{
                  borderRadius: 0,
                  textTransform: "none",
                  bgcolor: "secondary.main",
                  "&:hover": { bgcolor: "secondary.dark" },
                }}
              >
                {verifying ? "Verifying…" : "Verify payment"}
              </Button>
            )}
          </Box>
          {canVerify && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 0 }}>
              Verify only after the proof, amount, and reference match your bank alert.
            </Alert>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
        <Button
          onClick={onClose}
          disabled={verifying}
          variant="contained"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            px: 3,
            backgroundColor: "secondary.main",
            "&:hover": { backgroundColor: "secondary.dark" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { IssuanceStatusChip };
