import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  Grid,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Today as TodayIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import Calendar from "../../components/common09/Calendar";
import HeroPageSection from "../../components/sections/HeroPageSection";
import StatCard from "../components/StatCard";
import { getAppointments } from "../../api/api";
import { getCached, setCached } from "../utils/adminCache";

const CANCELLED_STATUSES = ["cancelled", "rejected"];
const FULLY_BOOKED_THRESHOLD = 5;

export default function CalendarPage() {
  const [appointments, setAppointments] = useState(() => getCached("appointments") || []);
  const [loading, setLoading] = useState(() => !getCached("appointments"));
  const [hasLoadedOnce, setHasLoadedOnce] = useState(() => Boolean(getCached("appointments")));
  const [viewMonth, setViewMonth] = useState(() => dayjs());
  const [monthBookedDates, setMonthBookedDates] = useState({});
  const [monthBlockedDates, setMonthBlockedDates] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const cached = getCached("appointments");
      if (cached) {
        setAppointments(cached);
        setLoading(false);
        setHasLoadedOnce(true);
        return;
      }
      try {
        setLoading(true);
        const res = await getAppointments();
        if (res.data?.success) {
          const data = res.data.appointments || [];
          setAppointments(data);
          setCached("appointments", data);
        }
      } catch {
        // keep empty list
      } finally {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    };
    fetchData();
  }, []);

  const handleMonthChange = useCallback((_year, _month, bookedDates, blockedDates) => {
    setMonthBookedDates(bookedDates || {});
    setMonthBlockedDates(blockedDates || {});
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const active = appointments.filter(
      (a) => !CANCELLED_STATUSES.includes((a.status || "").toLowerCase())
    );
    return {
      total: appointments.length,
      upcoming: active.filter((a) => a.date >= today).length,
      confirmed: appointments.filter((a) => (a.status || "").toLowerCase() === "confirmed").length,
    };
  }, [appointments]);

  const monthSummary = useMemo(() => {
    const monthStart = viewMonth.startOf("month").format("YYYY-MM-DD");
    const monthEnd = viewMonth.endOf("month").format("YYYY-MM-DD");

    let bookingsInMonth = 0;
    let fullyBookedDays = 0;
    let limitedDays = 0;
    let availableDays = 0;

    Object.entries(monthBookedDates).forEach(([dateKey, list]) => {
      if (dateKey < monthStart || dateKey > monthEnd) return;
      const count = Array.isArray(list) ? list.length : 0;
      bookingsInMonth += count;
      if (count >= FULLY_BOOKED_THRESHOLD) fullyBookedDays += 1;
      else if (count > 0) limitedDays += 1;
    });

    const blockedDays = Object.keys(monthBlockedDates).filter(
      (d) => d >= monthStart && d <= monthEnd
    ).length;

    const daysInMonth = viewMonth.daysInMonth();
    const today = dayjs().startOf("day");
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = viewMonth.date(d).format("YYYY-MM-DD");
      if (viewMonth.date(d).isBefore(today, "day")) continue;
      if (monthBlockedDates[dateKey]) continue;
      const count = monthBookedDates[dateKey]?.length || 0;
      if (count === 0) availableDays += 1;
    }

    return {
      bookingsInMonth,
      fullyBookedDays,
      limitedDays,
      blockedDays,
      availableDays,
    };
  }, [viewMonth, monthBookedDates, monthBlockedDates]);

  const showPreloader = loading && !hasLoadedOnce;

  return (
    <Box>
      <HeroPageSection
        title="Appointment Calendar"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Calendar" },
        ]}
        borderRadius={true}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Total Appointments"
              value={stats.total.toString()}
              icon={EventNoteIcon}
              color="#84994f"
              loading={showPreloader}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Upcoming"
              value={stats.upcoming.toString()}
              icon={TodayIcon}
              color="#3b82f6"
              loading={showPreloader}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Confirmed"
              value={stats.confirmed.toString()}
              icon={CheckCircleIcon}
              color="#4caf50"
              loading={showPreloader}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
            <StatCard
              title="Fully Booked Days"
              value={monthSummary.fullyBookedDays.toString()}
              icon={CancelIcon}
              color="#e74c3c"
              loading={showPreloader}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {viewMonth.format("MMM YYYY")}
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
      </HeroPageSection>

      {/* Month overview */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          mb: 2,
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1f2e", mb: 2 }}>
          {viewMonth.format("MMMM YYYY")} — Calendar overview
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          {[
            { label: "Bookings this month", value: monthSummary.bookingsInMonth, color: "#3b82f6" },
            { label: "Fully booked days", value: monthSummary.fullyBookedDays, color: "#e74c3c" },
            { label: "Limited availability", value: monthSummary.limitedDays, color: "#f58c00" },
            { label: "Blocked days", value: monthSummary.blockedDays, color: "#6b7280" },
            { label: "Available days", value: monthSummary.availableDays, color: "#4caf50" },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                textAlign: "center",
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Alert severity="info" sx={{ borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Click a future date to <strong>block</strong> or <strong>unblock</strong> it.
            Days show appointment counts; red means fully booked (5+). Use{" "}
            <strong>Appointments</strong> to cancel existing bookings.
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ position: "relative" }}>
        {showPreloader ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
            <CircularProgress sx={{ color: "#84994f" }} />
          </Box>
        ) : (
          <Calendar
            showInfoBox={true}
            adminMode={true}
            adminAppointments={appointments}
            onMonthChange={(year, month, booked, blocked) => {
              setViewMonth(dayjs().year(year).month(month - 1));
              handleMonthChange(year, month, booked, blocked);
            }}
          />
        )}
      </Box>
    </Box>
  );
}
