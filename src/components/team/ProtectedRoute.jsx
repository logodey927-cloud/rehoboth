import React from "react";
import { Navigate } from "react-router-dom";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function ProtectedRoute({ children }) {
  const { teamMember, loading } = useTeamMemberAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!teamMember) {
    return <Navigate to="/team/login" replace />;
  }

  return children;
}

