import React from "react";
import { Box, Grid } from "@mui/material";
import BgImg from "../../assets/images/bg-light-01.webp";
import AboutUi from "./AvoutUI";
import InfoSection from "../common09/InfoSection";
// import sectionIcon from "../../assets/effectImag/icon-section.webp";

export default function AboutUs() {
  return (
    <Box
      className="AboutUs"
      component="section"
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, sm: 10 },
        px: { xs: 2, sm: 6 },
        minHeight: { xs: "auto", md: "100vh" },
        overflow: "hidden",
      }}
    >
      <Grid
        container
        spacing={4}
        sx={{
          height: "100%",
          position: "relative",
          zIndex: 1,
          alignItems: "center",
        }}
      >
        <Grid
          p={{ xs: 0, md: 4 }}
          size={{ xs: 12, md: 6 }}
          sx={{ height: "100%" }}
        >
          <AboutUi />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid
            container
            spacing={0}
            justifyContent="center"
            sx={{ position: "relative", zIndex: 1 }} // make sure content is above overlay
          >
            <Grid size={{ xs: 12 }} className="AboutInfoSection">
              <InfoSection
                data-aos="fade-up"
                subtitle="About Us"
                title="Why We Are the Best"
                description={[
                  "At Rehoboth Health & Massage Spa, our philosophy is simple: wellness should feel luxurious, soothing, and deeply personal. We create a calming escape where stress melts away and your mind, body, and spirit reconnect.",
                  "Our skilled therapists combine expert techniques with warm, thoughtful care to craft a truly tailored experience. Every treatment is designed with intention, supporting relaxation, rejuvenation, and natural balance.",
                  "Quality, comfort, and genuine hospitality are at the heart of everything we do. From the moment you arrive, you are cared for — not rushed, not pressured — simply welcomed and restored at your own pace.",
                  "Whether you're seeking relief, relaxation, or radiant skin, our spa is your sanctuary. Breathe, unwind, and experience wellness the way it should be: calm, nurturing, and refreshingly real.",
                ]}
                align="center"
                btnAlign="center"
                descriptionAlign="justify"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
