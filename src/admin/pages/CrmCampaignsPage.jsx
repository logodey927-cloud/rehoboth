import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, CircularProgress, Alert, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Grid, Paper,
  IconButton, Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  campaignList,
  campaignCreate,
  campaignUpdate,
  campaignDelete,
  campaignGetSummary,
  campaignGetPerformance,
} from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";

const CAMPAIGN_TYPES = ["EMAIL", "SMS", "PUSH", "SOCIAL", "IN_APP"];
const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];
const STATUS_COLOR = {
  DRAFT: "default",
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "info",
  CANCELLED: "error",
};

const EMPTY_FORM = {
  name: "",
  type: "EMAIL",
  status: "DRAFT",
  description: "",
  target_segment: "",
  start_date: "",
  end_date: "",
};

function CampaignFormDialog({ open, onClose, initial, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
    setError(null);
  }, [initial, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await campaignUpdate(initial.id, form);
      } else {
        await campaignCreate(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save campaign.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isEdit ? "Edit Campaign" : "New Campaign"}
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          <TextField label="Campaign Name" value={form.name} onChange={set("name")} fullWidth required size="small" />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} label="Type" onChange={set("type")}>
                  {CAMPAIGN_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={set("status")}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField label="Description" value={form.description} onChange={set("description")} fullWidth multiline rows={2} size="small" />
          <TextField label="Target Segment" value={form.target_segment} onChange={set("target_segment")} fullWidth size="small" placeholder="e.g. all_leads, repeat_clients" />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="Start Date" type="date" value={form.start_date} onChange={set("start_date")} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="End Date" type="date" value={form.end_date} onChange={set("end_date")} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained" size="small">
          {saving ? "Saving…" : isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PerformanceDialog({ open, onClose, campaign }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && campaign?.id) {
      setLoading(true);
      campaignGetPerformance(campaign.id, {})
        .then((r) => setData(r.data?.data || r.data || {}))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [open, campaign]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Performance — {campaign?.name}
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {Object.entries(data).map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  {k.replace(/_/g, " ")}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {typeof v === "number" ? v.toLocaleString() : String(v ?? "—")}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" variant="body2">No performance data available.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CrmCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [perfTarget, setPerfTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.allSettled([
        campaignList({ limit: 100 }),
        campaignGetSummary(),
      ]);
      if (listRes.status === "fulfilled") {
        const p = listRes.value.data?.data || listRes.value.data || {};
        setCampaigns(p.campaigns || p.items || (Array.isArray(p) ? p : []));
      }
      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.data?.data || summaryRes.value.data || null);
      }
    } catch {
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await campaignDelete(deleteTarget.id);
      setDeleteTarget(null);
      fetchAll();
    } catch {
      setError("Failed to delete campaign.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      id: "row_number",
      label: "#",
      width: 50,
      align: "center",
      render: (_, __, n) => <Typography variant="body2" textAlign="center">{n}</Typography>,
    },
    {
      id: "name",
      label: "Name",
      render: (v) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{v}</Typography>,
    },
    {
      id: "type",
      label: "Type",
      render: (v) => <Chip label={v} size="small" variant="outlined" />,
    },
    {
      id: "status",
      label: "Status",
      render: (v) => (
        <Chip label={v} size="small" color={STATUS_COLOR[v] || "default"} />
      ),
    },
    {
      id: "start_date",
      label: "Start",
      render: (v) => (
        <Typography variant="body2" color="text.secondary">
          {v ? new Date(v).toLocaleDateString() : "—"}
        </Typography>
      ),
    },
    {
      id: "end_date",
      label: "End",
      render: (v) => (
        <Typography variant="body2" color="text.secondary">
          {v ? new Date(v).toLocaleDateString() : "—"}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Performance">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPerfTarget(row); }}>
              <BarChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditing(row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const summaryCards = summary
    ? [
        { label: "Total Campaigns", value: summary.total ?? summary.totalCampaigns },
        { label: "Active", value: summary.active ?? summary.activeCampaigns },
        { label: "Completed", value: summary.completed ?? summary.completedCampaigns },
        { label: "Total Sends", value: summary.totalSends?.toLocaleString() },
      ]
    : [];

  return (
    <Box>
      <HeroPageSection
        title="CRM Campaigns"
        subtitle="Manage marketing campaigns and track performance"
      />

      <Box sx={{ p: 3 }}>
        {summaryCards.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {summaryCards.map((c) => (
              <Grid item xs={6} md={3} key={c.label}>
                <Paper
                  elevation={0}
                  sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{c.value ?? "—"}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            All Campaigns
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={fetchAll}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => { setEditing(null); setFormOpen(true); }}
            >
              New Campaign
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <DataTable columns={columns} rows={campaigns} loading={loading} />

        <CampaignFormDialog
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          initial={editing}
          onSaved={fetchAll}
        />

        <PerformanceDialog
          open={Boolean(perfTarget)}
          onClose={() => setPerfTarget(null)}
          campaign={perfTarget}
        />

        {/* Delete confirmation */}
        <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs">
          <DialogTitle>Delete Campaign?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)} size="small">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} color="error" variant="contained" size="small">
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
