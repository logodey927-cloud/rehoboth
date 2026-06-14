import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Spa as SpaIcon,
  ZoomIn as ZoomInIcon,
  Image as ImageIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import PaymentActions from "./PaymentActions";

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
  "&:hover": {
    borderColor: BRAND.greenDark,
    bgcolor: BRAND.greenMuted,
  },
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

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount) {
  if (amount == null || amount === "") return "—";
  return `£${parseFloat(amount).toFixed(2)}`;
}

function formatPaymentMethod(value) {
  if (!value) return "—";
  const map = {
    stripe: "Stripe",
    bank_transfer: "Bank Transfer",
    voucher_prepaid: "Prepaid Voucher",
    voucher: "Voucher",
  };
  return map[value] || value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function PaymentStatusChip({ status }) {
  const s = (status || "pending").toLowerCase();
  const map = {
    pending: { bg: "#f58c0018", color: BRAND.orange, label: "Pending" },
    paid: { bg: "#4caf5018", color: "#4caf50", label: "Paid" },
    failed: { bg: "#f4433618", color: "#f44336", label: "Failed" },
    refunded: { bg: "#9e9e9e18", color: "#757575", label: "Refunded" },
  };
  const c = map[s] || map.pending;
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600, borderRadius: 0 }}
    />
  );
}

function DetailField({ label, value, children, fullWidth = false, styled = false }) {
  const valueContent = children ?? (
    <Typography
      variant="body2"
      sx={{
        color: "#1a1f2e",
        fontWeight: 700,
        fontSize: "0.875rem",
        wordBreak: "break-word",
        lineHeight: 1.45,
      }}
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
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark, letterSpacing: 0.3 }}>
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

