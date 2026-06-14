import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, Grid, Alert, Paper } from "@mui/material";
import dayjs from "dayjs";
import { getMyAppointments } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";
import Calendar from "../../components/common09/Calendar";
import CalendarDayPanel from "../../components/account/CalendarDayPanel";
import { profileCardSx } from "../../components/profile/profileStyles";

function normalizeAppointments(list) {
  return list.map((apt) => ({
    ...apt,
    date: typeof apt.date === "string" ? apt.date.split("T")[0] : apt.date,
  }));
}

export default function MyAccountCalendarPage() {
  const { accessToken } = useUserAuth();
  const [appointments, setAppointments] = useState([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyAppointments(accessToken)
      .then((res) => {
        if (res.data?.success) {
          setAppointments(normalizeAppointments(res.data.appointments ?? []));
          setError("");
        }
      })
      .catch(() => setError("Failed to load appointments. Please refresh."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleDayClick = useCallback((dateKey) => {
    setSelectedDateKey(dateKey);
  }, []);

  const selectedAppointments = useMemo(() => {
    if (!selectedDateKey) return [];
    return appointments.filter((a) => a.date === selectedDateKey);
  }, [appointments, selectedDateKey]);

  // Default selection: today if user has an appointment, else next upcoming
  useEffect(() => {
    if (selectedDateKey || appointments.length === 0) return;

    const today = dayjs().format("YYYY-MM-DD");
    const todayApts = appointments.filter((a) => a.date === today);
    if (todayApts.length > 0) {
      setSelectedDateKey(today);
      return;
    }

    const upcoming = appointments
      .filter((a) => !["completed", "cancelled"].includes(a.status))
      .filter((a) => a.date && !dayjs(a.date).isBefore(dayjs(), "day"))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (upcoming[0]?.date) {
      setSelectedDateKey(upcoming[0].date);
    }
  }, [appointments, selectedDateKey]);

  return (
    <Box>
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color="secondary.dark"
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
        >
          My Calendar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View your appointments by date. Highlighted days are when you have a booking.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          <Paper elevation={0} sx={{ ...profileCardSx, p: { xs: 1.5, md: 2 } }}>
            <Calendar
              showInfoBox={false}
              compact={false}
              adminMode={false}
              customerMode
              teamMemberAppointments={appointments}
              onDayClick={(dateKey) => handleDayClick(dateKey)}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <CalendarDayPanel
            dateKey={selectedDateKey}
            appointments={selectedAppointments}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
