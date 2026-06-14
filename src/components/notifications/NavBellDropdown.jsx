import React, { useState } from "react";
import {
  IconButton, Badge, Popover, Box, Typography, Divider,
  Button, CircularProgress, Tooltip,
} from "@mui/material";
import {
  Notifications, NotificationsNone, DoneAll,
  CalendarToday, LocalOffer, Chat as ChatIcon, DeleteOutline,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";
import NotificationDetailModal from "./NotificationDetailModal";

const TYPE_CONFIG = {
  appointment: { Icon: CalendarToday, color: "#3b82f6", bg: "#dbeafe" },
  voucher:     { Icon: LocalOffer,    color: "#f59e0b", bg: "#fef3c7" },
  reminder:    { Icon: Notifications, color: "#84994f", bg: "#ecfccb" },
  "chat.admin_replied": { Icon: ChatIcon, color: "#1565c0", bg: "#dbeafe" },
  chat:        { Icon: ChatIcon,      color: "#1565c0", bg: "#dbeafe" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifRow({ n, onRowClick, onDelete }) {
  const key = n.eventKey || n.type || "reminder";
  const cfg = TYPE_CONFIG[key] || TYPE_CONFIG.reminder;
  const { Icon, color, bg } = cfg;

  return (
    <Box
      sx={{
        display: "flex", alignItems: "flex-start", gap: 1.5,
        px: 2, py: 1.5, cursor: "pointer",
        borderLeft: "3px solid",
        borderLeftColor: n.unread ? color : "transparent",
        bgcolor: n.unread ? `${color}08` : "transparent",
        transition: "all 0.15s",
        "&:hover": { bgcolor: `${color}12` },
        position: "relative",
      }}
    >
      {/* Icon avatar */}
      <Box
        sx={{
          width: 38, height: 38, borderRadius: "10px",
          bgcolor: bg, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 18, color }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => onRowClick(n)}>
        <Typography
          fontSize="0.82rem"
          fontWeight={n.unread ? 700 : 500}
          color="text.primary"
          lineHeight={1.4}
          sx={{ mb: 0.3 }}
          noWrap
        >
          {n.title || n.message}
        </Typography>
        <Typography
          fontSize="0.75rem"
          color="text.secondary"
          lineHeight={1.4}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.5,
          }}
        >
          {n.message || n.body}
        </Typography>
        <Typography fontSize="0.7rem" color={n.unread ? color : "text.disabled"} fontWeight={n.unread ? 600 : 400}>
          {timeAgo(n.createdAt)}
        </Typography>
      </Box>

      {/* Unread dot */}
      {n.unread && (
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color, flexShrink: 0, mt: 0.8 }} />
      )}

      {/* Delete on hover */}
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
          sx={{
            position: "absolute", right: 6, top: 6,
            opacity: 0, transition: "opacity 0.15s",
            color: "text.disabled", p: 0.4,
            ".MuiBox-root:hover &": { opacity: 1 },
            "&:hover": { color: "error.main" },
          }}
        >
          <DeleteOutline sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function NavBellDropdown() {
  const navigate = useNavigate();
  const { notifications, unreadCount, fetched, markAsRead, markAllRead, deleteNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeNotif, setActiveNotif] = useState(null);

  const handleOpen  = (e) => setAnchorEl(e.currentTarget);
  const handleClose = ()  => setAnchorEl(null);

  const handleRowClick = (n) => {
    if (n.unread) markAsRead(n.id);
    setActiveNotif({ ...n, unread: false });
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{ color: "#47672f", "&:hover": { bgcolor: "rgba(71,103,47,0.08)" } }}
      >
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
        PaperProps={{
          sx: {
            width: 380, borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            overflow: "hidden", display: "flex", flexDirection: "column",
            maxHeight: 520,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontWeight={700} fontSize="1rem" color="text.primary">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box sx={{ px: 0.9, py: 0.15, borderRadius: "20px", bgcolor: "error.main" }}>
                <Typography fontSize="0.7rem" color="#fff" fontWeight={700} lineHeight={1.6}>
                  {unreadCount}
                </Typography>
              </Box>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAll sx={{ fontSize: 13 }} />}
              onClick={markAllRead}
              sx={{ textTransform: "none", fontSize: "0.75rem", color: "text.secondary", fontWeight: 500, p: 0.5 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Body */}
        {!fetched ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={26} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
              <NotificationsNone sx={{ fontSize: 28, color: "text.disabled" }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>All caught up!</Typography>
            <Typography variant="caption" color="text.disabled">No new notifications</Typography>
          </Box>
        ) : (
          <Box sx={{ overflow: "auto", flex: 1 }}>
            {notifications.map((n, i) => (
              <React.Fragment key={n.id}>
                <NotifRow n={n} onRowClick={handleRowClick} onDelete={deleteNotification} />
                {i < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 2.5, py: 1.5, flexShrink: 0 }}>
              <Button
                fullWidth
                endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
                onClick={() => { handleClose(); navigate("/my-account/notifications"); }}
                sx={{
                  textTransform: "none", fontSize: "0.82rem", fontWeight: 600,
                  color: "#47672f", justifyContent: "center",
                  "&:hover": { bgcolor: "rgba(71,103,47,0.06)" },
                }}
              >
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Popover>

      {activeNotif && (
        <NotificationDetailModal
          notification={activeNotif}
          onClose={() => setActiveNotif(null)}
          onDelete={(id) => { deleteNotification(id); setActiveNotif(null); }}
        />
      )}
    </>
  );
}
