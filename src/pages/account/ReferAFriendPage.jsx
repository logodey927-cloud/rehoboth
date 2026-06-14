import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Alert, CircularProgress } from "@mui/material";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { getMyReferrals } from "../../api/api";
import ReferralShareCard from "../../components/referrals/ReferralShareCard";
import HowReferralsWorkWidget from "../../components/referrals/HowReferralsWorkWidget";
import ReferralsTable from "../../components/referrals/ReferralsTable";

function buildReferralUrl(code) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://rehobothhealthmassage.com";
  return `${origin}/register?ref=${code}`;
}

export default function ReferAFriendPage() {
  const { user, accessToken } = useUserAuth();
  const [referrals, setReferrals]     = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    getMyReferrals(accessToken)
      .then((res) => {
        if (res.data?.success) {
          setReferrals(res.data.referrals || []);
          if (res.data.referral_code) setReferralCode(res.data.referral_code);
        } else {
          setError("Could not load referrals.");
        }
      })
      .catch(() => setError("Could not load referrals. Please try again later."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const code = referralCode || user?.referral_code || "";
  const referralUrl = code ? buildReferralUrl(code) : "";

  return (
    <Box>
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color="secondary.dark"
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
        >
          Refer a Friend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Share Rehoboth Health &amp; Wellness with friends and earn rewards when they book.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && !code && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
          Your referral code could not be loaded. Please refresh the page or contact support.
        </Alert>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          {code && <ReferralShareCard referralUrl={referralUrl} />}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <HowReferralsWorkWidget />
        </Grid>

        <Grid size={{ xs: 12 }} data-aos="fade-up" data-aos-delay="150" data-aos-duration="600">
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "secondary.main" }} />
            </Box>
          ) : (
            <ReferralsTable referrals={referrals} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
