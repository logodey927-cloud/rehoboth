import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Button,
  Divider,
  alpha,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorOutlineIcon,
  Spa as SpaIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { getAppointments, getRecentVoucherIssuesAdmin } from "../../api/api";
import { getCached, setCached, invalidateCache } from "../utils/adminCache";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";
import PaymentDetailsModal, { PaymentStatusChip } from "../components/payments/PaymentDetailsModal";
import StatCard from "../components/StatCard";
import VoucherIssuesTable from "../components/vouchers/VoucherIssuesTable";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState(0); // 0: appointment payments, 1: voucher purchases
  const [appointments, setAppointments] = useState(() => getCached("appointments") || []);
  const [loading, setLoading] = useState(() => !getCached("appointments"));
  const [hasLoadedOnce, setHasLoadedOnce] = useState(() => Boolean(getCached("appointments")));
  const [error, setError] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [voucherIssues, setVoucherIssues] = useState(() => getCached("voucherIssues") || []);
  const [voucherIssuesLoading, setVoucherIssuesLoading] = useState(() => !getCached("voucherIssues"));
  const [voucherIssuesError, setVoucherIssuesError] = useState(null);
  const [voucherPaymentStatusFilter, setVoucherPaymentStatusFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
    fetchVoucherPayments();
  }, []);

  const fetchAppointments = async (force = false) => {
    if (!force) {
      const cached = getCached("appointments");
      if (cached) {
        setHasLoadedOnce(true);
        setLoading(false);
        return;
      }
    } else {
      invalidateCache("appointments");
    }
    try {
      setLoading(true);
      const res = await getAppointments();
      if (res.data?.success) {
        const data = res.data.appointments || [];
        setAppointments(data);
        setCached("appointments", data);
        setHasLoadedOnce(true);
      } else {
        setError("Failed to load payments");
      }
    } catch {
      setError("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherPayments = async (force = false) => {
    if (!force) {
      const cached = getCached("voucherIssues");
      if (cached) {
        return; // already populated from useState initializer
      }
    } else {
      invalidateCache("voucherIssues");
    }
    try {
      setVoucherIssuesLoading(true);
      setVoucherIssuesError(null);
      const res = await getRecentVoucherIssuesAdmin(500);
      if (res.data?.success) {
        const data = res.data.issues || [];
        setVoucherIssues(data);
        setCached("voucherIssues", data);
      } else {
        setVoucherIssuesError("Failed to load voucher payments");
      }
    } catch {
      setVoucherIssuesError("Failed to load voucher payments. Please try again.");
    } finally {
      setVoucherIssuesLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter appointments by payment status and only show those with payment info
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter((apt) => apt.payment_status);
    if (paymentStatusFilter) {
      filtered = filtered.filter(
        (apt) => (apt.payment_status || "").toLowerCase().trim() === paymentStatusFilter
      );
    }
    if (paymentMethodFilter) {
      filtered = filtered.filter(
        (apt) => (apt.payment_method || "").toLowerCase() === paymentMethodFilter
      );
    }
    return filtered;
  }, [appointments, paymentStatusFilter, paymentMethodFilter]);

  // Calculate statistics for appointment payments
  const stats = useMemo(() => {
    const total = appointments.filter((apt) => apt.payment_status).length;
    // Use case-insensitive comparison for robustness
    const pending = appointments.filter((apt) => 
      apt.payment_status && apt.payment_status.toLowerCase().trim() === "pending"
    ).length;
    const paid = appointments.filter((apt) => 
      apt.payment_status && apt.payment_status.toLowerCase().trim() === "paid"
    ).length;
    const refunded = appointments.filter((apt) =>
      apt.payment_status && apt.payment_status.toLowerCase().trim() === "refunded"
    ).length;
    const failed = appointments.filter((apt) =>
      apt.payment_status && apt.payment_status.toLowerCase().trim() === "failed"
    ).length;

    const totalAmount = appointments
      .filter((apt) => apt.payment_status && apt.payment_status.toLowerCase().trim() === "paid")
      .reduce((sum, apt) => sum + (parseFloat(apt.payment_amount) || 0), 0);
    
    const pendingAmount = appointments
      .filter((apt) => apt.payment_status && apt.payment_status.toLowerCase().trim() === "pending")
      .reduce((sum, apt) => sum + (parseFloat(apt.payment_amount) || 0), 0);

    return {
      total,
      pending,
      paid,
      refunded,
      failed,
      totalAmount: totalAmount.toFixed(2),
      pendingAmount: pendingAmount.toFixed(2),
    };
  }, [appointments]);

  // Calculate statistics for voucher purchases
  const voucherStats = useMemo(() => {
    // Only count voucher issues that have payment information (purchased vouchers)
    const withPayment = voucherIssues.filter((issue) => issue.payment_status && issue.payment_amount);
    const total = withPayment.length;
    
    // Use case-insensitive comparison for robustness
    const pending = withPayment.filter((issue) => 
      issue.payment_status && issue.payment_status.toLowerCase().trim() === "pending"
    ).length;
    const paid = withPayment.filter((issue) => 
      issue.payment_status && issue.payment_status.toLowerCase().trim() === "paid"
    ).length;
    const refunded = withPayment.filter((issue) => 
      issue.payment_status && issue.payment_status.toLowerCase().trim() === "refunded"
    ).length;
    const failed = withPayment.filter((issue) => 
      issue.payment_status && issue.payment_status.toLowerCase().trim() === "failed"
    ).length;
    
    const totalAmount = withPayment
      .filter((issue) => issue.payment_status && issue.payment_status.toLowerCase().trim() === "paid")
      .reduce((sum, issue) => sum + (parseFloat(issue.payment_amount) || 0), 0);
    
    const pendingAmount = withPayment
      .filter((issue) => issue.payment_status && issue.payment_status.toLowerCase().trim() === "pending")
      .reduce((sum, issue) => sum + (parseFloat(issue.payment_amount) || 0), 0);

    return {
      total,
      pending,
      paid,
      refunded,
      failed,
      totalAmount: totalAmount.toFixed(2),
      pendingAmount: pendingAmount.toFixed(2),
    };
  }, [voucherIssues]);

  const renderCustomerCell = (_, row) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, py: 0.5 }}>
      <Avatar
        src={row.image_url || undefined}
        alt={row.service || "Service"}
        variant="rounded"
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          bgcolor: "secondary.light",
          flexShrink: 0,
        }}
      >
        {!row.image_url && <SpaIcon sx={{ color: "secondary.main", fontSize: 22 }} />}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.8125rem", lineHeight: 1.3 }}
          noWrap
        >
          {row.full_name || "—"}
        </Typography>
        {row.email ? (
          <Typography
            component="a"
            href={`mailto:${row.email}`}
            variant="caption"
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: "block",
              color: "text.secondary",
              textDecoration: "none",
              fontSize: "0.75rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
              "&:hover": { color: "secondary.dark", textDecoration: "underline" },
            }}
          >
            {row.email}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            —
          </Typography>
        )}
      </Box>
    </Box>
  );

  // All columns including hidden ones (for details view)
  const allColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "full_name",
      label: "Customer",
      render: renderCustomerCell,
    },
    {
      id: "service",
      label: "Service",
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{ backgroundColor: "#f58c0015", color: "#f58c00", fontWeight: 500, borderRadius: 0 }}
        />
      ),
    },
    {
      id: "date",
      label: "Date",
      type: "date",
    },
    {
      id: "time",
      label: "Time",
    },
    {
      id: "payment_amount",
      label: "Amount",
      width: 120,
      render: (value, row) => {
        const amount = parseFloat(value) || 0;
        const discount = parseFloat(row.voucher_discount_amount) || 0;
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              £{amount.toFixed(2)}
            </Typography>
            {discount > 0 && (
              <Typography variant="caption" sx={{ color: "success.main" }}>
                -£{discount.toFixed(2)} voucher
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: "payment_status",
      label: "Status",
      width: 140,
      render: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <PaymentStatusChip status={value} />
          {value === "pending" && row.payment_screenshot_url && (
            <Tooltip title="Payment proof available">
              <PaymentIcon fontSize="small" sx={{ color: "#f58c00", opacity: 0.8 }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      id: "email",
      label: "Email",
    },
    {
      id: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      id: "note",
      label: "Note",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "payment_transaction_id",
      label: "Reference",
      width: 150,
      render: (value) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "payment_date",
      label: "Payment Date",
      type: "date",
      render: (value) => {
        if (!value) return <Typography variant="body2">-</Typography>;
        return (
          <Typography variant="body2">
            {new Date(value).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        );
      },
    },
    {
      id: "voucher_code",
      label: "Voucher",
      width: 180,
      render: (value, row) => {
        if (!row.voucher && !value) return <Typography variant="body2">-</Typography>;
        
        const voucher = row.voucher || {};
        const formatDiscount = () => {
          if (voucher.discount_type === "percent") {
            return `${voucher.discount_value}% OFF`;
          } else if (voucher.discount_type === "amount") {
            return `£${voucher.discount_value} OFF`;
          } else if (voucher.discount_type === "free_service") {
            return "FREE SERVICE";
          }
          return "Special Offer";
        };

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={voucher.code || value || "-"}
              size="small"
              sx={{
                backgroundColor: "#84994f15",
                color: "secondary.dark",
                fontWeight: 500,
                borderRadius: 0,
              }}
            />
            {voucher.discount_value && (
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                ({formatDiscount()})
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: "payment_method",
      label: "Payment Method",
      render: (value) => {
        const map = { stripe: "Stripe", bank_transfer: "Bank Transfer", voucher_prepaid: "Prepaid Voucher", voucher: "Voucher" };
        return <Typography variant="body2">{map[value] || value || "-"}</Typography>;
      },
    },
    {
      id: "service_price",
      label: "Service Price",
      render: (value) => (
        <Typography variant="body2">{value ? `£${parseFloat(value).toFixed(2)}` : "-"}</Typography>
      ),
    },
    {
      id: "payment_currency",
      label: "Currency",
      render: (value) => <Typography variant="body2">{(value || "GBP").toUpperCase()}</Typography>,
    },
    {
      id: "stripe_checkout_session_id",
      label: "Stripe Session ID",
      render: (value) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.72rem", wordBreak: "break-all" }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "stripe_payment_intent_id",
      label: "Stripe Payment Intent",
      render: (value) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.72rem", wordBreak: "break-all" }}>
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "payment_verified_at",
      label: "Verified At",
      render: (value) => (
        <Typography variant="body2" sx={{ color: value ? "success.main" : "text.secondary" }}>
          {formatDateTime(value)}
        </Typography>
      ),
    },
    {
      id: "user_id",
      label: "Account",
      render: (value) =>
        value ? (
          <RouterLink
            to={`/admin/appointments?user=${value}`}
            style={{ color: "inherit", textDecoration: "underline", fontSize: "0.8rem" }}
          >
            Registered
          </RouterLink>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Guest</Typography>
        ),
    },
    {
      id: "created_at",
      label: "Booked At",
      render: (value) => <Typography variant="body2">{formatDateTime(value)}</Typography>,
    },
  ];

  // Essential columns to display in main table (visible columns)
  const essentialColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "full_name",
      label: "Customer",
      render: renderCustomerCell,
    },
    {
      id: "service",
      label: "Service",
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{ backgroundColor: "#f58c0015", color: "#f58c00", fontWeight: 500, borderRadius: 0 }}
        />
      ),
    },
    {
      id: "date",
      label: "Date",
      type: "date",
    },
    {
      id: "time",
      label: "Time",
    },
    {
      id: "payment_amount",
      label: "Amount",
      width: 120,
      render: (value, row) => {
        const amount = parseFloat(value) || 0;
        const discount = parseFloat(row.voucher_discount_amount) || 0;
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              £{amount.toFixed(2)}
            </Typography>
            {discount > 0 && (
              <Typography variant="caption" sx={{ color: "success.main" }}>
                -£{discount.toFixed(2)} voucher
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: "payment_status",
      label: "Status",
      width: 140,
      render: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <PaymentStatusChip status={value} />
          {value === "pending" && row.payment_screenshot_url && (
            <Tooltip title="Payment proof available">
              <PaymentIcon fontSize="small" sx={{ color: "#f58c00", opacity: 0.8 }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      id: "payment_method",
      label: "Method",
      width: 120,
      render: (value) => {
        const map = { stripe: "Stripe", bank_transfer: "Bank Transfer", voucher_prepaid: "Prepaid Voucher", voucher: "Voucher" };
        return <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>{map[value] || value || "-"}</Typography>;
      },
    },
  ];

  const renderDetails = (row, onClose, isOpen) => (
    <PaymentDetailsModal
      open={isOpen}
      onClose={onClose}
      appointment={row}
      onPaymentVerified={() => fetchAppointments(true)}
    />
  );

  const showPreloader = loading && !hasLoadedOnce;

  if (showPreloader) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <HeroPageSection
        title="Payment Management"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Payments" },
        ]}
        borderRadius={true}
      >
        {/* Stats Cards Container (appointment payments only) */}
        {activeTab === 0 && (
          <Box>
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{
                width: "100%",
                mx: "auto",
              }}
            >
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                width: "100%",
                minWidth: 0,
              }}
            >
              <StatCard
                title="Total Payments"
                value={stats.total.toString()}
                icon={AttachMoneyIcon}
                color="#84994f"
                loading={loading && appointments.length === 0}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                width: "100%",
                minWidth: 0,
              }}
            >
              <StatCard
                title="Pending Verification"
                value={stats.pending.toString()}
                icon={PendingIcon}
                color="#f58c00"
                loading={loading && appointments.length === 0}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    £{stats.pendingAmount}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                width: "100%",
                minWidth: 0,
              }}
            >
              <StatCard
                title="Verified Payments"
                value={stats.paid.toString()}
                icon={CheckCircleIcon}
                color="#4caf50"
                loading={loading && appointments.length === 0}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: "success.main" }} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    £{stats.totalAmount}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: "flex", width: "100%", minWidth: 0 }}
            >
              <StatCard
                title="Refunded"
                value={stats.refunded.toString()}
                icon={CancelIcon}
                color="#f44336"
                loading={loading && appointments.length === 0}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: "flex", width: "100%", minWidth: 0 }}
            >
              <StatCard
                title="Failed"
                value={stats.failed.toString()}
                icon={ErrorOutlineIcon}
                color="#e53935"
                loading={loading && appointments.length === 0}
              />
            </Grid>
            </Grid>
          </Box>
        )}

        {/* Stats Cards Container (voucher purchases only) */}
        {activeTab === 1 && (
          <Box>
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{
                width: "100%",
                mx: "auto",
              }}
            >
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                width: "100%",
                minWidth: 0,
              }}
            >
              <StatCard
                title="Total Purchases"
                value={voucherStats.total.toString()}
                icon={AttachMoneyIcon}
                color="#84994f"
                loading={voucherIssuesLoading && voucherIssues.length === 0}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                width: "100%",
                minWidth: 0,
              }}
            >
              <StatCard
                title="Pending Verification"
                value={voucherStats.pending.toString()}
                icon={PendingIcon}
                color="#f58c00"
                loading={voucherIssuesLoading && voucherIssues.length === 0}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    £{voucherStats.pendingAmount}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{
                display: "flex",
                width: "100%",
                minWidth: 0,
              }}
            >
              <StatCard
                title="Verified Purchases"
                value={voucherStats.paid.toString()}
                icon={CheckCircleIcon}
                color="#4caf50"
                loading={voucherIssuesLoading && voucherIssues.length === 0}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: "success.main" }} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    £{voucherStats.totalAmount}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: "flex", width: "100%", minWidth: 0 }}
            >
              <StatCard
                title="Refunded"
                value={voucherStats.refunded.toString()}
                icon={CancelIcon}
                color="#f44336"
                loading={voucherIssuesLoading && voucherIssues.length === 0}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: "flex", width: "100%", minWidth: 0 }}
            >
              <StatCard
                title="Failed"
                value={voucherStats.failed.toString()}
                icon={ErrorOutlineIcon}
                color="#e53935"
                loading={voucherIssuesLoading && voucherIssues.length === 0}
              />
            </Grid>
            </Grid>
          </Box>
        )}
      </HeroPageSection>

      <Box sx={{ mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 0,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "#ffffff",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              "& .MuiTab-root": { borderRadius: 0, textTransform: "none" },
            }}
          >
            <Tab label="Appointment Payments" />
            <Tab label="Voucher Purchases" />
          </Tabs>
        </Paper>

        {activeTab === 1 && (
          <>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {voucherPaymentStatusFilter && voucherPaymentStatusFilter !== "all" && (
                  <Chip
                    label={`Filtered: ${voucherIssues.filter((i) => (i.payment_status || "").toLowerCase() === voucherPaymentStatusFilter).length}`}
                    sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
                  />
                )}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={voucherPaymentStatusFilter}
                    label="Payment Status"
                    onChange={(e) => setVoucherPaymentStatusFilter(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </Select>
                </FormControl>
                {voucherPaymentStatusFilter && voucherPaymentStatusFilter !== "all" && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => setVoucherPaymentStatusFilter("all")}
                    sx={{ borderRadius: 0, textTransform: "none" }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={voucherIssuesLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
                onClick={() => fetchVoucherPayments(true)}
                disabled={voucherIssuesLoading}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Refresh
              </Button>
            </Box>
          </Paper>

          {voucherIssuesError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
              {voucherIssuesError}
            </Alert>
          )}

          <VoucherIssuesTable
              issues={voucherIssues}
              loading={voucherIssuesLoading}
              error={voucherIssuesError}
              showVoucherColumn={true}
              paymentStatusFilter={voucherPaymentStatusFilter}
              onIssueUpdated={() => fetchVoucherPayments(true)}
            />
          <Alert severity="info" sx={{ borderRadius: 0, mt: 2 }}>
            Voucher purchase payments are confirmed via Stripe webhook. Use the actions menu (⋯) to open issuance details.
          </Alert>
          </>
        )}

        {activeTab === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#ffffff",
            }}
          >
            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                flexWrap: "wrap", 
                gap: 2 
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {(paymentStatusFilter || paymentMethodFilter) && (
                  <Chip
                    label={`Filtered: ${filteredAppointments.length}`}
                    sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
                  />
                )}
                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    "& .MuiOutlinedInput-root": { borderRadius: 1, backgroundColor: "#f8f9fa" },
                  }}
                >
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={paymentStatusFilter}
                    label="Payment Status"
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Payments</MenuItem>
                    <MenuItem value="pending">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PendingIcon sx={{ fontSize: 16, color: "warning.main" }} />
                        Pending
                      </Box>
                    </MenuItem>
                    <MenuItem value="paid">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                        Verified
                      </Box>
                    </MenuItem>
                    <MenuItem value="failed">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 16, color: "error.main" }} />
                        Failed
                      </Box>
                    </MenuItem>
                    <MenuItem value="refunded">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CancelIcon sx={{ fontSize: 16, color: "error.main" }} />
                        Refunded
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", sm: 160 },
                    "& .MuiOutlinedInput-root": { borderRadius: 1, backgroundColor: "#f8f9fa" },
                  }}
                >
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethodFilter}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  >
                    <MenuItem value="">All Methods</MenuItem>
                    <MenuItem value="stripe">Stripe</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="voucher_prepaid">Prepaid Voucher</MenuItem>
                    <MenuItem value="voucher">Voucher</MenuItem>
                  </Select>
                </FormControl>
                {(paymentStatusFilter || paymentMethodFilter) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setPaymentStatusFilter("");
                      setPaymentMethodFilter("");
                    }}
                    sx={{ borderRadius: 0, textTransform: "none" }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
                onClick={() => fetchAppointments(true)}
                disabled={loading}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Refresh
              </Button>
            </Box>
          </Paper>
        )}

        {/* Payments Table */}
        {activeTab === 0 && (
          <>
          {error ? (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 0,
              mb: 3,
              "& .MuiAlert-icon": {
                alignItems: "center",
              },
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => fetchAppointments(true)}
                sx={{ textTransform: "none" }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              borderRadius: 0,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#ffffff",
            }}
          >
            <DataTable
              essentialColumns={essentialColumns}
              allColumns={allColumns}
              rows={filteredAppointments}
              loading={loading && appointments.length === 0}
              searchable
              searchPlaceholder="Search by customer name, email, or reference..."
              renderDetails={renderDetails}
              detailsActionIcon="more"
            />
          </Box>
        )}

        {!loading && filteredAppointments.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: alpha("#84994f", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <PaymentIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.6 }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
              No payments found
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 400, mx: "auto" }}>
              {paymentStatusFilter
                ? `No payments with status "${paymentStatusFilter}" found. Try selecting a different filter or check back later.`
                : "No payments have been recorded yet. Payments will appear here once customers make bookings."}
            </Typography>
          </Paper>
        )}
        </>
        )}
      </Box>

    </Box>
  );
}

