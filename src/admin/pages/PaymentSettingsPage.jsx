import React, { useState, useEffect } from "react";
import {
  Box, Typography, Switch, FormControlLabel, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Chip, CircularProgress, Avatar, Alert,
} from "@mui/material";
import { Edit, Delete, Add, DragIndicator, CreditCard } from "@mui/icons-material";
import HeroPageSection from "../../components/sections/HeroPageSection";
import {
  adminGetPaymentMethods,
  adminCreatePaymentMethod,
  adminUpdatePaymentMethod,
  adminDeletePaymentMethod,
} from "../../api/api";
import { swalConfirm, swalError, swalSuccess } from "../../utils/swal";

import stripeLogo from "../../assets/payments/stripe.svg";
import paypalLogo from "../../assets/payments/paypal.svg";
import sumupLogo from "../../assets/payments/sumup.svg";

const BUNDLED_LOGOS = { stripe: stripeLogo, paypal: paypalLogo, sumup: sumupLogo };
const GATEWAY_TYPES = ["stripe", "paypal", "sumup", "manual"];

const GATEWAY_COLORS = {
  stripe:  "#635BFF",
  paypal:  "#003087",
  sumup:   "#00d478",
  manual:  "#84994f",
};

function isMethodEnabled(method) {
  return method?.enabled === true || method?.enabled === "true" || method?.enabled === 1;
}

function normalizePaymentMethod(method) {
  return { ...method, enabled: isMethodEnabled(method) };
}

function GatewayLogo({ method }) {
  const logo = method.logo_url || BUNDLED_LOGOS[method.slug];
  if (logo) {
    return (
      <Box
        component="img"
        src={logo}
        alt={method.display_name}
        sx={{ height: 32, width: "auto", maxWidth: 80, objectFit: "contain" }}
      />
    );
  }
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: GATEWAY_COLORS[method.gateway_type] || "#84994f" }}>
      <CreditCard sx={{ fontSize: 20, color: "#fff" }} />
    </Avatar>
  );
}

