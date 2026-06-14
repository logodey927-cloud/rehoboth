import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Link,
  Alert,
  Button,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  CalendarToday,
  Email,
  Event,
  Pending as PendingIcon,
  CheckCircle,
  RateReview,
  Refresh,
  CalendarMonth,
  Block as BlockIcon,
  LocalOffer,
  Payment,
  NotificationsActive,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAppointments,
  getContactMessages,
  getSubscribers,
  getAllVouchersAdmin,
  getRecentVoucherIssuesAdmin,
  adminGetReviews,
  getAdminNotifications,
} from "../../api/api";
import ServiceDonutChart from "../components/ServiceDonutChart";
import MonthlyBookingsChart from "../components/MonthlyBookingsChart";
import SubscribersDonutChart from "../components/SubscribersDonutChart";
import StatCard from "../components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { getCached, setCached, invalidateCache } from "../utils/adminCache";

const DASHBOARD_CACHE_KEY = "dashboard";

function readDashboardCache() {
  return getCached(DASHBOARD_CACHE_KEY);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Appointments",   icon: CalendarToday, to: "/admin/appointments" },
  { label: "Calendar",       icon: CalendarMonth,  to: "/admin/calendar" },
  { label: "Blocked Slots",  icon: BlockIcon,      to: "/admin/blocked-time-slots" },
  { label: "New Voucher",    icon: LocalOffer,     to: "/admin/vouchers/new" },
  { label: "Payments",       icon: Payment,        to: "/admin/payments" },
  { label: "Pending Reviews",icon: RateReview,     to: "/admin/reviews?status=pending" },
];

// Consistent table-section Paper props — full height in paired grid rows
const CARD_PAPER_PROPS = {
  elevation: 0,
  sx: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
    },
  },
};

const DASHBOARD_TABLE_GRID_SX = { display: "flex", width: "100%", minWidth: 0 };

