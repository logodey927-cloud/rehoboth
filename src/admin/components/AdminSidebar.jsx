import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarToday,
  EventNote,
  Email,
  People,
  Dashboard,
  Logout,
  Lock,
  LocalOffer,
  VerifiedUser,
  Spa,
  Article,
  Payment,
  Groups,
  Block,
  ManageAccounts,
  RateReview,
  Share,
  Tune as TuneIcon,
  ExpandMore,
  ChevronRight,
  CardGiftcard as ReferralIcon,
  Chat as ChatIcon,
  CreditCard as CreditCardIcon,
  NotificationsActive as NotificationsIcon,
  Notifications as NotificationsInboxIcon,
  Leaderboard as FunnelIcon,
  RecentActors as ContactsIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import logoImage from "../../assets/images/logo.png";
import { getAdminSocket } from "../../utils/adminSocket";
import { adminGetChatThreads } from "../../api/api";

const drawerWidth    = 260;
const collapsedWidth = 80;

const menuGroups = [
  {
    label: "Overview",
    items: [
      { text: "Dashboard",     icon: Dashboard,              path: "/admin" },
      { text: "Notifications", icon: NotificationsInboxIcon, path: "/admin/notifications" },
    ],
  },
  {
    label: "Operations",
    items: [
      { text: "Appointments",         icon: CalendarToday, path: "/admin/appointments" },
      { text: "Calendar",             icon: EventNote,     path: "/admin/calendar" },
      { text: "Blocked Time Slots",   icon: Block,         path: "/admin/blocked-time-slots" },
      { text: "Services",             icon: Spa,           path: "/admin/services" },
      { text: "Payments",             icon: Payment,       path: "/admin/payments" },
      { text: "Vouchers",             icon: LocalOffer,    path: "/admin/vouchers" },
      { text: "Voucher Verification", icon: VerifiedUser,  path: "/admin/vouchers/verify" },
    ],
  },
  {
    label: "Customers",
    items: [
      { text: "Customer Users",   icon: ManageAccounts, path: "/admin/users" },
      { text: "Live Chat",        icon: ChatIcon,       path: "/admin/live-chat" },
      { text: "Referrals",        icon: ReferralIcon,   path: "/admin/referrals" },
      { text: "Reviews",          icon: RateReview,     path: "/admin/reviews" },
      { text: "Contact Messages", icon: Email,          path: "/admin/contact-messages" },
      { text: "Subscribers",      icon: People,         path: "/admin/subscribers" },
    ],
  },
  {
    label: "Content",
    items: [
      { text: "Blog Posts",   icon: Article, path: "/admin/blog" },
      { text: "Social Links", icon: Share,   path: "/admin/social-links" },
    ],
  },
  {
    label: "CRM",
    items: [
      { text: "Funnel",    icon: FunnelIcon,    path: "/admin/crm/funnel" },
      { text: "Contacts",  icon: ContactsIcon,  path: "/admin/crm/contacts" },
      { text: "Campaigns", icon: CampaignIcon,  path: "/admin/crm/campaigns" },
    ],
  },
  {
    label: "Settings",
    items: [
      { text: "Site Settings",          icon: TuneIcon,           path: "/admin/site-settings" },
      { text: "Payment Settings",       icon: CreditCardIcon,     path: "/admin/payment-settings" },
      { text: "Notification Settings",  icon: NotificationsIcon,  path: "/admin/notification-settings" },
      { text: "Team Members",           icon: Groups,             path: "/admin/team" },
      { text: "Referral Programme",     icon: ReferralIcon,       path: "/admin/referrals/settings" },
      { text: "Change Password",        icon: Lock,               path: "/admin/change-password" },
    ],
  },
];

// Return the label of the group that contains a given path (also matches sub-paths)
function groupForPath(pathname) {
  return (
    menuGroups.find((g) =>
      g.items.some((item) => item.path === pathname || pathname.startsWith(item.path + "/"))
    )?.label ?? null
  );
}

