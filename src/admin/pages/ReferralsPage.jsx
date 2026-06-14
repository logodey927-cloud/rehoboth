import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Chip, Button, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Tabs, Tab,
} from "@mui/material";
import { Refresh as RefreshIcon, Settings as SettingsIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { adminGetReferrals, adminUpdateReferralStatus } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";

const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "signed_up", label: "Signed Up" },
  { key: "qualified", label: "Qualified" },
  { key: "rewarded",  label: "Rewarded" },
  { key: "voided",    label: "Voided" },
];

const STATUS_COLORS = {
  pending:   { bg: "#f3f4f6", color: "#6b7280" },
  signed_up: { bg: "#dbeafe", color: "#1d4ed8" },
  qualified: { bg: "#fef9c3", color: "#a16207" },
  rewarded:  { bg: "#dcfce7", color: "#15803d" },
  voided:    { bg: "#fee2e2", color: "#b91c1c" },
};

function StatusChip({ value }) {
  const s = STATUS_COLORS[value] ?? STATUS_COLORS.pending;
  return (
    <Chip
      label={value?.replace("_", " ")}
      size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, borderRadius: 0, textTransform: "capitalize" }}
    />
  );
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Override status dialog
  const [overrideDialog, setOverrideDialog] = useState(null); // { id, currentStatus }
  const [newStatus, setNewStatus]           = useState("");
  const [voidReason, setVoidReason]         = useState("");
  const [saving, setSaving]                 = useState(false);

  useEffect(() => { fetchReferrals(); }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminGetReferrals({ limit: 500 });
      if (res.data?.success) {
        setReferrals(res.data.referrals || []);
      } else {
        setError("Failed to load referrals.");
      }
    } catch {
      setError("Failed to load referrals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = useMemo(() => {
    const key = STATUS_TABS[activeTab].key;
    return key === "all" ? referrals : referrals.filter((r) => r.status === key);
  }, [referrals, activeTab]);

  const openOverride = (row) => {
    setOverrideDialog({ id: row.id, currentStatus: row.status });
    setNewStatus(row.status);
    setVoidReason("");
  };

  const handleOverride = async () => {
    if (!overrideDialog || !newStatus) return;
    setSaving(true);
    try {
      const res = await adminUpdateReferralStatus(overrideDialog.id, {
        status: newStatus,
        voided_reason: newStatus === "voided" ? voidReason : null,
      });
      if (res.data?.success) {
        swalSuccess("Updated", "Referral status updated.");
        setOverrideDialog(null);
        fetchReferrals();
      } else {
        swalError("Error", res.data?.error || "Failed to update status.");
      }
    } catch (err) {
      swalError("Error", err.response?.data?.error || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  const referrerName = (row) =>
    row.referrer
      ? `${row.referrer.first_name || ""} ${row.referrer.last_name || ""}`.trim() || row.referrer.email
      : "—";
  const refereeName = (row) =>
    row.referee
      ? `${row.referee.first_name || ""} ${row.referee.last_name || ""}`.trim() || row.referee.email
      : row.referee_email || "—";

  const columns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (_, row, n) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>{n}</Typography>
      ),
    },
    {
      id: "referrer_user_id",
      label: "Referrer",
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: "#1a1f2e", fontSize: "0.8125rem" }}>
            {referrerName(row)}
          </Typography>
          <Typography variant="caption" color="text.secondary">{row.referrer?.email}</Typography>
        </Box>
      ),
    },
    {
      id: "referee_email",
      label: "Friend",
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: "#1a1f2e", fontSize: "0.8125rem" }}>
            {refereeName(row)}
          </Typography>
          <Typography variant="caption" color="text.secondary">{row.referee?.email || row.referee_email}</Typography>
        </Box>
      ),
    },
    { id: "referral_code", label: "Code" },
    { id: "status", label: "Status", render: (v) => <StatusChip value={v} /> },
    { id: "signed_up_at",  label: "Signed Up",  type: "date" },
    { id: "qualified_at",  label: "Qualified",  type: "date" },
    { id: "rewarded_at",   label: "Rewarded",   type: "date" },
    { id: "created_at",    label: "Created",    type: "date" },
  ];

  const renderDetails = (row, onClose, isOpen) => (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 0 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Override Status</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Referral <strong>{row.referral_code}</strong> — current: <StatusChip value={row.status} />
          </Typography>
          <TextField
            select
            label="New status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          >
            {STATUS_TABS.filter((t) => t.key !== "all").map((t) => (
              <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
            ))}
          </TextField>
          {newStatus === "voided" && (
            <TextField
              label="Reason for voiding"
              fullWidth
              size="small"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleOverride}
          disabled={saving || !newStatus || newStatus === row.status}
          sx={{ textTransform: "none", borderRadius: 0, bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }}
        >
          {saving ? "Saving…" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const tabCount = (key) => key === "all" ? referrals.length : referrals.filter((r) => r.status === key).length;

  return (
    <Box>
      <HeroPageSection
        title="Referrals"
        breadcrumb={[
          { label: "Home",  link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Referrals" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
        <Button
          component={RouterLink}
          to="/admin/referrals/settings"
          variant="outlined"
          startIcon={<SettingsIcon />}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Programme Settings
        </Button>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
          onClick={fetchReferrals}
          disabled={loading}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTabs-indicator": { bgcolor: "secondary.main", height: 2 },
          "& .MuiTab-root": {
            textTransform: "none", fontWeight: 600, fontSize: "0.875rem",
            color: "text.secondary", borderRadius: 0, minWidth: 0, px: 2,
            "&.Mui-selected": { color: "secondary.dark" },
          },
        }}
      >
        {STATUS_TABS.map((tab) => (
          <Tab key={tab.key} label={`${tab.label} (${tabCount(tab.key)})`} />
        ))}
      </Tabs>

      <DataTable
        columns={columns}
        rows={filteredReferrals}
        loading={loading && referrals.length === 0}
        searchPlaceholder="Search by name, email, code…"
        renderDetails={(row, onClose, isOpen) => {
          // Sync override dialog state when row changes
          if (isOpen && (!overrideDialog || overrideDialog.id !== row.id)) openOverride(row);
          return renderDetails(row, onClose, isOpen);
        }}
        detailsActionIcon="more"
      />
    </Box>
  );
}
