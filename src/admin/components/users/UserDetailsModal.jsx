import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Event as EventIcon,
  CardGiftcard as GiftIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { adminGetUserById, adminUpdateUser, adminStartChatThread } from "../../../api/api";
import { resolveUserAvatarUrl } from "../../../utils/userAvatar";
import { swalSuccess } from "../../../utils/swal";

const BRAND = {
  green: "#84994f",
  greenDark: "#47672f",
  greenLight: "#a8b86d",
  greenMuted: "#84994f18",
};

const ACTION_BTN_SX = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.8125rem",
  whiteSpace: "nowrap",
  borderColor: BRAND.green,
  color: BRAND.greenDark,
  px: 1.75,
  minHeight: 36,
  "&:hover": { borderColor: BRAND.greenDark, bgcolor: BRAND.greenMuted },
};

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: 0 } };

const GENDER_OPTIONS = [
  { value: "", label: "— not specified —" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function DetailField({ label, value, children, fullWidth = false, styled = false }) {
  const content = children ?? (
    <Typography
      variant="body2"
      sx={{ color: "#1a1f2e", fontWeight: 700, fontSize: "0.875rem", wordBreak: "break-word", lineHeight: 1.45 }}
    >
      {value ?? "—"}
    </Typography>
  );

  return (
    <Box sx={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: styled ? BRAND.greenDark : "text.secondary",
          fontSize: "0.6875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={
          styled
            ? { py: 1.1, px: 1.35, bgcolor: BRAND.greenMuted, borderLeft: `3px solid ${BRAND.green}`, borderRadius: 0 }
            : { mt: 0.25 }
        }
      >
        {content}
      </Box>
    </Box>
  );
}

function SectionCard({ title, icon: SectionIcon, children, action }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "#fff",
        boxShadow: "0 1px 4px rgba(71, 103, 47, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mb: 2,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: BRAND.greenMuted,
        }}
      >
        <Box
          sx={{
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: BRAND.green, color: "#fff", borderRadius: 0, flexShrink: 0,
          }}
        >
          {React.createElement(SectionIcon, { sx: { fontSize: 18 } })}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark, letterSpacing: 0.3, flex: 1 }}>
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {children}
      </Box>
    </Paper>
  );
}

