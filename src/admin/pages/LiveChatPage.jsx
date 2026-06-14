import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Typography, Tabs, Tab, TextField, InputAdornment, Avatar, Chip,
  IconButton, Tooltip, CircularProgress, Divider, Badge, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  List, ListItem, ListItemText, ListItemSecondaryAction, Switch,
} from "@mui/material";
import {
  Search, Send, SmartToy, SupportAgent, Person, Close,
  MoreVert, QuestionAnswer, Add, Edit, Delete, FiberManualRecord,
  Group, HourglassEmpty,
} from "@mui/icons-material";
import StatCard from "../components/StatCard";
import { io } from "socket.io-client";
import {
  adminGetChatThreads,
  adminStartChatThread,
  adminGetChatMessages,
  adminSendChatMessage,
  adminPatchChatThread,
  adminGetChatFaq,
  adminCreateChatFaq,
  adminUpdateChatFaq,
  adminDeleteChatFaq,
  adminGetUsers,
  adminGetChatPresence,
} from "../../api/api";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { getServerOrigin } from "../../config/env.js";

const STATUS_CONFIG = {
  ai:           { label: "AI",       color: "secondary" },
  human_queue:  { label: "Queued",   color: "warning"   },
  human_active: { label: "Active",   color: "success"   },
};

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function ThreadItem({ thread, selected, onClick }) {
  const { user, subtitle, status, lastMessage, lastMessageAt, admin_unread, isOnline, isVirtual } = thread;
  const fullName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "Unknown";
  const cfg = isVirtual ? null : (STATUS_CONFIG[status] || STATUS_CONFIG.ai);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", alignItems: "flex-start", gap: 1.5,
        px: 2, py: 1.5, cursor: "pointer",
        bgcolor: selected ? "#f0f4e8" : isOnline ? "#f6faf3" : "transparent",
        borderLeft: "3px solid",
        borderColor: selected ? "secondary.main" : isOnline ? "success.main" : "transparent",
        borderBottom: "1px solid", borderBottomColor: "divider",
        "&:hover": { bgcolor: selected ? "#f0f4e8" : "#f8f9fa" },
        transition: "background-color 0.15s",
      }}
    >
      <Badge
        badgeContent={admin_unread > 0 ? admin_unread : 0}
        color="error"
        overlap="circular"
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          color="success"
          invisible={!isOnline}
        >
          <Avatar
            src={user?.avatar_url || undefined}
            sx={{ width: 40, height: 40, bgcolor: "secondary.light", color: "secondary.dark", fontSize: "0.875rem", fontWeight: 700 }}
          >
            {fullName.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
      </Badge>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
          <Typography fontSize="0.875rem" fontWeight={700} noWrap color="text.primary">
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.disabled" flexShrink={0} fontSize="0.7rem">
            {fmtTime(lastMessageAt)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
          {isOnline && (
            <Chip
              icon={<FiberManualRecord sx={{ fontSize: "10px !important", color: "success.main" }} />}
              label="Online"
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 16, fontSize: "0.65rem", fontWeight: 700 }}
            />
          )}
          {cfg && (
            <Chip label={cfg.label} color={cfg.color} size="small" sx={{ height: 16, fontSize: "0.65rem", fontWeight: 700 }} />
          )}
          {subtitle && (
            <Typography fontSize="0.72rem" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Typography fontSize="0.78rem" color="text.secondary" noWrap>
          {lastMessage || "No messages yet"}
        </Typography>
      </Box>
    </Box>
  );
}

