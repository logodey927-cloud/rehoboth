import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, Container, Alert, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { getStripeCheckoutSession, capturePayPalOrder } from "../../api/api";
import StyledButton from "../../components/common09/StyledButton";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function StripeAppointmentPaymentResult({ mode }) {
  const query = useQuery();
  const navigate = useNavigate();
  const sessionId = query.get("session_id");
  // PayPal returns ?token=<orderId>
  const paypalOrderId = query.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // Stripe flow
        if (sessionId) {
          const resp = await getStripeCheckoutSession(sessionId);
          if (!resp.data?.success) {
            setError(resp.data?.error || "Failed to verify payment.");
            return;
          }

          const s = resp.data.session;
          setStatus(s?.payment_status || null);
          const apptId = s?.metadata?.appointment_id || null;
          setAppointmentId(apptId);

          if (mode === "success" && s?.payment_status === "paid" && apptId) {
            navigate(`/appointment-summary/${apptId}`, { replace: true });
          }
          return;
        }

        // PayPal flow (token is the PayPal order ID)
        if (paypalOrderId) {
          const resp = await capturePayPalOrder(paypalOrderId);
          if (!resp.data?.success) {
            setError(resp.data?.error || "Failed to verify PayPal payment.");
            return;
          }

          const apptId = resp.data?.appointmentId || null; // our capture endpoint may not return this; keep local state
          setAppointmentId(apptId);
          const paypalStatus = resp.data?.status || "COMPLETED";
          setStatus(paypalStatus);

          if (mode === "success" && paypalStatus === "COMPLETED" && apptId) {
            navigate(`/appointment-summary/${apptId}`, { replace: true });
          }
          return;
        }

        setError("Missing payment identifier. Please try again.");
      } catch (e) {
        setError(e.response?.data?.error || e.message || "Failed to verify payment.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [sessionId, paypalOrderId, mode, navigate]);

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 0, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {mode === "success" ? "Payment Status" : "Payment Cancelled"}
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Checking your payment with Stripe…
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 0, mb: 2 }}>
              {error}
            </Alert>
          ) : mode === "success" ? (
            <Alert severity={status === "paid" ? "success" : "warning"} sx={{ borderRadius: 0, mb: 2 }}>
              {status === "paid"
                ? "Payment confirmed. Redirecting to your appointment summary…"
                : "Payment not confirmed yet. If you completed payment, please wait a moment and refresh."}
            </Alert>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 0, mb: 2 }}>
              Your payment was cancelled. Your appointment will not be confirmed until payment is completed.
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
            {appointmentId && (
              <StyledButton
                to={`/appointment-summary/${appointmentId}`}
                text="View Appointment"
                variant="secondary"
              />
            )}
            <StyledButton to="/book-appointment" text="Back to Booking" variant="secondary" />
            <StyledButton to="/my-account/appointments" text="My Appointments" />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}



