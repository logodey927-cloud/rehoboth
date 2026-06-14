import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Skeleton } from "@mui/material";
import { getPublicPaymentMethods } from "../../api/api";

import stripeLogo from "../../assets/payments/stripe.svg";
import paypalLogo from "../../assets/payments/paypal.svg";
import sumupLogo from "../../assets/payments/sumup.svg";

const BUNDLED_LOGOS = { stripe: stripeLogo, paypal: paypalLogo, sumup: sumupLogo };

function GatewayCard({ method, selected, onSelect }) {
  const logo = method.logo_url || BUNDLED_LOGOS[method.slug];
  const isSelected = method.slug === selected;

  return (
    <Card
      variant="outlined"
      onClick={() => onSelect?.(method.slug)}
      sx={{
        p: 1.5,
        borderRadius: 1,
        borderColor: isSelected ? "#635BFF" : "rgba(99, 91, 255, 0.35)",
        boxShadow: isSelected ? "0 0 0 2px rgba(99, 91, 255, 0.15)" : "none",
        cursor: "pointer",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderColor: isSelected ? "#635BFF" : "text.primary",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          minHeight: 100,
        }}
      >
        {logo ? (
          <Box
            component="img"
            src={logo}
            alt={method.display_name}
            sx={{ height: 40, width: "auto", display: "block", mt: 2 }}
          />
        ) : (
          <Typography fontWeight={700} fontSize="0.95rem" sx={{ mt: 2 }}>
            {method.display_name}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
          {method.helper_text || method.display_name}
        </Typography>
      </Box>
    </Card>
  );
}

export default function PaymentGatewaySelector({ selectedGateway = null, onSelect }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPaymentMethods()
      .then((res) => setMethods(res.data?.methods || []))
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Payment method
      </Typography>

      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      ) : methods.length === 0 ? (
        <Typography variant="body2" color="error" sx={{ py: 2 }}>
          Payments are temporarily unavailable. Please try again later.
        </Typography>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: `repeat(${Math.min(methods.length, 3)}, 1fr)` }, gap: 1.5 }}>
          {methods.map((method) => (
            <GatewayCard
              key={method.slug}
              method={method}
              selected={selectedGateway}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
