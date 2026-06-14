import React from "react";
import AppointmentForm from "../components/AppointmentForm";
import { Box, Alert, Button } from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import SEO from "../components/common09/SEO";
import { useUserAuth } from "../contexts/UserAuthContext";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

export default function Appointment() {
  const { isAuthenticated, loading } = useUserAuth();
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service") || "";
  const bookingFrom = service
    ? `/book-appointment?service=${encodeURIComponent(service)}`
    : "/book-appointment";

  return (
    <Box>
      <SEO 
        title="Book Appointment"
        description="Book your wellness appointment at Rehoboth Health & Wellness Clinic. Choose from our range of spa treatments, massages, and holistic wellness services in Rochdale, Greater Manchester."
        keywords="book appointment, spa booking, wellness appointment, massage booking, Rochdale spa, schedule appointment"
      />
      <HeroPageSection
        title="Book Appointment"
        breadcrumb={[{ label: "Home", link: "/" }, { label: " Appointment" }]}
      />

      {!loading && !isAuthenticated ? (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 6, mb: 10, px: 2 }}>
          <Alert
            severity="info"
            sx={{ mb: 2, "& .MuiAlert-message": { width: "100%" } }}
            action={
              <Button
                color="inherit" size="small" variant="outlined"
                component={RouterLink}
                to="/login"
                state={{ from: bookingFrom }}
                sx={{ whiteSpace: "nowrap", fontWeight: 600 }}
              >
                Sign In
              </Button>
            }
          >
            Please sign in or create a free account to book an appointment.
          </Alert>
          <Button
            fullWidth variant="contained" component={RouterLink} to="/register"
            state={{ from: bookingFrom }}
            sx={{ py: 1.3, backgroundColor: "secondary.main", fontWeight: 700, textTransform: "none", fontSize: "1rem" }}
          >
            Create Free Account &amp; Book
          </Button>
          <Button
            fullWidth variant="outlined" component={RouterLink} to="/login"
            state={{ from: bookingFrom }}
            sx={{ mt: 1.5, py: 1.3, borderColor: "secondary.main", color: "secondary.main", fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
          >
            I already have an account — Sign In
          </Button>
        </Box>
      ) : (
        <AppointmentForm initialService={service} />
      )}
    </Box>
  );
}
