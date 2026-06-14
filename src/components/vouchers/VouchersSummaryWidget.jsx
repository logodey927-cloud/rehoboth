import React, { createElement } from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  CardGiftcard, CheckCircleOutline, CancelOutlined, Inventory2Outlined, ChevronRight,
} from "@mui/icons-material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";
import { ACTIVE_STATUSES } from "./voucherDisplayUtils";

const ROWS = [
  {
    key:    "active",
    label:  "Active",
    Icon:   CardGiftcard,
    color:  "#059669",
    bg:     "#ecfdf5",
    filter: (v) => ACTIVE_STATUSES.includes(v.status),
  },
  {
    key:    "used",
    label:  "Used",
    Icon:   CheckCircleOutline,
    color:  "#2563eb",
    bg:     "#eff6ff",
    filter: (v) => v.status === "used",
  },
  {
    key:    "expired",
    label:  "Expired",
    Icon:   CancelOutlined,
    color:  "#dc2626",
    bg:     "#fef2f2",
    filter: (v) => v.status === "expired",
  },
  {
    key:    "total",
    label:  "Total Vouchers",
    Icon:   Inventory2Outlined,
    color:  "#d97706",
    bg:     "#fffbeb",
    filter: () => true,
  },
];

export default function VouchersSummaryWidget({ vouchers = [], onTabChange, activeTabKey }) {
  return (
    <Paper elevation={0} sx={profileCardSx}>
      <Typography sx={{ ...profileSectionTitleSx, mb: 2 }}>Vouchers Summary</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {ROWS.map(({ key, label, Icon: RowIcon, color, bg, filter }) => {
          const count = vouchers.filter(filter).length;
          const clickable = key !== "total" && !!onTabChange;
          const isActive = activeTabKey === key;

          return (
            <Box
              key={key}
              onClick={clickable ? () => onTabChange(key) : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                cursor: clickable ? "pointer" : "default",
                border: "1px solid",
                borderColor: isActive ? color : "divider",
                bgcolor: isActive ? bg : "#fafafa",
                transition: "all 0.15s",
                "&:hover": clickable
                  ? { bgcolor: bg, borderColor: color, "& .row-label": { color } }
                  : {},
              }}
            >
              <Box
                sx={{
                  width: 38, height: 38, flexShrink: 0,
                  bgcolor: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {createElement(RowIcon, { sx: { fontSize: 20, color } })}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} fontSize="1.15rem" color="text.primary" lineHeight={1.1}>
                  {count}
                </Typography>
                <Typography
                  className="row-label"
                  fontSize="0.78rem"
                  color={isActive ? color : "text.secondary"}
                  fontWeight={500}
                >
                  {label}
                </Typography>
              </Box>

              {clickable && (
                <ChevronRight sx={{ fontSize: 18, color: isActive ? color : "text.disabled" }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
