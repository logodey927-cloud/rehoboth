import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button,
  Chip, LinearProgress, Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  BookOnline as BookOnlineIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { crmGetFunnel } from "../../api/api";
import HeroPageSection from "../../components/sections/HeroPageSection";

const STAGE_COLORS = {
  VISITOR: "#9e9e9e",
  LEAD: "#2196f3",
  PROSPECT: "#ff9800",
  BOOKING_INTENT: "#9c27b0",
  BOOKED: "#4caf50",
  REPEAT_CLIENT: "#00bcd4",
  CHURNED: "#f44336",
};

function FunnelStageBar({ stage, count, maxCount }) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  const color = STAGE_COLORS[stage] || "#757575";
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color }}>
          {stage.replace(/_/g, " ")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {count.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: "grey.100",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 5 },
        }}
      />
    </Box>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box sx={{ color: color || "primary.main" }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value ?? "—"}
      </Typography>
    </Paper>
  );
}

export default function CrmFunnelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchFunnel(); }, []);

  const fetchFunnel = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmGetFunnel();
      setData(res.data?.data || res.data || null);
    } catch (err) {
      setError("Failed to load funnel data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stages = data?.stages || {};
  const maxCount = Math.max(...Object.values(stages).map((s) => s?.count ?? s ?? 0), 1);
  const metrics = data?.metrics || data?.conversions || {};

  return (
    <Box>
      <HeroPageSection
        title="CRM Funnel"
        subtitle="Visitor-to-client conversion funnel and key metrics"
      />

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={fetchFunnel}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && !data ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<PeopleIcon />}
                  label="Total Contacts"
                  value={data?.totalContacts?.toLocaleString() ?? data?.total_contacts?.toLocaleString()}
                  color="#2196f3"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<TrendingUpIcon />}
                  label="Leads (30 days)"
                  value={data?.newLeads30d?.toLocaleString() ?? data?.new_leads_30d?.toLocaleString()}
                  color="#ff9800"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<BookOnlineIcon />}
                  label="Bookings (30 days)"
                  value={data?.bookings30d?.toLocaleString() ?? data?.bookings_30d?.toLocaleString()}
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard
                  icon={<MoneyIcon />}
                  label="Conversion Rate"
                  value={
                    data?.conversionRate != null
                      ? `${data.conversionRate}%`
                      : data?.conversion_rate != null
                      ? `${data.conversion_rate}%`
                      : null
                  }
                  color="#9c27b0"
                />
              </Grid>
            </Grid>

            {/* Funnel stages */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                >
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Funnel Stages
                  </Typography>
                  {Object.keys(STAGE_COLORS).map((stage) => {
                    const raw = stages[stage];
                    const count = typeof raw === "object" ? (raw?.count ?? 0) : (raw ?? 0);
                    return (
                      <FunnelStageBar key={stage} stage={stage} count={count} maxCount={maxCount} />
                    );
                  })}
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}
                >
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Conversion Rates
                  </Typography>
                  {Object.keys(stages).length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No stage data available.
                    </Typography>
                  ) : (
                    Object.entries(stages).map(([stage, raw]) => {
                      const count = typeof raw === "object" ? (raw?.count ?? 0) : (raw ?? 0);
                      const convPct =
                        typeof raw === "object" ? raw?.conversionFromPrev ?? raw?.conversion_rate : null;
                      return (
                        <Box
                          key={stage}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1.2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            "&:last-child": { borderBottom: 0 },
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {stage.replace(/_/g, " ")}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {count.toLocaleString()} contacts
                            </Typography>
                          </Box>
                          {convPct != null && (
                            <Chip
                              label={`${convPct}%`}
                              size="small"
                              color={convPct >= 50 ? "success" : convPct >= 20 ? "warning" : "error"}
                            />
                          )}
                        </Box>
                      );
                    })
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}
