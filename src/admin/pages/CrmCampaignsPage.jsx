import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Button, CircularProgress, Alert, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Grid,
  IconButton, Tabs, Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon,
  PlayArrow as PlayArrowIcon,
  Drafts as DraftsIcon,
  Visibility as VisibilityIcon,
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
import StatCard from "../components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";

const CAMPAIGN_TYPES = ["EMAIL", "SOCIAL", "PAID_ADS", "REFERRAL", "SEASONAL"];
const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

const STATUS_COLORS = {
  DRAFT: { bg: "#9e9e9e15", color: "#757575" },
  ACTIVE: { bg: "#4caf5015", color: "#4caf50" },
  PAUSED: { bg: "#ff980015", color: "#ff9800" },
  COMPLETED: { bg: "#2196f315", color: "#2196f3" },
  ARCHIVED: { bg: "#f4433615", color: "#f44336" },
};

const TYPE_COLORS = {
  EMAIL: { bg: "#2196f315", color: "#2196f3" },
  SOCIAL: { bg: "#9c27b015", color: "#9c27b0" },
  PAID_ADS: { bg: "#f58c0015", color: "#f58c00" },
  REFERRAL: { bg: "#4caf5015", color: "#4caf50" },
  SEASONAL: { bg: "#00bcd415", color: "#00bcd4" },
};

const STATUS_TABS = [
  { key: "all", label: "All", filter: () => true },
  { key: "active", label: "Active", filter: (c) => c.status === "ACTIVE" },
  { key: "draft", label: "Draft", filter: (c) => c.status === "DRAFT" },
  { key: "paused", label: "Paused", filter: (c) => c.status === "PAUSED" },
  { key: "completed", label: "Completed", filter: (c) => c.status === "COMPLETED" || c.status === "ARCHIVED" },
];

const EMPTY_FORM = {
  name: "",
  type: "EMAIL",
  status: "DRAFT",
  description: "",
  target_segment: "",
  start_date: "",
  end_date: "",
};

function parseCampaignList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.campaigns)) return payload.campaigns;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderStatusChip(status) {
  const s = status || "DRAFT";
  const colors = STATUS_COLORS[s] || { bg: "#e0e0e0", color: "#757575" };
  return (
    <Chip
      label={s.replace(/_/g, " ")}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 500, borderRadius: 0 }}
    />
  );
}

