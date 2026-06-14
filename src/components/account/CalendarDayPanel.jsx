import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { AccessTime, CalendarToday } from "@mui/icons-material";
import dayjs from "dayjs";
import StyledButton from "../common09/StyledButton";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";

const STATUS_STYLE = {
  confirmed: { label: "Upcoming", bg: "#e0f2fe", color: "#0369a1" },
  pending: { label: "Pending", bg: "#fff8e1", color: "#d97706" },
  completed: { label: "Completed", bg: "#ecfdf5", color: "#059669" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626" },
};

function formatDisplayDate(dateKey) {
  return dayjs(dateKey).format("dddd, D MMMM YYYY");
}

export default function CalendarDayPanel({ dateKey, appointments = [] }) {
  if (!dateKey) {
    return (
      <Paper elevation={0} sx={{ ...profileCardSx, height: "100%" }}>
        <Typography sx={profileSectionTitleSx} mb={1}>
          Day details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a date on the calendar to see your appointments.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ ...profileCardSx, height: "100%" }}>
      <Typography sx={profileSectionTitleSx} mb={0.5}>
        {formatDisplayDate(dateKey)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.82rem" }}>
        {appointments.length === 0
          ? "No appointments on this date."
          : `${appointments.length} appointment${appointments.length > 1 ? "s" : ""}`}
      </Typography>

      {appointments.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <CalendarToday sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary" mb={2}>
            You have no bookings on this day.
          </Typography>
          <StyledButton
            text="Book Appointment"
            to="/book-appointment"
            variant="primary"
            sx={{ fontSize: "0.875rem", px: 3, py: 0.75 }}
          />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {appointments.map((apt) => {
            const chip = STATUS_STYLE[apt.status] || STATUS_STYLE.pending;
            const detailId = apt.id?.startsWith("apt-") ? apt.id : apt.id;

            return (
              <Box
                key={apt.id || `${apt.service}-${apt.time}`}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fafafa",
                }}
              >
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.25,
                    mb: 0.75,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: chip.bg,
                    color: chip.color,
                  }}
                >
                  {chip.label}
                </Box>
                <Typography fontWeight={700} fontSize="0.9rem" color="text.primary" mb={0.5}>
                  {apt.service || "Appointment"}
                </Typography>
                {apt.treatment && (
                  <Typography fontSize="0.78rem" color="text.secondary" mb={0.5}>
                    {apt.treatment}
                  </Typography>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                  <AccessTime sx={{ fontSize: 14, color: "text.disabled" }} />
                  <Typography fontSize="0.78rem" color="text.secondary">
                    {apt.time || "—"}
                  </Typography>
                </Box>
                {detailId && (
                  <StyledButton
                    text="View details"
                    to={`/my-account/appointments/${detailId}`}
                    variant="primary"
                    sx={{ fontSize: "0.78rem", px: 2, py: 0.5 }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
