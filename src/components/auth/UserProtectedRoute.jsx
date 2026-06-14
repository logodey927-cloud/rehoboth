/**
 * Route guard for customer-only pages.
 * Redirects to /login and stores the intended path in location.state.from
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useUserAuth } from "../../contexts/UserAuthContext";

export default function UserProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
