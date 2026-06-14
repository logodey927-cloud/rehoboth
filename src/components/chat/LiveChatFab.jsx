import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Drawer,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Badge,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close,
  SupportAgent,
  Spa,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { getChatThreads, getChatFaq, getPublicChatFaq, sendChatMessage } from "../../api/api";
import { isOnline } from "../../utils/pwa";

const DRAWER_WIDTH = 380;

export default function LiveChatFab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, accessToken } = useUserAuth();

  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState("rehoboth");
  const [totalUnread, setTotalUnread] = useState(0);
  const [online, setOnline] = useState(isOnline());
  const [sendingFaqId, setSendingFaqId] = useState(null);

  // Track online/offline state for the chat FAB
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const hidden =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/team/") ||
    location.pathname.startsWith("/my-account/messages");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated && accessToken) {
        const [threadsRes, faqRes] = await Promise.all([
          getChatThreads(),
          getChatFaq(channel),
        ]);
        const t = threadsRes.data?.threads || [];
        setThreads(t);
        setFaqs(faqRes.data?.faqs || []);
        setTotalUnread(t.reduce((sum, th) => sum + (th.unreadCount || 0), 0));
      } else {
        const faqRes = await getPublicChatFaq(channel);
        setFaqs(faqRes.data?.faqs || []);
        setThreads([]);
        setTotalUnread(0);
      }
    } catch {
      setFaqs([]);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, channel]);

  useEffect(() => {
    if (open) loadData();
  }, [open, loadData]);

  const openThread = (threadId) => {
    setOpen(false);
    navigate(`/my-account/messages?thread=${threadId}`);
  };

  const channelThreads = threads.filter((t) => t.channel === channel);
  const displayFaqs = faqs.filter((f) => f.category !== "human");

  if (hidden) return null;

  return (
    <>
      <Badge
        badgeContent={totalUnread > 0 && !open ? totalUnread : 0}
        color="error"
        overlap="circular"
        sx={{
          position: "fixed",
          bottom: {
            xs: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            md: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
          },
          right: { xs: 20, md: 28 },
          zIndex: 1300,
        }}
      >
        <Fab
          color="secondary"
          aria-label="Open live chat"
          onClick={() => {
            if (!online) {
              alert("Chat is unavailable offline. Please check your connection.");
              return;
            }
            setOpen(true);
          }}
          sx={{ boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
        >
          <ChatIcon />
        </Fab>
      </Badge>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: DRAWER_WIDTH }, maxWidth: "100vw" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              bgcolor: "secondary.main",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <Typography fontWeight={700} fontSize="1rem">
              Live Chat
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <Close />
            </IconButton>
          </Box>

          {/* Channel tabs */}
          <Box sx={{ display: "flex", gap: 1, p: 1.5, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <Chip
              icon={<Spa sx={{ fontSize: 16 }} />}
              label="Rehoboth"
              onClick={() => setChannel("rehoboth")}
              color={channel === "rehoboth" ? "secondary" : "default"}
              variant={channel === "rehoboth" ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<SupportAgent sx={{ fontSize: 16 }} />}
              label="Support"
              onClick={() => setChannel("support")}
              color={channel === "support" ? "secondary" : "default"}
              variant={channel === "support" ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress color="secondary" size={32} />
              </Box>
            ) : isAuthenticated ? (
              /* Authenticated: show threads */
              <>
                {channelThreads.length === 0 ? (
                  <Typography fontSize="0.85rem" color="text.secondary" sx={{ mb: 2 }}>
                    No {channel} conversation yet.
                  </Typography>
                ) : (
                  channelThreads.map((t) => (
                    <Box
                      key={t.id}
                      onClick={() => openThread(t.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openThread(t.id)}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#f8f9fa" },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography fontWeight={700} fontSize="0.9rem">{t.name}</Typography>
                        {t.unreadCount > 0 && (
                          <Chip
                            label={t.unreadCount}
                            size="small"
                            color="error"
                            sx={{ height: 18, fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      {t.subtitle && (
                        <Typography fontSize="0.72rem" color="text.secondary">{t.subtitle}</Typography>
                      )}
                      {t.lastMessage && (
                        <Typography fontSize="0.78rem" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                          {t.lastMessage}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}

                {displayFaqs.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography fontSize="0.75rem" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                      QUICK QUESTIONS
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {displayFaqs.map((faq) => {
                        const isSending = sendingFaqId === faq.id;
                        return (
                          <Chip
                            key={faq.id}
                            label={isSending ? "Sending…" : faq.label}
                            size="small"
                            disabled={!!sendingFaqId}
                            onClick={async () => {
                              if (sendingFaqId) return;
                              const thread =
                                channelThreads.find((t) => t.source === "general") ||
                                channelThreads[0];
                              if (thread) {
                                setSendingFaqId(faq.id);
                                try {
                                  await sendChatMessage(thread.id, {
                                    text: faq.label,
                                    faqItemId: faq.id,
                                  });
                                } catch {
                                  // navigate anyway — thread will still open
                                } finally {
                                  setSendingFaqId(null);
                                }
                                setOpen(false);
                                navigate(`/my-account/messages?thread=${thread.id}`);
                              } else {
                                // No thread yet — open messages page; user can ask there
                                setOpen(false);
                                navigate("/my-account/messages");
                              }
                            }}
                            sx={{
                              cursor: sendingFaqId ? "default" : "pointer",
                              bgcolor: "#f0f4e8",
                              color: "secondary.dark",
                              fontSize: "0.72rem",
                              border: "1px solid",
                              borderColor: "secondary.light",
                              "&:hover": { bgcolor: sendingFaqId ? "#f0f4e8" : "#e4eccc" },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </>
                )}
              </>
            ) : (
              /* Guest: show FAQs + login prompt */
              <>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "#f0f4e8",
                    border: "1px solid",
                    borderColor: "secondary.light",
                  }}
                >
                  <Typography fontWeight={700} fontSize="0.9rem" color="secondary.dark" sx={{ mb: 0.5 }}>
                    Chat with us
                  </Typography>
                  <Typography fontSize="0.8rem" color="text.secondary" sx={{ mb: 1.5 }}>
                    Log in to message our team about your care, bookings, and wellness.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disableElevation
                    startIcon={<LoginIcon />}
                    onClick={() => {
                      setOpen(false);
                      navigate("/login", { state: { from: "/my-account/messages" } });
                    }}
                    sx={{ borderRadius: 0, textTransform: "none", fontWeight: 600 }}
                  >
                    Log in to chat
                  </Button>
                </Box>

                {displayFaqs.length > 0 && (
                  <>
                    <Typography fontSize="0.75rem" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                      QUICK QUESTIONS
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {displayFaqs.map((faq) => (
                        <Box
                          key={faq.id}
                          sx={{
                            p: 1.25,
                            border: "1px solid",
                            borderColor: "divider",
                            cursor: "default",
                          }}
                        >
                          <Typography fontWeight={600} fontSize="0.82rem" color="text.primary" sx={{ mb: 0.5 }}>
                            {faq.label}
                          </Typography>
                          <Typography fontSize="0.78rem" color="text.secondary" lineHeight={1.5}>
                            {faq.answer_text}
                          </Typography>
                          {faq.link_path && (
                            <Typography
                              component="a"
                              href={faq.link_path}
                              fontSize="0.75rem"
                              color="secondary.dark"
                              sx={{ display: "block", mt: 0.5, textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                            >
                              Learn more →
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>

          {/* Footer (authenticated only) */}
          {isAuthenticated && (
            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                disableElevation
                onClick={() => {
                  setOpen(false);
                  navigate("/my-account/messages");
                }}
                sx={{ borderRadius: 0, mb: 1, textTransform: "none" }}
              >
                Open full messages
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<SupportAgent />}
                onClick={() => {
                  const support = threads.find((t) => t.channel === "support" && t.source === "general");
                  setOpen(false);
                  navigate(support ? `/my-account/messages?thread=${support.id}` : "/my-account/messages");
                }}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Talk to support
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