// 4 cards: one row on md+, 2×2 on mobile
const STAT_SIZE    = { xs: 6, sm: 6, md: 3 };
const STAT_ITEM_SX = { display: "flex", width: "100%", minWidth: 0 };

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const cachedOnMount = readDashboardCache();

  // ── Data state (hydrate from session cache when revisiting /admin) ──
  const [appointments,            setAppointments]            = useState(cachedOnMount?.appointments ?? []);
  const [messages,                setMessages]                = useState(cachedOnMount?.messages ?? []);
  const [subscribers,             setSubscribers]             = useState(cachedOnMount?.subscribers ?? []);
  const [vouchers,                setVouchers]                = useState(cachedOnMount?.vouchers ?? []);
  const [recentIssuances,         setRecentIssuances]         = useState(cachedOnMount?.recentIssuances ?? []);
  const [pendingReviewsCount,     setPendingReviewsCount]     = useState(cachedOnMount?.pendingReviewsCount ?? 0);
  const [unreadNotifCount,        setUnreadNotifCount]        = useState(cachedOnMount?.unreadNotifCount ?? 0);

  // ── UI state ──
  const [statsLoading, setStatsLoading] = useState(!cachedOnMount);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(Boolean(cachedOnMount));
  const [refreshing, setRefreshing] = useState(false);
  const [dataErrors,   setDataErrors]   = useState([]);

  const showPreloader = statsLoading && !hasLoadedOnce;

  const applyDashboardCache = (data) => {
    setAppointments(data.appointments ?? []);
    setMessages(data.messages ?? []);
    setSubscribers(data.subscribers ?? []);
    setVouchers(data.vouchers ?? []);
    setRecentIssuances(data.recentIssuances ?? []);
    setPendingReviewsCount(data.pendingReviewsCount ?? 0);
    setUnreadNotifCount(data.unreadNotifCount ?? 0);
  };

  const persistDashboardCache = (payload) => {
    setCached(DASHBOARD_CACHE_KEY, payload);
    setCached("appointments", payload.appointments ?? []);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (force = false) => {
    if (!force) {
      const cached = readDashboardCache();
      if (cached) {
        applyDashboardCache(cached);
        setHasLoadedOnce(true);
        setStatsLoading(false);
        return;
      }
    } else {
      invalidateCache(DASHBOARD_CACHE_KEY);
    }

    if (!hasLoadedOnce) setStatsLoading(true);
    if (force) setRefreshing(true);
    setDataErrors([]);

    const [
      appointmentsRes,
      messagesRes,
      subscribersRes,
      vouchersRes,
      issuancesRes,
      reviewsRes,
      notifRes,
    ] = await Promise.allSettled([
      getAppointments(),
      getContactMessages(),
      getSubscribers(),
      getAllVouchersAdmin(),
      getRecentVoucherIssuesAdmin(5),
      adminGetReviews({ status: "pending" }),
      getAdminNotifications({ limit: 10 }),
    ]);

    const errors = [];
    const payload = {
      appointments: [],
      messages: [],
      subscribers: [],
      vouchers: [],
      recentIssuances: [],
      pendingReviewsCount: 0,
      unreadNotifCount: 0,
    };

    if (appointmentsRes.status === "fulfilled" && appointmentsRes.value.data?.success) {
      payload.appointments = appointmentsRes.value.data.appointments || [];
    } else {
      errors.push("appointments");
    }

    if (messagesRes.status === "fulfilled" && messagesRes.value.data?.success) {
      payload.messages = messagesRes.value.data.messages || [];
    } else {
      errors.push("contact messages");
    }

    if (subscribersRes.status === "fulfilled" && subscribersRes.value.data?.success) {
      payload.subscribers = subscribersRes.value.data.subscribers || [];
    }

    if (vouchersRes.status === "fulfilled" && vouchersRes.value.data?.success) {
      payload.vouchers = vouchersRes.value.data.vouchers || [];
    }

    if (issuancesRes.status === "fulfilled" && issuancesRes.value.data?.success) {
      payload.recentIssuances = issuancesRes.value.data.issues || [];
    }

    if (reviewsRes.status === "fulfilled" && reviewsRes.value.data?.success) {
      payload.pendingReviewsCount = reviewsRes.value.data.reviews?.length ?? 0;
    }

    if (notifRes.status === "fulfilled") {
      payload.unreadNotifCount = notifRes.value.data?.unreadCount ?? 0;
    }

    applyDashboardCache(payload);
    persistDashboardCache(payload);

    if (errors.length > 0) setDataErrors(errors);
    setStatsLoading(false);
    setRefreshing(false);
    setHasLoadedOnce(true);
  };

  // ─── Derived stat card definitions ───────────────────────────────────────

  const topStats = useMemo(() => {
    const now        = new Date();
    const upcoming   = appointments.filter((a) => {
      const d = new Date(`${a.date}T${a.time || "00:00"}`);
      return d > now && a.status !== "CANCELLED" && a.status !== "COMPLETED";
    }).length;
    const pending    = appointments.filter((a) => a.payment_status?.toLowerCase() === "pending");
    const paid       = appointments.filter((a) => a.payment_status?.toLowerCase() === "paid");
    const pendingAmt = pending.reduce((s, a) => s + (parseFloat(a.payment_amount) || 0), 0);
    const paidAmt    = paid.reduce((s, a)    => s + (parseFloat(a.payment_amount) || 0), 0);

    return [
      {
        title: "Upcoming Appointments",
        value: upcoming.toString(),
        icon: Event,
        color: "#3b82f6",
        onClick: () => navigate("/admin/appointments"),
      },
      {
        title: "Pending Payments",
        value: pending.length.toString(),
        icon: PendingIcon,
        color: "#f58c00",
        renderChildren: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              £{pendingAmt.toFixed(2)}
            </Typography>
          </Box>
        ),
        onClick: () => navigate("/admin/payments"),
      },
      {
        title: "Verified Revenue",
        value: `£${paidAmt.toFixed(2)}`,
        icon: CheckCircle,
        color: "#4caf50",
        onClick: () => navigate("/admin/payments"),
      },
      {
        title: "Contact Messages",
        value: messages.length.toString(),
        icon: Email,
        color: "#84994f",
        onClick: () => navigate("/admin/contact-messages"),
      },
    ];
  }, [appointments, messages, navigate]);

  // ─── Derived table data ───────────────────────────────────────────────────

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => {
        const d = new Date(`${a.date}T${a.time || "00:00"}`);
        return d > now && a.status !== "CANCELLED" && a.status !== "COMPLETED";
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
      .slice(0, 5);
  }, [appointments]);

  const recentMessages = useMemo(() =>
    [...messages]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5),
  [messages]);

  const recentVouchers = useMemo(() =>
    [...vouchers]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5),
  [vouchers]);

  // ─── Needs-attention strip data ───────────────────────────────────────────

  const needsAttention = useMemo(() => {
    const items = [];
    if (unreadNotifCount > 0)
      items.push({ label: `${unreadNotifCount} unread notification${unreadNotifCount !== 1 ? "s" : ""}`, color: "#f58c00", to: null });
    if (pendingReviewsCount > 0)
      items.push({ label: `${pendingReviewsCount} pending review${pendingReviewsCount !== 1 ? "s" : ""}`, color: "#f9a825", to: "/admin/reviews?status=pending" });
    const pendingPay = appointments.filter((a) => a.payment_status?.toLowerCase() === "pending").length;
    if (pendingPay > 0)
      items.push({ label: `${pendingPay} pending payment${pendingPay !== 1 ? "s" : ""}`, color: "#e74c3c", to: "/admin/payments" });
    return items;
  }, [unreadNotifCount, pendingReviewsCount, appointments]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "—";
    const date = new Date(`${dateString}T${timeString || "00:00"}`);
    return date.toLocaleDateString("en-GB", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDiscount = (voucher) => {
    if (voucher.discount_type === "percent")      return `${voucher.discount_value}% OFF`;
    if (voucher.discount_type === "amount")       return `£${voucher.discount_value} OFF`;
    if (voucher.discount_type === "free_service") return "FREE SERVICE";
    return "SPECIAL OFFER";
  };

  const formatMoney = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? `£${n.toFixed(2)}` : "—";
  };

  // ─── Shared render helpers ────────────────────────────────────────────────

  const renderTableHeader = (title, linkLabel, linkTo) => (
    <Box
      sx={{
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "#f8f9fa",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.9375rem" }}>
        {title}
      </Typography>
      <Link
        component="button"
        variant="body2"
        onClick={() => navigate(linkTo)}
        sx={{ color: "secondary.main", textDecoration: "none", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
      >
        {linkLabel}
      </Link>
    </Box>
  );

  const renderLoadingRow = (colSpan) => (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
        <CircularProgress size={26} sx={{ color: "#84994f" }} />
      </TableCell>
    </TableRow>
  );


  const TH = ({ children }) => (
    <TableCell sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.75rem" }}>{children}</TableCell>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box>
      <HeroPageSection
        title="Dashboard"
        breadcrumb={[
          { label: "Home",  link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Dashboard" },
        ]}
        borderRadius={true}
      >
        {/* ── Toolbar ── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            startIcon={
              showPreloader || refreshing
                ? <CircularProgress size={14} color="inherit" />
                : <Refresh />
            }
            onClick={() => fetchDashboardData(true)}
            disabled={showPreloader || refreshing}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 500,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
            }}
          >
            {showPreloader ? "Loading…" : refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </Box>

        {/* ── Error alert ── */}
        {dataErrors.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 2, borderRadius: 1 }}
            onClose={() => setDataErrors([])}
          >
            Failed to load: {dataErrors.join(", ")}. Some figures may be incomplete.
          </Alert>
        )}

        {/* ── Top 5 stat cards ── */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%", mb: 3, alignItems: "stretch" }}>
          {topStats.map((card) => (
            <Grid size={STAT_SIZE} key={card.title} sx={STAT_ITEM_SX}>
              <StatCard {...card} loading={showPreloader}>
                {card.renderChildren?.()}
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* ── Quick actions ── */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: "#1a1f2e", fontSize: "0.8125rem" }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1}>
            {QUICK_ACTIONS.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={action.label}>
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<ActionIcon sx={{ fontSize: 16 }} />}
                    variant="outlined"
                    onClick={() => navigate(action.to)}
                    sx={{
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.8125rem",
                      borderColor: "divider",
                      color: "text.primary",
                      justifyContent: "flex-start",
                      "&:hover": { borderColor: "secondary.main", color: "secondary.main", backgroundColor: "#f58c0008" },
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </HeroPageSection>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Below-fold content                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 4 }}>

        {/* ── Needs attention strip ── */}
        {!showPreloader && needsAttention.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 3,
              borderRadius: 1,
              border: "1px solid #f58c0040",
              backgroundColor: "#fffaf2",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <NotificationsActive sx={{ fontSize: 16, color: "#f58c00" }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#f58c00", fontSize: "0.8125rem" }}>
                Needs Attention
              </Typography>
            </Box>
            {needsAttention.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                size="small"
                onClick={item.to ? () => navigate(item.to) : undefined}
                sx={{
                  backgroundColor: `${item.color}18`,
                  color: item.color,
                  fontWeight: 600,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  cursor: item.to ? "pointer" : "default",
                  border: `1px solid ${item.color}30`,
                  "&:hover": item.to ? { backgroundColor: `${item.color}28` } : {},
                }}
              />
            ))}
          </Paper>
        )}

        {/* ── Charts ── */}
        {(showPreloader || appointments.length > 0 || subscribers.length > 0) && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {(showPreloader || appointments.length > 0) && (
              <Grid size={{ xs: 12, md: 6 }}>
                {showPreloader
                  ? <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
                  : <MonthlyBookingsChart appointments={appointments} />}
              </Grid>
            )}
            {(showPreloader || appointments.length > 0) && (
              <Grid size={{ xs: 12, md: 6 }}>
                {showPreloader
                  ? <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
                  : <ServiceDonutChart appointments={appointments} />}
              </Grid>
            )}
            {(showPreloader || subscribers.length > 0) && (
              <Grid size={{ xs: 12, md: 6 }}>
                {showPreloader
                  ? <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
                  : <SubscribersDonutChart subscribers={subscribers} />}
              </Grid>
            )}
          </Grid>
        )}

        {/* ── Tables row 1: appointments + contact messages (equal height) ── */}
        {(showPreloader ||
          upcomingAppointments.length > 0 ||
          recentMessages.length > 0) && (
        <Grid container spacing={3} alignItems="stretch" sx={{ mb: 3 }}>

          {/* Top 5 Upcoming Appointments */}
          {(showPreloader || upcomingAppointments.length > 0) && (
          <Grid size={{ xs: 12, md: 6 }} sx={DASHBOARD_TABLE_GRID_SX}>
            <Paper {...CARD_PAPER_PROPS}>
              {renderTableHeader("Top 5 Upcoming Appointments", "View All", "/admin/appointments")}
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TH>Name</TH>
                      <TH>Service</TH>
                      <TH>Date & Time</TH>
                      <TH>Status</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showPreloader
                      ? renderLoadingRow(4)
                      : upcomingAppointments.map((apt) => (
                          <TableRow
                            key={apt.id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate("/admin/appointments")}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1a1f2e", fontSize: "0.8125rem" }}>
                                {apt.full_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={apt.service}
                                size="small"
                                sx={{ backgroundColor: "#f58c0015", color: "#f58c00", fontWeight: 500, borderRadius: 1, fontSize: "0.6875rem", height: 20 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                                {formatDateTime(apt.date, apt.time)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={apt.status}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    apt.status === "CONFIRMED" ? "#10b98115"
                                    : apt.status === "PENDING"  ? "#f59e0b15"
                                    : "#6b728015",
                                  color:
                                    apt.status === "CONFIRMED" ? "#10b981"
                                    : apt.status === "PENDING"  ? "#f59e0b"
                                    : "#6b7280",
                                  fontWeight: 500, borderRadius: 1, fontSize: "0.6875rem", height: 20,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          )}

          {/* Recent Contact Messages */}
          {(showPreloader || recentMessages.length > 0) && (
          <Grid size={{ xs: 12, md: 6 }} sx={DASHBOARD_TABLE_GRID_SX}>
            <Paper {...CARD_PAPER_PROPS}>
              {renderTableHeader("Recent Contact Messages", "View All", "/admin/contact-messages")}
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TH>Name</TH>
                      <TH>Email</TH>
                      <TH>Message</TH>
                      <TH>Date</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showPreloader
                      ? renderLoadingRow(4)
                      : recentMessages.map((msg) => (
                          <TableRow
                            key={msg.id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate("/admin/contact-messages")}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1a1f2e", fontSize: "0.8125rem" }}>
                                {`${msg.first_name || ""} ${msg.last_name || ""}`.trim() || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#4b5563" }}>
                                {msg.email}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 160 }}>
                              <Typography
                                variant="body2"
                                title={msg.message}
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "#4b5563",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 160,
                                }}
                              >
                                {msg.message || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#4b5563", whiteSpace: "nowrap" }}>
                                {msg.created_at
                                  ? new Date(msg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                                  : "—"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          )}

        </Grid>
        )}

        {/* ── Tables row 2: vouchers + issuances (equal height) ── */}
        {(showPreloader || recentVouchers.length > 0 || recentIssuances.length > 0) && (
        <Grid container spacing={3} alignItems="stretch">

          {/* Top 5 Recently Added Vouchers */}
          {(showPreloader || recentVouchers.length > 0) && (
          <Grid size={{ xs: 12, md: 6 }} sx={DASHBOARD_TABLE_GRID_SX}>
            <Paper {...CARD_PAPER_PROPS}>
              {renderTableHeader("Top 5 Recently Added Vouchers", "View All", "/admin/vouchers")}
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TH>Title</TH>
                      <TH>Discount</TH>
                      <TH>Type</TH>
                      <TH>Status</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showPreloader
                      ? renderLoadingRow(4)
                      : recentVouchers.map((voucher) => (
                          <TableRow
                            key={voucher.id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate("/admin/vouchers")}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1a1f2e", fontSize: "0.8125rem" }}>
                                {voucher.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: "#84994f", fontWeight: 600, fontSize: "0.8125rem" }}>
                                {formatDiscount(voucher)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={voucher.voucher_type === "promo" ? "Promo" : "Gift"}
                                size="small"
                                sx={{
                                  backgroundColor: voucher.voucher_type === "promo" ? "#3b82f615" : "#f58c0015",
                                  color:           voucher.voucher_type === "promo" ? "#3b82f6"   : "#f58c00",
                                  fontWeight: 500, borderRadius: 1, fontSize: "0.6875rem", height: 20,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={voucher.status}
                                size="small"
                                sx={{
                                  backgroundColor: voucher.status === "active" ? "#10b98115" : "#6b728015",
                                  color:           voucher.status === "active" ? "#10b981"   : "#6b7280",
                                  fontWeight: 500, borderRadius: 1, fontSize: "0.6875rem", height: 20,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          )}

          {/* Top 5 Recent Voucher Issuances */}
          {(showPreloader || recentIssuances.length > 0) && (
          <Grid size={{ xs: 12, md: 6 }} sx={DASHBOARD_TABLE_GRID_SX}>
            <Paper {...CARD_PAPER_PROPS}>
              {renderTableHeader("Top 5 Recent Voucher Issuances", "View Vouchers", "/admin/vouchers")}
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TH>Issued</TH>
                      <TH>Voucher</TH>
                      <TH>Customer</TH>
                      <TH>Payment</TH>
                      <TH>Amount</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showPreloader
                      ? renderLoadingRow(5)
                      : recentIssuances.map((iss) => (
                          <TableRow
                            key={iss.id}
                            hover
                            sx={{ cursor: iss.voucher_id ? "pointer" : "default" }}
                            onClick={() =>
                              iss.voucher_id
                                ? navigate(`/admin/vouchers/${iss.voucher_id}?tab=history`)
                                : null
                            }
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#4b5563", whiteSpace: "nowrap" }}>
                                {formatDateTime(iss.issued_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.8125rem" }}>
                                {iss.voucher_title || "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
                                {String(iss.voucher_type || "—")}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1a1f2e", fontSize: "0.8125rem" }}>
                                {iss.client_name || "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
                                {iss.client_email || ""}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={String(iss.payment_status || "—")}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    iss.payment_status === "paid"    ? "#10b98115"
                                    : iss.payment_status === "pending" ? "#f59e0b15"
                                    : "#6b728015",
                                  color:
                                    iss.payment_status === "paid"    ? "#10b981"
                                    : iss.payment_status === "pending" ? "#f59e0b"
                                    : "#6b7280",
                                  fontWeight: 500,
                                  borderRadius: 1,
                                  textTransform: "capitalize",
                                  fontSize: "0.6875rem",
                                  height: 20,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1f2e", fontSize: "0.8125rem" }}>
                                {formatMoney(iss.payment_amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          )}

        </Grid>
        )}
      </Box>
    </Box>
  );
}
