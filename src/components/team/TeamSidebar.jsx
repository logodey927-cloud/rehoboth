import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  EventNote as CalendarViewIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import logoImage from "../../assets/images/logo.png";

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
  { text: "Dashboard", icon: DashboardIcon, path: "/team/dashboard" },
  { text: "My Appointments", icon: CalendarIcon, path: "/team/appointments" },
  { text: "Calendar", icon: CalendarViewIcon, path: "/team/calendar" },
  { text: "My Profile", icon: PersonIcon, path: "/team/profile" },
  { text: "Change Password", icon: LockIcon, path: "/team/change-password" },
];

export default function TeamSidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout } = useTeamMemberAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle(); // Close drawer on mobile after navigation
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/team/login");
  };

  // On desktop, drawer is always visible (persistent), but width changes
  // On mobile, drawer visibility toggles (temporary)
  const drawerOpen = isMobile ? open : true;
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="Rehoboth Health and Wellness Clinic Logo"
              sx={{
                height: 40,
                width: "auto",
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                color: "secondary.dark",
                fontSize: "1rem",
                letterSpacing: "0.5px",
              }}
            >
              REHOBOTH
            </Typography>
          </Box>
        ) : (
          <Box
            component="img"
            src={logoImage}
            alt="Rehoboth Logo"
            sx={{
              height: 36,
              width: "auto",
            }}
          />
        )}
      </Toolbar>
      <Divider />
      <List sx={{ px: open ? 1 : 0.5, py: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: open ? 2.5 : 1,
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
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  <Icon />
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
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Logout Button */}
      <List sx={{ px: open ? 1 : 0.5, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: open ? 2.5 : 1,
              borderRadius: 1,
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.light",
                color: "error.dark",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
                color: "error.main",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { drawerWidth, collapsedWidth };

