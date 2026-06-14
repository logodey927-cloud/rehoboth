import React from "react";
import {
  Dialog, Box, Typography, IconButton,
} from "@mui/material";
import {
  Close, DeleteOutline, CalendarToday, LocalOffer, NotificationsNone,
  Chat as ChatIcon, ArrowForward, Spa as SpaIcon,
} from "@mui/icons-material";
import StyledButton from "../common09/StyledButton";

const TYPE_CONFIG = {
  "account.welcome": {
    Icon: SpaIcon,
    color: "#47672f",
    bg: "#f0f4e8",
    heading: "Welcome to Rehoboth",
    ctaLabel: "Book Now",
    ctaPath: "/book-appointment",
  },
  appointment: {
    Icon: CalendarToday,
    color: "#3b82f6",
    bg: "#dbeafe",
    heading: "Appointment Update",
    ctaLabel: "View Appointment",
    ctaPath: "/my-account/appointments",
  },
  "booking.cancelled": {
    Icon: CalendarToday,
    color: "#dc2626",
    bg: "#fef2f2",
    heading: "Appointment Cancelled",
    ctaLabel: "Book Again",
    ctaPath: "/book-appointment",
  },
  "booking.completed": {
    Icon: CalendarToday,
    color: "#47672f",
    bg: "#f0f4e8",
    heading: "Appointment Completed",
    ctaLabel: "Book Again",
    ctaPath: "/book-appointment",
  },
  "booking.confirmed": {
    Icon: CalendarToday,
    color: "#47672f",
    bg: "#f0f4e8",
    heading: "Appointment Confirmed",
    ctaLabel: "View Appointment",
    ctaPath: "/my-account/appointments",
  },
  voucher: {
    Icon: LocalOffer,
    color: "#f59e0b",
    bg: "#fef3c7",
    heading: "New Voucher",
    ctaLabel: "View Vouchers",
    ctaPath: "/my-account/vouchers",
  },
  reminder: {
    Icon: NotificationsNone,
    color: "#84994f",
    bg: "#ecfccb",
    heading: "Reminder",
    ctaLabel: "Book Now",
    ctaPath: "/book-appointment",
  },
  "chat.admin_replied": {
    Icon: ChatIcon,
    color: "#1565c0",
    bg: "#dbeafe",
    heading: "New Message",
    ctaLabel: "Go to Messages",
    ctaPath: "/my-account/messages",
  },
  chat: {
    Icon: ChatIcon,
    color: "#1565c0",
    bg: "#dbeafe",
    heading: "New Message",
    ctaLabel: "Go to Messages",
    ctaPath: "/my-account/messages",
  },
};

function formatRelative(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const isChat = (eventKey, type) =>
  eventKey === "chat.admin_replied" || type === "chat" || eventKey === "chat";

/** Legacy notifications stored link_path as /appointment (no route). */
function normalizeBookingPath(path) {
  if (!path || path === "/appointment") return "/book-appointment";
  return path;
}

export default function NotificationDetailModal({ notification, onClose, onDelete }) {
  if (!notification) return null;

  const config = TYPE_CONFIG[notification.eventKey] || TYPE_CONFIG[notification.type] || TYPE_CONFIG.reminder;
  const { Icon, color, bg, heading, ctaLabel } = config;
  const rawPath = notification.linkPath || notification.relatedPath || config.ctaPath || "/book-appointment";
  const ctaPath = normalizeBookingPath(rawPath);
  const chatNotif = isChat(notification.eventKey, notification.type);

  const handleDelete = () => { onDelete(notification.id); onClose(); };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          m: { xs: 1.5, sm: 2 },
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        },
      }}
    >
      {/* Top accent bar */}
      <Box sx={{ height: 4, bgcolor: color, width: "100%" }} />

      {/* Close button */}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{ position: "absolute", top: 14, right: 14, color: "text.disabled", bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#ebebeb", color: "text.primary" } }}
      >
        <Close sx={{ fontSize: 16 }} />
      </IconButton>

      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Box sx={{ width: 60, height: 60, borderRadius: "18px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <Icon sx={{ fontSize: 28, color }} />
        </Box>
        <Typography fontWeight={700} fontSize="1.05rem" color="text.primary" lineHeight={1.3} mb={0.5}>
          {notification.title || heading}
        </Typography>
        <Typography fontSize="0.75rem" color="text.disabled" fontWeight={500}>
          {formatRelative(notification.createdAt)}
        </Typography>
      </Box>

      {/* Message body */}
      <Box sx={{ px: 3, pb: 3 }}>
        {chatNotif ? (
          /* Chat message — styled as a speech bubble */
          <Box
            sx={{
              bgcolor: bg,
              borderLeft: `3px solid ${color}`,
              borderRadius: "0 12px 12px 0",
              px: 2, py: 1.5,
            }}
          >
            <Typography fontSize="0.85rem" color="text.secondary" fontWeight={500} mb={0.4}>
              Rehoboth team says:
            </Typography>
            <Typography fontSize="0.92rem" color="text.primary" lineHeight={1.65} fontStyle="italic">
              "{notification.message || notification.body}"
            </Typography>
          </Box>
        ) : (
          <Typography fontSize="0.9rem" color="text.secondary" lineHeight={1.7} textAlign="center">
            {notification.message || notification.body}
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 1.5,
          borderTop: "1px solid", borderColor: "divider", pt: 2.5,
        }}
      >
        {/* Primary CTA */}
        <StyledButton
          text={ctaLabel}
          to={ctaPath}
          variant="primary"
          onClick={onClose}
          sx={{
            width: "100%", textAlign: "center", py: 1.1, borderRadius: "12px",
            fontSize: "0.87rem", fontWeight: 600,
          }}
        />

        {/* Delete — subtle link-style */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="button"
            onClick={handleDelete}
            sx={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 0.5,
              color: "text.disabled", fontSize: "0.78rem",
              "&:hover": { color: "error.main" },
              transition: "color 0.15s",
            }}
          >
            <DeleteOutline sx={{ fontSize: 14 }} />
            Delete notification
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
