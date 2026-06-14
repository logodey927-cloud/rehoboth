import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, Typography, Paper, useTheme, useMediaQuery, CircularProgress } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import ConversationList from "../../components/messages/ConversationList";
import ChatPanel from "../../components/messages/ChatPanel";
import { profileCardSx } from "../../components/profile/profileStyles";
import {
  getChatThreads,
  getChatMessages,
  sendChatMessage,
  getChatFaq,
} from "../../api/api";
import { getChatSocket } from "../../utils/chatSocket";

const LIST_WIDTH = 340;

export default function MyMessagesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSelectedId, setMobileSelectedId] = useState(null);
  const socketRef = useRef(null);
  const paramThread = searchParams.get("thread");
  const selectedId = isMobile
    ? mobileSelectedId
    : paramThread || conversations[0]?.id;

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  const selectedIdRef = useRef(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Load threads on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const threadsRes = await getChatThreads();
        if (cancelled) return;
        setConversations(
          (threadsRes.data?.threads || []).map((t) => ({ ...t, messages: [] }))
        );
      } catch {
        // silently fail — page still renders
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Reload FAQs whenever the selected thread's channel changes
  useEffect(() => {
    const ch = selectedConversation?.channel || "rehoboth";
    let cancelled = false;
    getChatFaq(ch)
      .then((res) => { if (!cancelled) setFaqs(res.data?.faqs || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedConversation?.channel]);

  // Load messages when a thread is selected
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    getChatMessages(selectedId, true)
      .then((res) => {
        if (cancelled) return;
        const msgs = res.data?.messages || [];
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId ? { ...c, messages: msgs, unreadCount: 0 } : c
          )
        );
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [selectedId]);

  // Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("user_access_token") || "";
    const socket = getChatSocket(token);
    socketRef.current = socket;

    const handleMessage = (msg) => {
      const tid = msg.threadId || msg.thread_id;
      const activeId = selectedIdRef.current;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== tid) return c;
          const exists = c.messages.some((m) => m.id === msg.id);
          if (exists) return c;
          return {
            ...c,
            messages: [...c.messages, msg],
            lastMessage: msg.text,
            timeLabel: msg.timeLabel || c.timeLabel,
            unreadCount: msg.sender !== "user" && c.id !== activeId ? (c.unreadCount || 0) + 1 : 0,
          };
        })
      );
    };

    const handleThreadUpdated = ({ threadId, status }) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === threadId ? { ...c, status } : c))
      );
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:thread-updated", handleThreadUpdated);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:thread-updated", handleThreadUpdated);
    };
  }, []);

  // Join/leave thread socket room when selection changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedId) return;
    socket.emit("chat:join", selectedId);
    return () => socket.emit("chat:leave", selectedId);
  }, [selectedId]);

  const handleSelect = useCallback(
    (id) => {
      if (isMobile) {
        setMobileSelectedId(id);
      } else {
        setSearchParams({ thread: id }, { replace: true, preventScrollReset: true });
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
      );
    },
    [isMobile, setSearchParams]
  );

  const handleBack = useCallback(() => setMobileSelectedId(null), []);

  const handleSend = useCallback(
    async (text, faqItemId) => {
      if (!selectedId) return;
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const tempId = `tmp-${Date.now()}`;

      // Optimistic insert
      const tempMsg = {
        id: tempId,
        sender: "user",
        senderType: "user",
        text,
        createdAt: now.toISOString(),
        timeLabel,
        dayLabel: null,
        status: "sent",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, messages: [...c.messages, tempMsg], lastMessage: text, timeLabel: "Just now" }
            : c
        )
      );

      try {
        const res = await sendChatMessage(selectedId, { text, faqItemId });
        const { message: savedMsg, botMessage } = res.data || {};

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== selectedId) return c;
            let msgs = c.messages.map((m) =>
              m.id === tempId ? { ...tempMsg, id: savedMsg?.id || tempId, status: "sent" } : m
            );
            if (botMessage) {
              msgs = [...msgs, {
                id: botMessage.id,
                sender: "clinic",
                senderType: botMessage.sender_type || "ai",
                text: botMessage.body,
                createdAt: botMessage.created_at,
                timeLabel: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                dayLabel: null,
                status: "sent",
              }];
            }
            return { ...c, messages: msgs };
          })
        );
      } catch {
        // message stays as temp — non-blocking
      }
    },
    [selectedId]
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // Mobile: show chat panel when a conversation is selected
  if (isMobile && mobileSelectedId && selectedConversation) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 480 }}>
        <ChatPanel
          conversation={selectedConversation}
          faqs={faqs}
          onBack={handleBack}
          onSend={handleSend}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color="secondary.dark"
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
        >
          Messages
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Chat with our team about your care, bookings, and wellness.
        </Typography>
      </Box>

      {isMobile ? (
        <Paper data-aos="fade-up" data-aos-delay="100" data-aos-duration="600" elevation={0} sx={{ ...profileCardSx, p: 0, overflow: "hidden" }}>
          <ConversationList
            conversations={conversations}
            selectedId={mobileSelectedId}
            onSelect={handleSelect}
          />
        </Paper>
      ) : (
        <Paper
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="600"
          elevation={0}
          sx={{
            ...profileCardSx,
            p: 0,
            overflow: "hidden",
            display: "flex",
            height: "calc(100vh - 260px)",
            minHeight: 520,
          }}
        >
          <Box sx={{ width: LIST_WIDTH, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </Box>
          <ChatPanel
            conversation={selectedConversation}
            faqs={faqs}
            onBack={null}
            onSend={handleSend}
          />
        </Paper>
      )}
    </Box>
  );
}
