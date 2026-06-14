import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from "@mui/icons-material";
import TeamSidebar from "./TeamSidebar";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";

export default function TeamDashboardLayout() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Collapsed by default
  const [anchorEl, setAnchorEl] = useState(null);
  const { teamMember, logout } = useTeamMemberAuth();
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/team/login");
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate("/team/change-password");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/team/profile");
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <TeamSidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: "100%",
            md: `calc(100% - ${sidebarOpen ? 260 : 80}px)` 
          },
          ml: { 
            xs: 0,
            md: 0 
          },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: "#f5f7fa",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid",
            borderColor: "divider",
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Left Sidebar Toggle Button */}
              <IconButton
                edge="start"
                aria-label="menu"
                onClick={handleSidebarToggle}
                sx={{
                  color: "#84994f",
                  "&:hover": {
                    backgroundColor: "rgba(132, 153, 79, 0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: "#1a1f2e",
                  fontWeight: 600,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                Rehoboth Health & Wellness Clinic
              </Typography>
              <Chip
                label="Team Member"
                size="small"
                sx={{
                  backgroundColor: "#84994f15",
                  color: "#84994f",
                  fontWeight: 600,
                  borderRadius: 0,
                  display: { xs: "none", md: "flex" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                onClick={handleMenuOpen}
              >
                <Avatar
                  src={teamMember?.image_url}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "#84994f",
                    fontSize: "0.8125rem",
                  }}
                >
                  {teamMember?.title
                    ? teamMember.title.charAt(0).toUpperCase()
                    : "T"}
                </Avatar>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {teamMember?.title || "Team Member"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.6875rem",
                    }}
                  >
                    {teamMember?.role || "Member"}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    color: "text.secondary",
                    ml: 0.5,
                  }}
                >
                  <AccountCircle fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: "divider",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {teamMember?.title || "Team Member"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {teamMember?.email || "team@rehoboth.com"}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 2, fontSize: 20 }} />
                My Profile
              </MenuItem>
              <MenuItem onClick={handleChangePassword}>
                <Settings sx={{ mr: 2, fontSize: 20 }} />
                Change Password
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <Logout sx={{ mr: 2, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            width: "100%",
            position: "relative",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3, md: 4 },
              width: "100%",
              transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              pb: { xs: 8, sm: 10, md: 12 },
            }}
          >
            <Outlet />
          </Box>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              backgroundColor: "#ffffff",
              borderTop: "1px solid",
              borderColor: "divider",
              py: { xs: 2, sm: 2.5 },
              px: { xs: 2, sm: 3, md: 4 },
              mt: { xs: 4, sm: 5, md: 6 },
              width: "100%",
              transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "center", sm: "center" },
                gap: { xs: 1, sm: 2 },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.813rem", sm: "0.875rem" },
                }}
              >
                © {new Date().getFullYear()} Rehoboth Health & Wellness Clinic. All rights reserved.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-end" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.813rem", sm: "0.875rem" },
                  }}
                >
                  Email: rehobothwellnessclinic@gmail.com
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.813rem", sm: "0.875rem" },
                  }}
                >
                  Phone: 07759221176
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

