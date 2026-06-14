import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import {
  CalendarToday, AccessTime, Timer, LocationOn, Person, Spa,
  AttachMoney, ArrowBack, Notes,
} from "@mui/icons-material";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import StyledButton from "../../components/common09/StyledButton";
import AppointmentTreatmentReview from "../../components/appointments/AppointmentTreatmentReview";
import RecentBlogPostsWidget from "../../components/account/RecentBlogPostsWidget";
import { CLINIC_LOCATION } from "../../data/profileData";
import { profileCardSx, profileSectionTitleSx } from "../../components/profile/profileStyles";
import { getMyAppointmentById, cancelMyAppointment } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";

const STATUS_CHIP = {
  confirmed:        { label: "Upcoming",    bg: "#e0f2fe", color: "#0369a1" },
  pending:          { label: "Pending",     bg: "#fff8e1", color: "#d97706" },
  in_process:       { label: "In Progress", bg: "#ede9fe", color: "#6d28d9" },
  completed:        { label: "Completed",   bg: "#ecfdf5", color: "#059669" },
  client_completed: { label: "Completed",   bg: "#ecfdf5", color: "#059669" },
  rejected:         { label: "Rejected",    bg: "#fef2f2", color: "#dc3545" },
  cancelled:        { label: "Cancelled",   bg: "#fef2f2", color: "#dc3545" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function MetaRow({ Icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 15, color: "text.disabled" }} />
      </Box>
      <Box>
        <Typography fontSize="0.72rem" color="text.disabled" lineHeight={1.2} mb={0.2}>
          {label}
        </Typography>
        <Typography fontSize="0.9rem" color="text.primary" fontWeight={500} lineHeight={1.4}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useUserAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [cancelOpen, setCancelOpen]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!accessToken || !id) return;
    setLoading(true);
    getMyAppointmentById(accessToken, id)
      .then((res) => {
        if (res.data?.success) {
          setAppointment(res.data.appointment);
        } else {
          setError("Appointment not found.");
        }
      })
      .catch(() => setError("Could not load appointment details."))
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={32} color="secondary" />
      </Box>
    );
  }

  if (error || !appointment) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary" mb={2}>{error || "Appointment not found."}</Typography>
        <StyledButton text="Back to Appointments" to="/my-account/appointments" variant="primary" />
      </Box>
    );
  }

  const chipStyle   = STATUS_CHIP[appointment.status] || STATUS_CHIP.pending;
  const isUpcoming  = !["completed", "client_completed", "cancelled", "rejected"].includes(appointment.status);
  const isCompleted = ["completed", "client_completed"].includes(appointment.status);

  const paymentLabel = appointment.payment_amount
    ? `£${parseFloat(appointment.payment_amount).toFixed(2)} — ${
        appointment.payment_status
          ? appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)
          : "—"
      }`
    : "—";

  return (
    <Box>
      {/* Page header */}
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Box
          component={RouterLink}
          to="/my-account/appointments"
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            color: "secondary.main", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600,
            mb: 1.25,
            "&:hover": { color: "secondary.dark" },
          }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Back to Appointments
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography
            variant="h4" fontWeight={700} color="secondary.dark"
            sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" } }}
          >
            {appointment.service}
          </Typography>
          <Box
            sx={{
              px: 1.5, py: 0.4,
              bgcolor: chipStyle.bg, color: chipStyle.color,
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.3, borderRadius: 0,
              flexShrink: 0,
            }}
          >
            {chipStyle.label}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Left: main detail ── */}
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          <Paper elevation={0} sx={{ ...profileCardSx, p: 0, overflow: "hidden" }}>
            {/* Service image */}
            <Box
              sx={{
                width: "100%",
                height: { xs: 180, sm: 240, md: 280 },
                bgcolor: "secondary.light",
                backgroundImage: appointment.image_url ? `url(${appointment.image_url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {!appointment.image_url && (
                <Spa sx={{ fontSize: 64, color: "secondary.main", opacity: 0.4 }} />
              )}
            </Box>

            {/* Meta table */}
            <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 1 }}>
              <Typography sx={{ ...profileSectionTitleSx, mb: 1.5 }}>Appointment Details</Typography>

              <MetaRow Icon={CalendarToday} label="Date"     value={formatDate(appointment.date)} />
              {appointment.time && (
                <MetaRow Icon={AccessTime}  label="Time"     value={appointment.time} />
              )}
              {appointment.duration && (
                <MetaRow Icon={Timer}       label="Duration" value={appointment.duration} />
              )}
              <MetaRow Icon={LocationOn}    label="Location" value={CLINIC_LOCATION} />
              <MetaRow
                Icon={Person}
                label="Therapist"
                value={appointment.therapist || "—"}
              />
              {appointment.treatment && (
                <MetaRow Icon={Spa}         label="Treatment" value={appointment.treatment} />
              )}
              <MetaRow Icon={AttachMoney}   label="Payment"  value={paymentLabel} />
              {appointment.note && (
                <MetaRow Icon={Notes}       label="Your notes" value={appointment.note} />
              )}
            </Box>

            {/* Action buttons */}
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: 2.5,
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              {isUpcoming && (
                <>
                  <StyledButton
                    text="Reschedule"
                    to="/book-appointment"
                    variant="muted"
                    sx={{ fontSize: "0.85rem", px: 3, py: 0.85, borderRadius: 0 }}
                  />
                  <StyledButton
                    text="Cancel Appointment"
                    onClick={() => setCancelOpen(true)}
                    variant="danger"
                    sx={{ fontSize: "0.85rem", px: 3, py: 0.85, borderRadius: 0 }}
                  />
                </>
              )}
              {isCompleted && (
                <StyledButton
                  text="Book Again"
                  to="/book-appointment"
                  variant="primary"
                  sx={{ fontSize: "0.85rem", px: 3, py: 0.85, borderRadius: 0 }}
                />
              )}
              {["cancelled", "rejected"].includes(appointment.status) && (
                <Typography variant="body2" color="text.disabled" sx={{ alignSelf: "center" }}>
                  This appointment has been {appointment.status}.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Treatment review section — only for completed appointments */}
          {isCompleted && (
            <AppointmentTreatmentReview
              appointmentId={id}
              serviceName={appointment.service || appointment.treatment}
              serviceId={appointment.service_id || null}
            />
          )}
        </Grid>

        {/* ── Right: sidebar ── */}
        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <RecentBlogPostsWidget />
        </Grid>
      </Grid>

      {/* Cancel confirmation dialog */}
      <Dialog
        open={cancelOpen}
        onClose={() => { if (!cancelling) { setCancelOpen(false); setCancelError(""); } }}
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "secondary.dark" }}>Cancel Appointment?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel your <strong>{appointment.service}</strong> on{" "}
            {formatDate(appointment.date)}? Cancellations made less than 24 hours in advance may
            not be eligible for a full refund.
          </Typography>
          {cancelError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 0 }}>{cancelError}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            autoFocus
            disabled={cancelling}
            onClick={() => { setCancelOpen(false); setCancelError(""); }}
            sx={{ textTransform: "none", color: "text.secondary", borderRadius: 0 }}
          >
            Keep Appointment
          </Button>
          <StyledButton
            text="Yes, Cancel"
            loadingText="Cancelling…"
            loading={cancelling}
            variant="danger"
            onClick={async () => {
              setCancelling(true);
              setCancelError("");
              try {
                await cancelMyAppointment(accessToken, appointment.id);
                navigate("/my-account/appointments");
              } catch (err) {
                setCancelError(err.response?.data?.error || "Failed to cancel. Please try again.");
                setCancelling(false);
              }
            }}
            sx={{ fontSize: "0.85rem", px: 2.5, py: 0.75, minWidth: 110 }}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
