// client/src/pages/AppointmentSummary.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getAppointmentById } from "../api/api";
import HeroPageSection from "../components/sections/HeroPageSection";
import StyledButton from "../components/common09/StyledButton";
import SEO from "../components/common09/SEO";
import VoucherDetailsDisplay from "../components/appointments/VoucherDetailsDisplay";
import MarkCompletedButton from "../components/appointments/MarkCompletedButton";

export default function AppointmentSummary() {
  const { id } = useParams();
  // const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleMarkCompleted = () => {
    // Refresh appointment data after marking as completed
    const fetchAppointment = async () => {
      try {
        const response = await getAppointmentById(id);
        if (response.data.success) {
          setAppointment(response.data.appointment);
        }
      } catch (error) {
        // Error handled silently
      }
    };
    fetchAppointment();
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await getAppointmentById(id);
        if (response.data.success) {
          setAppointment(response.data.appointment);
        }
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading appointment details...</Typography>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Appointment not found. Please check your appointment ID.
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <SEO
        title="Appointment Summary"
        description="View your appointment confirmation details at Rehoboth Health & Wellness Clinic. Your appointment has been successfully booked."
        keywords="appointment confirmation, booking summary, appointment details"
      />
      {/* HeroPageSection  */}
      <HeroPageSection
        title="Appointment Summary"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Appointment Summary" },
        ]}
      />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, textAlign: "center", borderRadius: 0 }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: "primary.main",
              fontWeight: 400,
              mb: 2,
              fontSize: { xs: "1.2rem", sm: "1.5rem", lg: "1.8rem" },
            }}
          >
            ✅ Appointment Confirmed
          </Typography>

          <Typography variant="h6" sx={{ mb: 4 }}>
            Thank you for choosing Rehoboth Spa! 💆‍♀️
          </Typography>

          <Paper sx={{ p: 3, mb: 4, bgcolor: "grey.50" }}>
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {/* Voucher Details */}
            {(appointment.voucher_code || appointment.voucher) && (
              <VoucherDetailsDisplay
                voucher={appointment.voucher}
                voucherCode={appointment.voucher_code}
                discountApplied={appointment.discount_applied}
              />
            )}

            <Box sx={{ textAlign: "left", maxWidth: 400, mx: "auto" }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Name:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {appointment.full_name}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Service:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {appointment.service}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Date:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {appointment.date}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Time:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {appointment.time}
                </Typography>
              </Box>
              {appointment.note && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Notes:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {appointment.note}
                  </Typography>
                </Box>
              )}
              {/* Show on desktop/tablet */}
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Appointment ID:
                </Typography>
                <Chip label={appointment.id} size="small" color="primary" />
              </Box>

              {/* Show on mobile only */}
              <Box sx={{ display: { xs: "flex", sm: "none" }, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ID:
                </Typography>
                <Chip label={appointment.id} size="small" color="primary" />
              </Box>
            </Box>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            A confirmation email has been sent to {appointment.email}. Please
            arrive 10 minutes before your scheduled time.
          </Alert>

          {/* Mark as Completed Button - Only show if appointment is not already completed */}
          {appointment.status !== "COMPLETED" &&
            appointment.status !== "CLIENT_COMPLETED" &&
            appointment.voucher_code && (
              <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                <MarkCompletedButton
                  appointmentId={appointment.id}
                  onSuccess={handleMarkCompleted}
                />
              </Box>
            )}

          {/* Status Alert */}
          {appointment.status === "CLIENT_COMPLETED" && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
              Your appointment has been marked as completed and is awaiting admin verification.
            </Alert>
          )}

          {appointment.status === "COMPLETED" && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 0 }}>
              Your appointment has been completed and verified. Thank you!
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            {/* <Button
              variant="contained"
              onClick={() => navigate("/book-appointment")}
            >
              Book Another Appointment
            </Button> */}
            {/* <Button variant="outlined" onClick={() => navigate("/")}>
              Back to Home
            </Button> */}
            <StyledButton
              variant="secondary"
              to="/book-appointment"
              text="Book Another Appointment"
            />

            <StyledButton to="/" text="Back to Home" />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
