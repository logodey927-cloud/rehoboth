import React from "react";
import { Box, Chip } from "@mui/material";
import { CardGiftcard } from "@mui/icons-material";
import StatCard from "./StatCard";

/**
 * VoucherStatsCard — props-driven; parent supplies vouchers to avoid a duplicate fetch.
 */
export default function VoucherStatsCard({ vouchers = [], loading = false, onClick }) {
  const active   = vouchers.filter((v) => v.status === "active").length;
  const inactive = vouchers.filter((v) => v.status !== "active").length;
  const total    = vouchers.length;

  return (
    <StatCard
      title="Total Vouchers"
      value={total}
      icon={CardGiftcard}
      color="#9c27b0"
      loading={loading}
      onClick={onClick}
    >
      {!loading && total > 0 && (
        <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1 }, flexWrap: "wrap" }}>
          <Chip
            label={`${active} Active`}
            size="small"
            sx={{
              backgroundColor: "#4caf5015",
              color: "#4caf50",
              fontWeight: 600,
              borderRadius: 0,
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              height: { xs: 24, sm: 28 },
            }}
          />
          <Chip
            label={`${inactive} Inactive`}
            size="small"
            sx={{
              backgroundColor: "#9e9e9e15",
              color: "#9e9e9e",
              fontWeight: 600,
              borderRadius: 0,
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              height: { xs: 24, sm: 28 },
            }}
          />
        </Box>
      )}
    </StatCard>
  );
}