function MethodDialog({ open, method, onClose, onSave, saving }) {
  const isEdit = Boolean(method?.id);
  const [form, setForm] = useState({
    slug: "", display_name: "", helper_text: "", gateway_type: "stripe",
    enabled: true, sort_order: 99, logo_url: "", config: "",
  });

  useEffect(() => {
    if (method) {
      setForm({
        slug: method.slug || "",
        display_name: method.display_name || "",
        helper_text: method.helper_text || "",
        gateway_type: method.gateway_type || "stripe",
        enabled: method.enabled !== false,
        sort_order: method.sort_order ?? 99,
        logo_url: method.logo_url || "",
        config: method.config ? JSON.stringify(method.config, null, 2) : "",
      });
    } else {
      setForm({ slug: "", display_name: "", helper_text: "", gateway_type: "stripe", enabled: true, sort_order: 99, logo_url: "", config: "" });
    }
  }, [method, open]);

  const handleSave = () => {
    let config = {};
    if (form.config.trim()) {
      try { config = JSON.parse(form.config); } catch { config = {}; }
    }
    onSave({ ...form, config });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 0 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        {!isEdit && (
          <TextField
            label="Slug (unique ID)"
            placeholder="e.g. bank_transfer"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
            size="small"
            fullWidth
            helperText="Cannot be changed after creation"
          />
        )}
        <TextField
          label="Display name"
          value={form.display_name}
          onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="Helper text"
          placeholder="Shown below the logo"
          value={form.helper_text}
          onChange={(e) => setForm((p) => ({ ...p, helper_text: e.target.value }))}
          size="small"
          fullWidth
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            select
            label="Gateway type"
            value={form.gateway_type}
            onChange={(e) => setForm((p) => ({ ...p, gateway_type: e.target.value }))}
            size="small"
            sx={{ flex: 1 }}
            SelectProps={{ native: true }}
            disabled={isEdit}
          >
            {GATEWAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </TextField>
          <TextField
            label="Sort order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
            size="small"
            sx={{ width: 110 }}
          />
        </Box>
        <TextField
          label="Logo URL (optional)"
          placeholder="Leave blank to use bundled logo"
          value={form.logo_url}
          onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="Config JSON (optional)"
          placeholder='{"bank_name": "Lloyds", "account_number": "..."}'
          value={form.config}
          onChange={(e) => setForm((p) => ({ ...p, config: e.target.value }))}
          size="small"
          fullWidth
          multiline
          minRows={3}
          helperText="Extra config stored for this gateway (e.g. bank details for manual)"
        />
        <FormControlLabel
          control={<Switch checked={form.enabled} onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked })) } color="secondary" />}
          label="Enabled"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="secondary" disableElevation disabled={saving}>
          {saving ? <CircularProgress size={18} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PaymentSettingsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await adminGetPaymentMethods();
      if (!res.data?.success) {
        setMethods([]);
        setLoadError(res.data?.error || "Failed to load payment methods.");
        return;
      }
      setMethods((res.data.methods || []).map(normalizePaymentMethod));
    } catch (err) {
      setMethods([]);
      setLoadError(err.response?.data?.error || err.message || "Failed to load payment methods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (method) => {
    setTogglingId(method.id);
    try {
      await adminUpdatePaymentMethod(method.id, { enabled: !method.enabled });
      setMethods((prev) => prev.map((m) => m.id === method.id ? { ...m, enabled: !m.enabled } : m));
    } catch {
      await swalError("Error", "Failed to update payment method.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingMethod?.id) {
        await adminUpdatePaymentMethod(editingMethod.id, data);
      } else {
        await adminCreatePaymentMethod(data);
      }
      await load();
      setDialogOpen(false);
      setEditingMethod(null);
      await swalSuccess("Saved", "Payment method saved successfully.");
    } catch (err) {
      await swalError("Error", err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (method) => {
    const confirmed = await swalConfirm(
      "Delete payment method?",
      `"${method.display_name}" will be removed. This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await adminDeletePaymentMethod(method.id);
      setMethods((prev) => prev.filter((m) => m.id !== method.id));
    } catch {
      await swalError("Error", "Failed to delete payment method.");
    }
  };

  const enabledCount = methods.filter(isMethodEnabled).length;

  return (
    <Box sx={{ pb: 6 }}>
      <HeroPageSection
        title="Payment Settings"
        subtitle="Control which payment gateways are available to customers"
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {enabledCount} of {methods.length} enabled
          </Typography>
          {methods.length > 0 && enabledCount === 0 && (
            <Chip label="No active payment methods" color="error" size="small" sx={{ fontWeight: 600 }} />
          )}
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          color="secondary"
          disableElevation
          onClick={() => { setEditingMethod(null); setDialogOpen(true); }}
          sx={{ borderRadius: 0 }}
        >
          Add Method
        </Button>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {loadError}
        </Alert>
      )}

      {methods.length > 0 && enabledCount === 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
          Stripe and PayPal are listed but turned off. Use the switches on the right to enable them so customers can check out.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {methods.map((method) => {
            const isToggling = togglingId === method.id;

            return (
              <Box
                key={method.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2.5,
                  bgcolor: "#fff",
                  border: "1px solid",
                  borderColor: method.enabled ? "secondary.light" : "divider",
                  borderLeft: "4px solid",
                  borderLeftColor: method.enabled ? "secondary.main" : "divider",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Drag handle placeholder */}
                <DragIndicator sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />

                {/* Logo */}
                <Box sx={{ width: 80, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  <GatewayLogo method={method} />
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography fontWeight={700} fontSize="0.95rem">{method.display_name}</Typography>
                    <Chip
                      label={method.gateway_type}
                      size="small"
                      sx={{
                        height: 18, fontSize: "0.65rem", fontWeight: 700,
                        bgcolor: `${GATEWAY_COLORS[method.gateway_type] || "#84994f"}20`,
                        color: GATEWAY_COLORS[method.gateway_type] || "#84994f",
                      }}
                    />
                    <Chip label={`#${method.sort_order}`} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                  </Box>
                  <Typography fontSize="0.8rem" color="text.secondary">{method.helper_text || "—"}</Typography>
                  <Typography fontSize="0.72rem" color="text.disabled" sx={{ mt: 0.25 }}>slug: {method.slug}</Typography>
                </Box>

                {/* Toggle */}
                <Box sx={{ flexShrink: 0 }}>
                  {isToggling ? (
                    <CircularProgress size={20} color="secondary" />
                  ) : (
                    <Tooltip title={method.enabled ? "Disable" : "Enable"}>
                      <Switch
                        checked={method.enabled}
                        onChange={() => handleToggle(method)}
                        color="secondary"
                        size="small"
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => { setEditingMethod(method); setDialogOpen(true); }}
                    >
                      <Edit sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(method)}>
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}

          {methods.length === 0 && (
            <Typography color="text.disabled" textAlign="center" sx={{ py: 6 }}>
              No payment methods configured. Add one to get started.
            </Typography>
          )}
        </Box>
      )}

      <MethodDialog
        open={dialogOpen}
        method={editingMethod}
        onClose={() => { setDialogOpen(false); setEditingMethod(null); }}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}
