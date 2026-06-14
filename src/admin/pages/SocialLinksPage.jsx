import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import HeroPageSection from "../../components/sections/HeroPageSection";
import {
  getSocialLinksAdmin,
  createSocialLinkAdmin,
  updateSocialLinkAdmin,
  deleteSocialLinkAdmin,
  getSocialLinkIconTypes,
} from "../../api/api";
import { swalSuccess, swalError, swalConfirm, ensureSweetAlertReady } from "../../utils/swal";
import DataTable from "../components/DataTable";

const emptyForm = {
  label: "",
  url: "",
  icon_type: "Instagram",
  image_url: "",
  invert_logo: false,
  display_order: 0,
  is_active: true,
};

export default function SocialLinksPage() {
  const [links, setLinks] = useState([]);
  const [iconTypes, setIconTypes] = useState([
    "Instagram", "Facebook", "LinkedIn", "Twitter", "YouTube", "Faces", "Custom",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSocialLinksAdmin();
      if (res.data?.success) {
        setLinks(res.data.socialLinks || []);
      } else {
        setError(res.data?.error || "Failed to load social links");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load social links. Run create_social_links_table.sql in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    getSocialLinkIconTypes()
      .then((res) => { if (res.data?.iconTypes) setIconTypes(res.data.iconTypes); })
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: links.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      label: row.label || "",
      url: row.url || "",
      icon_type: row.icon_type || "Custom",
      image_url: row.image_url || "",
      invert_logo: Boolean(row.invert_logo),
      display_order: row.display_order ?? 0,
      is_active: row.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.url.trim()) {
      await swalError("Validation", "Label and URL are required");
      return;
    }
    try {
      setSaving(true);
      await ensureSweetAlertReady();
      const payload = {
        label: form.label.trim(),
        url: form.url.trim(),
        icon_type: form.icon_type,
        image_url: form.image_url.trim() || null,
        invert_logo: form.invert_logo,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      };
      const res = editingId
        ? await updateSocialLinkAdmin(editingId, payload)
        : await createSocialLinkAdmin(payload);

      if (res.data?.success) {
        await swalSuccess("Saved", editingId ? "Social link updated" : "Social link created");
        setDialogOpen(false);
        fetchLinks();
      } else {
        await swalError("Error", res.data?.error || "Save failed");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = await swalConfirm("Delete social link?", `Remove "${row.label}" from the footer?`);
    if (!ok?.isConfirmed) return;
    try {
      const res = await deleteSocialLinkAdmin(row.id);
      if (res.data?.success) {
        await swalSuccess("Deleted", "Social link removed");
        fetchLinks();
      } else {
        await swalError("Error", res.data?.error || "Delete failed");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || "Delete failed");
    }
  };

  const needsImage = form.icon_type === "Faces" || form.icon_type === "Custom";

  const columns = [
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
      id: "display_order",
      label: "Order",
      width: 80,
      align: "center",
      render: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
          <DragIcon sx={{ fontSize: 16, color: "text.disabled" }} />
          <Typography variant="body2" fontWeight={500}>{value}</Typography>
        </Box>
      ),
    },
    {
      id: "label",
      label: "Label",
      render: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {row.image_url && (
            <Box
              component="img"
              src={row.image_url}
              alt={value}
              sx={{
                width: 32, height: 32, objectFit: "contain",
                borderRadius: 0.5, border: "1px solid", borderColor: "divider",
                bgcolor: "#f9fafb", p: 0.25,
                filter: row.invert_logo ? "invert(1)" : "none",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: "#1a1f2e" }}>
              {value}
            </Typography>
            <Chip
              label={row.icon_type}
              size="small"
              sx={{ fontSize: "0.68rem", height: 18, borderRadius: 0, mt: 0.25 }}
            />
          </Box>
        </Box>
      ),
    },
    {
      id: "url",
      label: "URL",
      render: (value) => (
        <Typography
          component="a"
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          onClick={(e) => e.stopPropagation()}
          sx={{
            color: "secondary.dark",
            textDecoration: "none",
            wordBreak: "break-all",
            fontSize: "0.8125rem",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "is_active",
      label: "Status",
      width: 100,
      render: (value) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          size="small"
          sx={
            value
              ? { backgroundColor: "#4caf5015", color: "#4caf50", fontWeight: 500, borderRadius: 0 }
              : { backgroundColor: "#9e9e9e15", color: "#9e9e9e", fontWeight: 500, borderRadius: 0 }
          }
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      width: 120,
      align: "right",
      render: (value, row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: "primary.main" }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(row)} sx={{ color: "error.main" }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <HeroPageSection
        title="Social Links"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Social Links" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Manage footer and contact page social icons. Changes appear on the public site immediately.
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={fetchLinks}
              disabled={loading}
              sx={{ borderRadius: 0, textTransform: "none" }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{
                borderRadius: 0, textTransform: "none",
                bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" },
              }}
            >
              Add Link
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

        <DataTable
          columns={columns}
          rows={links}
          loading={loading && links.length === 0}
          searchable={false}
        />
      </Box>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Edit Social Link" : "Add Social Link"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Label (accessibility / tooltip)"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              fullWidth
              required
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="URL"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              fullWidth
              required
              placeholder="https://..."
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: "action.disabled" }} /> }}
            />
            <TextField
              select
              label="Icon type"
              value={form.icon_type}
              onChange={(e) => setForm((f) => ({ ...f, icon_type: e.target.value }))}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            >
              {iconTypes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            {needsImage && (
              <TextField
                label="Image URL (for Faces / Custom)"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                fullWidth
                placeholder="/faces-business.png or https://..."
                helperText="Use /faces-business.png for site public folder, or a full image URL"
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            )}
            <TextField
              label="Display order"
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            {needsImage && (
              <FormControlLabel
                control={
                  <Switch
                    checked={form.invert_logo}
                    onChange={(e) => setForm((f) => ({ ...f, invert_logo: e.target.checked }))}
                    color="secondary"
                  />
                }
                label="Invert logo (black on light footer)"
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  color="secondary"
                />
              }
              label="Active (show on website)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: "none", borderRadius: 0,
              bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" },
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
