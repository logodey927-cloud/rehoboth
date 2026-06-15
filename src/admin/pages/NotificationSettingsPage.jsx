import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  IconButton,
  Tab,
  Tabs,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Notifications as InAppIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  Person as CustomerIcon,
} from "@mui/icons-material";
import {
  getNotificationRules,
  updateNotificationRule,
} from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { swalSuccess, swalError } from "../../utils/swal";

// ── Audience tab ──────────────────────────────────────────────────────────────

const AUDIENCES = [
  { value: "admin",    label: "Admin Events",    icon: <AdminIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
  { value: "customer", label: "Customer Events",  icon: <CustomerIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
];

// ── Channel chip ──────────────────────────────────────────────────────────────

function ChannelChip({ active, icon, label }) {
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      variant={active ? "filled" : "outlined"}
      color={active ? "primary" : "default"}
      sx={{ fontWeight: active ? 600 : 400, opacity: active ? 1 : 0.45, mr: 0.5 }}
    />
  );
}

// ── Enabled chip ──────────────────────────────────────────────────────────────

function EnabledChip({ enabled }) {
  return (
    <Chip
      label={enabled ? "On" : "Off"}
      size="small"
      sx={{
        backgroundColor: enabled ? "#e8f5e9" : "#fafafa",
        color: enabled ? "#2e7d32" : "#9e9e9e",
        fontWeight: 600,
        borderRadius: 1,
        border: "1px solid",
        borderColor: enabled ? "#a5d6a7" : "#e0e0e0",
      }}
    />
  );
}

// ── Template helper text ──────────────────────────────────────────────────────

const PLACEHOLDER_HINTS = {
  "user.registered":        "{{first_name}}, {{last_name}}, {{email}}, {{phone}}, {{registered_at}}, {{admin_users_url}}, {{logo_url}}",
  "user.logged_in":         "{{first_name}}, {{last_name}}, {{email}}, {{logged_in_at}}, {{admin_users_url}}, {{logo_url}}",
  "booking.payment_started":"{{client_name}}, {{email}}, {{phone}}, {{service}}, {{date}}, {{time}}, {{payment_amount}}, {{note}}, {{admin_appointments_url}}, {{logo_url}}",
  "booking.created":        "{{client_name}}, {{email}}, {{phone}}, {{service}}, {{date}}, {{time}}, {{payment_amount}}, {{admin_appointments_url}}, {{logo_url}}",
  "booking.bank_proof":     "{{client_name}}, {{email}}, {{appointment_id}}, {{service}}, {{date}}, {{admin_appointments_url}}, {{logo_url}}",
  "voucher.purchased":      "{{buyer_name}}, {{buyer_email}}, {{voucher_title}}, {{amount}}, {{admin_vouchers_url}}, {{logo_url}}",
  "contact.received":       "{{name}}, {{email}}, {{subject}}, {{message}}, {{admin_contact_url}}, {{logo_url}}",
  "review.submitted":       "{{display_name}}, {{rating}}, {{service_title}}, {{review_text}}, {{admin_reviews_url}}, {{logo_url}}",
  "chat.user_message":      "{{first_name}}, {{thread_id}}, {{admin_chat_url}}, {{logo_url}}",
  "chat.human_requested":   "{{name}}, {{email}}, {{channel}}, {{thread_id}}, {{admin_chat_url}}, {{logo_url}}",
  "payment.failed":         "{{client_name}}, {{email}}, {{service}}, {{date}}, {{payment_amount}}, {{failure_reason}}, {{admin_appointments_url}}, {{logo_url}}",
  "booking.confirmed":      "{{first_name}}, {{service}}, {{date}}, {{time}}, {{clinic_url}}, {{logo_url}}",
  "booking.reminder":       "{{first_name}}, {{service}}, {{date}}, {{time}}, {{clinic_url}}, {{logo_url}}",
  "booking.cancelled":      "{{first_name}}, {{service}}, {{date}}, {{time}}, {{clinic_url}}, {{logo_url}}",
  "booking.status_changed": "{{first_name}}, {{service}}, {{date}}, {{time}}, {{status_label}}, {{clinic_url}}, {{logo_url}}",
  "voucher.issued":         "{{first_name}}, {{title}}, {{code}}, {{clinic_url}}, {{logo_url}}",
  "voucher.expiring":       "{{first_name}}, {{title}}, {{code}}, {{expiry_date}}, {{days_remaining}}, {{clinic_url}}, {{logo_url}}",
  "account.welcome":        "{{first_name}}, {{last_name}}, {{email}}, {{clinic_url}}, {{logo_url}}",
  "account.email_verification": "{{first_name}}, {{last_name}}, {{email}}, {{verification_link}}, {{clinic_url}}, {{logo_url}}",
  "chat.admin_replied":     "{{first_name}}, {{reply}}, {{channel}}, {{chat_url}}, {{clinic_url}}, {{logo_url}}",
};

// ── Edit dialog ───────────────────────────────────────────────────────────────

function EditRuleDialog({ rule, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (rule) {
      setForm({
        enabled:                 rule.enabled,
        channel_in_app:          rule.channel_in_app,
        channel_email:           rule.channel_email,
        channel_chat:            rule.channel_chat,
        in_app_title_template:   rule.in_app_title_template  || "",
        in_app_body_template:    rule.in_app_body_template   || "",
        email_subject_template:  rule.email_subject_template || "",
        email_body_template:     rule.email_body_template    || "",
        chat_body_template:      rule.chat_body_template     || "",
      });
      setTab(0);
    }
  }, [rule]);

  if (!rule || !form) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationRule(rule.id, form);
      await swalSuccess("Saved", "Notification rule updated.");
      onSaved();
    } catch (err) {
      await swalError("Error", err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const hint = PLACEHOLDER_HINTS[rule.event_key] || "";

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit: {rule.name}
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
          {rule.event_key} · {rule.audience}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Master toggle + channel switches */}
        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <FormControlLabel
            control={<Switch checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />}
            label="Enabled"
          />
          <Divider orientation="vertical" flexItem />
          <FormControlLabel
            control={<Switch checked={form.channel_in_app} onChange={(e) => set("channel_in_app", e.target.checked)} />}
            label="In-App"
          />
          <FormControlLabel
            control={<Switch checked={form.channel_email} onChange={(e) => set("channel_email", e.target.checked)} />}
            label="Email"
          />
          <FormControlLabel
            control={<Switch checked={form.channel_chat} onChange={(e) => set("channel_chat", e.target.checked)} />}
            label="Chat"
          />
        </Box>

        {hint && (
          <Alert severity="info" sx={{ mb: 2, fontSize: "0.8rem" }}>
            Available placeholders: <strong>{hint}</strong>
          </Alert>
        )}

        {/* Template tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
          <Tab label="In-App" disabled={!form.channel_in_app} />
          <Tab label="Email"  disabled={!form.channel_email} />
          <Tab label="Chat"   disabled={!form.channel_chat} />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2}>
            <TextField
              label="In-App Title"
              fullWidth
              value={form.in_app_title_template}
              onChange={(e) => set("in_app_title_template", e.target.value)}
              size="small"
            />
            <TextField
              label="In-App Body"
              fullWidth
              multiline
              rows={3}
              value={form.in_app_body_template}
              onChange={(e) => set("in_app_body_template", e.target.value)}
              size="small"
            />
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <TextField
              label="Email Subject"
              fullWidth
              value={form.email_subject_template}
              onChange={(e) => set("email_subject_template", e.target.value)}
              size="small"
            />
            <TextField
              label="Email Body (HTML)"
              fullWidth
              multiline
              rows={8}
              value={form.email_body_template}
              onChange={(e) => set("email_body_template", e.target.value)}
              size="small"
              inputProps={{ style: { fontFamily: "monospace", fontSize: "0.8rem" } }}
            />
          </Stack>
        )}

        {tab === 2 && (
          <TextField
            label="Chat Body"
            fullWidth
            multiline
            rows={3}
            value={form.chat_body_template}
            onChange={(e) => set("chat_body_template", e.target.value)}
            size="small"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={18} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationSettingsPage() {
  const [rules, setRules]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [audience, setAudience] = useState("admin");
  const [editing, setEditing]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotificationRules({ audience });
      setRules(res.data.rules || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load notification rules.");
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  // ── Quick-toggle a single boolean field inline ────────────────────────────
  const quickToggle = async (rule, field) => {
    const patch = { [field]: !rule[field] };
    try {
      await updateNotificationRule(rule.id, patch);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, ...patch } : r)));
    } catch (err) {
      await swalError("Error", err.response?.data?.error || err.message);
    }
  };

  const columns = [
    {
      id: "name",
      label: "Event",
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.event_key}</Typography>
        </Box>
      ),
    },
    {
      id: "enabled",
      label: "Status",
      render: (_, row) => (
        <Tooltip title="Click to toggle">
          <Box sx={{ cursor: "pointer" }} onClick={() => quickToggle(row, "enabled")}>
            <EnabledChip enabled={row.enabled} />
          </Box>
        </Tooltip>
      ),
    },
    {
      id: "channel_in_app",
      label: "Channels",
      render: (_, row) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          <Tooltip title="Toggle In-App">
            <Box onClick={() => quickToggle(row, "channel_in_app")} sx={{ cursor: "pointer" }}>
              <ChannelChip active={row.channel_in_app} icon={<InAppIcon sx={{ fontSize: 14 }} />} label="In-App" />
            </Box>
          </Tooltip>
          <Tooltip title="Toggle Email">
            <Box onClick={() => quickToggle(row, "channel_email")} sx={{ cursor: "pointer" }}>
              <ChannelChip active={row.channel_email} icon={<EmailIcon sx={{ fontSize: 14 }} />} label="Email" />
            </Box>
          </Tooltip>
          <Tooltip title="Toggle Chat">
            <Box onClick={() => quickToggle(row, "channel_chat")} sx={{ cursor: "pointer" }}>
              <ChannelChip active={row.channel_chat} icon={<ChatIcon sx={{ fontSize: 14 }} />} label="Chat" />
            </Box>
          </Tooltip>
        </Box>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (_, row) => (
        <Tooltip title="Edit templates">
          <IconButton size="small" onClick={() => setEditing(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <HeroPageSection
        title="Notification Settings"
        subtitle="Control which events trigger notifications, which channels they use, and customise the message templates."
      />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Audience tabs + refresh */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Tabs
            value={audience}
            onChange={(_, v) => setAudience(v)}
            sx={{ "& .MuiTab-root": { minHeight: 36, py: 0.5 } }}
          >
            {AUDIENCES.map((a) => (
              <Tab
                key={a.value}
                value={a.value}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {a.icon}{a.label}
                  </Box>
                }
              />
            ))}
          </Tabs>

          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={load}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>

        {/* Helper note */}
        <Alert severity="info" sx={{ mb: 2, fontSize: "0.8rem" }}>
          Click a channel chip to toggle it instantly. Click the edit icon to customise message templates.
          Templates support <strong>{"{{variable}}"}</strong> placeholders.
        </Alert>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={rules}
            searchPlaceholder="Search events…"
          />
        )}
      </Box>

      {editing && (
        <EditRuleDialog
          rule={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
}
