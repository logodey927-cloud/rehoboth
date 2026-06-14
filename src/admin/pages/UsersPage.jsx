import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Tabs,
  Tab,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { adminGetUsers, adminUpdateUserStatus, adminSendUserEmail, adminBroadcastToUsers } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import { resolveUserAvatarUrl } from "../../utils/userAvatar";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";
import UserDetailsModal from "../components/users/UserDetailsModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "all",      label: "All",      filter: () => true },
  { key: "active",   label: "Active",   filter: (u) => u.is_active },
  { key: "inactive", label: "Inactive", filter: (u) => !u.is_active },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  // ── Data state ──
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState(0);

  // ── Confirm toggle dialog ──
  const [confirmDialog, setConfirmDialog] = useState(null); // { userId, name, currentStatus }

  // ── Single-user email dialog ──
  const [emailDialog, setEmailDialog] = useState(null); // { id, name, email }
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // ── Broadcast dialog ──
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastActiveOnly, setBroadcastActiveOnly] = useState(true);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastRecipientCount, setBroadcastRecipientCount] = useState(null);
  const [broadcastConfirmOpen, setBroadcastConfirmOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminGetUsers({ limit: 1000 });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      } else {
        setError(res.data?.error || "Failed to load users");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipient count when broadcast dialog opens or active_only toggles
  useEffect(() => {
    if (!broadcastOpen) return;
    adminGetUsers({ limit: 1000, status: broadcastActiveOnly ? "active" : "" })
      .then((res) => {
        if (res.data?.success)
          setBroadcastRecipientCount(res.data.total ?? res.data.users?.length ?? 0);
      })
      .catch(() => setBroadcastRecipientCount(null));
  }, [broadcastOpen, broadcastActiveOnly]);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const summaryCounts = useMemo(() => ({
    total:    users.length,
    active:   users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    verified: users.filter((u) => u.email_verified).length,
  }), [users]);

  const filteredUsers = useMemo(
    () => users.filter(STATUS_TABS[activeStatusTab].filter),
    [users, activeStatusTab]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleToggleStatus = async () => {
    if (!confirmDialog) return;
    const { userId, currentStatus } = confirmDialog;
    const newStatus = !currentStatus;
    setConfirmDialog(null);
    try {
      await adminUpdateUserStatus(userId, newStatus);
      swalSuccess("Updated", `User ${newStatus ? "activated" : "deactivated"} successfully.`);
      fetchUsers();
    } catch (err) {
      swalError("Error", err.response?.data?.error || "Failed to update user status.");
    }
  };

  const EMAIL_TEMPLATES = [
    {
      label: "Follow up on payment",
      subject: "Your Rehoboth appointment booking – payment reminder",
      message: (name) =>
        `Dear ${name},\n\nWe noticed you recently started booking an appointment with us but your payment wasn't completed.\n\nWe'd love to help you secure your slot! Simply visit our website to complete your booking, or feel free to reply to this email and we'll be happy to assist you.\n\n📞 07759221176\n\nWe look forward to welcoming you at Rehoboth Health & Wellness Clinic.\n\nWarm regards,\nRehoboth Health & Wellness Clinic`,
    },
    {
      label: "Booking confirmation",
      subject: "Your appointment is confirmed – Rehoboth Health & Wellness",
      message: (name) =>
        `Dear ${name},\n\nThank you for booking with us! Your appointment has been confirmed and we look forward to seeing you.\n\nIf you need to reschedule or have any questions, please don't hesitate to get in touch.\n\n📞 07759221176\n\nSee you soon!\n\nWarm regards,\nRehoboth Health & Wellness Clinic`,
    },
    {
      label: "General follow-up",
      subject: "Following up from Rehoboth Health & Wellness Clinic",
      message: (name) =>
        `Dear ${name},\n\nWe hope you're doing well! We just wanted to check in and see if there's anything we can help you with.\n\nFeel free to reply to this email or give us a call on 07759221176.\n\nWarm regards,\nRehoboth Health & Wellness Clinic`,
    },
  ];

  const openEmailDialog = (user) => {
    setEmailDialog({ id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email });
    setEmailSubject("");
    setEmailMessage("");
  };

  const handleSendUserEmail = async () => {
    if (!emailDialog || !emailMessage.trim()) return;
    setEmailSending(true);
    try {
      const res = await adminSendUserEmail(emailDialog.id, { subject: emailSubject, message: emailMessage });
      if (res.data?.success) {
        swalSuccess("Email sent", `Message sent to ${emailDialog.email}`);
        setEmailDialog(null);
      } else {
        swalError("Error", res.data?.error || "Failed to send email");
      }
    } catch (err) {
      swalError("Error", err.response?.data?.error || "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const handleBroadcastPreview = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastConfirmOpen(true);
  };

  const handleBroadcast = async () => {
    setBroadcastConfirmOpen(false);
    setBroadcastSending(true);
    try {
      const res = await adminBroadcastToUsers({
        subject: broadcastSubject,
        message: broadcastMessage,
        active_only: broadcastActiveOnly,
      });
      if (res.data?.success) {
        const { sent, failed } = res.data;
        swalSuccess("Broadcast complete", `Sent: ${sent}${failed ? `, Failed: ${failed}` : ""}`);
        setBroadcastOpen(false);
        setBroadcastSubject("");
        setBroadcastMessage("");
      } else {
        swalError("Error", res.data?.error || "Broadcast failed");
      }
    } catch (err) {
      swalError("Error", err.response?.data?.error || "Broadcast failed");
    } finally {
      setBroadcastSending(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const initials = (u) =>
    `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase() || "?";

  const renderUserCell = (_, row) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, py: 0.5 }}>
      <Avatar
        src={resolveUserAvatarUrl(row)}
        alt={`${row.first_name} ${row.last_name}`}
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          bgcolor: "secondary.light",
          color: "secondary.dark",
          flexShrink: 0,
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        {initials(row)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.8125rem", lineHeight: 1.3 }}
          noWrap
        >
          {row.first_name} {row.last_name}
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

  const renderEmailVerifiedChip = (value) => (
    <Chip
      label={value ? "Verified" : "Unverified"}
      size="small"
      sx={
        value
          ? { backgroundColor: "#4caf5015", color: "#4caf50", fontWeight: 500, borderRadius: 0 }
          : { backgroundColor: "#f58c0015", color: "#f58c00", fontWeight: 500, borderRadius: 0 }
      }
    />
  );

  const renderStatusChip = (value) => (
    <Chip
      label={value ? "Active" : "Inactive"}
      size="small"
      sx={
        value
          ? { backgroundColor: "#4caf5015", color: "#4caf50", fontWeight: 500, borderRadius: 0 }
          : { backgroundColor: "#9e9e9e15", color: "#9e9e9e", fontWeight: 500, borderRadius: 0 }
      }
    />
  );

  const renderDetails = (row, onClose, isOpen) => (
    <UserDetailsModal
      open={isOpen}
      onClose={onClose}
      userId={row?.id}
      listRow={row}
      onEmail={(u) => {
        onClose();
        openEmailDialog(u);
      }}
      onToggleStatus={(u) => {
        onClose();
        setConfirmDialog({
          userId: u.id,
          name: `${u.first_name} ${u.last_name}`,
          currentStatus: u.is_active,
        });
      }}
    />
  );

  // ── Column definitions ────────────────────────────────────────────────────────

  const ROW_NUMBER_COL = {
    id: "row_number",
    label: "No.",
    width: 60,
    align: "center",
    render: (value, row, rowNumber) => (
      <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
        {rowNumber}
      </Typography>
    ),
  };

  const essentialColumns = [
    ROW_NUMBER_COL,
    { id: "first_name", label: "User", width: 240, render: renderUserCell },
    { id: "phone",      label: "Phone",         render: (v) => v || "—" },
    { id: "email_verified", label: "Email Verified", render: renderEmailVerifiedChip },
    { id: "is_active",  label: "Status",        render: renderStatusChip },
    { id: "created_at", label: "Joined",        type: "date" },
  ];

  const allColumns = [
    ROW_NUMBER_COL,
    { id: "first_name", label: "User",          render: renderUserCell },
    {
      id: "email",
      label: "Email",
      render: (value) =>
        value ? (
          <Typography
            component="a"
            href={`mailto:${value}`}
            sx={{
              color: "secondary.dark",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline", fontWeight: 500 },
            }}
          >
            {value}
          </Typography>
        ) : "—",
    },
    { id: "phone",          label: "Phone",          render: (v) => v || "—" },
    { id: "email_verified", label: "Email Verified",  render: renderEmailVerifiedChip },
    { id: "is_active",      label: "Status",          render: renderStatusChip },
    { id: "created_at",     label: "Joined",          type: "date" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="Customer Users"
        breadcrumb={[
          { label: "Home",  link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Customer Users" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Total Users"
              value={summaryCounts.total.toString()}
              icon={PeopleIcon}
              color="#3b82f6"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Active"
              value={summaryCounts.active.toString()}
              icon={CheckCircleIcon}
              color="#4caf50"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Inactive"
              value={summaryCounts.inactive.toString()}
              icon={BlockIcon}
              color="#9e9e9e"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Email Verified"
              value={summaryCounts.verified.toString()}
              icon={VerifiedUserIcon}
              color="#84994f"
              loading={loading}
            />
          </Grid>
        </Grid>
      </HeroPageSection>

      {/* ── Status tabs ── */}
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
          const count = users.filter(tab.filter).length;
          return <Tab key={tab.key} label={`${tab.label} (${count})`} />;
        })}
      </Tabs>

      {/* ── Toolbar ── */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<CampaignIcon />}
          onClick={() => setBroadcastOpen(true)}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Broadcast Email
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
          onClick={fetchUsers}
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
        rows={filteredUsers}
        loading={loading && users.length === 0}
        searchPlaceholder="Search users by name, email, phone…"
        renderDetails={renderDetails}
        detailsActionIcon="more"
      />

      {/* ── Confirm status toggle ── */}
      <Dialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          {confirmDialog?.currentStatus ? "Deactivate User" : "Activate User"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmDialog?.currentStatus ? "deactivate" : "activate"}{" "}
            <strong>{confirmDialog?.name}</strong>?
            {confirmDialog?.currentStatus && " They will no longer be able to log in."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmDialog(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleToggleStatus}
            variant="contained"
            color={confirmDialog?.currentStatus ? "error" : "success"}
            sx={{ textTransform: "none" }}
          >
            {confirmDialog?.currentStatus ? "Deactivate" : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Email customer ── */}
      <Dialog
        open={!!emailDialog}
        onClose={() => !emailSending && setEmailDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="span" fontWeight={600}>Email Customer</Typography>
          {emailDialog && (
            <Typography variant="body2" color="text.secondary">
              To: {emailDialog.name} ({emailDialog.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Template picker */}
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1 }}>
                Quick templates
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {EMAIL_TEMPLATES.map((tpl) => (
                  <Chip
                    key={tpl.label}
                    label={tpl.label}
                    size="small"
                    clickable
                    onClick={() => {
                      setEmailSubject(tpl.subject);
                      setEmailMessage(tpl.message(emailDialog?.name || "there"));
                    }}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: emailSubject === tpl.subject ? "#47672f" : "rgba(71,103,47,0.08)",
                      color: emailSubject === tpl.subject ? "#fff" : "#47672f",
                      border: "1px solid",
                      borderColor: emailSubject === tpl.subject ? "#47672f" : "rgba(71,103,47,0.25)",
                      "&:hover": { bgcolor: "#47672f", color: "#fff" },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Subject"
              fullWidth
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Message from Rehoboth Health & Wellness Clinic"
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
            onClick={() => setEmailDialog(null)}
            disabled={emailSending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendUserEmail}
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

      {/* ── Broadcast compose ── */}
      <Dialog
        open={broadcastOpen}
        onClose={() => !broadcastSending && setBroadcastOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="span" fontWeight={600}>Broadcast Email to Users</Typography>
          {broadcastRecipientCount !== null && (
            <Typography variant="body2" color="text.secondary">
              {broadcastRecipientCount} recipient{broadcastRecipientCount !== 1 ? "s" : ""} will receive this email
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={broadcastActiveOnly}
                  onChange={(e) => setBroadcastActiveOnly(e.target.checked)}
                  color="secondary"
                />
              }
              label="Active users only"
            />
            <TextField
              label="Subject"
              fullWidth
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
              placeholder="Message from Rehoboth Health & Wellness Clinic"
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={6}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setBroadcastOpen(false)}
            disabled={broadcastSending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBroadcastPreview}
            disabled={broadcastSending || !broadcastMessage.trim()}
            sx={{
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            Review & Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Broadcast confirm ── */}
      <Dialog
        open={broadcastConfirmOpen}
        onClose={() => setBroadcastConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Confirm Broadcast</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send this email to <strong>{broadcastRecipientCount ?? "all"}</strong>{" "}
            {broadcastActiveOnly ? "active " : ""}users? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setBroadcastConfirmOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBroadcast}
            variant="contained"
            color="secondary"
            sx={{ textTransform: "none" }}
          >
            {broadcastSending ? "Sending…" : "Send now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