function renderTypeChip(type) {
  const colors = TYPE_COLORS[type] || { bg: "#84994f15", color: "#84994f" };
  return (
    <Chip
      label={type?.replace(/_/g, " ") || "—"}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 500, borderRadius: 0 }}
    />
  );
}

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isEdit ? "Edit Campaign" : "New Campaign"}
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          <TextField label="Campaign Name" value={form.name} onChange={set("name")} fullWidth required size="small" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} label="Type" onChange={set("type")}>
                  {CAMPAIGN_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, " ")}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Start Date" type="date" value={form.start_date} onChange={set("start_date")} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="End Date" type="date" value={form.end_date} onChange={set("end_date")} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained" size="small" sx={{ textTransform: "none" }}>
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
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
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>Close</Button>
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
  const [activeStatusTab, setActiveStatusTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");

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
        setCampaigns(parseCampaignList(p));
      } else {
        setError("Failed to load campaigns.");
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

  const summaryCounts = useMemo(() => {
    const impressions7d = (summary?.campaigns || []).reduce(
      (sum, c) => sum + (c.last_7_days?.impressions || 0),
      0
    );
    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "ACTIVE").length,
      draft: campaigns.filter((c) => c.status === "DRAFT").length,
      paused: campaigns.filter((c) => c.status === "PAUSED").length,
      impressions7d,
    };
  }, [campaigns, summary]);

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(STATUS_TABS[activeStatusTab].filter);
    if (typeFilter) {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }
    return filtered;
  }, [campaigns, activeStatusTab, typeFilter]);

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

  const essentialColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (_, __, n) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>{n}</Typography>
      ),
    },
    {
      id: "name",
      label: "Name",
      render: (v) => <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1f2e" }}>{v}</Typography>,
    },
    {
      id: "type",
      label: "Type",
      render: (v) => renderTypeChip(v),
    },
    {
      id: "status",
      label: "Status",
      width: 120,
      render: (v) => renderStatusChip(v),
    },
    {
      id: "start_date",
      label: "Start",
      width: 110,
      render: (v) => (
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {formatDate(v)}
        </Typography>
      ),
    },
    {
      id: "end_date",
      label: "End",
      width: 110,
      render: (v) => (
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {formatDate(v)}
        </Typography>
      ),
    },
  ];

  const allColumns = [
    ...essentialColumns,
    {
      id: "description",
      label: "Description",
      render: (v) => (
        <Typography variant="body2" sx={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {v || "—"}
        </Typography>
      ),
    },
    {
      id: "target_audience",
      label: "Target Audience",
      render: (v) => v || "—",
    },
    {
      id: "budget",
      label: "Budget",
      render: (v) => (v != null ? `£${parseFloat(v).toFixed(2)}` : "—"),
    },
    {
      id: "spent",
      label: "Spent",
      render: (v) => (v != null ? `£${parseFloat(v).toFixed(2)}` : "—"),
    },
    {
      id: "utm_campaign",
      label: "UTM Campaign",
      render: (v) => v || "—",
    },
    {
      id: "discount_code",
      label: "Discount Code",
      render: (v) =>
        v ? (
          <Chip label={v} size="small" sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 500, borderRadius: 0 }} />
        ) : (
          "—"
        ),
    },
    {
      id: "created_at",
      label: "Created",
      type: "datetime",
    },
  ];

  const renderDetails = (row, onClose, isOpen) => (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            {renderTypeChip(row.type)}
            {renderStatusChip(row.status)}
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {allColumns
            .filter((c) => c.id !== "row_number")
            .map((column) => (
              <Box key={column.id}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {column.label}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {column.render
                    ? column.render(row[column.id], row)
                    : row[column.id] ?? "—"}
                </Box>
              </Box>
            ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          size="small"
          startIcon={<BarChartIcon />}
          onClick={() => { onClose(); setPerfTarget(row); }}
          sx={{ textTransform: "none" }}
        >
          Performance
        </Button>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => { onClose(); setEditing(row); setFormOpen(true); }}
          sx={{ textTransform: "none" }}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => { onClose(); setDeleteTarget(row); }}
          sx={{ textTransform: "none" }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && campaigns.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="CRM Campaigns"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "CRM Campaigns" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Total Campaigns"
              value={summaryCounts.total.toString()}
              icon={CampaignIcon}
              color="#3b82f6"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Active"
              value={summaryCounts.active.toString()}
              icon={PlayArrowIcon}
              color="#4caf50"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Draft"
              value={summaryCounts.draft.toString()}
              icon={DraftsIcon}
              color="#9e9e9e"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Impressions (7d)"
              value={summaryCounts.impressions7d.toLocaleString()}
              icon={VisibilityIcon}
              color="#9c27b0"
              loading={loading}
            />
          </Grid>
        </Grid>
      </HeroPageSection>

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
          const count = campaigns.filter(tab.filter).length;
          return <Tab key={tab.key} label={`${tab.label} (${count})`} />;
        })}
      </Tabs>

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
          {typeFilter && (
            <Chip
              label={`Filtered: ${filteredCampaigns.length}`}
              sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
            />
          )}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
            >
              <MenuItem value="">All Types</MenuItem>
              {CAMPAIGN_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t.replace(/_/g, " ")}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setFormOpen(true); }}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            New Campaign
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={fetchAll}
            disabled={loading}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        essentialColumns={essentialColumns}
        allColumns={allColumns}
        rows={filteredCampaigns}
        loading={loading && campaigns.length === 0}
        searchPlaceholder="Search campaigns by name, type, status..."
        renderDetails={renderDetails}
        detailsActionIcon="more"
      />

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

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>Delete Campaign?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} size="small" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleDelete} disabled={deleting} color="error" variant="contained" size="small" sx={{ textTransform: "none" }}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
