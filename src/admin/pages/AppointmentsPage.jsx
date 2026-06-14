import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Grid,
  Avatar,
} from "@mui/material";
import {
  Info as InfoIcon,
  Clear as ClearIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Today as TodayIcon,
  EventNote as EventNoteIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  Spa as SpaIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  getAppointments,
  getAllTeamMembersAdmin,
  updateAppointmentTeamMember,
  sendAppointmentCustomerEmail,
} from "../../api/api";
import { getCached, setCached, invalidateCache } from "../utils/adminCache";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";
import AppointmentDetailsModal from "../components/appointments/AppointmentDetailsModal";
import VoucherDetailsOverlay from "../components/vouchers/VoucherDetailsOverlay";
import PaymentStatusBadge from "../components/payments/PaymentStatusBadge";
import PaymentDetailsOverlay from "../components/payments/PaymentDetailsOverlay";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";
import { resolveUserAvatarUrl } from "../../utils/userAvatar";

// ── Constants ────────────────────────────────────────────────────────────────

const FOLLOW_UP_TEMPLATES = {
  payment: {
    subject: "Complete your Rehoboth booking",
    message:
      "Thank you for starting your appointment booking with us. We noticed your payment was not completed.\n\nWe would be happy to help you finish your booking or answer any questions. Please reply to this email or call us on 07759221176.",
  },
  general: {
    subject: "Message from Rehoboth Health & Wellness Clinic",
    message:
      "Thank you for your interest in Rehoboth Health & Wellness Clinic. Please let us know if we can help you with your booking or any questions about our services.",
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

const DONE_STATUSES = ["completed", "client_completed"];
const CANCELLED_STATUSES = ["cancelled", "rejected"];

const STATUS_TABS = [
  { key: "all", label: "All", filter: () => true },
  {
    key: "upcoming",
    label: "Upcoming",
    filter: (a) =>
      !DONE_STATUSES.includes(a.status) && !CANCELLED_STATUSES.includes(a.status),
  },
  { key: "completed", label: "Completed", filter: (a) => DONE_STATUSES.includes(a.status) },
  { key: "cancelled", label: "Cancelled", filter: (a) => CANCELLED_STATUSES.includes(a.status) },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState(() => getCached("appointments") || []);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(() => !getCached("appointments"));
  const [error, setError] = useState(null);
  const [voucherOverlayOpen, setVoucherOverlayOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState(0);
  const [paymentOverlayOpen, setPaymentOverlayOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [appointmentToReassign, setAppointmentToReassign] = useState(null);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "pending") {
      setPaymentStatusFilter("pending");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAppointments();
    fetchTeamMembers();
  }, []);

  const fetchAppointments = async (force = false) => {
    if (!force) {
      const cached = getCached("appointments");
      if (cached) {
        // Already shown from useState initializer — no loading flash
        return;
      }
    } else {
      invalidateCache("appointments");
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getAppointments();
      if (res.data?.success) {
        const data = res.data.appointments || [];
        setAppointments(data);
        setCached("appointments", data);
      } else {
        setError("Failed to load appointments");
      }
    } catch {
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await getAllTeamMembersAdmin({ is_active: true });
      if (res.data?.success) {
        setTeamMembers(res.data.teamMembers || []);
      }
    } catch {
      // non-critical — proceed without filter options
    }
  };

  const handleSendCustomerEmail = async () => {
    if (!emailTarget?.id || !emailMessage.trim()) return;
    setEmailSending(true);
    try {
      await ensureSweetAlertReady();
      const res = await sendAppointmentCustomerEmail(emailTarget.id, {
        subject: emailSubject,
        message: emailMessage,
      });
      if (res.data?.success) {
        await swalSuccess("Email sent", `Message sent to ${emailTarget.email}`);
        setEmailDialogOpen(false);
        setEmailTarget(null);
      } else {
        await swalError("Error", res.data?.error || "Failed to send email");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const filteredAppointments = useMemo(() => {
    // Status tab filter applied first
    let filtered = appointments.filter(STATUS_TABS[activeStatusTab].filter);

    if (filterDate) {
      const filterDateStr = dayjs(filterDate).format("YYYY-MM-DD");
      // Filter by booking date (when the appointment was created), not appointment date
      filtered = filtered.filter((apt) => dayjs(apt.created_at).format("YYYY-MM-DD") === filterDateStr);
    }
    if (paymentStatusFilter) {
      filtered = filtered.filter(
        (apt) => (apt.payment_status || "").toLowerCase() === paymentStatusFilter.toLowerCase()
      );
    }
    if (serviceFilter) {
      filtered = filtered.filter((apt) => apt.service === serviceFilter);
    }
    if (teamMemberFilter) {
      filtered = filtered.filter(
        (apt) => apt.team_member?.id === teamMemberFilter || apt.team_member_id === teamMemberFilter
      );
    }

    // Most recently booked first (created_at desc)
    filtered.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

    return filtered;
  }, [appointments, activeStatusTab, filterDate, paymentStatusFilter, serviceFilter, teamMemberFilter]);

  const serviceOptions = useMemo(
    () => [...new Set(appointments.map((a) => a.service).filter(Boolean))].sort(),
    [appointments]
  );

  const summaryCounts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: appointments.length,
      upcoming: appointments.filter(STATUS_TABS[1].filter).length,
      completed: appointments.filter(STATUS_TABS[2].filter).length,
      cancelled: appointments.filter(STATUS_TABS[3].filter).length,
      // Scheduled today (appointment date)
      todayCount: appointments.filter(
        (a) => a.date === today && !CANCELLED_STATUSES.includes(a.status)
      ).length,
      // Booked today (booking/created_at date)
      bookedTodayCount: appointments.filter(
        (a) => dayjs(a.created_at).format("YYYY-MM-DD") === today
      ).length,
      upcomingConfirmed: appointments.filter(
        (a) => a.status === "confirmed" && a.date > today
      ).length,
      pendingCount: appointments.filter((a) => a.status === "pending").length,
      completedCount: appointments.filter((a) => a.status === "completed").length,
    };
  }, [appointments]);

  const handleReassignTeamMember = async () => {
    if (!appointmentToReassign) return;
    try {
      await ensureSweetAlertReady();
      const res = await updateAppointmentTeamMember(
        appointmentToReassign.id,
        selectedTeamMemberId || null
      );
      if (res.data?.success) {
        await swalSuccess("Success", res.data.message || "Team member assignment updated successfully");
        setReassignDialogOpen(false);
        setAppointmentToReassign(null);
        setSelectedTeamMemberId("");
        fetchAppointments();
      } else {
        await swalError("Error", res.data?.error || "Failed to update team member assignment");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || "Failed to update team member assignment");
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

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

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderNoWrapCell = (value) => (
    <Typography
      variant="body2"
      component="span"
      sx={{ whiteSpace: "nowrap", display: "inline-block" }}
    >
      {value || "-"}
    </Typography>
  );

  const DATE_COLUMN = {
    nowrap: true,
    width: 132,
    minWidth: 132,
  };

  const TIME_COLUMN = {
    nowrap: true,
    width: 72,
    minWidth: 72,
  };

  const BOOKED_COLUMN = {
    nowrap: true,
    width: 152,
    minWidth: 152,
  };

  const renderCustomerCell = (_, row) => {
    const avatarSrc = resolveUserAvatarUrl({
      id: row.user_id || row.email || row.id,
      avatar_url: row.avatar_url,
      gender: row.user_gender || row.client_gender,
    });

    return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, py: 0.5 }}>
      <Avatar
        src={avatarSrc}
        alt={row.full_name || "Customer"}
        variant="rounded"
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          bgcolor: "secondary.light",
          flexShrink: 0,
        }}
      >
        <SpaIcon sx={{ color: "secondary.main", fontSize: 22 }} />
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
            href={`mailto:${row.email}?subject=${encodeURIComponent("Rehoboth booking follow-up")}`}
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
  };

  const renderStatusChip = (status) => {
    const s = (status || "pending").toLowerCase();
    const colors = STATUS_COLORS[s] || { bg: "#e0e0e0", color: "#757575" };
    const label = STATUS_LABEL_MAP[s] || s;
    return (
      <Chip
        label={label}
        size="small"
        sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 500, borderRadius: 0 }}
      />
    );
  };

  // ── Column definitions ───────────────────────────────────────────────────────

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
      id: "email",
      label: "Email",
      render: (value) =>
        value ? (
          <Typography
            component="a"
            href={`mailto:${value}?subject=${encodeURIComponent("Rehoboth booking follow-up")}`}
            sx={{
              color: "secondary.dark",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline", fontWeight: 500 },
            }}
          >
            {value}
          </Typography>
        ) : (
          "-"
        ),
    },
    {
      id: "phone",
      label: "Phone",
      render: (value) => value || "-",
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
      id: "treatment",
      label: "Treatment",
      render: (value) => value || "-",
    },
    {
      id: "duration",
      label: "Duration",
      render: (value) => value || "-",
    },
    {
      id: "image_url",
      label: "Service Image",
      render: (value) =>
        value ? (
          <Box
            component="img"
            src={value}
            alt="Service"
            sx={{ width: 88, height: 60, objectFit: "cover", borderRadius: 1, display: "block" }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: "team_member",
      label: "Team Member",
      width: 180,
      render: (value, row) => {
        const teamMember = row.team_member;
        if (!teamMember && !row.team_member_id) {
          return (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              Not assigned
            </Typography>
          );
        }
        return (
          <Chip
            label={teamMember?.title || "Unknown"}
            size="small"
            sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 500, borderRadius: 0 }}
          />
        );
      },
    },
    {
      id: "date",
      label: "Appointment Date",
      ...DATE_COLUMN,
      render: (value) => renderNoWrapCell(formatAppointmentDate(value)),
    },
    {
      id: "time",
      label: "Time",
      ...TIME_COLUMN,
      render: (value) => renderNoWrapCell(value),
    },
    {
      id: "note",
      label: "Note",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "user_id",
      label: "Account",
      render: (value) =>
        value ? (
          <RouterLink to="/admin/users" style={{ textDecoration: "none" }}>
            <Chip
              icon={<PersonIcon sx={{ fontSize: "0.9rem !important" }} />}
              label="Registered User"
              size="small"
              sx={{ backgroundColor: "#2196f315", color: "#2196f3", fontWeight: 500, borderRadius: 0, cursor: "pointer" }}
            />
          </RouterLink>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            Guest
          </Typography>
        ),
    },
    {
      id: "client_gender",
      label: "Gender",
      render: (value) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1) : "-",
    },
    {
      id: "status",
      label: "Status",
      width: 140,
      render: (value) => renderStatusChip(value),
    },
    {
      id: "__payment_breakdown__",
      label: "Payment Breakdown",
      render: (_, row) => {
        const servicePrice = parseFloat(row.service_price || 0);
        const discount = parseFloat(row.voucher_discount_amount || 0);
        const total = parseFloat(row.payment_amount || 0);
        if (servicePrice === 0 && total === 0) return <Typography variant="body2">-</Typography>;
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 200 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
              <Typography variant="body2" color="text.secondary">Service price:</Typography>
              <Typography variant="body2">£{servicePrice.toFixed(2)}</Typography>
            </Box>
            {discount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
                <Typography variant="body2" color="text.secondary">Voucher discount:</Typography>
                <Typography variant="body2" sx={{ color: "#4caf50" }}>−£{discount.toFixed(2)}</Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 3,
                pt: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Total:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>£{total.toFixed(2)}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "payment_method",
      label: "Payment Method",
      render: (value) =>
        value
          ? value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          : "-",
    },
    {
      id: "payment_status",
      label: "Payment",
      width: 120,
      render: (value, row) => {
        if (!row.payment_status) return <Typography variant="body2">-</Typography>;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PaymentStatusBadge status={row.payment_status} />
            {row.payment_status === "pending" && row.payment_screenshot_url && (
              <Tooltip title="View Payment Details">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedAppointment(row);
                    setPaymentOverlayOpen(true);
                  }}
                  sx={{ p: 0.5 }}
                >
                  <PaymentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      id: "payment_amount",
      label: "Amount",
      width: 100,
      render: (value) =>
        value ? (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            £{parseFloat(value).toFixed(2)}
          </Typography>
        ) : (
          <Typography variant="body2">-</Typography>
        ),
    },
    {
      id: "voucher_code",
      label: "Voucher",
      width: 180,
      render: (value, row) => {
        if (!row.voucher && !value) return <Typography variant="body2">-</Typography>;
        const voucher = row.voucher || {};
        const formatDiscount = () => {
          if (voucher.discount_type === "percent") return `${voucher.discount_value}% OFF`;
          if (voucher.discount_type === "amount") return `£${voucher.discount_value} OFF`;
          if (voucher.discount_type === "free_service") return "FREE SERVICE";
          return "Special Offer";
        };
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={voucher.code || value || "-"}
              size="small"
              sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 500, borderRadius: 0 }}
            />
            {voucher.discount_value && (
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                ({formatDiscount()})
              </Typography>
            )}
            {voucher.code && (
              <Tooltip title="View Voucher Details">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedVoucher(voucher);
                    setVoucherOverlayOpen(true);
                  }}
                  sx={{ p: 0.5 }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      id: "payment_transaction_id",
      label: "Transaction ID",
      render: (value) =>
        value ? (
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
            {value}
          </Typography>
        ) : (
          "-"
        ),
    },
    {
      id: "payment_name",
      label: "Payment Name",
      render: (value) => value || "-",
    },
    {
      id: "payment_date",
      label: "Payment Date",
      render: (value) => formatDateTime(value),
    },
    {
      id: "payment_verified_at",
      label: "Verified At",
      render: (value) => formatDateTime(value),
    },
    {
      id: "created_at",
      label: "Booked On",
      ...BOOKED_COLUMN,
      render: (value) => renderNoWrapCell(formatDateTime(value)),
    },
  ];

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
      width: 240,
      render: renderCustomerCell,
    },
    {
      id: "phone",
      label: "Phone",
      render: (value) => value || "-",
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
      id: "team_member",
      label: "Team Member",
      width: 180,
      render: (value, row) => {
        const teamMember = row.team_member;
        if (!teamMember && !row.team_member_id) {
          return (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              Not assigned
            </Typography>
          );
        }
        return (
          <Chip
            label={teamMember?.title || "Unknown"}
            size="small"
            sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 500, borderRadius: 0 }}
          />
        );
      },
    },
    {
      id: "date",
      label: "Appointment Date",
      ...DATE_COLUMN,
      render: (value) => renderNoWrapCell(formatAppointmentDate(value)),
    },
    {
      id: "time",
      label: "Time",
      ...TIME_COLUMN,
      render: (value) => renderNoWrapCell(value),
    },
    {
      id: "created_at",
      label: "Booked On",
      ...BOOKED_COLUMN,
      render: (value) => renderNoWrapCell(formatDateTime(value)),
    },
    {
      id: "status",
      label: "Status",
      width: 140,
      render: (value) => renderStatusChip(value),
    },
  ];

  // ── Detail dialog ────────────────────────────────────────────────────────────

  const renderDetails = (row, onClose, isOpen) => (
    <AppointmentDetailsModal
      open={isOpen}
      onClose={onClose}
      appointment={row}
      onRefresh={() => fetchAppointments(true)}
      onReassign={(apt) => {
        setAppointmentToReassign(apt);
        setSelectedTeamMemberId(apt.team_member_id || "");
        setReassignDialogOpen(true);
      }}
      onEmail={(apt) => {
        const tpl =
          apt.payment_status === "pending" ? FOLLOW_UP_TEMPLATES.payment : FOLLOW_UP_TEMPLATES.general;
        setEmailTarget(apt);
        setEmailSubject(tpl.subject);
        setEmailMessage(tpl.message);
        setEmailDialogOpen(true);
      }}
      onPaymentDetails={(apt) => {
        setSelectedAppointment(apt);
        setPaymentOverlayOpen(true);
      }}
      onVoucherDetails={(voucher) => {
        setSelectedVoucher(voucher);
        setVoucherOverlayOpen(true);
      }}
    />
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading && appointments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="Appointments"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Appointments" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Booked Today"
              value={summaryCounts.bookedTodayCount.toString()}
              icon={TodayIcon}
              color="#9c27b0"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Appointments Today"
              value={summaryCounts.todayCount.toString()}
              icon={SpaIcon}
              color="#0288d1"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Pending"
              value={summaryCounts.pendingCount.toString()}
              icon={HourglassEmptyIcon}
              color="#f58c00"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Completed"
              value={summaryCounts.completedCount.toString()}
              icon={CheckCircleIcon}
              color="#4caf50"
              loading={loading}
            />
          </Grid>
        </Grid>
      </HeroPageSection>

      {/* Status tabs */}
      <Tabs
        value={activeStatusTab}
        onChange={(_, v) => setActiveStatusTab(v)}
        sx={{
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTabs-indicator": { bgcolor: "secondary.main", height: 2 },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "text.secondary",
            borderRadius: 0,
            minWidth: 0,
            px: 2,
            "&.Mui-selected": { color: "secondary.dark" },
          },
        }}
      >
        {STATUS_TABS.map((tab) => {
          const count = appointments.filter(tab.filter).length;
          return (
            <Tab
              key={tab.key}
              label={`${tab.label} (${count})`}
            />
          );
        })}
      </Tabs>

      {/* Filters + Refresh */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {(filterDate || paymentStatusFilter || teamMemberFilter || serviceFilter) && (
            <Chip
              label={`Filtered: ${filteredAppointments.length}`}
              sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
            />
          )}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Booking Date"
              value={filterDate}
              onChange={(newValue) => setFilterDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 180, "& .MuiOutlinedInput-root": { borderRadius: 1 } },
                },
                field: { clearable: true, onClear: () => setFilterDate(null) },
              }}
            />
          </LocalizationProvider>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={paymentStatusFilter}
              label="Payment Status"
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Service</InputLabel>
            <Select
              value={serviceFilter}
              label="Service"
              onChange={(e) => setServiceFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
            >
              <MenuItem value="">All Services</MenuItem>
              {serviceOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Team Member</InputLabel>
            <Select
              value={teamMemberFilter}
              label="Team Member"
              onChange={(e) => setTeamMemberFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
            >
              <MenuItem value="">All</MenuItem>
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(filterDate || paymentStatusFilter || teamMemberFilter || serviceFilter) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                setFilterDate(null);
                setPaymentStatusFilter("");
                setTeamMemberFilter("");
                setServiceFilter("");
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

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        essentialColumns={essentialColumns}
        allColumns={allColumns}
        rows={filteredAppointments}
        loading={loading && appointments.length === 0}
        searchPlaceholder="Search appointments by name, email, service..."
        renderDetails={renderDetails}
        detailsActionIcon="more"
      />

      {/* Voucher Details Overlay */}
      <VoucherDetailsOverlay
        open={voucherOverlayOpen}
        onClose={() => {
          setVoucherOverlayOpen(false);
          setSelectedVoucher(null);
        }}
        voucher={selectedVoucher}
        onVoucherUpdate={fetchAppointments}
      />

      {/* Payment Details Overlay */}
      <PaymentDetailsOverlay
        open={paymentOverlayOpen}
        onClose={() => {
          setPaymentOverlayOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onPaymentVerified={fetchAppointments}
      />

      {/* Team Member Reassignment Dialog */}
      <Dialog
        open={reassignDialogOpen}
        onClose={() => {
          setReassignDialogOpen(false);
          setAppointmentToReassign(null);
          setSelectedTeamMemberId("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {appointmentToReassign?.team_member_id ? "Reassign Team Member" : "Assign Team Member"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Appointment: {appointmentToReassign?.full_name} — {appointmentToReassign?.service} on{" "}
              {appointmentToReassign?.date} at {appointmentToReassign?.time}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Team Member</InputLabel>
              <Select
                value={selectedTeamMemberId}
                label="Select Team Member"
                onChange={(e) => setSelectedTeamMemberId(e.target.value)}
              >
                <MenuItem value="">
                  <em>None (Unassign)</em>
                </MenuItem>
                {teamMembers.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.title} - {member.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setReassignDialogOpen(false);
              setAppointmentToReassign(null);
              setSelectedTeamMemberId("");
            }}
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReassignTeamMember}
            variant="contained"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Customer Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => !emailSending && setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Email Customer
          </Typography>
          {emailTarget && (
            <Typography variant="body2" color="text.secondary">
              To: {emailTarget.full_name} ({emailTarget.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Subject"
              fullWidth
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={6}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setEmailDialogOpen(false)}
            disabled={emailSending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendCustomerEmail}
            disabled={emailSending || !emailMessage.trim()}
            sx={{
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            {emailSending ? "Sending…" : "Send email"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
