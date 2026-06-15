import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemText, Divider, Button, Chip, CircularProgress, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import {
  Notifications, NotificationsNone, DoneAll, DeleteOutline, Close,
  OpenInNew,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAdminNotification,
} from "../../api/api";
import { getAdminSocket } from "../../utils/adminSocket";

const TYPE_COLORS = {
  "user.registered":      "#4caf50",
  "user.logged_in":       "#00897b",
  "booking.created":      "#2196f3",
  "booking.bank_proof":   "#ff9800",
  "voucher.purchased":    "#9c27b0",
  "contact.received":     "#607d8b",
  "review.submitted":     "#e65100",
  "chat.human_requested": "#1565c0",
  "chat.user_message":    "#0288d1",
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
  "chat.user_message":    "Chat",
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
  "chat.human_requested": "/admin/live-chat",
  "chat.user_message":    "/admin/live-chat",
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
  const color = TYPE_COLORS[typeKey] || "#607d8b";
  const label = TYPE_LABELS[typeKey] || typeKey;
  const dest  = notification.link_path || TYPE_LINKS[typeKey];

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
            <Chip label={label} size="small"
              sx={{ height: 18, fontSize: 10, bgcolor: color, color: "#fff" }} />
          </Box>
          <Typography fontSize="0.75rem" color="text.disabled" mt={0.4}>
            {timeAgo(notification.created_at)}
            {notification.created_at && ` · ${new Date(notification.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "text.disabled" }}>
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

export default function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl]       = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);
  const [hovered, setHovered]         = useState(null);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getAdminNotifications({ limit: 30 });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount ?? 0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  // Real-time: re-fetch immediately when a customer sends a chat message
  useEffect(() => {
    const socket = getAdminSocket();
    const handleChatMsg = (msg) => {
      if (msg.sender === "user" || msg.senderType === "user") {
        fetchNotifications();
      }
    };
    socket.on("chat:message", handleChatMsg);
    return () => socket.off("chat:message", handleChatMsg);
  }, [fetchNotifications]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  };
  const handleClose = () => setAnchorEl(null);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => {
      const n = notifications.find((x) => x.id === id);
      return n && !n.is_read ? Math.max(0, c - 1) : c;
    });
    await deleteAdminNotification(id).catch(() => {});
  };

  const handleRowClick = (n) => {
    if (!n.is_read) handleMarkRead(n.id);
    setActiveNotif(n);
    handleClose();
  };

  const handleCheckout = (dest) => {
    navigate(dest);
  };

  return (
    <>
      <IconButton sx={{ color: "#1a1f2e" }} onClick={handleOpen} size="small">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 380, maxHeight: 540, borderRadius: 2, boxShadow: 6, display: "flex", flexDirection: "column" } }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
          <Typography fontWeight={700} fontSize="0.95rem">
            Notifications{" "}
            {unreadCount > 0 && <Chip label={unreadCount} color="error" size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAll sx={{ fontSize: 14 }} />} onClick={handleMarkAllRead}
              sx={{ textTransform: "none", fontSize: "0.75rem" }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* Body */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <NotificationsNone sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary" mt={1}>No notifications</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflow: "auto", flex: 1 }}>
            {notifications.map((n, i) => {
              const typeKey = n.event_key || n.type;
              const color = TYPE_COLORS[typeKey] || "primary.main";
              return (
                <React.Fragment key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    sx={{
                      py: 1.25, px: 2, cursor: "pointer",
                      bgcolor: n.is_read ? "transparent" : "action.hover",
                      "&:hover": { bgcolor: "action.selected" },
                      position: "relative",
                    }}
                    onClick={() => handleRowClick(n)}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", mt: 0.75, mr: 1.5, flexShrink: 0, bgcolor: n.is_read ? "transparent" : color }} />
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", pr: hovered === n.id ? 3 : 0 }}>
                          <Typography variant="body2" fontWeight={n.is_read ? 400 : 700} sx={{ mr: 1 }}>
                            {n.title}
                          </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                            <Chip
                              label={TYPE_LABELS[typeKey] || typeKey}
                              size="small"
                              sx={{ height: 16, fontSize: 10, bgcolor: color, color: "#fff", mb: 0.25 }}
                            />
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                              {timeAgo(n.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                          {n.body}
                        </Typography>
                      }
                    />
                    {/* Delete button — visible on hover */}
                    {hovered === n.id && (
                      <Tooltip title="Delete" placement="left">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                          sx={{
                            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                            color: "text.disabled", "&:hover": { color: "error.main" },
                            p: 0.5,
                          }}
                        >
                          <DeleteOutline sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                  {i < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}

        {/* Footer — "View all" link */}
        {notifications.length > 0 && (
          <Box sx={{ borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
            <Button fullWidth size="small"
              onClick={() => { handleClose(); navigate("/admin/notifications"); }}
              sx={{ textTransform: "none", fontSize: "0.8rem", py: 1, color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}>
              View all notifications
            </Button>
          </Box>
        )}
      </Popover>

      {/* Detail modal */}
      {activeNotif && (
        <DetailModal
          notification={activeNotif}
          onClose={() => setActiveNotif(null)}
          onDelete={handleDelete}
          onCheckout={handleCheckout}
        />
      )}
    </>
  );
}
