import React from "react";
import { Box, Typography } from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";
import ConversationListItem from "./ConversationListItem";

export default function ConversationList({ conversations, selectedId, onSelect }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: { md: "1px solid" },
        borderColor: { md: "divider" },
        bgcolor: "#fff",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "#fafafa",
          flexShrink: 0,
        }}
      >
        <Typography fontSize="0.8rem" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
          Conversations
        </Typography>
      </Box>

      {conversations.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, py: 4, px: 2 }}>
          <ChatBubbleOutline sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No conversations yet.
          </Typography>
        </Box>
      ) : (
        conversations.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            selected={conv.id === selectedId}
            onClick={() => onSelect(conv.id)}
          />
        ))
      )}
    </Box>
  );
}
