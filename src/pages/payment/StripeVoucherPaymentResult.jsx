import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, Container, Alert, CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";
import { getStripeCheckoutSession, capturePayPalOrder } from "../../api/api";
import StyledButton from "../../components/common09/StyledButton";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function StripeVoucherPaymentResult({ mode }) {
  const query = useQuery();
  const sessionId = query.get("session_id");
  const paypalOrderId = query.get("token"); // PayPal returns ?token=<orderId>

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [gateway, setGateway] = useState("stripe");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // Stripe flow (legacy)
        if (sessionId) {
          setGateway("stripe");
          const resp = await getStripeCheckoutSession(sessionId);
          if (!resp.data?.success) {
            setError(resp.data?.error || "Failed to verify payment.");
            return;
          }
          setStatus(resp.data.session?.payment_status || null);
          return;
        }

        // PayPal flow (token is PayPal order ID)
        if (paypalOrderId) {
          setGateway("paypal");
          const resp = await capturePayPalOrder(paypalOrderId);
          if (!resp.data?.success) {
            setError(resp.data?.error || "Failed to verify PayPal payment.");
            return;
          }
          const paypalStatus = resp.data?.status || "COMPLETED";
          setStatus(paypalStatus);
          return;
        }

        setError("Missing payment identifier. Please try again.");
      } catch (e) {
        setError(e.response?.data?.error || e.message || "Failed to verify payment.");
      } finally {
        setLoading(false);
      }
    };

    // For cancel, we still fetch best-effort so we can show consistent messaging.
    run();
  }, [sessionId, paypalOrderId]);

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 0, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {mode === "success" ? "Voucher Payment Status" : "Voucher Payment Cancelled"}
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Checking your payment{gateway === "paypal" ? " with PayPal…" : " with Stripe…"}
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 0, mb: 2 }}>
              {error}
            </Alert>
          ) : mode === "success" ? (
            <Alert severity={status === "paid" || status === "COMPLETED" ? "success" : "warning"} sx={{ borderRadius: 0, mb: 2 }}>
              {status === "paid" || status === "COMPLETED"
                ? "Payment confirmed. Your voucher code will be emailed to you shortly."
                : "Payment not confirmed yet. If you completed payment, please wait a moment and refresh."}
            </Alert>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 0, mb: 2 }}>
              Your voucher payment was cancelled. No voucher will be issued until payment is completed.
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
            <StyledButton to="/vouchers" text="Back to Vouchers" variant="secondary" />
            <StyledButton to="/my-account/vouchers" text="My Vouchers" />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}



