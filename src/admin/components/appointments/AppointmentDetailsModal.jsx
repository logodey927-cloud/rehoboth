import React, { useEffect, useState } from "react";
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
  Tooltip,
  Rating,
} from "@mui/material";
import {
  Close as CloseIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Spa as SpaIcon,
  Payment as PaymentIcon,
  LocalOffer as VoucherIcon,
  Notes as NotesIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";
import { adminGetReviews } from "../../../api/api";
import StatusActions from "./StatusActions";
import CompletionActions from "../../../components/appointments/CompletionActions";
import PaymentActions from "../payments/PaymentActions";
import { resolveUserAvatarUrl } from "../../../utils/userAvatar";

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
  "&:hover": {
    borderColor: BRAND.greenDark,
    bgcolor: BRAND.greenMuted,
  },
};

const STATUS_COLORS = {
  pending: { bg: "#f58c0015", color: "#f58c00" },
  confirmed: { bg: "#2196f315", color: "#2196f3" },
  in_process: { bg: "#9c27b015", color: "#9c27b0" },
  client_completed: { bg: "#ff980015", color: "#ff9800" },
  completed: { bg: "#4caf5015", color: "#4caf50" },
  rejected: { bg: "#f4433615", color: "#f44336" },
  cancelled: { bg: "#9e9e9e15", color: "#9e9e9e" },
};

const STATUS_LABEL_MAP = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_process: "In Process",
  client_completed: "Client Completed",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
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
  if (value === "bank_transfer") return "Bank Transfer";
  if (value === "voucher_prepaid") return "Prepaid Voucher";
  if (value === "voucher") return "Voucher";
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function StatusChip({ status }) {
  const s = (status || "pending").toLowerCase();
  const colors = STATUS_COLORS[s] || { bg: "#e0e0e015", color: "#757575" };
  const label = STATUS_LABEL_MAP[s] || s;
  return (
    <Chip
      label={label}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 600, borderRadius: 0 }}
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

function PaymentHeaderChip({ status }) {
  if (!status) return null;
  const s = status.toLowerCase();
  const labels = {
    pending: "Payment pending",
    paid: "Paid",
    failed: "Payment failed",
    refunded: "Refunded",
  };
  const colors = {
    pending: { bg: "#f58c0018", color: BRAND.orange },
    paid: { bg: "#4caf5018", color: "#4caf50" },
    failed: { bg: "#f4433618", color: "#f44336" },
    refunded: { bg: "#9e9e9e18", color: "#757575" },
  };
  const c = colors[s] || colors.pending;
  return (
    <Chip
      label={labels[s] || status}
      size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600, borderRadius: 0 }}
    />
  );
}

const REVIEW_STATUS_COLORS = {
  pending:  { bg: "#fff8e1", color: "#d97706" },
  approved: { bg: "#ecfdf5", color: "#059669" },
  rejected: { bg: "#fef2f2", color: "#dc3545" },
};

