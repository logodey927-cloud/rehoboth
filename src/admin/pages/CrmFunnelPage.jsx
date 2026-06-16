import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button,
  Chip, LinearProgress,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  BookOnline as BookOnlineIcon,
  Percent as PercentIcon,
} from "@mui/icons-material";
import { crmGetFunnel } from "../../api/api";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";

const STAGE_COLORS = {
  VISITOR: "#9e9e9e",
  LEAD: "#2196f3",
  PROSPECT: "#ff9800",
  CLIENT: "#4caf50",
  LOYAL: "#00bcd4",
};

const STAGE_CHIP_COLORS = {
  VISITOR: { bg: "#9e9e9e15", color: "#757575" },
  LEAD: { bg: "#2196f315", color: "#2196f3" },
  PROSPECT: { bg: "#ff980015", color: "#ff9800" },
  CLIENT: { bg: "#4caf5015", color: "#4caf50" },
  LOYAL: { bg: "#00bcd415", color: "#00bcd4" },
};

function normalizeFunnelResponse(raw) {
  if (!raw) {
    return { totalContacts: 0, stages: [], conversionRates: {} };
  }

  let stages = [];
  if (Array.isArray(raw.stages)) {
    stages = raw.stages.map((s) => ({
      stage: s.stage,
      count: s.count ?? 0,
      percentage: s.percentage ?? 0,
    }));
  } else if (raw.stages && typeof raw.stages === "object") {
    stages = Object.entries(raw.stages).map(([stage, value]) => ({
      stage,
      count: typeof value === "object" ? (value?.count ?? 0) : (value ?? 0),
      percentage: typeof value === "object" ? (value?.percentage ?? 0) : 0,
    }));
  }

  const totalContacts = raw.total_contacts ?? raw.totalContacts ?? 0;
  const conversionRates = raw.conversion_rates ?? raw.conversionRates ?? {};

  if (totalContacts > 0) {
    stages = stages.map((s) => ({
      ...s,
      percentage: s.percentage || parseFloat(((s.count / totalContacts) * 100).toFixed(2)),
    }));
  }

  return { totalContacts, stages, conversionRates };
}

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
          height: 8,
          borderRadius: 4,
          bgcolor: "grey.100",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

function renderStageChip(stage) {
  const colors = STAGE_CHIP_COLORS[stage] || { bg: "#e0e0e0", color: "#757575" };
  return (
    <Chip
      label={stage?.replace(/_/g, " ") || "—"}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 500, borderRadius: 0 }}
    />
  );
}

export default function CrmFunnelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFunnel = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmGetFunnel();
      setData(res.data?.data || res.data || null);
    } catch {
      setError("Failed to load funnel data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFunnel(); }, []);

  const { totalContacts, stages, conversionRates } = useMemo(
    () => normalizeFunnelResponse(data),
    [data]
  );

  const summaryCounts = useMemo(() => {
    const leadCount = stages.find((s) => s.stage === "LEAD")?.count ?? 0;
    const clientCount = stages.find((s) => s.stage === "CLIENT")?.count ?? 0;
    const conversionRate =
      totalContacts > 0 ? ((clientCount / totalContacts) * 100).toFixed(1) : "0";
    return { totalContacts, leadCount, clientCount, conversionRate };
  }, [stages, totalContacts]);

  const stageRows = useMemo(() => {
    return stages.map((s, i) => {
      const prevStage = i > 0 ? stages[i - 1].stage : null;
      const convKey = prevStage
        ? `${prevStage.toLowerCase()}_to_${s.stage.toLowerCase()}`
        : null;
      const conversionFromPrev = convKey ? conversionRates[convKey] : null;
      return {
        id: s.stage,
        stage: s.stage,
        count: s.count,
        percentage: s.percentage,
        conversion_from_prev: conversionFromPrev,
      };
    });
  }, [stages, conversionRates]);

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  const essentialColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (_, __, n) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>{n}</Typography>
      ),
    },
    {
      id: "stage",
      label: "Stage",
      render: (v) => renderStageChip(v),
    },
    {
      id: "count",
      label: "Contacts",
      width: 110,
      render: (v) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {(v ?? 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "percentage",
      label: "% of Total",
      width: 110,
      render: (v) => (
        <Typography variant="body2" color="text.secondary">
          {v != null ? `${v}%` : "—"}
        </Typography>
      ),
    },
    {
      id: "conversion_from_prev",
      label: "From Previous",
      width: 130,
      render: (v) =>
        v != null ? (
          <Chip
            label={`${v}%`}
            size="small"
            sx={{
              backgroundColor: v >= 50 ? "#4caf5015" : v >= 20 ? "#ff980015" : "#f4433615",
              color: v >= 50 ? "#4caf50" : v >= 20 ? "#ff9800" : "#f44336",
              fontWeight: 600,
              borderRadius: 0,
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">—</Typography>
        ),
    },
  ];

  const allColumns = [
    ...essentialColumns,
    {
      id: "stage_label",
      label: "Description",
      render: (_, row) => (
        <Typography variant="body2" color="text.secondary">
          Contacts at the {row.stage?.replace(/_/g, " ").toLowerCase()} stage of the funnel
        </Typography>
      ),
    },
  ];

  if (loading && !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="CRM Funnel"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "CRM Funnel" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Total Contacts"
              value={summaryCounts.totalContacts.toLocaleString()}
              icon={PeopleIcon}
              color="#2196f3"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Leads"
              value={summaryCounts.leadCount.toLocaleString()}
              icon={TrendingUpIcon}
              color="#ff9800"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Clients"
              value={summaryCounts.clientCount.toLocaleString()}
              icon={BookOnlineIcon}
              color="#4caf50"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Visitor → Client"
              value={`${summaryCounts.conversionRate}%`}
              icon={PercentIcon}
              color="#9c27b0"
              loading={loading}
            />
          </Grid>
        </Grid>
      </HeroPageSection>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
          onClick={fetchFunnel}
          disabled={loading}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        essentialColumns={essentialColumns}
        allColumns={allColumns}
        rows={stageRows}
        loading={loading && !data}
        searchPlaceholder="Search funnel stages..."
        detailsActionIcon="more"
      />

      {stages.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: "#1a1f2e" }}>
            Funnel Overview
          </Typography>
          {stages.map((s) => (
            <FunnelStageBar key={s.stage} stage={s.stage} count={s.count} maxCount={maxCount} />
          ))}
        </Paper>
      )}
    </Box>
  );
}
