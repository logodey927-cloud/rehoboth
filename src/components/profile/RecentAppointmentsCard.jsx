import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import { CalendarToday, AccessTime, EventBusy } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import StyledButton from "../common09/StyledButton";
import { profileCardSx, profileCardFullHeightSx, profileSectionTitleSx, profileViewAllSx, accountStyledButtonSx } from "./profileStyles";

const STATUS_COLORS = {
  pending: { bg: "#fff8e1", color: "#f59e0b", label: "Pending" },
  confirmed: { bg: "#e3f2fd", color: "#3b82f6", label: "Upcoming" },
  completed: { bg: "#e8f5e9", color: "#10b981", label: "Completed" },
  cancelled: { bg: "#fce4ec", color: "#ef4444", label: "Cancelled" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function AppointmentRow({ appointment }) {
  const statusKey = appointment.status || "pending";
  const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.75,
        "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 0,
          flexShrink: 0,
          bgcolor: "secondary.light",
          overflow: "hidden",
          backgroundImage: appointment.image_url ? `url(${appointment.image_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!appointment.image_url && (
          <CalendarToday sx={{ color: "secondary.dark", fontSize: 24 }} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography fontWeight={600} fontSize="0.9rem" noWrap>
            {appointment.service || "Appointment"}
          </Typography>
          <Chip
            label={statusStyle.label}
            size="small"
            sx={{
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 22,
              borderRadius: 0,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(appointment.date)}
            </Typography>
          </Box>
          {appointment.time && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 13, color: "text.disabled" }} />
              <Typography variant="caption" color="text.secondary">{appointment.time}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <StyledButton
        text="View Details"
        to={`/appointment-summary/${appointment.id}`}
        variant="primary"
        sx={{ ...accountStyledButtonSx, fontSize: "0.78rem", py: 0.5, px: 1.5, flexShrink: 0 }}
      />
    </Box>
  );
}

export default function RecentAppointmentsCard({ appointments = [], fullHeight = false, onBookNow }) {
  const recent = appointments.slice(0, 3);
  const cardSx = fullHeight ? profileCardFullHeightSx : profileCardSx;

  return (
    <Paper elevation={0} sx={{ ...cardSx, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexShrink: 0 }}>
        <Typography sx={profileSectionTitleSx}>Recent Appointments</Typography>
        <Typography component={RouterLink} to="/my-account/appointments" sx={profileViewAllSx}>
          View All
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {recent.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <EventBusy sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" mb={2}>
              You have no appointments yet. Book your first session!
            </Typography>
            <StyledButton
              text="Book Now"
              onClick={onBookNow}
              variant="primary"
              sx={accountStyledButtonSx}
            />
          </Box>
        ) : (
          recent.map((a) => <AppointmentRow key={a.id} appointment={a} />)
        )}
      </Box>
    </Paper>
  );
}
