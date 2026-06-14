import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Paper, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider,
  useTheme, useMediaQuery, Drawer, IconButton,
} from "@mui/material";
import {
  CalendarToday, CardGiftcard, Person, Lock, Logout, People, EventNote,
  Menu as MenuIcon, Close as CloseIcon, Notifications, Message, CameraAlt,
} from "@mui/icons-material";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { resolveUserAvatarUrl } from "../../utils/userAvatar";
import { getChatThreads } from "../../api/api";
import { getChatSocket } from "../../utils/chatSocket";
import SEO from "../../components/common09/SEO";
import AvatarPickerModal from "../../components/profile/AvatarPickerModal";

const SIDEBAR_WIDTH = 300;

const BASE_NAV_ITEMS = [
  { label: "Profile",          icon: <Person />,       path: "/my-account/profile" },
  { label: "Appointments",     icon: <CalendarToday />,path: "/my-account/appointments" },
  { label: "Calendar",         icon: <EventNote />,    path: "/my-account/calendar" },
  { label: "Vouchers",         icon: <CardGiftcard />, path: "/my-account/vouchers" },
  { label: "Refer a Friend",   icon: <People />,       path: "/my-account/refer-a-friend" },
  { label: "Change Password",  icon: <Lock />,         path: "/my-account/change-password" },
  { label: "Notifications",    icon: <Notifications />,path: "/my-account/notifications", badgeKey: "notifications" },
  { label: "Messages",         icon: <Message />,      path: "/my-account/messages",      badgeKey: "chat" },
];

