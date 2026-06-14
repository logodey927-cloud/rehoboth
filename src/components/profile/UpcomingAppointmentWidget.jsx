import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { CalendarToday, AccessTime, LocationOn } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { CLINIC_LOCATION } from "../../data/profileData";
import StyledButton from "../common09/StyledButton";
import { profileCardSx, profileSectionTitleSx, profileViewAllSx, accountStyledButtonSx } from "./profileStyles";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", weekday: "long",
  });
}

export default function UpcomingAppointmentWidget({ appointment, onBookNow }) {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={profileSectionTitleSx}>Upcoming Appointment</Typography>
        <Typography component={RouterLink} to="/my-account/appointments" sx={profileViewAllSx}>
          View All
        </Typography>
      </Box>

      {!appointment ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            No upcoming appointments
          </Typography>
          <StyledButton
            text="Book Now"
            onClick={onBookNow}
            variant="primary"
            sx={accountStyledButtonSx}
          />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              width: "100%",
              height: 130,
              borderRadius: 0,
              mb: 2,
              bgcolor: "secondary.light",
              overflow: "hidden",
              backgroundImage: appointment.image_url
                ? `url(${appointment.image_url})`
                : "linear-gradient(135deg, #a8b86d 0%, #84994f 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <Typography fontWeight={700} fontSize="1rem" color="secondary.dark" mb={1.5}>
            {appointment.service}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: "secondary.main" }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(appointment.date)}
              </Typography>
            </Box>
            {appointment.time && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTime sx={{ fontSize: 16, color: "secondary.main" }} />
                <Typography variant="body2" color="text.secondary">{appointment.time}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <LocationOn sx={{ fontSize: 16, color: "secondary.main", mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary">{CLINIC_LOCATION}</Typography>
            </Box>
          </Box>

          <StyledButton
            text="View Appointment"
            to={`/appointment-summary/${appointment.id}`}
            variant="primary"
            sx={{ ...accountStyledButtonSx, width: "100%" }}
          />
        </>
      )}
    </Paper>
  );
}
