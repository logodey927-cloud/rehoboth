import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Alert, Tabs, Tab } from "@mui/material";
import StyledButton from "../../components/common09/StyledButton";
import { getMyVouchers } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";

import VoucherListCard        from "../../components/vouchers/VoucherListCard";
import VouchersSummaryWidget  from "../../components/vouchers/VouchersSummaryWidget";
import HowToUseVouchersWidget from "../../components/vouchers/HowToUseVouchersWidget";
import VoucherTermsWidget     from "../../components/vouchers/VoucherTermsWidget";
import { ACTIVE_STATUSES }    from "../../components/vouchers/voucherDisplayUtils";

const PAGE_SIZE = 3;

const TABS = [
  { key: "all",     label: "All Vouchers", filter: () => true },
  { key: "active",  label: "Active",       filter: (v) => ACTIVE_STATUSES.includes(v.status) },
  { key: "used",    label: "Used",         filter: (v) => v.status === "used" },
  { key: "expired", label: "Expired",      filter: (v) => v.status === "expired" },
];

export default function MyVouchersPage() {
  const { accessToken } = useUserAuth();

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [visible, setVisible]   = useState(PAGE_SIZE);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyVouchers(accessToken)
      .then((res) => {
        if (res.data?.success) {
          setVouchers(res.data.vouchers ?? []);
          setError("");
        }
      })
      .catch(() => setError("Failed to load vouchers. Please refresh."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setVisible(PAGE_SIZE);
  };

  const handleTabChangeByKey = (key) => {
    const idx = TABS.findIndex((t) => t.key === key);
    if (idx !== -1) {
      setActiveTab(idx);
      setVisible(PAGE_SIZE);
    }
  };

  const filtered = vouchers.filter(TABS[activeTab].filter);
  const shown    = filtered.slice(0, visible);
  const hasMore  = visible < filtered.length;

  return (
    <Box>
      {/* Page header */}
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Typography
          variant="h4" fontWeight={700} color="secondary.dark"
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
        >
          My Vouchers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View and manage your discount vouchers and gift cards.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Left: tabs + list + load more ── */}
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          {/* Tabs row + Buy Voucher button */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTabs-indicator": { bgcolor: "secondary.main", height: 2 },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.72rem", sm: "0.875rem" },
                  color: "text.secondary",
                  minWidth: 0,
                  px: { xs: 1, sm: 1.5 },
                  py: 1,
                  mr: { xs: 0.5, sm: 1 },
                  borderRadius: 0,
                  transition: "background-color 0.2s ease, color 0.2s ease",
                  "&:hover": { bgcolor: "secondary.main", color: "#fff" },
                  "&.Mui-selected": { color: "secondary.dark" },
                  "&.Mui-selected:hover": { bgcolor: "secondary.main", color: "#fff" },
                },
              }}
            >
              {TABS.map((tab) => {
                const count = tab.key === "all"
                  ? vouchers.length
                  : vouchers.filter(tab.filter).length;
                const showCount = count > 0 && tab.key !== "all";
                return (
                  <Tab
                    key={tab.key}
                    label={showCount ? `${tab.label} (${count})` : tab.label}
                  />
                );
              })}
            </Tabs>

            <StyledButton
              text="Buy Voucher"
              to="/vouchers"
              variant="primary"
              sx={{ fontSize: "0.82rem", px: 2, py: 0.65, mb: 0.5 }}
            />
          </Box>

          {/* Voucher list */}
          {loading ? null : shown.length === 0 ? (
            <Box
              sx={{
                py: 6, textAlign: "center",
                border: "1px solid", borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No {TABS[activeTab].label.toLowerCase()} vouchers.
              </Typography>
            </Box>
          ) : (
            shown.map((v) => <VoucherListCard key={v.id} voucher={v} />)
          )}

          {/* Load More */}
          {hasMore && (
            <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
              <StyledButton
                text="Load More"
                onClick={() => setVisible((prev) => prev + PAGE_SIZE)}
                variant="primary"
                sx={{ px: 5, py: 0.85 }}
              />
            </Box>
          )}
        </Grid>

        {/* ── Right: widgets ── */}
        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <VouchersSummaryWidget
              vouchers={vouchers}
              onTabChange={handleTabChangeByKey}
              activeTabKey={TABS[activeTab].key}
            />
            <HowToUseVouchersWidget />
            <VoucherTermsWidget />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
