import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, CircularProgress, Alert, Button, Chip, TextField,
  MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, IconButton, InputAdornment,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ArrowForward as AdvanceIcon,
} from "@mui/icons-material";
import { crmGetContacts, crmGetContact, crmUpdateContact, crmAdvanceStage } from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";

const STAGES = ["VISITOR", "LEAD", "PROSPECT", "BOOKING_INTENT", "BOOKED", "REPEAT_CLIENT", "CHURNED"];

const STAGE_COLOR = {
  VISITOR: "default",
  LEAD: "primary",
  PROSPECT: "warning",
  BOOKING_INTENT: "secondary",
  BOOKED: "success",
  REPEAT_CLIENT: "info",
  CHURNED: "error",
};

function ContactDetailDialog({ contact, open, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contact) setNotes(contact.notes || "");
  }, [contact]);

  const handleSaveNotes = async () => {
    setSaving(true);
    setError(null);
    try {
      await crmUpdateContact(contact.id, { notes });
      onUpdated();
      onClose();
    } catch {
      setError("Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    setError(null);
    try {
      await crmAdvanceStage(contact.id, {});
      onUpdated();
      onClose();
    } catch {
      setError("Failed to advance stage.");
    } finally {
      setAdvancing(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Contact Details
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography>{contact.email || "—"}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Stage</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={contact.stage?.replace(/_/g, " ")}
                  color={STAGE_COLOR[contact.stage] || "default"}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {contact.name && (
            <Box>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography>{contact.name}</Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Source</Typography>
              <Typography>{contact.source || "—"}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Last seen</Typography>
              <Typography>
                {contact.last_seen_at
                  ? new Date(contact.last_seen_at).toLocaleDateString()
                  : "—"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="caption" color="text.secondary">Notes</Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 0.5 }}
              size="small"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button
          startIcon={<AdvanceIcon />}
          onClick={handleAdvance}
          disabled={advancing || contact.stage === "REPEAT_CLIENT"}
          color="secondary"
          variant="outlined"
          size="small"
        >
          {advancing ? "Advancing…" : "Advance Stage"}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button onClick={handleSaveNotes} disabled={saving} variant="contained" size="small">
          {saving ? "Saving…" : "Save Notes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CrmContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (stageFilter) params.stage = stageFilter;
      const res = await crmGetContacts(params);
      const payload = res.data?.data || res.data || {};
      setContacts(payload.contacts || payload.items || []);
    } catch {
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleRowClick = async (row) => {
    try {
      const res = await crmGetContact(row.id);
      setSelected(res.data?.data || res.data || row);
    } catch {
      setSelected(row);
    }
    setDialogOpen(true);
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
      id: "email",
      label: "Email",
      render: (v) => <Typography variant="body2">{v || "—"}</Typography>,
    },
    {
      id: "name",
      label: "Name",
      render: (v) => <Typography variant="body2">{v || "—"}</Typography>,
    },
    {
      id: "stage",
      label: "Stage",
      render: (v) => (
        <Chip
          label={(v || "VISITOR").replace(/_/g, " ")}
          color={STAGE_COLOR[v] || "default"}
          size="small"
        />
      ),
    },
    {
      id: "source",
      label: "Source",
      render: (v) => (
        <Typography variant="body2" color="text.secondary">
          {v || "—"}
        </Typography>
      ),
    },
    {
      id: "last_seen_at",
      label: "Last Seen",
      type: "datetime",
    },
  ];

  return (
    <Box>
      <HeroPageSection
        title="CRM Contacts"
        subtitle="All tracked visitors, leads, and clients"
      />

      <Box sx={{ p: 3 }}>
        {/* Toolbar */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search email or name…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Stage</InputLabel>
            <Select
              value={stageFilter}
              label="Stage"
              onChange={(e) => { setStageFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All stages</MenuItem>
              {STAGES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={fetchContacts}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <DataTable
          columns={columns}
          rows={contacts}
          loading={loading}
          onRowClick={handleRowClick}
        />

        <ContactDetailDialog
          contact={selected}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onUpdated={fetchContacts}
        />
      </Box>
    </Box>
  );
}
