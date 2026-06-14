import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Switch, FormControlLabel,
  Button, CircularProgress, Alert, Divider, Grid,
  TextField, MenuItem, InputAdornment,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { adminGetReferralSettings, adminUpdateReferralSettings } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import HeroPageSection from "../../components/sections/HeroPageSection";

const REWARD_TYPES = [
  { value: "percent", label: "Percentage discount (e.g. 5% off any service)" },
  { value: "amount",  label: "Fixed £ amount off (e.g. £10 off)" },
  { value: "credit",  label: "Spendable credit balance (e.g. £15 credit)" },
];

const DEFAULTS = {
  enabled: true,
  reward_type: "percent",
  reward_value: 5,
  friend_reward_enabled: false,
  friend_reward_type: "percent",
  friend_reward_value: 5,
  require_completed_appt: true,
  min_appointment_amount: 0,
  reward_expiry_days: 90,
  block_self_referral: true,
  one_reward_per_friend: true,
  terms_text: "",
};

function SectionHeader({ title, subtitle }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1a1f2e" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function ReferralSettingsPage() {
  const [form, setForm]       = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminGetReferralSettings();
      if (res.data?.success && res.data.settings) {
        setForm({ ...DEFAULTS, ...res.data.settings });
      }
    } catch {
      setError("Failed to load referral settings.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminUpdateReferralSettings(form);
      if (res.data?.success) {
        setForm({ ...DEFAULTS, ...res.data.settings });
        swalSuccess("Saved", "Referral programme settings updated.");
      } else {
        swalError("Error", res.data?.error || "Failed to save settings.");
      }
    } catch (err) {
      swalError("Error", err.response?.data?.error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const rewardValueAdornment = form.reward_type === "percent" ? "%" : "£";
  const friendValueAdornment = form.friend_reward_type === "percent" ? "%" : "£";

  return (
    <Box sx={{ px: { xs: 0, md: 0 } }}>
      <HeroPageSection
        title="Referral Programme"
        breadcrumb={[
          { label: "Home",  link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Referral Settings" },
        ]}
        borderRadius={true}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
          disabled={loading}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: 0, textTransform: "none", bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }}
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── Programme toggle ── */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ borderRadius: 0, p: 3 }}>
            <SectionHeader
              title="Programme Status"
              subtitle="Enable or disable the entire referral programme."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.enabled}
                  onChange={(e) => set("enabled", e.target.checked)}
                  color="secondary"
                />
              }
              label={form.enabled ? "Programme enabled" : "Programme disabled"}
            />
          </Paper>
        </Grid>

        {/* ── Referrer reward ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ borderRadius: 0, p: 3, height: "100%" }}>
            <SectionHeader
              title="Referrer Reward"
              subtitle="The reward issued to the existing customer who referred a friend."
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                select
                label="Reward type"
                value={form.reward_type}
                onChange={(e) => set("reward_type", e.target.value)}
                fullWidth
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              >
                {REWARD_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                label={form.reward_type === "percent" ? "Discount (%)" : "Amount (£)"}
                type="number"
                value={form.reward_value}
                onChange={(e) => set("reward_value", e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{rewardValueAdornment}</InputAdornment>,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <TextField
                label="Reward valid for (days)"
                type="number"
                value={form.reward_expiry_days}
                onChange={(e) => set("reward_expiry_days", e.target.value)}
                fullWidth
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* ── Friend reward ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ borderRadius: 0, p: 3, height: "100%" }}>
            <SectionHeader
              title="Friend Welcome Reward (optional)"
              subtitle="Issue a reward to the referred friend when they sign up or complete their first booking."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.friend_reward_enabled}
                  onChange={(e) => set("friend_reward_enabled", e.target.checked)}
                  color="secondary"
                />
              }
              label="Enable friend welcome reward"
              sx={{ mb: 2 }}
            />
            {form.friend_reward_enabled && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  select
                  label="Friend reward type"
                  value={form.friend_reward_type}
                  onChange={(e) => set("friend_reward_type", e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                >
                  {REWARD_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  label={form.friend_reward_type === "percent" ? "Discount (%)" : "Amount (£)"}
                  type="number"
                  value={form.friend_reward_value}
                  onChange={(e) => set("friend_reward_value", e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{friendValueAdornment}</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ── Qualification rules ── */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ borderRadius: 0, p: 3 }}>
            <SectionHeader
              title="Qualification Rules"
              subtitle="Conditions the referred friend must meet before the referrer is rewarded."
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!form.require_completed_appt}
                      onChange={(e) => set("require_completed_appt", e.target.checked)}
                      color="secondary"
                    />
                  }
                  label="Friend must complete at least one paid appointment"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Minimum appointment value (£)"
                  type="number"
                  value={form.min_appointment_amount}
                  onChange={(e) => set("min_appointment_amount", e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Set to 0 for no minimum"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ── Guard rails ── */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ borderRadius: 0, p: 3 }}>
            <SectionHeader title="Guard Rails" subtitle="Prevent abuse and duplicate rewards." />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.block_self_referral}
                    onChange={(e) => set("block_self_referral", e.target.checked)}
                    color="secondary"
                  />
                }
                label="Block self-referral (same user cannot refer themselves)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.one_reward_per_friend}
                    onChange={(e) => set("one_reward_per_friend", e.target.checked)}
                    color="secondary"
                  />
                }
                label="One reward per referred friend"
              />
            </Box>
          </Paper>
        </Grid>

        {/* ── Terms text ── */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ borderRadius: 0, p: 3 }}>
            <SectionHeader title="Terms & Conditions" subtitle="Displayed on the Refer a Friend page." />
            <TextField
              label="Terms text (optional)"
              multiline
              minRows={3}
              fullWidth
              value={form.terms_text || ""}
              onChange={(e) => set("terms_text", e.target.value)}
              placeholder="e.g. Reward vouchers are issued after your friend completes their first paid appointment…"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