function MessageRow({ msg }) {
  const isUser = msg.senderType === "user";
  const isSystem = msg.senderType === "system";

  if (isSystem) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
        <Typography
          fontSize="0.75rem"
          color="text.secondary"
          sx={{ bgcolor: "#f0f4e8", px: 2, py: 0.5, borderRadius: 10, fontStyle: "italic" }}
        >
          {msg.text}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end", mb: 0.75 }}>
      <Box
        sx={{
          maxWidth: "70%",
          px: 1.75, py: 1,
          bgcolor: isUser ? "#fff" : "#e8f0dc",
          border: isUser ? "1px solid" : "none",
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        {!isUser && (
          <Typography fontSize="0.68rem" color="secondary.dark" fontWeight={700} sx={{ mb: 0.25 }}>
            {msg.senderType === "ai" ? "AI Assistant" : "You"}
          </Typography>
        )}
        <Typography fontSize="0.875rem" color="text.primary" lineHeight={1.55} sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
          {msg.text}
        </Typography>
        <Typography fontSize="0.68rem" color="text.disabled" sx={{ mt: 0.4, textAlign: "right" }}>
          {msg.timeLabel}
        </Typography>
      </Box>
    </Box>
  );
}

// ── FAQ Editor Dialog ─────────────────────────────────────────────────────────
function FaqDialog({ open, item, onClose, onSave }) {
  const [form, setForm] = useState({ label: "", answer_text: "", category: "", channel: "both", keywords: "", link_path: "", sort_order: 0, is_active: true });

  useEffect(() => {
    if (item) {
      setForm({ ...item, keywords: (item.keywords || []).join(", ") });
    } else {
      setForm({ label: "", answer_text: "", category: "", channel: "both", keywords: "", link_path: "", sort_order: 0, is_active: true });
    }
  }, [item, open]);

  const handleSave = () => {
    const data = { ...form, keywords: form.keywords ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [] };
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 0 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{item ? "Edit FAQ" : "New FAQ"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField label="Chip label" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} size="small" fullWidth />
        <TextField label="Answer text" value={form.answer_text} onChange={(e) => setForm((p) => ({ ...p, answer_text: e.target.value }))} size="small" fullWidth multiline minRows={3} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} size="small" sx={{ flex: 1 }} />
          <TextField
            select label="Channel" value={form.channel}
            onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
            size="small" sx={{ width: 130 }}
            SelectProps={{ native: true }}
          >
            <option value="both">Both</option>
            <option value="rehoboth">Rehoboth</option>
            <option value="support">Support</option>
          </TextField>
        </Box>
        <TextField label="Keywords (comma-separated)" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} size="small" fullWidth />
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField label="Link path (optional)" value={form.link_path || ""} onChange={(e) => setForm((p) => ({ ...p, link_path: e.target.value }))} size="small" sx={{ flex: 1 }} />
          <TextField label="Sort order" type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} size="small" sx={{ width: 110 }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="secondary" disableElevation>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LiveChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [channelTab, setChannelTab] = useState(0); // 0=rehoboth, 1=support, 2=faq-editor
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [composerText, setComposerText] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // FAQ state
  const [faqs, setFaqs] = useState([]);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [threadError, setThreadError] = useState("");
  const selectedThreadRef = useRef(null);
  const adminSocketRef = useRef(null);
  const [startOpen, setStartOpen] = useState(false);
  const [startSearch, setStartSearch] = useState("");
  const [startUsers, setStartUsers] = useState([]);
  const [startLoading, setStartLoading] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const channel = channelTab === 1 ? "support" : "rehoboth";

  const chatStats = useMemo(() => ({
    onlineUsers: onlineUsers.length,
    active: threads.filter((t) => t.status === "human_active").length,
    queued: threads.filter((t) => t.status === "human_queue").length,
    aiHandled: threads.filter((t) => t.status === "ai").length,
  }), [threads, onlineUsers]);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    setThreadError("");
    try {
      const res = await adminGetChatThreads({ channel });
      if (res.data?.success) {
        setThreads(res.data.threads || []);
      } else {
        setThreadError(res.data?.error || "Failed to load conversations.");
      }
    } catch (err) {
      setThreadError(err.response?.data?.error || err.message || "Failed to load conversations.");
    } finally {
      setLoadingThreads(false);
    }
  }, [channel]);

  const loadPresence = useCallback(async () => {
    try {
      const res = await adminGetChatPresence();
      if (res.data?.success) {
        setOnlineUsers(res.data.users || []);
      }
    } catch {
      // keep previous list on transient errors
    }
  }, []);

  useEffect(() => {
    if (channelTab < 2) {
      loadThreads();
      loadPresence();
    }
  }, [channelTab, loadThreads, loadPresence]);

  useEffect(() => {
    if (channelTab >= 2) return undefined;
    const interval = setInterval(loadPresence, 30_000);
    return () => clearInterval(interval);
  }, [channelTab, loadPresence]);

  // Auto-select thread from ?thread=<id> URL param (set by "Chat" button on UsersPage)
  const autoSelectDoneRef = useRef(false);
  useEffect(() => {
    const paramThread = searchParams.get("thread");
    if (!paramThread || autoSelectDoneRef.current || loadingThreads) return;
    const match = threads.find((t) => t.id === paramThread);
    if (match) {
      autoSelectDoneRef.current = true;
      handleSelectThread(match);
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, loadingThreads]);

  // Load FAQs when FAQ editor tab opens
  useEffect(() => {
    if (channelTab === 2) {
      adminGetChatFaq().then((r) => setFaqs(r.data?.faqs || [])).catch(() => {});
    }
  }, [channelTab]);

  // Keep ref in sync so socket callbacks can read current selectedThread without reconnecting
  useEffect(() => {
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  const openStartDialog = () => {
    setStartOpen(true);
    setStartLoading(true);
    adminGetUsers({ limit: 200, status: "active" })
      .then((res) => setStartUsers(res.data?.users || []))
      .catch(() => setStartUsers([]))
      .finally(() => setStartLoading(false));
  };

  // Socket.IO — stable connection; never reconnects just because thread selection changes
  useEffect(() => {
    const token = localStorage.getItem("admin_token") || "";
    const socket = io(getServerOrigin(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    adminSocketRef.current = socket;

    socket.on("chat:message", (msg) => {
      const tid = msg.threadId || msg.thread_id;
      const active = selectedThreadRef.current;
      setThreads((prev) =>
        prev.map((t) =>
          t.id === tid
            ? { ...t, lastMessage: msg.text, lastMessageAt: msg.createdAt, admin_unread: t.id === active?.id ? 0 : (t.admin_unread || 0) + 1 }
            : t
        )
      );
      if (tid === active?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    socket.on("chat:thread-updated", ({ threadId, status }) => {
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, status } : t)));
      if (selectedThreadRef.current?.id === threadId) {
        setSelectedThread((p) => p ? { ...p, status } : p);
      }
    });

    socket.on("chat:presence", ({ userId, online }) => {
      if (!userId) return;
      if (online) {
        loadPresence();
        return;
      }
      setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    return () => {
      adminSocketRef.current = null;
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const socket = adminSocketRef.current;
    if (!socket || !selectedThread?.id || selectedThread.isVirtual) return undefined;
    socket.emit("chat:join", selectedThread.id);
    return () => socket.emit("chat:leave", selectedThread.id);
  }, [selectedThread?.id, selectedThread?.isVirtual]);

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    setLoadingMsgs(true);
    try {
      const res = await adminGetChatMessages(thread.id);
      setMessages(res.data?.messages || []);
      setThreads((prev) => prev.map((t) => (t.id === thread.id ? { ...t, admin_unread: 0 } : t)));
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleStartWithUser = async (userId) => {
    setStartBusy(true);
    try {
      const res = await adminStartChatThread({ userId, channel });
      const thread = res.data?.thread;
      if (thread) {
        setThreads((prev) => {
          const exists = prev.some((t) => t.id === thread.id);
          if (exists) return prev.map((t) => (t.id === thread.id ? { ...t, ...thread } : t));
          return [thread, ...prev];
        });
        await handleSelectThread(thread);
        setStartOpen(false);
      }
    } catch {
      setThreadError("Could not start conversation with that customer.");
    } finally {
      setStartBusy(false);
    }
  };

  const handleSend = async () => {
    if (!composerText.trim() || !selectedThread || sending) return;
    const text = composerText.trim();
    setComposerText("");
    setSending(true);
    try {
      const res = await adminSendChatMessage(selectedThread.id, { text });
      const saved = res.data?.message;
      if (saved) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === saved.id)) return prev;
          return [...prev, {
            id: saved.id,
            sender: "clinic",
            senderType: "admin",
            text: saved.body || text,
            createdAt: saved.created_at,
            timeLabel: fmtTime(saved.created_at),
            dayLabel: null,
            status: "sent",
          }];
        });
      }
      // Optimistically update thread status to human_active
      if (selectedThread.status !== "human_active") {
        setSelectedThread((p) => p ? { ...p, status: "human_active" } : p);
        setThreads((prev) => prev.map((t) => (t.id === selectedThread.id ? { ...t, status: "human_active" } : t)));
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handlePatchStatus = async (status) => {
    if (!selectedThread) return;
    setAnchorEl(null);
    try {
      await adminPatchChatThread(selectedThread.id, { status });
      setSelectedThread((p) => p ? { ...p, status } : p);
      setThreads((prev) => prev.map((t) => (t.id === selectedThread.id ? { ...t, status } : t)));
    } catch {
      // ignore
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // FAQ handlers
  const handleSaveFaq = async (data) => {
    try {
      if (editingFaq) {
        await adminUpdateChatFaq(editingFaq.id, data);
      } else {
        await adminCreateChatFaq(data);
      }
      const res = await adminGetChatFaq();
      setFaqs(res.data?.faqs || []);
    } catch {
      // ignore
    }
    setFaqDialogOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = async (id) => {
    try {
      await adminDeleteChatFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // ignore
    }
  };

  const matchesSearch = useCallback((user) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const name = `${user?.first_name || ""} ${user?.last_name || ""} ${user?.email || ""}`.toLowerCase();
    return name.includes(s);
  }, [search]);

  const { onlineEntries, offlineEntries } = useMemo(() => {
    const threadByUser = new Map();
    threads.forEach((t) => {
      if (t.user?.id) threadByUser.set(t.user.id, t);
    });

    const online = [];
    onlineUsers.forEach((user) => {
      const existing = threadByUser.get(user.id);
      if (existing) {
        online.push({ ...existing, isOnline: true, isVirtual: false });
        threadByUser.delete(user.id);
      } else {
        online.push({
          id: `online-${user.id}`,
          user,
          status: "ai",
          channel,
          isOnline: true,
          isVirtual: true,
          lastMessage: "Online now — tap to start chatting",
          lastMessageAt: new Date().toISOString(),
          admin_unread: 0,
          subtitle: user.email,
        });
      }
    });

    const offline = [...threadByUser.values()]
      .map((t) => ({ ...t, isOnline: false, isVirtual: false }))
      .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

    return { onlineEntries: online, offlineEntries: offline };
  }, [threads, onlineUsers, channel]);

  const filteredOnline = onlineEntries.filter((t) => matchesSearch(t.user));
  const filteredOffline = offlineEntries.filter((t) => matchesSearch(t.user));

  const handleOpenThread = (thread) => {
    if (thread.isVirtual && thread.user?.id) {
      handleStartWithUser(thread.user.id);
    } else {
      handleSelectThread(thread);
    }
  };

  const selectedCfg = selectedThread && !selectedThread.isVirtual
    ? (STATUS_CONFIG[selectedThread.status] || STATUS_CONFIG.ai)
    : null;

  const statsLoading = loadingThreads && threads.length === 0;

  return (
    <Box>
      <HeroPageSection
        title="Live Chat"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Live Chat" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Online Users"
              value={chatStats.onlineUsers.toString()}
              icon={Group}
              color="#2196f3"
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Active Chats"
              value={chatStats.active.toString()}
              icon={SupportAgent}
              color="#4caf50"
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="In Queue"
              value={chatStats.queued.toString()}
              icon={HourglassEmpty}
              color="#ff9800"
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="AI Handled"
              value={chatStats.aiHandled.toString()}
              icon={SmartToy}
              color="#9c27b0"
              loading={statsLoading}
            />
          </Grid>
        </Grid>
      </HeroPageSection>

      {/* Tabs */}
      <Tabs
        value={channelTab}
        onChange={(_, v) => { setChannelTab(v); setSelectedThread(null); setMessages([]); }}
        textColor="secondary"
        indicatorColor="secondary"
        sx={{
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
          <Tab label="Rehoboth" />
          <Tab label="Support" />
          <Tab label="FAQ Editor" icon={<QuestionAnswer sx={{ fontSize: 16 }} />} iconPosition="start" />
      </Tabs>

      {/* FAQ Editor */}
      {channelTab === 2 ? (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="text.primary">FAQ Items</Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              color="secondary"
              disableElevation
              onClick={() => { setEditingFaq(null); setFaqDialogOpen(true); }}
              sx={{ borderRadius: 0 }}
            >
              Add FAQ
            </Button>
          </Box>
          <Box sx={{ bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
            {faqs.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No FAQ items yet.</Typography>
            ) : (
              faqs.map((faq, idx) => (
                <Box key={faq.id}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, px: 2, py: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography fontWeight={700} fontSize="0.875rem">{faq.label}</Typography>
                        <Chip label={faq.channel} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
                        {faq.category && <Chip label={faq.category} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
                        {!faq.is_active && <Chip label="Inactive" color="error" size="small" sx={{ height: 18, fontSize: "0.65rem" }} />}
                      </Box>
                      <Typography fontSize="0.8rem" color="text.secondary" sx={{ mb: 0.5 }}>{faq.answer_text}</Typography>
                      {faq.keywords?.length > 0 && (
                        <Typography fontSize="0.72rem" color="text.disabled">
                          Keywords: {faq.keywords.join(", ")}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => { setEditingFaq(faq); setFaqDialogOpen(true); }}>
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteFaq(faq.id)}>
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  {idx < faqs.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Box>
          <FaqDialog
            open={faqDialogOpen}
            item={editingFaq}
            onClose={() => { setFaqDialogOpen(false); setEditingFaq(null); }}
            onSave={handleSaveFaq}
          />
        </Box>
      ) : (
        // Chat UI
        <Box
          sx={{
            display: "flex",
            height: "calc(100vh - 280px)",
            minHeight: 500,
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Thread list */}
          <Box sx={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid", borderColor: "divider" }}>
            <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                disableElevation
                startIcon={<Add />}
                onClick={openStartDialog}
                sx={{ borderRadius: 0, alignSelf: "stretch" }}
              >
                Message a customer
              </Button>
              <TextField
                size="small"
                placeholder="Search customers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {threadError && (
                <Typography color="error" fontSize="0.8rem" sx={{ p: 2, textAlign: "center" }}>
                  {threadError}
                </Typography>
              )}
              {loadingThreads ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                  <CircularProgress color="secondary" size={28} />
                </Box>
              ) : !threadError && filteredOnline.length === 0 && filteredOffline.length === 0 ? (
                <Typography color="text.disabled" fontSize="0.85rem" sx={{ p: 3, textAlign: "center" }}>
                  No conversations yet. Online customers will appear here when they are on the site.
                </Typography>
              ) : (
                <>
                  {filteredOnline.length > 0 && (
                    <>
                      <Typography
                        sx={{
                          px: 2,
                          py: 0.75,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          color: "success.dark",
                          bgcolor: "#f1f8e9",
                        }}
                      >
                        ONLINE NOW
                      </Typography>
                      {filteredOnline.map((t) => (
                        <ThreadItem
                          key={t.isVirtual ? `online-${t.user.id}` : t.id}
                          thread={t}
                          selected={
                            selectedThread?.id === t.id ||
                            (t.isVirtual && selectedThread?.user?.id === t.user?.id)
                          }
                          onClick={() => handleOpenThread(t)}
                        />
                      ))}
                    </>
                  )}
                  {filteredOffline.length > 0 && (
                    <>
                      {filteredOnline.length > 0 && <Divider />}
                      <Typography
                        sx={{
                          px: 2,
                          py: 0.75,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          color: "text.secondary",
                          bgcolor: "#fafafa",
                        }}
                      >
                        CONVERSATIONS
                      </Typography>
                      {filteredOffline.map((t) => (
                        <ThreadItem
                          key={t.id}
                          thread={t}
                          selected={selectedThread?.id === t.id}
                          onClick={() => handleOpenThread(t)}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* Chat panel */}
          {!selectedThread ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8f9fa" }}>
              <Box sx={{ textAlign: "center", color: "text.disabled" }}>
                <QuestionAnswer sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                <Typography fontSize="0.9rem">Select a conversation</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {/* Header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, bgcolor: "#fff", borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                <Avatar
                  src={selectedThread.user?.avatar_url || undefined}
                  sx={{ width: 36, height: 36, bgcolor: "secondary.light", color: "secondary.dark", fontWeight: 700, fontSize: "0.875rem" }}
                >
                  {(selectedThread.user?.first_name || "?").charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize="0.9rem" noWrap>
                    {selectedThread.user
                      ? `${selectedThread.user.first_name || ""} ${selectedThread.user.last_name || ""}`.trim() || selectedThread.user.email
                      : "Unknown"}
                  </Typography>
                  {selectedThread.subtitle && (
                    <Typography fontSize="0.72rem" color="text.secondary" noWrap>{selectedThread.subtitle}</Typography>
                  )}
                </Box>
                {selectedCfg && (
                  <Chip label={selectedCfg.label} color={selectedCfg.color} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem" }} />
                )}
                <Tooltip title="Actions">
                  <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => handlePatchStatus("ai")}>
                    <SmartToy sx={{ mr: 1.5, fontSize: 18 }} /> Return to AI
                  </MenuItem>
                  <MenuItem onClick={() => handlePatchStatus("human_queue")}>
                    <Person sx={{ mr: 1.5, fontSize: 18 }} /> Mark as Queued
                  </MenuItem>
                  <MenuItem onClick={() => handlePatchStatus("human_active")}>
                    <SupportAgent sx={{ mr: 1.5, fontSize: 18 }} /> Mark as Active
                  </MenuItem>
                </Menu>
              </Box>

              {/* Messages */}
              <Box ref={messagesRef} sx={{ flex: 1, overflowY: "auto", px: 2, py: 2, bgcolor: "#f8f9fa" }}>
                {loadingMsgs ? (
                  <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                    <CircularProgress color="secondary" size={28} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Typography color="text.disabled" fontSize="0.85rem" textAlign="center" sx={{ pt: 4 }}>
                    No messages yet.
                  </Typography>
                ) : (
                  messages.map((msg) => <MessageRow key={msg.id} msg={msg} />)
                )}
              </Box>

              {/* Composer */}
              <Box sx={{ display: "flex", gap: 1, px: 2, py: 1.5, bgcolor: "#fff", borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                <TextField
                  inputRef={inputRef}
                  placeholder="Type a reply…"
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  fullWidth
                  size="small"
                  multiline
                  maxRows={4}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
                <IconButton
                  onClick={handleSend}
                  disabled={!composerText.trim() || sending}
                  sx={{
                    bgcolor: "secondary.main",
                    color: "#fff",
                    borderRadius: 0,
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    alignSelf: "flex-end",
                    "&:hover": { bgcolor: "secondary.dark" },
                    "&.Mui-disabled": { bgcolor: "#e0e0e0" },
                  }}
                >
                  {sending ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <Send sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Dialog open={startOpen} onClose={() => !startBusy && setStartOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Start {channel === "support" ? "Support" : "Rehoboth"} chat
        </DialogTitle>
        <DialogContent>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name or email…"
            value={startSearch}
            onChange={(e) => setStartSearch(e.target.value)}
            sx={{ mb: 2, mt: 0.5 }}
          />
          {startLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} color="secondary" />
            </Box>
          ) : (
            <List dense sx={{ maxHeight: 320, overflow: "auto" }}>
              {startUsers
                .filter((u) => {
                  if (!startSearch.trim()) return true;
                  const s = startSearch.toLowerCase();
                  const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
                  return name.includes(s) || (u.email || "").toLowerCase().includes(s);
                })
                .map((u) => (
                  <ListItem
                    key={u.id}
                    component="button"
                    type="button"
                    onClick={() => handleStartWithUser(u.id)}
                    disabled={startBusy}
                    sx={{ cursor: "pointer", borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <ListItemText
                      primary={`${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email}
                      secondary={u.email}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartOpen(false)} disabled={startBusy}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
