import React, { useState, useEffect } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import Calendar from "../../components/common09/Calendar";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { getTeamMemberAppointmentsAuth } from "../../api/api";

export default function TeamCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeamMemberAppointmentsAuth();
      if (response.data?.success) {
        setAppointments(response.data.appointments || []);
      } else {
        setError("Failed to load appointments");
      }
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="My Appointment Calendar"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Team", link: "/team" },
          { label: "Calendar" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 2 }}>
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          <Typography variant="body2">
            <strong>Your Appointments:</strong> This calendar shows all dates when you have
            appointments scheduled. Dates with appointments are highlighted in yellow or red
            depending on the number of appointments.
          </Typography>
        </Alert>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Calendar 
          showInfoBox={false} 
          adminMode={false}
          teamMemberAppointments={appointments}
        />
      </Box>
    </Box>
  );
}

