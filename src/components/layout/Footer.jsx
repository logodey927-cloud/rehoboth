import { Box, Grid, Typography, IconButton } from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";
import FooterLinks from "../common09/FooterLinks";
import FooterContact from "../common09/FooterContact";
import FooterNewsletter from "../../components/common09/FooterNewsletter";
import SocialLinksRow from "../common09/SocialLinksRow";
import footerData from "../../data/footerData";
import logo from "../../assets/images/logo.webp";
import BgImg from "../../assets/images/bg-light-02.webp";

export default function Footer() {
  // const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <Box
      component="footer"
      sx={{
        backgroundImage: `url(${BgImg})`,
        bgcolor: "#fef6ef",
        color: "#000",
        py: 8,
        px: { xs: 2, md: 5 },
        position: "relative",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        opacity: 0.9,
      }}
    >
      <Grid
        container
        spacing={4}
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ===== Brand ===== */}
        <Grid
          size={{ xs: 12, md: 12, lg: 6 }}
          sx={{
            order: { xs: 1, md: 1, lg: 2 }, // Center block on desktop
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "center", lg: "center" },
            textAlign: { xs: "center", md: "center", lg: "center" },
          }}
        >
          <img src={logo} alt="Rehoboth" width={90} />
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
            {footerData.brand.name}
          </Typography>
          <Typography sx={{ mb: 2 }}>{footerData.brand.tagline}</Typography>
          <Typography
            sx={{ fontSize: ".9rem", maxWidth: { xs: "100%", sm: "500px" } }}
          >
            {footerData.brand.description}
          </Typography>
        </Grid>

        {/* ===== Contact ===== */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            order: { xs: 2, md: 2, lg: 1 }, // First on desktop
            display: "flex",
            justifyContent: {
              xs: "center",
              md: "flex-start",
              lg: "flex-start",
            },
            textAlign: { xs: "center", md: "left", lg: "left" },
          }}
        >
          <FooterContact />
        </Grid>

        {/* ===== Newsletter ===== */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            order: { xs: 3, md: 3, lg: 3 }, // Last on all
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end", lg: "flex-end" },
            textAlign: { xs: "center", md: "right", lg: "right" },
          }}
        >
          <FooterNewsletter />
        </Grid>
      </Grid>

      {/* ===== Footer Links ===== */}
      <FooterLinks />

      {/* ===== Social Icons (admin-managed) ===== */}
      <SocialLinksRow sx={{ mt: 3, fontSize: ".85rem" }} />

      {/* ===== Copyright ===== */}
      <Typography sx={{ textAlign: "center", mt: 2, opacity: 0.7 }}>
        {footerData.copyright}
      </Typography>

      {/* ===== Scroll to Top ===== */}
      <IconButton
        // onClick={scrollToTop}
        sx={{
          position: "absolute",
          bottom: 15,
          right: 15,
          transition: "color 0.3s ease",
          "&:hover": {
            color: "#f58c00",
          },
        }}
      >
        <ArrowUpward />
      </IconButton>
    </Box>
  );
}