export default function AppointmentDetailsModal({
  open,
  onClose,
  appointment: row,
  onRefresh,
  onReassign,
  onEmail,
  onPaymentDetails,
  onVoucherDetails,
}) {
  const [linkedReview, setLinkedReview] = useState(null);

  useEffect(() => {
    if (!open || !row?.id) return;
    setLinkedReview(null);
    adminGetReviews({ has_appointment: "true" })
      .then((res) => {
        const match = (res.data?.reviews || []).find((r) => r.appointment_id === row.id);
        setLinkedReview(match || false);
      })
      .catch(() => setLinkedReview(false));
  }, [open, row?.id]);

  if (!row) return null;

  const servicePrice = parseFloat(row.service_price || 0);
  const discount = parseFloat(row.voucher_discount_amount || 0);
  const total = parseFloat(row.payment_amount || 0);
  const hasPayment = servicePrice > 0 || total > 0 || row.payment_status;
  const voucher = row.voucher || {};
  const hasVoucher = Boolean(voucher.code || row.voucher_code);
  const teamLabel = row.team_member?.title || (row.team_member_id ? "Assigned" : null);

  const formatVoucherDiscount = () => {
    if (voucher.discount_type === "percent") return `${voucher.discount_value}% off`;
    if (voucher.discount_type === "amount") return `£${voucher.discount_value} off`;
    if (voucher.discount_type === "free_service") return "Free service";
    return "Special offer";
  };

  const apptStatus = (row.status || "pending").toLowerCase();
  const payStatus = row.payment_status?.toLowerCase();
  const showPaymentInHeader =
    payStatus && !(apptStatus === "pending" && payStatus === "pending");

  const customerAvatarSrc = resolveUserAvatarUrl({
    id: row.user_id || row.email || row.id,
    avatar_url: row.avatar_url,
    gender: row.user_gender || row.client_gender,
  });

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
      {/* Header */}
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
            src={customerAvatarSrc}
            alt={row.full_name || "Customer"}
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 1,
              bgcolor: "secondary.main",
              flexShrink: 0,
            }}
          >
            <SpaIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>
              Appointment
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.25 }}>
              {row.full_name || "Guest booking"}
            </Typography>
            {row.email && (
              <Typography
                component="a"
                href={`mailto:${row.email}`}
                variant="body2"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  display: "block",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {row.email}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              <StatusChip status={row.status} />
              {showPaymentInHeader && <PaymentHeaderChip status={row.payment_status} />}
              {row.service && (
                <Chip
                  label={row.service}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 0,
                    maxWidth: 220,
                    border: "1px solid rgba(255,255,255,0.35)",
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Quick summary strip */}
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
            { label: "Appt. Date", value: row.date ? formatDate(row.date) : "—" },
            { label: "Time", value: row.time || "—" },
            { label: "Duration", value: row.duration || "—" },
            { label: "Total", value: hasPayment ? formatCurrency(total) : "—" },
          ].map((item) => (
            <Box key={item.label} sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", display: "block" }}>
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#fff", fontSize: "0.8125rem" }}
                noWrap={item.label !== "Date"}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f4f5f7" }}>
        <Grid container spacing={2}>
          {/* Customer */}
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
                        "&:hover": { textDecoration: "underline", color: BRAND.green },
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
                label="Gender"
                value={row.client_gender ? row.client_gender.charAt(0).toUpperCase() + row.client_gender.slice(1) : "—"}
              />
              <DetailField
                styled
                label="Account"
                children={
                  row.user_id ? (
                    <RouterLink to="/admin/users" style={{ textDecoration: "none" }}>
                      <Chip
                        icon={<PersonIcon sx={{ fontSize: "0.9rem !important" }} />}
                        label="Registered user"
                        size="small"
                        clickable
                        sx={{ backgroundColor: BRAND.greenMuted, color: BRAND.greenDark, fontWeight: 700, borderRadius: 0 }}
                      />
                    </RouterLink>
                  ) : (
                    <Chip
                      label="Guest"
                      size="small"
                      sx={{ bgcolor: "#9e9e9e15", color: "#757575", fontWeight: 700, borderRadius: 0 }}
                    />
                  )
                }
              />
            </SectionCard>
          </Grid>

          {/* Schedule & service */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Booking" icon={ScheduleIcon}>
              <DetailField
                styled
                label="Appointment date"
                value={row.date ? formatDate(row.date) : "—"}
                fullWidth
              />
              <DetailField styled label="Time slot" value={row.time} />
              <DetailField styled label="Duration" value={row.duration} />
              <DetailField
                styled
                label="Team member"
                children={
                  teamLabel ? (
                    <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
                      {teamLabel}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: "italic", color: "text.secondary" }}>
                      Not assigned
                    </Typography>
                  )
                }
              />
              <DetailField styled label="Status" children={<StatusChip status={row.status} />} />
              <DetailField styled label="Treatment" value={row.treatment || "—"} />
              {row.image_url && (
                <DetailField label="Service image" fullWidth>
                  <Box
                    component="img"
                    src={row.image_url}
                    alt={row.service}
                    sx={{
                      width: "100%",
                      maxHeight: 120,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </DetailField>
              )}
            </SectionCard>
          </Grid>

          {/* Payment */}
          {hasPayment && (
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
                      {row.payment_status && <PaymentHeaderChip status={row.payment_status} />}
                    </Box>
                    {servicePrice > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Service price
                        </Typography>
                        <Typography variant="body2">{formatCurrency(servicePrice)}</Typography>
                      </Box>
                    )}
                    {discount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Voucher discount
                        </Typography>
                        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>
                          −{formatCurrency(discount)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Total paid
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "secondary.dark" }}>
                        {formatCurrency(total)}
                      </Typography>
                    </Box>
                    {row.payment_status === "pending" && row.payment_screenshot_url && onPaymentDetails && (
                      <Button
                        size="small"
                        startIcon={<PaymentIcon />}
                        onClick={() => onPaymentDetails(row)}
                        sx={{ mt: 1.5, borderRadius: 0, textTransform: "none" }}
                      >
                        View payment proof
                      </Button>
                    )}
                  </Paper>
                </Box>
                <DetailField label="Payment method" value={formatPaymentMethod(row.payment_method)} />
                <DetailField label="Payer name" value={row.payment_name} />
                <DetailField
                  label="Transaction ID"
                  children={
                    row.payment_transaction_id ? (
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all" }}>
                        {row.payment_transaction_id}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )
                  }
                />
                <DetailField label="Payment date" value={formatDateTime(row.payment_date)} />
                <DetailField label="Verified at" value={formatDateTime(row.payment_verified_at)} />
              </SectionCard>
            </Grid>
          )}

          {/* Voucher */}
          {hasVoucher && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Voucher" icon={VoucherIcon}>
                <DetailField
                  label="Code"
                  children={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={voucher.code || row.voucher_code}
                        size="small"
                        sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
                      />
                      {voucher.discount_value != null && (
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          {formatVoucherDiscount()}
                        </Typography>
                      )}
                      {voucher.code && onVoucherDetails && (
                        <Tooltip title="View voucher details">
                          <IconButton size="small" onClick={() => onVoucherDetails(voucher)}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                  fullWidth
                />
              </SectionCard>
            </Grid>
          )}

          {/* Notes */}
          {row.note && (
            <Grid size={{ xs: 12, md: hasVoucher ? 6 : 12 }}>
              <SectionCard title="Notes" icon={NotesIcon}>
                <DetailField label="Customer note" fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1a1f2e",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      bgcolor: "#fafafa",
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {row.note}
                  </Typography>
                </DetailField>
              </SectionCard>
            </Grid>
          )}

          {/* Customer review */}
          {linkedReview && (
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "#fff",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, pb: 1.25, borderBottom: "1px solid", borderColor: BRAND.greenMuted }}>
                  <Box sx={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: BRAND.green, color: "#fff", borderRadius: 0, flexShrink: 0 }}>
                    <ReviewIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark, letterSpacing: 0.3, flex: 1 }}>
                    Customer Review
                  </Typography>
                  <Chip
                    label={linkedReview.status.charAt(0).toUpperCase() + linkedReview.status.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: REVIEW_STATUS_COLORS[linkedReview.status]?.bg || "#f5f5f5",
                      color: REVIEW_STATUS_COLORS[linkedReview.status]?.color || "#555",
                      fontWeight: 600,
                      borderRadius: 0,
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Rating
                    value={linkedReview.rating}
                    readOnly
                    size="small"
                    sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    by {linkedReview.display_name}
                    {linkedReview.edited_by_admin && " · edited by admin"}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1a1f2e",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    bgcolor: "#fafafa",
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {linkedReview.comment}
                </Typography>
                <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <RouterLink to="/admin/reviews" style={{ textDecoration: "none" }}>
                    <Chip
                      label="Manage in Reviews"
                      size="small"
                      clickable
                      sx={{ bgcolor: BRAND.greenMuted, color: BRAND.greenDark, fontWeight: 600, borderRadius: 0 }}
                    />
                  </RouterLink>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Record meta */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                px: 0.5,
                py: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Booked on {formatDateTime(row.created_at)}
                </Typography>
              </Box>
              {row.id && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  ID: {row.id}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Actions */}
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
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: BRAND.orange,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
              Admin actions
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: { xs: "nowrap", sm: "wrap" },
              gap: 1,
              alignItems: "stretch",
              "& .MuiButton-root": {
                ...ACTION_BTN_SX,
                width: { xs: "100%", sm: "auto" },
                bgcolor: "#fff",
              },
              "& .MuiChip-root": {
                borderRadius: 0,
                fontWeight: 600,
                height: 36,
                width: { xs: "100%", sm: "auto" },
                justifyContent: "center",
                maxWidth: { xs: "100%", sm: 280 },
              },
            }}
          >
            <Box sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, display: "flex", width: { xs: "100%", sm: "auto" } }}>
              <StatusActions
                appointmentId={row.id}
                currentStatus={row.status || "pending"}
                onStatusUpdate={onRefresh}
                onClose={onClose}
              />
            </Box>
            {row.status === "client_completed" && (
              <Box sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, display: "flex", "& .MuiButton-root": { width: "100%" } }}>
                <CompletionActions
                  appointmentId={row.id}
                  appointment={row}
                  onActionComplete={onRefresh}
                  onClose={onClose}
                />
              </Box>
            )}
            {row.payment_status === "pending" && (
              <Box sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, display: "flex", alignItems: "center" }}>
                <PaymentActions
                  appointmentId={row.id}
                  paymentStatus={row.payment_status}
                  onPaymentVerified={async () => {
                    await onRefresh?.();
                    onClose?.();
                  }}
                />
              </Box>
            )}
            {onReassign && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => onReassign(row)}
                sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, ...ACTION_BTN_SX, bgcolor: "#fff" }}
              >
                {row.team_member_id ? "Reassign team member" : "Assign team member"}
              </Button>
            )}
            {row.email && onEmail && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EmailIcon />}
                onClick={() => onEmail(row)}
                sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, ...ACTION_BTN_SX, bgcolor: "#fff" }}
              >
                Email customer
              </Button>
            )}
            {row.phone && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PhoneIcon />}
                component="a"
                href={`tel:${row.phone}`}
                sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, ...ACTION_BTN_SX, bgcolor: "#fff" }}
              >
                Call
              </Button>
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
