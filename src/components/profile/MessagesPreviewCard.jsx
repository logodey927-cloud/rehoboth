import React from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { mockMessages } from "../../data/profileData";
import { profileCardSx, profileSectionTitleSx, profileViewAllSx } from "./profileStyles";

function getInitial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "R";
}

export default function MessagesPreviewCard() {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={profileSectionTitleSx}>Messages</Typography>
        <Typography component={RouterLink} to="/my-account/messages" sx={profileViewAllSx}>
          View All
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {mockMessages.map((msg) => (
          <Box
            key={msg.id}
            component={RouterLink}
            to={`/my-account/messages?thread=${msg.id}`}
            sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  bgcolor: "secondary.light",
                  color: "secondary.dark",
                }}
              >
                {getInitial(msg.sender)}
              </Avatar>
              {msg.unread && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    border: "2px solid white",
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
                <Typography fontSize="0.85rem" fontWeight={600} color="text.primary" noWrap>
                  {msg.sender}
                </Typography>
                <Typography variant="caption" color="text.disabled" flexShrink={0}>
                  {msg.timeLabel}
                </Typography>
              </Box>
              <Typography fontSize="0.8rem" color="text.secondary" noWrap>
                {msg.preview}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {mockMessages.length === 0 && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <ChatBubbleOutline sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No messages yet.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
