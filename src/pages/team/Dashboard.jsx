import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Link,
} from "@mui/material";
import { CalendarToday, Event, Today } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import { getTeamMemberAppointmentsAuth } from "../../api/api";
import StatCard from "../../admin/components/StatCard";
import HeroPageSection from "../../components/sections/HeroPageSection";
import MonthlyBookingsChart from "../../admin/components/MonthlyBookingsChart";

export default function Dashboard() {
  const { teamMember } = useTeamMemberAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    today: 0,
    loading: true,
  });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all appointments for chart and stats
      const [allAppointmentsRes, upcomingAppointmentsRes] =
        await Promise.allSettled([
          getTeamMemberAppointmentsAuth(),
          getTeamMemberAppointmentsAuth({ upcoming_only: true }),
        ]);

      // Get all appointments for chart
      const allAppointments =
        allAppointmentsRes.status === "fulfilled" &&
        allAppointmentsRes.value.data?.success
          ? allAppointmentsRes.value.data.appointments || []
          : [];
      setAppointments(allAppointments);

      // Get upcoming appointments for stats
      const upcomingAppointments =
        upcomingAppointmentsRes.status === "fulfilled" &&
        upcomingAppointmentsRes.value.data?.success
          ? upcomingAppointmentsRes.value.data.appointments || []
          : [];

      const today = new Date().toISOString().split("T")[0];

      setStats({
        total: allAppointments.length,
        upcoming: upcomingAppointments.length,
        today: allAppointments.filter((apt) => apt.date === today).length,
        loading: false,
      });
    } catch (err) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  // Get top 5 upcoming appointments
  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter((apt) => {
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        return (
          aptDate > now &&
          apt.status !== "CANCELLED" &&
          apt.status !== "COMPLETED"
        );
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      })
      .slice(0, 5);
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "-";
    const date = new Date(`${dateString}T${timeString || "00:00"}`);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.total.toString(),
      icon: CalendarToday,
      color: "#f58c00",
      loading: stats.loading,
    },
    {
      title: "Upcoming",
      value: stats.upcoming.toString(),
      icon: Event,
      color: "#84994f",
      loading: stats.loading,
    },
    {
      title: "Today",
      value: stats.today.toString(),
      icon: Today,
      color: "#3b82f6",
      loading: stats.loading,
    },
  ];

  const upcomingAppointments = getUpcomingAppointments();

  return (
    <Box>
      <HeroPageSection
        title={`Welcome, ${teamMember?.title || "Team Member"}!`}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Team", link: "/team" },
          { label: "Dashboard" },
        ]}
        borderRadius={true}
      >
        {/* Stats Cards Container */}
        <Box>
          <Grid
            container
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            sx={{
              width: "100%",
              mx: "auto",
            }}
          >
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={stat.title}
                  sx={{
                    display: "flex",
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <StatCard
                    title={stat.title}
                    value={stat.value}
                    icon={Icon}
                    color={stat.color}
                    loading={stat.loading}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </HeroPageSection>

      <Box sx={{ mt: 4 }}>
        {/* Charts Section AND Recent Tables Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Monthly Bookings Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MonthlyBookingsChart
              appointments={appointments}
              title="Monthly Treatment Appointments"
            />
          </Grid>

          {/* Top 5 Upcoming Appointments */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                boxShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#ffffff",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow:
                    "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1f2e",
                    fontSize: "0.9375rem",
                  }}
                >
                  Top 5 Upcoming Appointments
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/team/appointments")}
                  sx={{
                    color: "secondary.main",
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  View All
                </Link>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#1a1f2e",
                          fontSize: "0.75rem",
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#1a1f2e",
                          fontSize: "0.75rem",
                        }}
                      >
                        Service
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#1a1f2e",
                          fontSize: "0.75rem",
                        }}
                      >
                        Date & Time
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#1a1f2e",
                          fontSize: "0.75rem",
                        }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No upcoming appointments
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      upcomingAppointments.map((apt) => (
                        <TableRow
                          key={apt.id}
                          hover
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                          onClick={() => navigate("/team/appointments")}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "#1a1f2e",
                                fontSize: "0.8125rem",
                              }}
                            >
                              {apt.full_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={apt.service}
                              size="small"
                              sx={{
                                backgroundColor: "#f58c0015",
                                color: "#f58c00",
                                fontWeight: 500,
                                borderRadius: 1,
                                fontSize: "0.6875rem",
                                height: "20px",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.8125rem", color: "#4b5563" }}
                            >
                              {formatDateTime(apt.date, apt.time)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={apt.status}
                              size="small"
                              sx={{
                                backgroundColor:
                                  apt.status === "CONFIRMED"
                                    ? "#10b98115"
                                    : apt.status === "PENDING"
                                    ? "#f59e0b15"
                                    : "#6b728015",
                                color:
                                  apt.status === "CONFIRMED"
                                    ? "#10b981"
                                    : apt.status === "PENDING"
                                    ? "#f59e0b"
                                    : "#6b7280",
                                fontWeight: 500,
                                borderRadius: 1,
                                fontSize: "0.6875rem",
                                height: "20px",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
