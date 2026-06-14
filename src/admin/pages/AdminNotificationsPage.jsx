import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Paper, Checkbox, Button, FormControlLabel,
  Chip, CircularProgress, Divider, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import {
  NotificationsNone, DoneAll, DeleteOutline, Refresh, OpenInNew,
  Notifications, Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAdminNotification,
  deleteAdminNotificationsBulk,
} from "../../api/api";

const TYPE_COLORS = {
  "user.registered":      "#4caf50",
  "user.logged_in":       "#00897b",
  "booking.created":      "#2196f3",
  "booking.bank_proof":   "#ff9800",
  "voucher.purchased":    "#9c27b0",
  "contact.received":     "#607d8b",
  "review.submitted":     "#e65100",
  "chat.human_requested": "#1565c0",
  "payment.failed":       "#c62828",
  new_registration:       "#4caf50",
  new_booking:            "#2196f3",
  new_voucher_purchase:   "#9c27b0",
  bank_transfer_proof:    "#ff9800",
  contact_message:        "#607d8b",
  new_review:             "#e65100",
};

const TYPE_LABELS = {
  "user.registered":      "New User",
  "user.logged_in":       "Login",
  "booking.created":      "New Booking",
  "booking.bank_proof":   "Payment",
  "voucher.purchased":    "Voucher",
  "contact.received":     "Message",
  "review.submitted":     "Review",
  "chat.human_requested": "Chat",
  "payment.failed":       "Payment",
  new_registration:       "New User",
  new_booking:            "New Booking",
  new_voucher_purchase:   "Voucher",
  bank_transfer_proof:    "Payment",
  contact_message:        "Message",
  new_review:             "Review",
};

