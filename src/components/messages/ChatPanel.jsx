import React, { useEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, IconButton, Chip, Tooltip } from "@mui/material";
import { ArrowBack, EventAvailable, SupportAgent, SmartToy } from "@mui/icons-material";
import MessageBubble from "./MessageBubble";
import ChatComposer from "./ChatComposer";
import { requestHumanAgent } from "../../api/api";

function ChatAvatar({ avatarType, status }) {
  if (avatarType === "clinic") {
    if (status === "human_active") {
      return (
        <Avatar sx={{ width: 40, height: 40, bgcolor: "#e8f4e8", color: "#2e7d32" }}>
          <SupportAgent sx={{ fontSize: 22 }} />
        </Avatar>
      );
    }
    return (
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: "secondary.light",
          color: "secondary.dark",
          fontWeight: 700,
          fontSize: "1rem",
        }}
      >
        R
      </Avatar>
    );
  }
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: "#e0f4f1", color: "#2a7a6e" }}>
      <EventAvailable sx={{ fontSize: 20 }} />
    </Avatar>
  );
}

function StatusSubtitle({ status }) {
  if (status === "human_queue") {
    return <Typography fontSize="0.72rem" color="warning.main" fontWeight={600}>Waiting for a team member…</Typography>;
  }
  if (status === "human_active") {
    return <Typography fontSize="0.72rem" color="success.main" fontWeight={600}>Connected to a team member</Typography>;
  }
  return <Typography fontSize="0.72rem" color="text.secondary">AI assistant · replies instantly</Typography>;
}

export default function ChatPanel({ conversation, faqs = [], onBack, onSend }) {
  const messagesContainerRef = useRef(null);
  const prevConversationIdRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const [requestingHuman, setRequestingHuman] = useState(false);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el || !conversation) return;

    const conversationId = conversation.id;
    const messageCount = conversation.messages.length;

    const scrollToBottom = (behavior) => el.scrollTo({ top: el.scrollHeight, behavior });

    if (conversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = conversationId;
      prevMessageCountRef.current = messageCount;
      requestAnimationFrame(() => scrollToBottom("auto"));
      return;
    }
    if (messageCount > prevMessageCountRef.current) {
      prevMessageCountRef.current = messageCount;
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
    prevMessageCountRef.current = messageCount;
  }, [conversation?.id, conversation?.messages?.length, conversation]);

  if (!conversation) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8f9fa" }}>
        <Typography color="text.disabled" fontSize="0.9rem">
          Select a conversation to start messaging.
        </Typography>
      </Box>
    );
  }

  const canRequestHuman = conversation.status === "ai";
  const showFaqs = faqs.length > 0 && conversation.status === "ai";
  // Filter out the "Talk to a person" FAQ since we have a dedicated button
  const displayFaqs = showFaqs ? faqs.filter((f) => f.category !== "human") : [];

  const handleFaqClick = (faq) => {
    onSend(faq.label, faq.id);
  };

  const handleRequestHuman = async () => {
    if (!conversation?.id || requestingHuman) return;
    setRequestingHuman(true);
    try {
      await requestHumanAgent(conversation.id);
    } catch {
      // optimistic — socket will update status
    } finally {
      setRequestingHuman(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: "#f8f9fa" }}>
      {/* Chat header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: "#fff",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} aria-label="Back" size="small" sx={{ mr: 0.5, color: "secondary.dark" }}>
            <ArrowBack />
          </IconButton>
        )}
        <ChatAvatar avatarType={conversation.avatarType} status={conversation.status} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontSize="0.95rem" fontWeight={700} color="text.primary" lineHeight={1.2} noWrap>
            {conversation.name}
          </Typography>
          <StatusSubtitle status={conversation.status} />
        </Box>
        {canRequestHuman && (
          <Tooltip title="Talk to a person">
            <Chip
              icon={<SupportAgent sx={{ fontSize: 16 }} />}
              label="Talk to us"
              size="small"
              onClick={handleRequestHuman}
              disabled={requestingHuman}
              sx={{
                cursor: "pointer",
                bgcolor: "secondary.main",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.72rem",
                height: 26,
                "& .MuiChip-icon": { color: "#fff" },
                "&:hover": { bgcolor: "secondary.dark" },
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Message thread */}
      <Box ref={messagesContainerRef} sx={{ flex: 1, overflowY: "auto", px: { xs: 1.5, sm: 2 }, py: 2 }}>
        {conversation.messages.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 4 }}>
            <SmartToy sx={{ fontSize: 40, color: "secondary.light" }} />
            <Typography fontSize="0.85rem" color="text.secondary" textAlign="center">
              Hi! How can we help you today?
            </Typography>
          </Box>
        )}
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </Box>

      {/* FAQ chips */}
      {displayFaqs.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: "#fff",
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
          }}
        >
          {displayFaqs.map((faq) => (
            <Chip
              key={faq.id}
              label={faq.label}
              size="small"
              onClick={() => handleFaqClick(faq)}
              sx={{
                cursor: "pointer",
                bgcolor: "#f0f4e8",
                color: "secondary.dark",
                fontWeight: 500,
                fontSize: "0.75rem",
                border: "1px solid",
                borderColor: "secondary.light",
                "&:hover": { bgcolor: "#e4eccc" },
              }}
            />
          ))}
          <Chip
            icon={<SupportAgent sx={{ fontSize: 14 }} />}
            label="Talk to a person"
            size="small"
            onClick={handleRequestHuman}
            disabled={requestingHuman || !canRequestHuman}
            sx={{
              cursor: canRequestHuman ? "pointer" : "default",
              bgcolor: canRequestHuman ? "#fff3e0" : "#f5f5f5",
              color: canRequestHuman ? "#e65100" : "text.disabled",
              fontWeight: 500,
              fontSize: "0.75rem",
              border: "1px solid",
              borderColor: canRequestHuman ? "#ffb74d" : "divider",
              "& .MuiChip-icon": { color: "inherit" },
              "&:hover": { bgcolor: canRequestHuman ? "#ffe0b2" : "#f5f5f5" },
            }}
          />
        </Box>
      )}

      <ChatComposer onSend={(text) => onSend(text)} />
    </Box>
  );
}