export default function AdminSidebar({ open, onToggle }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down("md"));
  const { logout } = useAuth();
  const [chatUnread, setChatUnread] = useState(0);

  // Initial load: sum admin_unread across all threads
  useEffect(() => {
    adminGetChatThreads({ limit: 200 })
      .then((res) => {
        const threads = res.data?.threads || [];
        setChatUnread(threads.reduce((sum, t) => sum + (t.admin_unread || 0), 0));
      })
      .catch(() => {});
  }, []);

  // Socket: increment on each user message; clear when admin opens live chat
  useEffect(() => {
    const socket = getAdminSocket();
    const handleMsg = (msg) => {
      if (msg.sender === "user" || msg.senderType === "user") {
        setChatUnread((prev) => prev + 1);
      }
    };
    socket.on("chat:message", handleMsg);
    return () => socket.off("chat:message", handleMsg);
  }, []);

  // Clear badge when admin navigates to live chat
  useEffect(() => {
    if (location.pathname.startsWith("/admin/live-chat")) {
      setChatUnread(0);
    }
  }, [location.pathname]);

  // Start with only the active group expanded
  const [expanded, setExpanded] = useState(() => {
    const active = groupForPath(location.pathname);
    return new Set(active ? [active] : []);
  });

  // Auto-expand the group that contains the newly active route
  useEffect(() => {
    const active = groupForPath(location.pathname);
    if (active) {
      setExpanded((prev) => {
        if (prev.has(active)) return prev; // already open — no-op
        return new Set([...prev, active]);
      });
    }
  }, [location.pathname]);

  const toggleGroup = (label) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onToggle();
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const drawerOpen       = isMobile ? open : true;
  const drawerWidthValue = isMobile
    ? (open ? drawerWidth : 0)
    : (open ? drawerWidth : collapsedWidth);

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={drawerOpen}
      onClose={onToggle}
      sx={{
        width: drawerWidthValue,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidthValue,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          overflowY: "auto",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
        },
      }}
    >
      {/* ── Logo / Brand ── */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          px: open ? 2 : 1,
          minHeight: "64px !important",
        }}
      >
        {open ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <Box
              component="img"
              src={logoImage}
              alt="Rehoboth Health and Wellness Clinic Logo"
              sx={{ height: 40, width: "auto" }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 700, color: "secondary.dark", fontSize: "1rem", letterSpacing: "0.5px" }}
            >
              REHOBOTH
            </Typography>
          </Box>
        ) : (
          <Box
            component="img"
            src={logoImage}
            alt="Rehoboth Logo"
            sx={{ height: 36, width: "auto" }}
          />
        )}
      </Toolbar>

      <Divider />

      {/* ── Navigation groups ── */}
      <Box sx={{ py: 0.5 }}>
        {menuGroups.map((group, groupIndex) => {
          const isGroupExpanded = expanded.has(group.label);

          return (
            <React.Fragment key={group.label}>
              {/* Thin divider between groups in icon-only mode */}
              {groupIndex > 0 && !open && <Divider sx={{ my: 0.5 }} />}

              {/* Group header — only shown when sidebar is expanded */}
              {open && (
                <ListItemButton
                  onClick={() => toggleGroup(group.label)}
                  sx={{
                    mx: 1,
                    px: 1.5,
                    py: 0.625,
                    minHeight: 30,
                    borderRadius: 1,
                    mt: groupIndex === 0 ? 0.5 : 1,
                    mb: 0.25,
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      flex: 1,
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: 1.4,
                      color: "text.disabled",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {group.label}
                  </Typography>
                  {isGroupExpanded
                    ? <ExpandMore  sx={{ fontSize: 15, color: "text.disabled" }} />
                    : <ChevronRight sx={{ fontSize: 15, color: "text.disabled" }} />}
                </ListItemButton>
              )}

              {/* Items — collapsible when sidebar is expanded, always visible when icon-only */}
              <Collapse in={open ? isGroupExpanded : true} timeout="auto" unmountOnExit={false}>
                <List sx={{ px: open ? 1 : 0.5, py: 0 }} disablePadding>
                  {group.items.map((item) => {
                    const Icon     = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                          onClick={() => handleNavigation(item.path)}
                          sx={{
                            minHeight: 40,
                            justifyContent: open ? "initial" : "center",
                            px: open ? 2 : 1,
                            borderRadius: 1,
                            backgroundColor: isActive ? "secondary.dark" : "transparent",
                            color: isActive ? "primary.main" : "text.primary",
                            "&:hover": {
                              backgroundColor: isActive ? "secondary.dark" : "action.hover",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 1.5 : "auto",
                              justifyContent: "center",
                              color: isActive ? "primary.main" : "text.secondary",
                              "& .MuiSvgIcon-root": { fontSize: "1.125rem" },
                            }}
                          >
                            {item.path === "/admin/live-chat" && chatUnread > 0 ? (
                              <Badge badgeContent={chatUnread} color="error" max={99}>
                                <Icon />
                              </Badge>
                            ) : (
                              <Icon />
                            )}
                          </ListItemIcon>
                          {open && (
                            <ListItemText
                              primary={item.text}
                              primaryTypographyProps={{
                                fontWeight: isActive ? 600 : 400,
                                fontSize: "0.8125rem",
                              }}
                            />
                          )}
                          {open && item.path === "/admin/live-chat" && chatUnread > 0 && (
                            <Box
                              sx={{
                                minWidth: 18, height: 18, borderRadius: 9,
                                bgcolor: "error.main", color: "#fff",
                                fontSize: "0.65rem", fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                px: 0.5, ml: 0.5,
                              }}
                            >
                              {chatUnread > 99 ? "99+" : chatUnread}
                            </Box>
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </Box>

      {/* ── Logout ── */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ my: 1 }} />
        <List sx={{ px: open ? 1 : 0.5, py: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 40,
                justifyContent: open ? "initial" : "center",
                px: open ? 2 : 1,
                borderRadius: 1,
                color: "error.main",
                "&:hover": { backgroundColor: "error.light", color: "error.dark" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 1.5 : "auto",
                  justifyContent: "center",
                  color: "error.main",
                  "& .MuiSvgIcon-root": { fontSize: "1.125rem" },
                }}
              >
                <Logout />
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontWeight: 500, fontSize: "0.8125rem" }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