const TYPE_LINKS = {
  "user.registered":      "/admin/users",
  "user.logged_in":       "/admin/users",
  "booking.created":      "/admin/appointments?payment=pending",
  "booking.bank_proof":   "/admin/payments",
  "voucher.purchased":    "/admin/vouchers",
  "contact.received":     "/admin/contact-messages",
  "review.submitted":     "/admin/reviews",
  "chat.human_requested": "/admin/chat",
  new_booking:            "/admin/appointments?payment=pending",
  new_voucher_purchase:   "/admin/vouchers",
  bank_transfer_proof:    "/admin/payments",
  contact_message:        "/admin/contact-messages",
  new_review:             "/admin/reviews",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function DetailModal({ notification, onClose, onDelete, onCheckout }) {
  const typeKey = notification.event_key || notification.type;
  const color   = TYPE_COLORS[typeKey] || "#607d8b";
  const label   = TYPE_LABELS[typeKey] || typeKey;
  const dest    = notification.link_path || TYPE_LINKS[typeKey];

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 0, m: { xs: 1, sm: 2 } } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", gap: 2, pr: 6, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: `${color}18`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Notifications sx={{ fontSize: 22, color }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography fontWeight={700} fontSize="1rem" color="secondary.dark" lineHeight={1.3}>
              {notification.title}
            </Typography>
            <Chip label={label} size="small" sx={{ height: 18, fontSize: 10, bgcolor: color, color: "#fff" }} />
          </Box>
          <Typography fontSize="0.75rem" color="text.disabled" mt={0.4}>
            {timeAgo(notification.created_at)}
            {" · "}
            {new Date(notification.created_at).toLocaleString("en-GB", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ position: "absolute", top: 12, right: 12, color: "text.disabled", "&:hover": { color: "text.primary" } }}>
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 2 }}>
        <Typography fontSize="0.92rem" color="text.primary" lineHeight={1.6}>
          {notification.body || notification.title}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 1, borderTop: "1px solid", borderColor: "divider", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        {dest ? (
          <Button variant="contained" size="small" startIcon={<OpenInNew sx={{ fontSize: 16 }} />}
            onClick={() => { onCheckout(dest); onClose(); }}
            sx={{ textTransform: "none", borderRadius: 0, bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }}>
            Go to page
          </Button>
        ) : <Box />}
        <Button variant="outlined" color="error" size="small" startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
          onClick={() => { onDelete(notification.id); onClose(); }}
          sx={{ textTransform: "none", borderRadius: 0 }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedIds, setSelectedIds]     = useState(() => new Set());
  const [activeNotif, setActiveNotif]     = useState(null);
  const [filter, setFilter]               = useState("all"); // "all" | "unread" | "read"

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getAdminNotifications({ limit: 100 });
      if (res.data?.success) setNotifications(res.data.notifications || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    if (filter === "read")   return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, filter]);

  const allIds      = useMemo(() => filtered.map((n) => n.id), [filtered]);
  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  const hasUnread   = notifications.some((n) => !n.is_read);
  const hasSelection = selectedIds.size > 0;

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = allIds.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      return next;
    });
  }, [allIds]);

  const handleMarkRead = useCallback(async (id) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const handleDelete = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    await deleteAdminNotification(id).catch(() => {});
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    const ids = [...selectedIds];
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    await deleteAdminNotificationsBulk(ids).catch(() => {});
  }, [selectedIds]);

  const handleRowClick = useCallback((n) => {
    if (!n.is_read) handleMarkRead(n.id);
    setActiveNotif({ ...n, is_read: true });
  }, [handleMarkRead]);

  const FILTER_TABS = [
    { key: "all",    label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read",   label: "Read" },
  ];

  return (
    <Box>
      {/* Page header */}
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="secondary.dark">
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Review, manage, and clear your admin notifications.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => { setLoading(true); fetchNotifications(); }} size="small"
            sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Refresh sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filter tabs */}
      <Box data-aos="fade-up" data-aos-delay="50" data-aos-duration="600"
        sx={{ display: "flex", gap: 1, mb: 2 }}>
        {FILTER_TABS.map((t) => (
          <Button key={t.key} size="small" variant={filter === t.key ? "contained" : "outlined"}
            onClick={() => setFilter(t.key)}
            sx={{
              textTransform: "none", borderRadius: 0, fontSize: "0.8rem",
              ...(filter === t.key
                ? { bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }
                : { borderColor: "divider", color: "text.secondary" }),
            }}>
            {t.label}
          </Button>
        ))}
      </Box>

      <Paper data-aos="fade-up" data-aos-delay="100" data-aos-duration="600"
        elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>

        {/* Toolbar */}
        {filtered.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, px: { xs: 1.5, md: 2.5 }, py: 1.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fafafa" }}>
            <FormControlLabel
              control={
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleSelectAll} size="small"
                  sx={{ color: "secondary.main", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "secondary.main" } }} />
              }
              label={<Typography fontSize="0.85rem" fontWeight={600} color="text.secondary">{allSelected ? "Deselect all" : "Select all"}</Typography>}
              sx={{ m: 0, mr: "auto" }}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<DoneAll sx={{ fontSize: 18 }} />}
                onClick={handleMarkAllRead} disabled={!hasUnread}
                sx={{ textTransform: "none", borderRadius: 0, borderColor: "secondary.main", color: "secondary.main", "&:hover": { borderColor: "secondary.dark", bgcolor: "#f0f4e8" }, "&.Mui-disabled": { borderColor: "divider", color: "text.disabled" } }}>
                Mark all read
              </Button>
              <Button variant="outlined" size="small" startIcon={<DeleteOutline sx={{ fontSize: 18 }} />}
                onClick={handleDeleteSelected} disabled={!hasSelection}
                sx={{ textTransform: "none", borderRadius: 0, borderColor: hasSelection ? "error.main" : "divider", color: hasSelection ? "error.main" : "text.disabled", "&:hover": hasSelection ? { borderColor: "error.dark", bgcolor: "#fef2f2" } : {}, "&.Mui-disabled": { borderColor: "divider", color: "text.disabled" } }}>
                Delete{hasSelection ? ` (${selectedIds.size})` : ""}
              </Button>
            </Box>
          </Box>
        )}

        {/* List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <NotificationsNone sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <Box>
            {filtered.map((n, i) => {
              const typeKey   = n.event_key || n.type;
              const color     = TYPE_COLORS[typeKey] || "#607d8b";
              const isSelected = selectedIds.has(n.id);
              const dest       = n.link_path || TYPE_LINKS[typeKey];

              return (
                <Box key={n.id}>
                  <Box
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: { xs: 1, sm: 1.5 },
                      py: 2, px: { xs: 1.5, md: 2.5 },
                      bgcolor: isSelected ? "#f0f4e8" : n.is_read ? "transparent" : "#fafafa",
                      transition: "background-color 0.15s",
                      "&:hover": { bgcolor: isSelected ? "#e8f0dc" : "action.hover" },
                    }}
                  >
                    <Checkbox checked={isSelected} onChange={() => toggleSelect(n.id)}
                      size="small" onClick={(e) => e.stopPropagation()}
                      sx={{ mt: 0.5, p: 0.5, color: "secondary.main", "&.Mui-checked": { color: "secondary.main" } }} />

                    {/* Icon */}
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: `${color}18`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", mt: 0.25 }}>
                      <Notifications sx={{ fontSize: 20, color }} />
                    </Box>

                    {/* Clickable body */}
                    <Box onClick={() => handleRowClick(n)}
                      sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                        <Typography fontSize="0.9rem" fontWeight={n.is_read ? 400 : 700} color="text.primary" lineHeight={1.5}>
                          {n.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                          <Chip label={TYPE_LABELS[typeKey] || typeKey} size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: color, color: "#fff" }} />
                          {!n.is_read && (
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "error.main" }} />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.5 }}>
                        {n.body}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
                        {timeAgo(n.created_at)} · {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, mt: 0.25 }}>
                      {dest && (
                        <Tooltip title="Go to page">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(dest); }}
                            sx={{ color: "text.disabled", "&:hover": { color: "secondary.main" } }}>
                            <OpenInNew sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                          sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                          <DeleteOutline sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {i < filtered.length - 1 && <Divider />}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Detail modal */}
      {activeNotif && (
        <DetailModal
          notification={activeNotif}
          onClose={() => setActiveNotif(null)}
          onDelete={(id) => { handleDelete(id); setActiveNotif(null); }}
          onCheckout={(dest) => navigate(dest)}
        />
      )}
    </Box>
  );
}