export default function UserDetailsModal({
  open,
  onClose,
  userId,
  listRow,
  onEmail,
  onToggleStatus,
}) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState(false);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchUser = () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    adminGetUserById(userId)
      .then((res) => {
        if (res.data?.success) {
          setDetail({
            user: res.data.user || res.data.data?.user,
            recent_bookings: res.data.data?.recent_bookings || [],
            recent_payments: res.data.data?.recent_payments || [],
          });
        } else setError("Failed to load user details.");
      })
      .catch(() => setError("Failed to load user details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !userId) {
      setDetail(null);
      setError("");
      setEditMode(false);
      setEditData({});
      setEditError("");
      return;
    }
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const handleStartEdit = () => {
    const u = detail?.user || listRow;
    setEditData({
      first_name:     u?.first_name    || "",
      last_name:      u?.last_name     || "",
      email:          u?.email         || "",
      phone:          u?.phone         || "",
      gender:         u?.gender        || "",
      date_of_birth:  u?.date_of_birth || "",
      address:        u?.address       || "",
      email_verified: u?.email_verified ?? Boolean(u?.email_verified_at),
      is_active:      u?.is_active     ?? true,
    });
    setEditError("");
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({});
    setEditError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setEditError("");
    try {
      const res = await adminUpdateUser(userId, editData);
      if (res.data?.success) {
        swalSuccess("Saved", "User profile updated successfully.");
        setEditMode(false);
        // Re-fetch to get fresh data
        fetchUser();
      } else {
        setEditError(res.data?.error || "Failed to save changes.");
      }
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartChat = async () => {
    if (!userId) return;
    setStartingChat(true);
    try {
      const res = await adminStartChatThread({ userId, channel: "rehoboth" });
      if (res.data?.success) {
        onClose();
        navigate(`/admin/live-chat?thread=${res.data.thread.id}`);
      }
    } catch {
      // fail silently
    } finally {
      setStartingChat(false);
    }
  };

  const user = detail?.user || listRow;
  if (!open) return null;

  const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Customer";
  const avatarSrc = user ? resolveUserAvatarUrl(user) : undefined;

  const field = (key) => ({
    value: editData[key] ?? "",
    onChange: (e) => setEditData((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <Dialog
      open={open}
      onClose={editMode ? undefined : onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden", maxHeight: "92vh" } }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          background: `linear-gradient(135deg, ${BRAND.greenDark} 0%, ${BRAND.green} 55%, ${BRAND.greenLight} 100%)`,
          color: "#fff",
          position: "relative",
        }}
      >
        {!editMode && (
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close"
            sx={{
              position: "absolute", top: 12, right: 12,
              color: "rgba(255,255,255,0.85)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", pr: 4 }}>
          <Avatar
            src={avatarSrc}
            alt={name}
            sx={{ width: 56, height: 56, borderRadius: 1, bgcolor: "secondary.main", flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>
              Customer
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.25 }}>
              {editMode
                ? `${editData.first_name || ""} ${editData.last_name || ""}`.trim() || name
                : name}
            </Typography>
            {user?.email && !editMode && (
              <Typography
                component="a"
                href={`mailto:${user.email}`}
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", display: "block" }}
              >
                {user.email}
              </Typography>
            )}
            {editMode && (
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {editData.email}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              <Chip
                label={(editMode ? editData.is_active : user?.is_active) ? "Active" : "Inactive"}
                size="small"
                sx={{
                  bgcolor: (editMode ? editData.is_active : user?.is_active)
                    ? "rgba(76,175,80,0.25)" : "rgba(158,158,158,0.35)",
                  color: "#fff", fontWeight: 600, borderRadius: 0,
                }}
              />
              <Chip
                label={(editMode ? editData.email_verified : (user?.email_verified ?? Boolean(user?.email_verified_at))) ? "Email verified" : "Unverified"}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600, borderRadius: 0 }}
              />
              {editMode && (
                <Chip label="Editing…" size="small" sx={{ bgcolor: "#f59e0b44", color: "#fff", fontWeight: 600, borderRadius: 0 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Quick summary strip */}
        {!editMode && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
              mt: 2.5,
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {[
              { label: "Phone",  value: user?.phone || "—" },
              { label: "Joined", value: user?.created_at ? formatDate(user.created_at) : "—" },
              { label: "Gender", value: user?.gender ? user.gender.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—" },
            ].map((item) => (
              <Box key={item.label} sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", display: "block" }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff", fontSize: "0.8125rem" }} noWrap>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f4f5f7" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} sx={{ color: BRAND.green }} />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>
        )}

        {!loading && user && (
          <Grid container spacing={2}>
            {/* Profile section — view or edit */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Profile"
                icon={PersonIcon}
                action={
                  !editMode ? (
                    <Button
                      size="small"
                      startIcon={<EditIcon sx={{ fontSize: "0.875rem" }} />}
                      onClick={handleStartEdit}
                      sx={{ ...ACTION_BTN_SX, bgcolor: "#fff", fontSize: "0.75rem", px: 1.25, minHeight: 30 }}
                      variant="outlined"
                    >
                      Edit
                    </Button>
                  ) : null
                }
              >
                {editMode ? (
                  /* ── Edit form ── */
                  <>
                    {editError && (
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        <Alert severity="error" sx={{ borderRadius: 0, mb: 1 }}>{editError}</Alert>
                      </Box>
                    )}

                    <TextField label="First Name" size="small" fullWidth sx={FIELD_SX} {...field("first_name")} />
                    <TextField label="Last Name"  size="small" fullWidth sx={FIELD_SX} {...field("last_name")} />

                    {/* Email — full width */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                      <TextField
                        label="Email"
                        size="small"
                        fullWidth
                        type="email"
                        sx={FIELD_SX}
                        {...field("email")}
                        helperText="Changing the email updates the login address."
                      />
                    </Box>

                    <TextField label="Phone" size="small" fullWidth sx={FIELD_SX} {...field("phone")} />

                    <TextField
                      label="Gender"
                      size="small"
                      fullWidth
                      select
                      sx={FIELD_SX}
                      value={editData.gender || ""}
                      onChange={(e) => setEditData((prev) => ({ ...prev, gender: e.target.value }))}
                    >
                      {GENDER_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Date of Birth"
                      size="small"
                      fullWidth
                      type="date"
                      sx={FIELD_SX}
                      InputLabelProps={{ shrink: true }}
                      {...field("date_of_birth")}
                    />

                    {/* Address — full width */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                      <TextField
                        label="Address"
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        sx={FIELD_SX}
                        {...field("address")}
                      />
                    </Box>

                    {/* Toggles */}
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editData.email_verified}
                            onChange={(e) => setEditData((prev) => ({ ...prev, email_verified: e.target.checked }))}
                            color="success"
                            size="small"
                          />
                        }
                        label={<Typography fontSize="0.8125rem">Email verified</Typography>}
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editData.is_active}
                            onChange={(e) => setEditData((prev) => ({ ...prev, is_active: e.target.checked }))}
                            color="success"
                            size="small"
                          />
                        }
                        label={<Typography fontSize="0.8125rem">Account active</Typography>}
                      />
                    </Box>

                    {/* Save / Cancel */}
                    <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, mt: 0.5 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ borderRadius: 0, textTransform: "none", bgcolor: BRAND.greenDark, "&:hover": { bgcolor: "#2d3d1f" } }}
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                        disabled={saving}
                        sx={{ borderRadius: 0, textTransform: "none", borderColor: BRAND.green, color: BRAND.greenDark }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  /* ── View mode ── */
                  <>
                    <DetailField styled label="Phone"         value={user.phone} />
                    <DetailField styled label="Gender"        value={user.gender?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} />
                    <DetailField styled label="Date of birth" value={formatDate(user.date_of_birth)} />
                    <DetailField styled label="Joined"        value={formatDateTime(user.created_at)} />
                    <DetailField styled label="Address"       value={user.address} fullWidth />
                  </>
                )}
              </SectionCard>
            </Grid>

            {/* Recent appointments */}
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Recent appointments" icon={EventIcon}>
                {(detail?.recentAppointments || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
                    No appointments yet.
                  </Typography>
                ) : (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    {(detail?.recentAppointments || []).slice(0, 5).map((a) => (
                      <Box key={a.id} sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" fontWeight={600}>{a.service || "Appointment"}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(a.date)}{a.time ? ` · ${a.time}` : ""} · {a.status}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>

            {/* Recent vouchers */}
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Recent vouchers" icon={GiftIcon}>
                {(detail?.recentVouchers || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
                    No vouchers yet.
                  </Typography>
                ) : (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    {(detail?.recentVouchers || []).slice(0, 5).map((v) => (
                      <Box key={v.id} sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {v.vouchers?.title || v.code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {v.code} · {v.status}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        )}

        {/* Admin actions */}
        {!loading && user && !editMode && (
          <Paper
            elevation={0}
            sx={{
              mt: 2.5, p: 2.5,
              border: "2px solid", borderColor: BRAND.greenLight,
              borderRadius: 1, bgcolor: BRAND.greenMuted,
            }}
          >
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                mb: 2, pb: 1.5, borderBottom: "1px solid", borderColor: "rgba(132, 153, 79, 0.25)",
              }}
            >
              <Box sx={{ width: 8, height: 8, bgcolor: "#f58c00", borderRadius: "50%", flexShrink: 0 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
                Admin actions
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: { xs: "nowrap", sm: "wrap" },
                gap: 1,
                alignItems: "stretch",
                "& .MuiButton-root": {
                  ...ACTION_BTN_SX,
                  width: { xs: "100%", sm: "auto" },
                  bgcolor: "#fff",
                },
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={startingChat ? <CircularProgress size={14} /> : <ChatIcon />}
                onClick={handleStartChat}
                disabled={startingChat}
              >
                Chat
              </Button>
              {user.email && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EmailIcon />}
                  onClick={() => onEmail?.(user)}
                >
                  Email customer
                </Button>
              )}
              {user.phone && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhoneIcon />}
                  component="a"
                  href={`tel:${user.phone}`}
                >
                  Call
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                color={user.is_active ? "error" : "success"}
                startIcon={user.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                onClick={() => onToggleStatus?.(user)}
                sx={{ ...ACTION_BTN_SX, borderColor: "currentcolor", bgcolor: "#fff !important" }}
              >
                {user.is_active ? "Deactivate" : "Activate"}
              </Button>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
        {editMode ? (
          <Button
            onClick={handleCancelEdit}
            disabled={saving}
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Cancel editing
          </Button>
        ) : (
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              borderRadius: 1, textTransform: "none", fontSize: "0.875rem", px: 3,
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
