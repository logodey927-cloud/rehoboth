import React from "react";
import { Box, Button, Typography } from "@mui/material";

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[RouteErrorBoundary]", error, info);
  }

  handleReload = () => {
    sessionStorage.removeItem("vite:chunk-reload");
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isChunkError =
      this.state.error?.message?.includes("dynamically imported module") ||
      this.state.error?.message?.includes("Failed to fetch");

    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {isChunkError ? "Page failed to load" : "Something went wrong"}
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={420}>
          {isChunkError
            ? "This usually happens after a dev-server reconnect. Reload the page to continue."
            : "An unexpected error occurred. Try reloading the page."}
        </Typography>
        <Button variant="contained" onClick={this.handleReload} sx={{ bgcolor: "#0C6E6D" }}>
          Reload page
        </Button>
      </Box>
    );
  }
}
