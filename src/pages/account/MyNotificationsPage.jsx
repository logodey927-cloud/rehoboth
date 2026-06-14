import React, { useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Checkbox, Button, Chip,
  IconButton, Tooltip, Divider,
} from "@mui/material";
import {
  NotificationsNone, LocalOffer, CalendarToday, DoneAll, DeleteOutline,
  Chat as ChatIcon, ArrowForward,
} from "@mui/icons-material";
import NotificationDetailModal from "../../components/notifications/NotificationDetailModal";
import { useNotifications } from "../../contexts/NotificationContext";

const TYPE_CONFIG = {
  appointment: { Icon: CalendarToday, color: "#3b82f6", bg: "#dbeafe" },
  voucher:     { Icon: LocalOffer,    color: "#f59e0b", bg: "#fef3c7" },
  reminder:    { Icon: NotificationsNone, color: "#84994f", bg: "#ecfccb" },
  "chat.admin_replied": { Icon: ChatIcon, color: "#1565c0", bg: "#dbeafe" },
  chat:        { Icon: ChatIcon,      color: "#1565c0", bg: "#dbeafe" },
  default:     { Icon: NotificationsNone, color: "#84994f", bg: "#ecfccb" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const FILTERS = ["All", "Unread", "Read"];

export default function MyNotificationsPage() {
  const { notifications, markAsRead, markAllRead, deleteNotification, deleteNotifications } = useNotifications();
  const [selectedIds, setSelectedIds]       = useState(() => new Set());
  const [activeNotification, setActiveNotification] = useState(null);
  const [filter, setFilter]                 = useState("All");

  const filtered = useMemo(() => {
    if (filter === "Unread") return notifications.filter((n) => n.unread);
    if (filter === "Read")   return notifications.filter((n) => !n.unread);
    return notifications;
  }, [notifications, filter]);

  const allIds      = useMemo(() => filtered.map((n) => n.id), [filtered]);
  const allSelected = filtered.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  const hasUnread   = notifications.some((n) => n.unread);
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
      const all = allIds.every((id) => prev.has(id));
      if (all) {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      return next;
    });
  }, [allIds]);

  const handleDeleteSelected = useCallback(() => {
    deleteNotifications([...selectedIds]);
    setSelectedIds(new Set());
  }, [selectedIds, deleteNotifications]);

  const handleRowClick = useCallback((n) => {
    markAsRead(n.id);
    setActiveNotification({ ...n, unread: false });
  }, [markAsRead]);

  const handleModalDelete = useCallback((id) => {
    deleteNotification(id);
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setActiveNotification(null);
  }, [deleteNotification]);

  return (
    <>
      <Box>
        {/* Page heading */}
        <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="secondary.dark"
            sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Stay up to date with your appointments, vouchers, and messages.
          </Typography>
        </Box>

        {/* Filter + toolbar row */}
        <Box
          data-aos="fade-up" data-aos-delay="80" data-aos-duration="600"
          sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2 }}
        >
          {/* Filter tabs */}
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {FILTERS.map((f) => {
              const active = filter === f;
              const unreadBadge = f === "Unread" && notifications.filter((n) => n.unread).length;
              return (
                <Box
                  key={f}
                  onClick={() => setFilter(f)}
                  sx={{
                    px: 1.75, py: 0.55,
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: active ? 700 : 500,
                    display: "flex", alignItems: "center", gap: 0.6,
                    bgcolor: active ? "secondary.main" : "#f0f0f0",
                    color: active ? "#fff" : "text.secondary",
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: active ? "secondary.dark" : "#e4e4e4" },
                  }}
                >
                  {f}
                  {unreadBadge > 0 && (
                    <Box sx={{ px: 0.6, py: 0.05, borderRadius: "99px", bgcolor: active ? "rgba(255,255,255,0.35)" : "error.main" }}>
                      <Typography fontSize="0.65rem" color="#fff" lineHeight={1.6} fontWeight={700}>
                        {unreadBadge}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Action buttons */}
          {notifications.length > 0 && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" startIcon={<DoneAll sx={{ fontSize: 15 }} />}
                onClick={markAllRead} disabled={!hasUnread}
                sx={{ textTransform: "none", fontSize: "0.78rem", borderRadius: "999px", px: 1.8, color: "secondary.main", border: "1px solid", borderColor: "secondary.main", "&:hover": { bgcolor: "#f0f4e8" }, "&.Mui-disabled": { borderColor: "divider", color: "text.disabled" } }}>
                Mark all read
              </Button>
              {hasSelection && (
                <Button size="small" startIcon={<DeleteOutline sx={{ fontSize: 15 }} />}
                  onClick={handleDeleteSelected}
                  sx={{ textTransform: "none", fontSize: "0.78rem", borderRadius: "999px", px: 1.8, color: "error.main", border: "1px solid", borderColor: "error.main", "&:hover": { bgcolor: "#fef2f2" } }}>
                  Delete ({selectedIds.size})
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* List */}
        <Box data-aos="fade-up" data-aos-delay="120" data-aos-duration="600">
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                <NotificationsNone sx={{ fontSize: 34, color: "text.disabled" }} />
              </Box>
              <Typography fontWeight={600} color="text.secondary" mb={0.5}>All caught up!</Typography>
              <Typography variant="caption" color="text.disabled">
                {filter === "All" ? "No notifications yet." : `No ${filter.toLowerCase()} notifications.`}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {/* Select-all row */}
              {filtered.length > 1 && (
                <Box sx={{ display: "flex", alignItems: "center", px: 1, mb: 0.5 }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                    size="small"
                    sx={{ color: "secondary.main", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "secondary.main" }, p: 0.5, mr: 1 }}
                  />
                  <Typography fontSize="0.78rem" color="text.disabled" fontWeight={500}>
                    {allSelected ? "Deselect all" : "Select all"}
                  </Typography>
                </Box>
              )}

              {filtered.map((n) => {
                const key = n.eventKey || n.type || "default";
                const cfg = TYPE_CONFIG[key] || TYPE_CONFIG.default;
                const { Icon, color, bg } = cfg;
                const isSelected = selectedIds.has(n.id);

                return (
                  <Box
                    key={n.id}
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: 1.5,
                      p: 1.75,
                      borderRadius: "16px",
                      border: "1px solid",
                      borderColor: isSelected ? color : n.unread ? `${color}30` : "divider",
                      bgcolor: isSelected ? `${color}0a` : n.unread ? `${color}06` : "#fff",
                      transition: "all 0.15s",
                      "&:hover": { borderColor: color, boxShadow: `0 2px 12px ${color}18` },
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(n.id)}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ p: 0.25, mt: 0.25, color: "text.disabled", "&.Mui-checked": { color } }}
                    />

                    {/* Icon */}
                    <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon sx={{ fontSize: 20, color }} />
                    </Box>

                    {/* Text */}
                    <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => handleRowClick(n)}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography fontSize="0.88rem" fontWeight={n.unread ? 700 : 500} color="text.primary" lineHeight={1.4}>
                          {n.title || n.message}
                        </Typography>
                        {n.unread && (
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0, mt: 0.4 }} />
                        )}
                      </Box>
                      <Typography
                        fontSize="0.8rem"
                        color="text.secondary"
                        lineHeight={1.5}
                        mb={0.75}
                        sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {n.message || n.body}
                      </Typography>
                      <Typography fontSize="0.72rem" color={n.unread ? color : "text.disabled"} fontWeight={n.unread ? 600 : 400}>
                        {timeAgo(n.createdAt)}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="Open">
                        <IconButton size="small" onClick={() => handleRowClick(n)}
                          sx={{ p: 0.5, color: "text.disabled", "&:hover": { color } }}>
                          <ArrowForward sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          sx={{ p: 0.5, color: "text.disabled", "&:hover": { color: "error.main" } }}>
                          <DeleteOutline sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {activeNotification && (
        <NotificationDetailModal
          notification={activeNotification}
          onClose={() => setActiveNotification(null)}
          onDelete={handleModalDelete}
        />
      )}
    </>
  );
}
