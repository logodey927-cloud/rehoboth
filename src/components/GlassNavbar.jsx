import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  useMediaQuery,
  useTheme,
  Slide,
  Container,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import logoImage from "../assets/images/logo.png";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountCircle,
  Logout,
  CalendarToday,
  CardGiftcard,
  Person,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import StyledButton from "./common09/StyledButton";
import { navigationData } from "../data/NavigationData";
import { useUserAuth } from "../contexts/UserAuthContext";
import NavBellDropdown from "./notifications/NavBellDropdown";
import { resolveUserAvatarUrl } from "../utils/userAvatar";

const GlassNavbar = () => {
  const [_isScrolled, setIsScrolled] = useState(false);
  const [_isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { user, isAuthenticated, logout } = useUserAuth();

  const handleAccountMenuOpen = (e) => setAccountMenuAnchor(e.currentTarget);
  const handleAccountMenuClose = () => setAccountMenuAnchor(null);
  const handleLogout = () => {
    handleAccountMenuClose();
    logout();
    navigate("/login");
  };
  const initials = user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U" : "U";
  const avatarSrc = user ? resolveUserAvatarUrl(user) : undefined;

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navbar
        setIsScrollingDown(true);
        setIsVisible(false);
      } else {
        // Scrolling up - show navbar
        setIsScrollingDown(false);
        setIsVisible(true);
      }

      // Update scrolled state for styling
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [lastScrollY]);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const closeDrawer = () => setMobileOpen(false);

  const navItems = navigationData.mainNav.map((item) => (
    <Box
      key={item.href}
      component={Link}
      to={item.href}
      sx={{
        color: "#47672f",
        textDecoration: "none",
        px: 2,
        py: 1,
        borderRadius: 0,
        border: "none",
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          // backgroundColor: "rgba(71, 103, 47, 0.1)",
          transform: "translateY(-2px)",
          color: "#cc7000",
          // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        },

        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: "50%",
          width: 0,
          height: "3px",
          backgroundColor: "#cc7000",
          transition: "all 0.3s ease",
          transform: "translateX(-50%)",
          borderRadius: "2px 2px 0 0",
        },
        "&:hover::after": {
          width: "100%",
        },
        ...(location.pathname === item.href && {
          color: "#cc7000",
          fontWeight: "bold",
          "&::after": {
            width: "85%",
          },
        }),
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontWeight: location.pathname === item.href ? 700 : 500,
          fontSize: "0.95rem",
          textTransform: "capitalize",
          letterSpacing: "0.3px",
        }}
      >
        {item.title}
      </Typography>
    </Box>
  ));

  const drawer = (
    <Box sx={{ width: 280, height: "100%", bgcolor: "#f8f9fa" }}>
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2d4320",
          bgcolor: "#2d4320",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src={logoImage}
            alt="Rehoboth Health and Wellness Clinic Logo"
            sx={{ height: 40, width: "auto" }}
          />
          <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
            Rehoboth
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {navigationData.mainNav.map((item) => (
          <ListItem key={item.slug} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={item.href}
              onClick={closeDrawer}
              sx={{
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "rgba(71, 103, 47, 0.15)",
                },
                ...(location.pathname === item.href && {
                  backgroundColor: "rgba(71, 103, 47, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(71, 103, 47, 0.25)",
                  },
                }),
              }}
            >
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.href ? 700 : 500,
                  color: location.pathname === item.href ? "#2d4320" : "#47672f",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Contact Info
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <PhoneIcon sx={{ fontSize: 16, color: "#47672f" }} />
          <Typography variant="body2">
            {navigationData.contactInfo.phone}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon sx={{ fontSize: 16, color: "#47672f" }} />
          <Typography variant="body2">
            {navigationData.contactInfo.email}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 2, mt: "auto" }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {navigationData.ctaButtons.map((button, index) => (
            <StyledButton
              key={index}
              text={button.text}
              to={button.href}
              variant="custom"
              onClick={closeDrawer}
            />
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        {isAuthenticated ? (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Signed in as <strong>{user?.first_name}</strong>
            </Typography>
            <List dense disablePadding>
              <ListItemButton component={Link} to="/my-account/profile" onClick={closeDrawer}>
                <Person fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <ListItemText primary="My Profile" />
              </ListItemButton>
              <ListItemButton component={Link} to="/my-account/appointments" onClick={closeDrawer}>
                <CalendarToday fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <ListItemText primary="My Appointments" />
              </ListItemButton>
              <ListItemButton component={Link} to="/my-account/vouchers" onClick={closeDrawer}>
                <CardGiftcard fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <ListItemText primary="My Vouchers" />
              </ListItemButton>
              <ListItemButton onClick={() => { closeDrawer(); handleLogout(); }} sx={{ color: "error.main" }}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </List>
          </Box>
        ) : (
          <StyledButton text="Sign In / Register" to="/login" variant="custom" onClick={closeDrawer} />
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Slide direction="down" in={isVisible} timeout={300}>
        <AppBar
          className="glass-navbar"
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 1300,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              sx={{
                justifyContent: "space-between",
                py: 1,
                minHeight: "70px !important",
                // Push content below notch in standalone PWA mode
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
              }}
            >
              {/* Logo Section */}

              <Box
                component={Link}
                to="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box
                  component="img"
                  src={logoImage}
                  alt="Rehoboth Health and Wellness Clinic Logo"
                  sx={{
                    height: { xs: 40, md: 48 },
                    width: "auto",
                  }}
                />

                <Box>
                  {/* For screens 0–500px */}
                  <Box sx={{ display: { xs: "block", sm: "none" } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: "#47672f",
                        fontSize: "1rem",
                      }}
                    >
                      Rehoboth
                    </Typography>
                  </Box>

                  {/* For screens 500px and above */}
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: "#47672f",
                        fontSize: "1rem",
                      }}
                    >
                      {navigationData.brand.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#2d4320",
                        fontSize: "0.75rem",
                        display: "block",
                        lineHeight: 1.2,
                        fontWeight: 600,
                      }}
                    >
                      {navigationData.brand.nameSubtitle}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {navItems}
                </Box>
              )}

              {/* CTA Buttons + Account */}
              {!isMobile && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {navigationData.ctaButtons.map((button, index) => (
                    <StyledButton
                      key={index}
                      text={button.text}
                      to={button.href}
                      variant={button.variant}
                    />
                  ))}

                  {/* Notification bell — authenticated only */}
                  {isAuthenticated && <NavBellDropdown />}

                  {/* User account menu */}
                  {isAuthenticated ? (
                    <>
                      <IconButton onClick={handleAccountMenuOpen} size="small">
                        <Avatar
                          src={avatarSrc}
                          alt={user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Account"}
                          sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 13, fontWeight: 700 }}
                        >
                          {initials}
                        </Avatar>
                      </IconButton>
                      <Menu
                        anchorEl={accountMenuAnchor}
                        open={Boolean(accountMenuAnchor)}
                        onClose={handleAccountMenuClose}
                        PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 0 } }}
                      >
                        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
                          <Typography variant="body2" fontWeight={700}>{user?.first_name} {user?.last_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                        </Box>
                        <MenuItem onClick={() => { navigate("/my-account/profile"); handleAccountMenuClose(); }}>
                          <Person fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />My Profile
                        </MenuItem>
                        <MenuItem onClick={() => { navigate("/my-account/appointments"); handleAccountMenuClose(); }}>
                          <CalendarToday fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />My Appointments
                        </MenuItem>
                        <MenuItem onClick={() => { navigate("/my-account/vouchers"); handleAccountMenuClose(); }}>
                          <CardGiftcard fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />My Vouchers
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                          <Logout fontSize="small" sx={{ mr: 1.5 }} />Sign Out
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <StyledButton text="Sign In" to="/login" variant="outlined" />
                  )}
                </Box>
              )}

              {/* Mobile: bell + hamburger */}
              {isMobile && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {isAuthenticated && <NavBellDropdown />}
                  <IconButton
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{
                      color: "#47672f",
                      "&:hover": {
                        backgroundColor: "rgba(71, 103, 47, 0.15)",
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          zIndex: 1400, // Higher than navbar's zIndex (1300)
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            zIndex: 1400,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default GlassNavbar;
