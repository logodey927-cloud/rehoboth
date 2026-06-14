import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Alert, Tabs, Tab } from "@mui/material";
import { getMyAppointments } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { appointmentsQuickActions } from "../../data/profileData";
import StyledButton from "../../components/common09/StyledButton";

import AppointmentListCard       from "../../components/appointments/AppointmentListCard";
import AppointmentsSummaryWidget from "../../components/appointments/AppointmentsSummaryWidget";
import ImportantNoteWidget       from "../../components/appointments/ImportantNoteWidget";
import QuickLinksWidget          from "../../components/profile/QuickLinksWidget";
import BookingModal              from "../../components/booking/BookingModal";

const PAGE_SIZE = 3;

const DONE_STATUSES      = ["completed", "client_completed"];
const CANCELLED_STATUSES = ["cancelled", "rejected"];

const TABS = [
  { key: "upcoming",  label: "Upcoming",  filter: (a) => ![...DONE_STATUSES, ...CANCELLED_STATUSES].includes(a.status) },
  { key: "completed", label: "Completed", filter: (a) => DONE_STATUSES.includes(a.status) },
  { key: "cancelled", label: "Cancelled", filter: (a) => CANCELLED_STATUSES.includes(a.status) },
];

export default function MyAppointmentsPage() {
  const { accessToken } = useUserAuth();

  const [appointments, setAppointments] = useState([]);
  const [, setLoading]                  = useState(true);
  const [error, setError]               = useState("");
  const [activeTab, setActiveTab]       = useState(0);
  const [visible, setVisible]           = useState(PAGE_SIZE);
  const [bookingOpen, setBookingOpen]   = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyAppointments(accessToken)
      .then((res) => {
        if (res.data?.success) {
          setAppointments(res.data.appointments ?? []);
          setError("");
        }
      })
      .catch(() => setError("Failed to load appointments. Please refresh."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  // Reset visible count when tab changes
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setVisible(PAGE_SIZE);
  };

  // Allow AppointmentsSummaryWidget to switch tab by key
  const handleTabChangeByKey = (key) => {
    const idx = TABS.findIndex((t) => t.key === key);
    if (idx !== -1) {
      setActiveTab(idx);
      setVisible(PAGE_SIZE);
    }
  };

  const filtered = TABS[activeTab].filter
    ? appointments.filter(TABS[activeTab].filter)
    : appointments;

  const shown     = filtered.slice(0, visible);
  const hasMore   = visible < filtered.length;

  return (
    <Box>
      {/* Page header */}
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Typography
          variant="h4" fontWeight={700} color="secondary.dark"
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
        >
          My Appointments
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage and track your wellness appointments.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Left: tabs + list + load more ── */}
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": { bgcolor: "secondary.main", height: 2 },
              "& .MuiTabs-flexContainer": { gap: 0 },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.72rem", sm: "0.9rem" },
                color: "text.secondary",
                minWidth: 0,
                flex: 1,
                px: { xs: 0.5, sm: 1.5 },
                py: 1,
                borderRadius: 0,
                transition: "background-color 0.2s ease, color 0.2s ease",
                "&:hover": {
                  bgcolor: "secondary.main",
                  color: "#fff",
                },
                "&.Mui-selected": {
                  color: "secondary.dark",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "secondary.main",
                  color: "#fff",
                },
              },
            }}
          >
            {TABS.map((tab) => {
              const count = appointments.filter(tab.filter).length;
              return (
                <Tab
                  key={tab.key}
                  label={`${tab.label}${count > 0 ? ` (${count})` : ""}`}
                />
              );
            })}
          </Tabs>

          {/* Appointment list */}
          {shown.length === 0 ? (
            <Box
              sx={{
                py: 6, textAlign: "center",
                border: "1px solid", borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No {TABS[activeTab].label.toLowerCase()} appointments.
              </Typography>
            </Box>
          ) : (
            shown.map((a) => (
              <AppointmentListCard
                key={a.id}
                appointment={a}
                onCancelled={(cancelledId) =>
                  setAppointments((prev) =>
                    prev.map((appt) =>
                      appt.id === cancelledId ? { ...appt, status: "cancelled" } : appt
                    )
                  )
                }
              />
            ))
          )}

          {/* Load More */}
          {hasMore && (
            <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
              <StyledButton
                text="Load More"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                variant="primary"
                sx={{ px: 5, py: 0.85 }}
              />
            </Box>
          )}
        </Grid>

        {/* ── Right: widgets ── */}
        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <AppointmentsSummaryWidget
              appointments={appointments}
              onTabChange={handleTabChangeByKey}
              activeTabKey={TABS[activeTab].key}
            />
            <QuickLinksWidget
              title="Quick Actions"
              links={appointmentsQuickActions.map((link) =>
                link.id === "book"
                  ? { ...link, onClick: () => setBookingOpen(true), path: undefined }
                  : link
              )}
            />
            <ImportantNoteWidget />
          </Box>
        </Grid>
      </Grid>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialStep={1}
        title="Book New Appointment"
      />
    </Box>
  );
}
