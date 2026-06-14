import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  CalendarToday, CheckCircleOutline, CancelOutlined, QueryBuilder,
} from "@mui/icons-material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";
import AppointmentsSummaryRow from "./AppointmentsSummaryRow";

const ROWS = [
  {
    key:   "upcoming",
    label: "Upcoming",
    Icon:  CalendarToday,
    color: "#3b82f6",
    bg:    "#eff6ff",
    filter: (a) => !["completed", "cancelled"].includes(a.status),
  },
  {
    key:   "completed",
    label: "Completed",
    Icon:  CheckCircleOutline,
    color: "#10b981",
    bg:    "#ecfdf5",
    filter: (a) => a.status === "completed",
  },
  {
    key:   "cancelled",
    label: "Cancelled",
    Icon:  CancelOutlined,
    color: "#dc3545",
    bg:    "#fef2f2",
    filter: (a) => a.status === "cancelled",
  },
  {
    key:   "total",
    label: "Total Appointments",
    Icon:  QueryBuilder,
    color: "#f59e0b",
    bg:    "#fffbeb",
    filter: () => true,
  },
];

export default function AppointmentsSummaryWidget({
  appointments = [],
  onTabChange,
  activeTabKey,
}) {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, mb: 0 }}>
      <Typography sx={{ ...profileSectionTitleSx, mb: 2 }}>Appointments Summary</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {ROWS.map(({ key, label, Icon, color, bg, filter }) => {
          const count = appointments.filter(filter).length;
          const clickable = key !== "total" && !!onTabChange;
          return (
            <AppointmentsSummaryRow
              key={key}
              label={label}
              count={count}
              Icon={Icon}
              color={color}
              bg={bg}
              clickable={clickable}
              active={clickable && activeTabKey === key}
              onClick={clickable ? () => onTabChange(key) : undefined}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
