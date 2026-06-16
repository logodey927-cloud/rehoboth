import { Box, Grid, CircularProgress, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { getServices, unwrapServicesList } from "../../api/api";
import MassageSidebar from "../common09/MassageSidebar";
import MassageContent from "../common09/MassageContent";
import { AnimatePresence } from "framer-motion";
import InfoSection from "../common09/InfoSection";
import sectionIcon from "../../assets/effectImag/icon-section.webp";

const MassageSection = () => {
  const [massages, setMassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (massages.length > 0 && !active) {
      setActive(massages[0]);
    }
  }, [massages, active]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServices();
      if (response.data?.success) {
        const services = unwrapServicesList(response);
        setMassages(services);
        if (services.length > 0) {
          setActive(services[0]);
        }
      } else {
        setError("Failed to load services");
      }
    } catch (err) {
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        py: { xs: 6, sm: 10 },
        px: { xs: 2, sm: 6 },
        bgcolor: "#e8ffeaff",
      }}
    >
      {/* <InfoSection /> */}
      <InfoSection
        data-aos="fade-up"
        subtitle="Relaxation Redefined"
        title="Massage Treatments"
        description={[
          "Experience ultimate relaxation with our range of therapeutic massage treatments. Each session is designed to relieve stress, ease muscle tension, and restore balance to your body and mind.",
        ]}
        colorBtn="#157D1C"
        btnText="View All Services"
        btnLink="/services"
        align="center"
        btnAlign="center"
        imgIcon={sectionIcon}
      />

      {/* Massage Sidebar and Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ px: 2 }}>
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {error}
          </Alert>
        </Box>
      ) : massages.length > 0 ? (
        <Grid container spacing={2} data-aos="fade-up">
          <Grid size={{ xs: 12, md: 3 }}>
            <MassageSidebar
              massages={massages}
              active={active}
              setActive={setActive}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <AnimatePresence mode="wait">
              {active && <MassageContent item={active} />}
            </AnimatePresence>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default MassageSection;
