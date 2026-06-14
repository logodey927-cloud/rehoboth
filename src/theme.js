// client/src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#f58c00", // Orange accent
      light: "#ffb84d", // Lighter orange
      dark: "#cc7000", // Darker orange
      contrastText: "#fff",
    },
    secondary: {
      main: "#84994f", // Olive green
      light: "#a8b86d", // Light olive
      dark: "#47672f", // Dark olive
      darker: "rgba(27, 36, 8, 1)", // Dark olive
      contrastText: "#fff",
    },
    background: {
      default: "#f8f9fa", // Light gray background
      paper: "#ffffff", // White cards
      dark: "#1a1f2e", // Dark footer background
      light: "#f5f6f8", // Very light gray
    },
    text: {
      primary: "#1a1f2e", // Dark blue-gray
      secondary: "#5a6b7a", // Medium gray
      light: "#e8f4f8", // Light text on dark
      disabled: "#9ca3af", // Disabled text
    },
    success: {
      main: "#10b981",
      light: "#e5fff5ff",
      dark: "#059669ff",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#ffdbdbff",
      dark: "#dc2626",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
  },
  typography: {
   fontFamily: '"Raleway", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      fontFamily: '"Raleway", sans-serif',
    },
    h2: {
      fontSize: "2.25rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      fontFamily: '"Raleway", sans-serif',
    },
    h3: {
      fontSize: "1.875rem",
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"Raleway", sans-serif',
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"Raleway", sans-serif',
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
      fontFamily: '"Raleway", sans-serif',
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
      fontFamily: '"Raleway", sans-serif',
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      fontWeight: 400,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 4px 6px rgba(0, 0, 0, 0.07)",
    "0 10px 15px rgba(0, 0, 0, 0.1)",
    "0 20px 25px rgba(0, 0, 0, 0.1)",
    "0 25px 50px rgba(0, 0, 0, 0.15)",
    "0 0 0 1px rgba(0, 0, 0, 0.05)",
    "0 1px 2px rgba(0, 0, 0, 0.1)",
    "0 2px 4px rgba(0, 0, 0, 0.1)",
    "0 4px 8px rgba(0, 0, 0, 0.1)",
    "0 8px 16px rgba(0, 0, 0, 0.1)",
    "0 12px 24px rgba(0, 0, 0, 0.1)",
    "0 16px 32px rgba(0, 0, 0, 0.1)",
    "0 20px 40px rgba(0, 0, 0, 0.1)",
    "0 24px 48px rgba(0, 0, 0, 0.1)",
    "0 28px 56px rgba(0, 0, 0, 0.1)",
    "0 32px 64px rgba(0, 0, 0, 0.1)",
    "0 36px 72px rgba(0, 0, 0, 0.1)",
    "0 40px 80px rgba(0, 0, 0, 0.1)",
    "0 44px 88px rgba(0, 0, 0, 0.1)",
    "0 48px 96px rgba(0, 0, 0, 0.1)",
    "0 52px 104px rgba(0, 0, 0, 0.1)",
    "0 56px 112px rgba(0, 0, 0, 0.1)",
    "0 60px 120px rgba(0, 0, 0, 0.1)",
    "0 64px 128px rgba(0, 0, 0, 0.1)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "12px 24px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        contained: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 4px rgba(0, 0, 0, 0.08)",
          borderRadius: 16,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            transition: "all 0.2s ease",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            textDecoration: "none",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3": {
            background: "linear-gradient(135deg, #f58c00 0%, #ff6b35 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          },
        },
      },
    },
  },
});

export default theme;
