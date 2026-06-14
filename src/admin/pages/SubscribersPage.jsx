import React, { useState, useEffect } from "react";
import { Box, Typography, Chip, CircularProgress, Alert, Button, IconButton } from "@mui/material";
import { Refresh as RefreshIcon, Email as EmailIcon } from "@mui/icons-material";
import { getSubscribers } from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await getSubscribers();
      if (res.data?.success) {
        setSubscribers(res.data.subscribers || []);
      } else {
        setError("Failed to load subscribers");
      }
    } catch (err) {
      setError("Failed to load subscribers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "email",
      label: "Email",
      render: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography
            component="a"
            href={`mailto:${value}`}
            sx={{
              color: "secondary.dark",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
                color: "secondary.dark",
              },
            }}
          >
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "subscribed_at",
      label: "Subscribed Date",
      type: "datetime",
    },
    {
      id: "status",
      label: "Status",
      render: (value) => (
        <Chip
          label={value || "Active"}
          size="small"
          sx={{
            backgroundColor: "#10b98115",
            color: "#10b981",
            fontWeight: 500,
            borderRadius: 0,
          }}
        />
      ),
    },
  ];

  if (loading && subscribers.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="Newsletter Subscribers"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Subscribers" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Chip
          label={`Total: ${subscribers.length}`}
          sx={{
            backgroundColor: "#84994f15",
            color: "secondary.dark",
            fontWeight: 600,
            borderRadius: 0,
          }}
        />
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchSubscribers}
          variant="outlined"
          sx={{ borderRadius: 0 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {subscribers.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
          No subscribers found. Subscribers will appear here once they subscribe through the website.
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={subscribers}
        loading={loading}
        searchPlaceholder="Search subscribers by email..."
      />
    </Box>
  );
}

