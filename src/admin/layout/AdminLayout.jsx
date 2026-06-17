import React, { useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  ChevronRight,
  ChevronLeft,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import AdminSidebar from "../components/AdminSidebar";
import AdminRightSidebar from "../components/AdminRightSidebar";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";
import { AdminLayoutProvider } from "../context/AdminLayoutContext";
import { uploadAdminAvatar } from "../../api/api";
import { swalError } from "../../utils/swal";

export default function AdminLayout() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Fetch subscribers for right sidebar (available on all pages)
  React.useEffect(() => {
    import("../../api/api").then(({ getSubscribers }) => {
      getSubscribers()
        .then((res) => {
          if (res.data?.success) {
            setSubscribers(res.data.subscribers || []);
          }
        })
        .catch((_err) => {
          // Error fetching subscribers - silently fail
        });
    });
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleRightSidebarToggle = () => {
    setRightSidebarOpen(!rightSidebarOpen);
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
    navigate("/admin/login");
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate("/admin/change-password");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await uploadAdminAvatar(form);
      if (res.data?.success && res.data?.url) {
        updateUser({ avatar_url: res.data.url });
      } else {
        await swalError("Upload Failed", res.data?.error || "Could not upload photo.");
      }
    } catch (err) {
      await swalError("Upload Error", err.response?.data?.error || err.message);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <AdminSidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      
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
              {/* Left Sidebar Toggle Button - Moved from sidebar to header */}
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
                label="Admin"
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
              {/* Notification Bell */}
              <NotificationBell />

              {/* Right Sidebar Toggle Button */}
              {isLargeScreen && (
                <IconButton
                  aria-label="toggle right sidebar"
                  onClick={handleRightSidebarToggle}
                  sx={{
                    color: "#84994f",
                    "&:hover": {
                      backgroundColor: "rgba(132, 153, 79, 0.1)",
                    },
                  }}
                >
                  {rightSidebarOpen ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
              )}
              {/* Hidden file input for avatar upload */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "action.hover" },
                }}
                onClick={handleMenuOpen}
              >
                {/* Avatar with upload overlay on hover */}
                <Tooltip title="Click menu to change photo">
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar
                      src={user?.avatar_url || undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#84994f",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        border: user?.avatar_url ? "2px solid #84994f30" : "none",
                      }}
                    >
                      {!user?.avatar_url && (user?.username ? user.username.charAt(0).toUpperCase() : "A")}
                    </Avatar>
                    {avatarUploading && (
                      <Box
                        sx={{
                          position: "absolute", inset: 0,
                          borderRadius: "50%",
                          bgcolor: "rgba(0,0,0,0.45)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={16} sx={{ color: "#fff" }} />
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8125rem" }}
                  >
                    {user?.username || "Admin"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.6875rem" }}
                  >
                    Administrator
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: "divider",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Profile header */}
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={user?.avatar_url || undefined}
                  sx={{
                    width: 40, height: 40,
                    bgcolor: "#84994f",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {!user?.avatar_url && (user?.username ? user.username.charAt(0).toUpperCase() : "A")}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
                    {user?.username || "Admin"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {user?.email || "admin@rehoboth.com"}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  avatarInputRef.current?.click();
                }}
              >
                <PhotoCameraIcon sx={{ mr: 2, fontSize: 20, color: "text.secondary" }} />
                Change Photo
              </MenuItem>
              <MenuItem onClick={handleChangePassword}>
                <Settings sx={{ mr: 2, fontSize: 20, color: "text.secondary" }} />
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
              display: "flex",
              flexGrow: 1,
              width: "100%",
              position: "relative",
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
              <AdminLayoutProvider sidebarOpen={sidebarOpen}>
                <Outlet />
              </AdminLayoutProvider>
            </Box>
            
            {/* Right Sidebar - Available on all pages, Large Screens only, Overlay when open */}
            {isLargeScreen && (
              <AdminRightSidebar 
                subscribers={subscribers} 
                open={rightSidebarOpen}
                onClose={() => setRightSidebarOpen(false)}
              />
            )}
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

