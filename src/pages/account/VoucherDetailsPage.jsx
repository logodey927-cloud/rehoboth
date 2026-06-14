import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, Tooltip, CircularProgress,
} from "@mui/material";
import {
  CalendarToday, LocalOffer, ReceiptLong,
  ContentCopy, Check, ArrowBack,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom";
import StyledButton from "../../components/common09/StyledButton";
import RecentBlogPostsWidget from "../../components/account/RecentBlogPostsWidget";
import VoucherQrCode from "../../components/vouchers/VoucherQrCode";
import VoucherTicketCard from "../../components/vouchers/VoucherTicketCard";
import BookingModal from "../../components/booking/BookingModal";
import { getMyVoucherById } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { profileCardSx, profileSectionTitleSx } from "../../components/profile/profileStyles";
import { formatDate, parseDateLabel } from "../../components/vouchers/voucherDisplayUtils";
import { copyToClipboard } from "../../utils/clipboard";

function MetaRow({ Icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {React.createElement(Icon, { sx: { fontSize: 15, color: "text.disabled" } })}
      </Box>
      <Box>
        <Typography fontSize="0.72rem" color="text.disabled" lineHeight={1.2} mb={0.2}>
          {label}
        </Typography>
        <Typography fontSize="0.9rem" color="text.primary" fontWeight={500} lineHeight={1.4}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function VoucherDetailsPage() {
  const { accessToken } = useUserAuth();
  const [copied, setCopied] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();

  useEffect(() => {
    if (!accessToken || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyVoucherById(accessToken, id)
      .then((res) => {
        if (res.data?.success) {
          setVoucher(res.data.voucher);
          setError("");
        } else {
          setError("Voucher not found.");
        }
      })
      .catch(() => setError("Failed to load voucher."))
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  const copyCode = () => {
    if (!voucher?.code) return;
    copyToClipboard(voucher.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!voucher || error) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary" mb={2}>{error || "Voucher not found."}</Typography>
        <StyledButton text="Back to Vouchers" to="/my-account/vouchers" variant="primary" />
      </Box>
    );
  }

  const dateInfo = parseDateLabel(voucher);

  return (
    <Box>
      {/* ── Back link ───────────────────────────────────────────────── */}
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Box
          component={RouterLink}
          to="/my-account/vouchers"
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            color: "secondary.main", textDecoration: "none",
            fontSize: "0.85rem", fontWeight: 600, mb: 1.25,
            "&:hover": { color: "secondary.dark" },
          }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Back to My Vouchers
        </Box>

        <Typography
          variant="h4" fontWeight={700} color="secondary.dark"
          sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" } }}
        >
          {voucher.vouchers?.title || "Voucher"}
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Main column ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          <Paper elevation={0} sx={{ ...profileCardSx, p: 0, overflow: "hidden" }}>
            {/* Hero ticket card */}
            <VoucherTicketCard variant="hero" voucher={voucher} />

            {/* ── Details section ─────────────────────────────────────── */}
            <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 1 }}>
              <Typography sx={{ ...profileSectionTitleSx, mb: 1.5 }}>Voucher Details</Typography>

              {/* Code row with copy button */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LocalOffer sx={{ fontSize: 15, color: "text.disabled" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize="0.72rem" color="text.disabled" lineHeight={1.2} mb={0.2}>
                    Voucher Code
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography
                      fontFamily="monospace"
                      fontWeight={700}
                      fontSize="1.1rem"
                      color="text.primary"
                      letterSpacing={1.5}
                    >
                      {voucher.code}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy code"} placement="top">
                      <Box
                        onClick={copyCode}
                        sx={{
                          display: "flex", alignItems: "center", cursor: "pointer",
                          color: copied ? "success.main" : "text.disabled",
                          "&:hover": { color: "secondary.main" },
                          transition: "color 0.15s",
                        }}
                      >
                        {copied ? <Check sx={{ fontSize: 18 }} /> : <ContentCopy sx={{ fontSize: 18 }} />}
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              <MetaRow Icon={CalendarToday} label={dateInfo.label} value={dateInfo.value} />
              <MetaRow
                Icon={ReceiptLong}
                label="Minimum Spend"
                value={voucher.minSpend || "No minimum"}
              />
            </Box>

            {/* ── Action buttons ──────────────────────────────────────── */}
            <Box
              sx={{
                px: { xs: 2, md: 3 }, py: 2.5,
                display: "flex", flexWrap: "wrap", gap: 1.5,
                borderTop: "1px solid", borderColor: "divider",
              }}
            >
              {voucher.status === "active" && (
                <>
                  <StyledButton
                    text="Book Appointment"
                    onClick={() => setBookingOpen(true)}
                    variant="primary"
                    sx={{ fontSize: "0.85rem", px: 3, py: 0.85, borderRadius: 0 }}
                  />
                  <StyledButton
                    text="Browse Vouchers"
                    to="/vouchers"
                    variant="muted"
                    sx={{ fontSize: "0.85rem", px: 3, py: 0.85, borderRadius: 0 }}
                  />
                </>
              )}
              {voucher.status === "used" && (
                <Typography variant="body2" color="text.disabled" sx={{ alignSelf: "center" }}>
                  This voucher was used on {formatDate(voucher.used_at)}.
                </Typography>
              )}
              {voucher.status === "expired" && (
                <Typography variant="body2" color="text.disabled" sx={{ alignSelf: "center" }}>
                  This voucher expired on {formatDate(voucher.expires_at)}.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Sidebar column ──────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper elevation={0} sx={{ ...profileCardSx, py: 3 }}>
              <VoucherQrCode code={voucher.code} size={180} />
            </Paper>
            <RecentBlogPostsWidget />
          </Box>
        </Grid>
      </Grid>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialStep={1}
        initialVoucherCode={voucher.code}
        title={`Book with Voucher: ${voucher.code}`}
      />
    </Box>
  );
}