export default function PaymentDetailsModal({
  open,
  onClose,
  appointment: row,
  onPaymentVerified,
}) {
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    if (!open) setImageZoomed(false);
  }, [open]);

  if (!row) return null;

  const servicePrice = parseFloat(row.service_price || 0);
  const discount = parseFloat(row.voucher_discount_amount || 0);
  const total = parseFloat(row.payment_amount || 0);
  const voucher = row.voucher || {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          maxHeight: "92vh",
        },
      }}
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
            src={row.image_url || undefined}
            alt={row.service || "Service"}
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.35)",
              flexShrink: 0,
            }}
          >
            {!row.image_url && <SpaIcon />}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>
              Payment
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.25 }}>
              {row.full_name || "Customer"}
            </Typography>
            {row.email && (
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {row.email}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              <PaymentStatusChip status={row.payment_status} />
              {row.service && (
                <Chip
                  label={row.service}
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
            { label: "Amount", value: formatCurrency(total) },
            { label: "Method", value: formatPaymentMethod(row.payment_method) },
            { label: "Appointment", value: row.date ? formatDate(row.date) : "—" },
            { label: "Reference", value: row.payment_transaction_id ? "View below" : "—" },
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Customer" icon={PersonIcon}>
              <DetailField styled label="Full name" value={row.full_name} />
              <DetailField styled label="Phone" value={row.phone} />
              <DetailField
                styled
                label="Email"
                children={
                  row.email ? (
                    <Typography
                      component="a"
                      href={`mailto:${row.email}`}
                      variant="body2"
                      sx={{
                        color: BRAND.greenDark,
                        fontWeight: 700,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {row.email}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      —
                    </Typography>
                  )
                }
              />
              <DetailField
                styled
                label="Account"
                value={row.user_id ? "Registered user" : "Guest"}
              />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Booking" icon={EventIcon}>
              <DetailField styled label="Service" value={row.service} />
              <DetailField styled label="Appointment date" value={row.date ? formatDate(row.date) : "—"} />
              <DetailField styled label="Time" value={row.time} />
              <DetailField styled label="Booked at" value={formatDateTime(row.created_at)} />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Payment" icon={PaymentIcon}>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "#fff",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Payment summary
                    </Typography>
                    <PaymentStatusChip status={row.payment_status} />
                  </Box>
                  {servicePrice > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Service price
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(servicePrice)}
                      </Typography>
                    </Box>
                  )}
                  {discount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Voucher discount
                      </Typography>
                      <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700 }}>
                        −{formatCurrency(discount)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
                      {formatCurrency(total)}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              <DetailField styled label="Payment method" value={formatPaymentMethod(row.payment_method)} />
              <DetailField styled label="Payer name" value={row.payment_name} />
              <DetailField styled label="Currency" value={(row.payment_currency || "GBP").toUpperCase()} />
              <DetailField
                styled
                label="Transaction ID"
                fullWidth
                children={
                  row.payment_transaction_id ? (
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all", fontWeight: 600 }}
                    >
                      {row.payment_transaction_id}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      —
                    </Typography>
                  )
                }
              />
              <DetailField styled label="Payment date" value={formatDateTime(row.payment_date)} />
              <DetailField styled label="Verified at" value={formatDateTime(row.payment_verified_at)} />
              {(voucher.code || row.voucher_code) && (
                <DetailField
                  styled
                  label="Voucher"
                  children={
                    <Chip
                      label={voucher.code || row.voucher_code}
                      size="small"
                      sx={{ backgroundColor: BRAND.greenMuted, color: BRAND.greenDark, fontWeight: 700, borderRadius: 0 }}
                    />
                  }
                />
              )}
              {row.stripe_checkout_session_id && (
                <DetailField
                  styled
                  label="Stripe session"
                  fullWidth
                  children={
                    <Typography variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all", fontWeight: 600 }}>
                      {row.stripe_checkout_session_id}
                    </Typography>
                  }
                />
              )}
              {row.stripe_payment_intent_id && (
                <DetailField
                  styled
                  label="Stripe payment intent"
                  fullWidth
                  children={
                    <Typography variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all", fontWeight: 600 }}>
                      {row.stripe_payment_intent_id}
                    </Typography>
                  }
                />
              )}
            </SectionCard>
          </Grid>

          {row.payment_screenshot_url && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Payment proof" icon={ImageIcon}>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Box
                      sx={{ position: "relative", cursor: "pointer" }}
                      onClick={() => setImageZoomed(!imageZoomed)}
                    >
                      <Box
                        component="img"
                        src={row.payment_screenshot_url}
                        alt="Payment proof"
                        sx={{
                          width: "100%",
                          maxHeight: imageZoomed ? "none" : 360,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0,0,0,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: imageZoomed ? 0 : 0,
                          transition: "opacity 0.2s",
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <ZoomInIcon sx={{ color: "#fff", fontSize: 48 }} />
                      </Box>
                    </Box>
                    <Box sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fff" }}>
                      <Typography variant="caption" color="text.secondary">
                        Click image to {imageZoomed ? "collapse" : "expand"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => window.open(row.payment_screenshot_url, "_blank")}
                        sx={{ borderRadius: 0 }}
                      >
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </SectionCard>
            </Grid>
          )}

          {row.payment_status === "pending" && row.payment_method === "stripe" && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                Awaiting Stripe confirmation. Status updates automatically when the customer completes checkout.
              </Alert>
            </Grid>
          )}

          {row.payment_method === "voucher_prepaid" && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                Booked with a prepaid voucher
                {row.voucher_code ? ` (${row.voucher_code})` : ""}.
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, px: 0.5 }}>
              {row.id && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  Appointment ID: {row.id}
                </Typography>
              )}
            </Box>
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              pb: 1.5,
              borderBottom: "1px solid",
              borderColor: "rgba(132, 153, 79, 0.25)",
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
              alignItems: "stretch",
              "& .MuiButton-root": {
                ...ACTION_BTN_SX,
                width: { xs: "100%", sm: "auto" },
              },
              "& .MuiChip-root": {
                borderRadius: 0,
                fontWeight: 600,
                height: 36,
                width: { xs: "100%", sm: "auto" },
                justifyContent: "center",
              },
            }}
          >
            <Button
              component={RouterLink}
              to="/admin/appointments"
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={onClose}
            >
              View appointments
            </Button>
            {row.payment_status === "pending" && (
              <PaymentActions
                appointmentId={row.id}
                paymentStatus={row.payment_status}
                onPaymentVerified={async () => {
                  await onPaymentVerified?.();
                  onClose?.();
                }}
                onCompleted={onClose}
              />
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontSize: "0.875rem",
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