function SideNav({ onLogout, onNavigate, showClose }) {
  const { user, accessToken, updateUser, isAuthenticated } = useUserAuth();
  const { unreadCount: notifUnread } = useNotifications();
  const location = useLocation();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const initials =
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() || "U";
  const avatarSrc = user ? resolveUserAvatarUrl(user) : undefined;

  // Fetch initial chat unread count
  const fetchChatUnread = useCallback(() => {
    if (!isAuthenticated) return;
    getChatThreads()
      .then((res) => {
        const threads = res.data?.threads || [];
        setChatUnread(threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    fetchChatUnread();
  }, [fetchChatUnread]);

  // Listen to incoming socket messages to increment unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getChatSocket(accessToken || "");
    const handleMsg = (msg) => {
      // Only count messages not sent by the user themselves
      const isOnMessagesPage = location.pathname.startsWith("/my-account/messages");
      if (!isOnMessagesPage && msg.senderType !== "user" && msg.sender_type !== "user") {
        setChatUnread((prev) => prev + 1);
      }
    };
    socket.on("chat:message", handleMsg);
    return () => socket.off("chat:message", handleMsg);
  }, [isAuthenticated, accessToken, location.pathname]);

  // Clear chat unread when user is on the messages page
  useEffect(() => {
    if (location.pathname.startsWith("/my-account/messages")) {
      setChatUnread(0);
    }
  }, [location.pathname]);

  const NAV_ITEMS = BASE_NAV_ITEMS.map((item) => ({
    ...item,
    badge:
      item.badgeKey === "notifications" ? notifUnread :
      item.badgeKey === "chat"          ? chatUnread :
      (item.badge ?? 0),
  }));

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <>
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        overflow: "hidden",
        height: showClose ? "100%" : "auto",
        minHeight: showClose ? "100%" : 480,
        bgcolor: "#fff",
        boxShadow: showClose ? "none" : "0 4px 24px rgba(71, 103, 47, 0.08)",
        border: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showClose && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography fontWeight={700} fontSize="1rem" color="secondary.dark">
            My Account
          </Typography>
          <IconButton
            onClick={handleNavClick}
            aria-label="Close menu"
            size="large"
            sx={{ color: "secondary.dark" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          pt: showClose ? 2 : 3.5,
          pb: 2.5,
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ position: "relative", mb: 1.5 }}>
          <Avatar
            src={avatarSrc}
            alt={`${user?.first_name} ${user?.last_name}`}
            sx={{
              width: showClose ? 72 : 88,
              height: showClose ? 72 : 88,
              fontSize: "1.75rem",
              fontWeight: 700,
              bgcolor: "secondary.light",
              color: "secondary.dark",
              border: "4px solid #fff",
              boxShadow: "0 6px 20px rgba(71, 103, 47, 0.15)",
            }}
          >
            {initials}
          </Avatar>
          <Box
            onClick={() => setAvatarModalOpen(true)}
            role="button"
            aria-label="Change profile photo"
            sx={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
              cursor: "pointer",
              "&:hover": { bgcolor: "secondary.dark" },
            }}
          >
            <CameraAlt sx={{ fontSize: 14, color: "#fff" }} />
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
          Welcome,
        </Typography>
        <Typography fontWeight={700} fontSize="1rem" color="text.primary" textAlign="center">
          {user?.first_name} {user?.last_name}
        </Typography>
        <Typography
          fontSize="0.75rem"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: "100%", px: 1, wordBreak: "break-word" }}
        >
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ pt: 1, px: 1.5, flex: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.label}
            component={NavLink}
            to={item.path}
            onClick={handleNavClick}
            sx={{
              borderRadius: 0,
              mb: 0.5,
              py: 1.25,
              minHeight: 48,
              color: "text.secondary",
              "&.active": {
                backgroundColor: "secondary.main",
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
              "&:hover:not(.active)": { backgroundColor: "action.hover" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
            />
            {item.badge > 0 && (
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  bgcolor: "error.main",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 0.75,
                }}
              >
                {item.badge}
              </Box>
            )}
          </ListItemButton>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <ListItemButton
          onClick={() => {
            handleNavClick();
            onLogout();
          }}
          sx={{
            borderRadius: 0,
            py: 1.25,
            minHeight: 48,
            color: "error.main",
            "&:hover": { bgcolor: "error.light", color: "error.dark" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Paper>

    <AvatarPickerModal
      open={avatarModalOpen}
      onClose={() => setAvatarModalOpen(false)}
      user={user}
      accessToken={accessToken}
      avatarUrl={user?.avatar_url}
      gender={user?.gender}
      onAvatarChange={(url) => {
        updateUser({ ...user, avatar_url: url });
        setAvatarModalOpen(false);
      }}
    />
    </>
  );
}

export default function AccountLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUserAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  const handleLogout = () => {
    closeDrawer();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <SEO title="My Account | Rehoboth Health & Wellness Clinic" />
      <Box sx={{ backgroundColor: "#f9f6f2", minHeight: "calc(100vh - 120px)", py: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl" disableGutters={isMobile} sx={{ px: { xs: 2, sm: 3, md: 3 } }}>
          {isMobile && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                position: "sticky",
                top: 0,
                zIndex: 10,
                bgcolor: "#f9f6f2",
                py: 1,
              }}
            >
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open account menu"
                size="large"
                sx={{
                  color: "secondary.dark",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                  bgcolor: "#fff",
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700} color="secondary.dark" sx={{ flex: 1 }}>
                My Account
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "flex-start",
              gap: 3,
            }}
          >
            {!isMobile && (
              <Box
                component="aside"
                sx={{
                  width: SIDEBAR_WIDTH,
                  flexShrink: 0,
                  position: "sticky",
                  top: 24,
                  alignSelf: "flex-start",
                }}
              >
                <SideNav onLogout={handleLogout} />
              </Box>
            )}

            <Box
              component="main"
              sx={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                maxWidth: { md: `calc(100% - ${SIDEBAR_WIDTH}px - 24px)` },
                "& .MuiOutlinedInput-root": { borderRadius: 0 },
                "& .MuiOutlinedInput-notchedOutline": { borderRadius: 0 },
                "& .MuiInputBase-root": { borderRadius: 0 },
                "& .MuiSelect-select": { borderRadius: 0 },
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Container>
      </Box>

      <Drawer
        anchor="left"
        open={isMobile && drawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: (t) => t.zIndex.drawer + 2,
        }}
        PaperProps={{
          sx: {
            width: "min(100vw, 320px)",
            maxWidth: "100%",
            bgcolor: "#fff",
            borderRadius: 0,
          },
        }}
      >
        <SideNav onLogout={handleLogout} onNavigate={closeDrawer} showClose />
      </Drawer>
    </>
  );
}
