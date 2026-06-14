import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Reply as ReplyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import navigationData from "../../../data/NavigationData";

const BRAND = {
  green: "#84994f",
  greenDark: "#47672f",
  greenMuted: "#84994f18",
};

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
      <Icon sx={{ fontSize: 16, color: BRAND.green, mt: 0.25, flexShrink: 0 }} />
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1a1f2e", fontSize: "0.8125rem" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ContactMessageDetailsModal({ open, onClose, message, onReply }) {
  if (!message) return null;

  const { contactInfo } = navigationData;
  const fullName = `${message.first_name || ""} ${message.last_name || ""}`.trim() || "Unknown";
  const initials = `${message.first_name?.[0] || ""}${message.last_name?.[0] || ""}`.toUpperCase() || "?";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#1a1f2e", fontSize: "1.0625rem", lineHeight: 1.2 }}>
            Contact Message
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Received {formatDateTime(message.created_at)}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ mt: -0.5, color: "text.secondary" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 2 }}>
        {/* ── Sender ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: BRAND.greenMuted,
              color: BRAND.greenDark,
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1a1f2e", lineHeight: 1.2 }}>
              {fullName}
            </Typography>
            <Typography
              component="a"
              href={`mailto:${message.email}`}
              variant="body2"
              sx={{
                color: BRAND.green,
                textDecoration: "none",
                fontSize: "0.8125rem",
                display: "block",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {message.email}
            </Typography>
            {message.phone && (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                {message.phone}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Message body ── */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1,
            }}
          >
            Message
          </Typography>
          <Box
            sx={{
              bgcolor: "#f8f9fa",
              border: "1px solid",
              borderColor: "divider",
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#1a1f2e", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {message.message || "—"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* ── Support info ── */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1.5,
            }}
          >
            Support Contact
          </Typography>
          <InfoRow icon={EmailIcon}       label="Email"   value={contactInfo.email} />
          <InfoRow icon={PhoneIcon}       label="Phone"   value={contactInfo.phone} />
          <InfoRow icon={LocationIcon}    label="Address" value={contactInfo.address} />
          <InfoRow icon={AccessTimeIcon}  label="Hours"   value={contactInfo.hours} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 0, color: "text.secondary" }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<ReplyIcon />}
          onClick={() => { onClose(); onReply(message); }}
          sx={{
            textTransform: "none",
            borderRadius: 0,
            bgcolor: BRAND.green,
            "&:hover": { bgcolor: BRAND.greenDark },
          }}
        >
          Reply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
