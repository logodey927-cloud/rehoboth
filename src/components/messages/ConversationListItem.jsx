import React from "react";
import { Box, Avatar, Typography, Badge } from "@mui/material";
import { LocalHospital, EventAvailable } from "@mui/icons-material";

function ConversationAvatar({ avatarType }) {
  if (avatarType === "clinic") {
    return (
      <Avatar
        sx={{
          width: 46,
          height: 46,
          bgcolor: "secondary.light",
          color: "secondary.dark",
          fontWeight: 700,
          fontSize: "1.1rem",
          flexShrink: 0,
        }}
      >
        R
      </Avatar>
    );
  }
  return (
    <Avatar
      sx={{
        width: 46,
        height: 46,
        bgcolor: "#e0f4f1",
        color: "#2a7a6e",
        flexShrink: 0,
      }}
    >
      <EventAvailable sx={{ fontSize: 22 }} />
    </Avatar>
  );
}

export default function ConversationListItem({ conversation, selected, onClick }) {
  const { name, avatarType, subtitle, lastMessage, timeLabel, unreadCount } = conversation;

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open conversation with ${name}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: "pointer",
        bgcolor: selected ? "#f0f4e8" : "transparent",
        borderLeft: selected ? "3px solid" : "3px solid transparent",
        borderColor: selected ? "secondary.main" : "transparent",
        borderBottom: "1px solid",
        borderBottomColor: "divider",
        transition: "background-color 0.15s",
        "&:hover": { bgcolor: selected ? "#f0f4e8" : "#f8f9fa" },
        "&:focus-visible": { outline: "2px solid", outlineColor: "secondary.main", outlineOffset: -2 },
      }}
    >
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <ConversationAvatar avatarType={avatarType} />
        {unreadCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              border: "2px solid #fff",
            }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
          <Typography
            fontSize="0.9rem"
            fontWeight={unreadCount > 0 ? 700 : 600}
            color="text.primary"
            noWrap
          >
            {name}
          </Typography>
          <Typography variant="caption" color="text.disabled" flexShrink={0} fontSize="0.72rem">
            {timeLabel}
          </Typography>
        </Box>
        {subtitle && (
          <Typography fontSize="0.73rem" color="secondary.main" noWrap sx={{ mb: 0.25, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Typography fontSize="0.8rem" color="text.secondary" noWrap sx={{ flex: 1 }}>
            {lastMessage}
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                bgcolor: "secondary.main",
                color: "#fff",
                fontSize: "0.68rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.75,
                flexShrink: 0,
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
