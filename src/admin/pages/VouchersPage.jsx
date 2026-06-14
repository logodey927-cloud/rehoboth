import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CardGiftcard as CardGiftcardIcon,
  CheckCircle as CheckCircleIcon,
  LocalOffer as LocalOfferIcon,
  Block as BlockIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllVouchersAdmin, getRecentVoucherIssuesAdmin } from "../../api/api";
import { getCached, setCached, invalidateCache } from "../utils/adminCache";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";
import TestDataManager from "../components/vouchers/TestDataManager";
import VoucherIssuesTable from "../components/vouchers/VoucherIssuesTable";
import VoucherDetailsModal from "../components/vouchers/VoucherDetailsModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "all",      label: "All",      filter: () => true },
  { key: "active",   label: "Active",   filter: (v) => v.status === "active" },
  { key: "inactive", label: "Inactive", filter: (v) => v.status !== "active" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function VouchersPage() {
  const navigate = useNavigate();

  const [vouchers,            setVouchers]            = useState(() => getCached("vouchers") || []);
  const [loading,             setLoading]             = useState(() => !getCached("vouchers"));
  const [error,               setError]               = useState(null);
  const [activeStatusTab,     setActiveStatusTab]     = useState(0);
  const [typeFilter,          setTypeFilter]          = useState("");
  const [recentIssues,        setRecentIssues]        = useState(() => getCached("voucherIssuesRecent") || []);
  const [recentIssuesLoading, setRecentIssuesLoading] = useState(() => !getCached("voucherIssuesRecent"));
  const [recentIssuesError,   setRecentIssuesError]   = useState(null);
  const [hasLoadedOnce,       setHasLoadedOnce]       = useState(() => Boolean(getCached("vouchers")));

  useEffect(() => {
    fetchVouchers();
    fetchRecentIssues();
  }, []);

  const fetchVouchers = async (force = false) => {
    if (!force) {
      const cached = getCached("vouchers");
      if (cached) {
        setVouchers(cached);
        setLoading(false);
        return;
      }
    } else {
      invalidateCache("vouchers");
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getAllVouchersAdmin();
      if (res.data?.success) {
        const data = res.data.vouchers || [];
        setCached("vouchers", data);
        setVouchers(data);
      } else {
        setError("Failed to load vouchers");
      }
    } catch {
      setError("Failed to load vouchers. Please try again.");
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }
  };

  const fetchRecentIssues = async (force = false) => {
    if (!force) {
      const cached = getCached("voucherIssuesRecent");
      if (cached) {
        setRecentIssues(cached);
        setRecentIssuesLoading(false);
        return;
      }
    } else {
      invalidateCache("voucherIssuesRecent");
    }
    try {
      setRecentIssuesLoading(true);
      setRecentIssuesError(null);
      const res = await getRecentVoucherIssuesAdmin(20);
      if (res.data?.success) {
        const data = res.data.issues || [];
        setCached("voucherIssuesRecent", data);
        setRecentIssues(data);
      } else {
        setRecentIssuesError("Failed to load recent issuances");
      }
    } catch {
      setRecentIssuesError("Failed to load recent issuances. Please try again.");
    } finally {
      setRecentIssuesLoading(false);
    }
  };

  const handleMutated = () => {
    fetchVouchers(true);
    fetchRecentIssues(true);
  };

  // ── Derived data ─────────────────────────────────────────────────────────────

  const summaryCounts = useMemo(() => ({
    total:    vouchers.length,
    active:   vouchers.filter((v) => v.status === "active").length,
    inactive: vouchers.filter((v) => v.status !== "active").length,
    promo:    vouchers.filter((v) => v.voucher_type === "promo").length,
  }), [vouchers]);

  const filteredVouchers = useMemo(() => {
    let list = vouchers.filter(STATUS_TABS[activeStatusTab].filter);
    if (typeFilter) list = list.filter((v) => v.voucher_type === typeFilter);
    return list;
  }, [vouchers, activeStatusTab, typeFilter]);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatDiscount = (voucher) => {
    if (voucher.discount_type === "percent")      return `${voucher.discount_value}% OFF`;
    if (voucher.discount_type === "amount")       return `£${voucher.discount_value} OFF`;
    if (voucher.discount_type === "free_service") return "FREE SERVICE";
    if (voucher.discount_type === "full_coverage") return "FULL COVERAGE";
    return "SPECIAL OFFER";
  };

  const renderTypeChip = (value) => (
    <Chip
      label={value === "promo" ? "Promo" : value === "gift" ? "Gift Card" : "Voucher"}
      size="small"
      sx={{
        backgroundColor: value === "promo" ? "#f58c0015" : value === "gift" ? "#84994f15" : "#3b82f615",
        color:           value === "promo" ? "#f58c00"   : value === "gift" ? "secondary.dark" : "#3b82f6",
        fontWeight: 500,
        borderRadius: 0,
      }}
    />
  );

  const renderStatusChip = (value) => {
    const active = value === "active" || !value;
    return (
      <Chip
        label={active ? "Active" : "Inactive"}
        size="small"
        sx={{
          backgroundColor: active ? "#4caf5015" : "#9e9e9e15",
          color:           active ? "#4caf50"   : "#9e9e9e",
          fontWeight: 500,
          borderRadius: 0,
        }}
      />
    );
  };

  const renderTitleCell = (value, row) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.8125rem", lineHeight: 1.3 }}>
        {value}
      </Typography>
      {row.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}
        >
          {row.description}
        </Typography>
      )}
    </Box>
  );

  // ── Column definitions ────────────────────────────────────────────────────────

  const ROW_NUMBER_COL = {
    id: "row_number",
    label: "No.",
    width: 60,
    align: "center",
    render: (value, row, rowNumber) => (
      <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>{rowNumber}</Typography>
    ),
  };

  const essentialColumns = [
    ROW_NUMBER_COL,
    { id: "title",        label: "Title",    render: renderTitleCell },
    { id: "voucher_type", label: "Type",     width: 110, render: renderTypeChip },
    {
      id: "discount",
      label: "Discount",
      width: 130,
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "secondary.main" }}>
          {formatDiscount(row)}
        </Typography>
      ),
    },
    { id: "status", label: "Status", width: 100, render: renderStatusChip },
  ];

  const allColumns = [
    ROW_NUMBER_COL,
    { id: "title",        label: "Title",    render: renderTitleCell },
    { id: "voucher_type", label: "Type",     width: 110, render: renderTypeChip },
    {
      id: "discount",
      label: "Discount",
      width: 130,
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "secondary.main" }}>
          {formatDiscount(row)}
        </Typography>
      ),
    },
    {
      id: "validity",
      label: "Validity",
      width: 200,
      render: (_, row) => (
        <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#4b5563" }}>
          {formatDate(row.validity_start)} — {formatDate(row.validity_end)}
        </Typography>
      ),
    },
    { id: "status",     label: "Status",  width: 100, render: renderStatusChip },
    { id: "created_at", label: "Created", type: "date" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  const showPreloader = loading && !hasLoadedOnce;

  if (showPreloader) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="Voucher Management"
        breadcrumb={[
          { label: "Home",  link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Vouchers" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Total Vouchers"
              value={summaryCounts.total.toString()}
              icon={CardGiftcardIcon}
              color="#9c27b0"
              loading={loading && !hasLoadedOnce}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Active"
              value={summaryCounts.active.toString()}
              icon={CheckCircleIcon}
              color="#4caf50"
              loading={loading && !hasLoadedOnce}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Inactive"
              value={summaryCounts.inactive.toString()}
              icon={BlockIcon}
              color="#9e9e9e"
              loading={loading && !hasLoadedOnce}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Promo Codes"
              value={summaryCounts.promo.toString()}
              icon={LocalOfferIcon}
              color="#f58c00"
              loading={loading && !hasLoadedOnce}
            />
          </Grid>
        </Grid>
      </HeroPageSection>

      {/* ── Status tabs ── */}
      <Tabs
        value={activeStatusTab}
        onChange={(_, v) => setActiveStatusTab(v)}
        sx={{
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTabs-indicator": { bgcolor: "secondary.main", height: 2 },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "text.secondary",
            borderRadius: 0,
            minWidth: 0,
            px: 2,
            "&.Mui-selected": { color: "secondary.dark" },
          },
        }}
      >
        {STATUS_TABS.map((tab) => {
          const count = vouchers.filter(tab.filter).length;
          return <Tab key={tab.key} label={`${tab.label} (${count})`} />;
        })}
      </Tabs>

      {/* ── Filters + actions ── */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {typeFilter && (
            <Chip
              label={`Filtered: ${filteredVouchers.length}`}
              sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
            />
          )}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="promo">Promotional</MenuItem>
              <MenuItem value="gift">Gift Card</MenuItem>
            </Select>
          </FormControl>
          {typeFilter && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => setTypeFilter("")}
              sx={{ borderRadius: 0, textTransform: "none" }}
            >
              Clear Filter
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={() => { fetchVouchers(true); fetchRecentIssues(true); }}
            disabled={loading}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/vouchers/new")}
            sx={{
              borderRadius: 0,
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            Create Voucher
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <DataTable
        essentialColumns={essentialColumns}
        allColumns={allColumns}
        rows={filteredVouchers}
        loading={loading && vouchers.length === 0}
        searchPlaceholder="Search vouchers by title, description…"
        renderDetails={(row, onClose, isOpen) => (
          <VoucherDetailsModal
            open={isOpen}
            onClose={onClose}
            voucher={row}
            onMutated={handleMutated}
          />
        )}
        detailsActionIcon="more"
      />

      {/* ── Recent Issuances ── */}
      <Accordion sx={{ mt: 3, borderRadius: 0, boxShadow: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Recent Issuances (Top 20)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <VoucherIssuesTable
            issues={recentIssues}
            loading={recentIssuesLoading}
            error={recentIssuesError}
            showVoucherColumn={true}
            onOpenVoucher={(issue) => {
              if (issue?.voucher_id) navigate(`/admin/vouchers/${issue.voucher_id}?tab=history`);
            }}
          />
        </AccordionDetails>
      </Accordion>

      {/* ── Test Data Utilities ── */}
      <Accordion sx={{ mt: 2, mb: 3, borderRadius: 0, boxShadow: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Test Data Utilities
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TestDataManager onComplete={handleMutated} />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
