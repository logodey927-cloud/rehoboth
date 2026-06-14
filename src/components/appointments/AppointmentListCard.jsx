import React, { useState } from "react";
import {
  Box, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert,
} from "@mui/material";
import {
  CalendarToday, AccessTime, LocationOn, Person, Timer, Spa,
} from "@mui/icons-material";
import StyledButton from "../common09/StyledButton";
import { CLINIC_LOCATION } from "../../data/profileData";
import { profileCardSx } from "../profile/profileStyles";
import { cancelMyAppointment } from "../../api/api";
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

/** Inline meta item — used in the date / time / duration row */
function MetaItem({ Icon, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
      <Box
        sx={{
          width: { xs: 24, md: 28 },
          height: { xs: 24, md: 28 },
          borderRadius: "50%",
          bgcolor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: { xs: 12, md: 14 }, color: "text.disabled" }} />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        lineHeight={1.4}
        fontSize={{ xs: "0.68rem", md: "0.78rem" }}
        sx={{ whiteSpace: "nowrap" }}
      >
        {children}
      </Typography>
    </Box>
  );
}

/** Full-width meta row — location, therapist */
function MetaRow({ Icon, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
      <Box
        sx={{
          width: { xs: 24, md: 28 },
          height: { xs: 24, md: 28 },
          borderRadius: "50%",
          bgcolor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: { xs: 12, md: 14 }, color: "text.disabled" }} />
      </Box>
      <Typography variant="caption" color="text.secondary" lineHeight={1.4} fontSize={{ xs: "0.68rem", md: "0.78rem" }}>
        {children}
      </Typography>
    </Box>
  );
}

const buttonSx = {
  fontSize: { xs: "0.68rem", sm: "0.8rem" },
  px: { xs: 0.5, sm: 2 },
  py: 0.75,
  flex: { xs: 1, md: "none" },
  minWidth: { xs: 0, sm: 136 },
  width: { xs: "auto", sm: 136 },
  whiteSpace: { xs: "nowrap", sm: "normal" },
};

export default function AppointmentListCard({ appointment, onCancelled }) {
  const { accessToken } = useUserAuth();
  const [cancelOpen, setCancelOpen]     = useState(false);
  const [cancelling, setCancelling]     = useState(false);
  const [cancelError, setCancelError]   = useState("");
  const chipStyle = STATUS_CHIP[appointment.status] || STATUS_CHIP.pending;
  const isUpcoming = !["completed", "client_completed", "cancelled", "rejected"].includes(appointment.status);
  const therapistName = appointment.therapist || appointment.team_member?.title || null;
  const therapistLabel = therapistName ? `Therapist: ${therapistName}` : "Therapist: —";
  const durationLabel = appointment.duration ||
    (appointment.service_duration ? `${appointment.service_duration} mins` : null);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          ...profileCardSx,
          mb: 2,
          p: 0,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "stretch",
            minHeight: { md: 150 },
          }}
        >
          {/* Thumbnail — full-width square on mobile, fixed square on desktop */}
          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              flexShrink: 0,
              p: { xs: 2, md: 2 },
              pb: { xs: 1.5, md: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: 120 },
                aspectRatio: "1 / 1",
                height: { md: 120 },
                flexShrink: 0,
                borderRadius: 1.5,
                overflow: "hidden",
                bgcolor: "secondary.light",
                backgroundImage: appointment.image_url ? `url(${appointment.image_url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!appointment.image_url && (
                <Spa sx={{ fontSize: { xs: 48, md: 36 }, color: "secondary.main", opacity: 0.5 }} />
              )}
            </Box>
          </Box>

          {/* Details */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 2, md: 2.5 },
              py: { xs: 0, md: 2 },
              pb: { xs: 1.5, md: 2 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                alignSelf: "flex-start",
                px: 1.25,
                py: 0.35,
                mb: 0.75,
                bgcolor: chipStyle.bg,
                color: chipStyle.color,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: 0.3,
                borderRadius: 0,
              }}
            >
              {chipStyle.label}
            </Box>

            <Typography
              fontWeight={700}
              fontSize={{ xs: "0.95rem", md: "1.05rem" }}
              color="text.primary"
              lineHeight={1.3}
              mb={1.25}
            >
              {appointment.service}
            </Typography>

            {/* Row 1: date · time · duration */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                alignItems: "center",
                gap: { xs: 1, md: 2.5 },
                overflowX: { xs: "auto", md: "visible" },
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <MetaItem Icon={CalendarToday}>{formatDate(appointment.date)}</MetaItem>
              {appointment.time && <MetaItem Icon={AccessTime}>{appointment.time}</MetaItem>}
              {durationLabel && <MetaItem Icon={Timer}>{durationLabel}</MetaItem>}
            </Box>

            {/* Row 2: location */}
            <MetaRow Icon={LocationOn}>{CLINIC_LOCATION}</MetaRow>

            {/* Row 3: therapist */}
            <MetaRow Icon={Person}>{therapistLabel}</MetaRow>
          </Box>

          {/* Action buttons — row on mobile, column on desktop */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              flexWrap: "nowrap",
              gap: { xs: 0.75, md: 1 },
              flexShrink: 0,
              px: { xs: 2, md: 2 },
              py: { xs: 1.5, md: 2 },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: { xs: "center", md: "center" },
            
              borderColor: "divider",
              bgcolor: { md: "#fafafa" },
            }}
          >
            <StyledButton
              text="View Details"
              to={`/my-account/appointments/${appointment.id}`}
              variant="primary"
              sx={buttonSx}
            />
            {isUpcoming && (
              <>
                <StyledButton
                  text="Reschedule"
                  to="/book-appointment"
                  variant="muted"
                  sx={buttonSx}
                />
                <StyledButton
                  text="Cancel"
                  onClick={() => setCancelOpen(true)}
                  variant="danger"
                  sx={buttonSx}
                />
              </>
            )}
          </Box>
        </Box>
      </Paper>

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
                setCancelOpen(false);
                if (onCancelled) onCancelled(appointment.id);
              } catch (err) {
                setCancelError(err.response?.data?.error || "Failed to cancel. Please try again.");
              } finally {
                setCancelling(false);
              }
            }}
            sx={{ fontSize: "0.85rem", px: 2.5, py: 0.75, minWidth: 110 }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
}
