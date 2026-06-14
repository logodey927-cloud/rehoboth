import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
import logoImage from "../../../assets/images/logo.png";

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 3px rgba(220, 20, 60, 0.4),
      0 0 6px rgba(220, 20, 60, 0.3),
      1px 1px 2px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 
      0 0 5px rgba(220, 20, 60, 0.5),
      0 0 8px rgba(220, 20, 60, 0.4),
      1px 1px 2px rgba(0, 0, 0, 0.3);
  }
`;


export default function ChristmasMessage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        color: "#ffffff",
        px: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt="Rehoboth Health and Wellness Clinic Logo"
          sx={{
            height: { xs: 60, sm: 80, md: 100 },
            width: "auto",
            mb: 2,
            filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))",
          }}
        />
        <Typography
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem", lg: "6rem" },
            fontWeight: 400,
            fontFamily: '"Dancing Script", "Great Vibes", "Brush Script MT", "Lucida Handwriting", cursive',
            color: "#DC143C",
           
            animation: `${pulseGlow} 2s ease-in-out infinite`,
            letterSpacing: "2px",
            textAlign: "center",
          }}
        >
          Merry Christmas
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
          fontWeight: 400,
          mb: 3,
          color: "#B8860B",
          textShadow: "0 0 5px rgba(184, 134, 11, 0.3), 1px 1px 2px rgba(0, 0, 0, 0.3)",
          animation: `${fadeInUp} 1s ease-out 0.5s both`,
        }}
      >
        Spread Joy & Wellness This Holiday Season
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
          mb: 4,
          maxWidth: "600px",
          mx: "auto",
          color: "#000000",
          fontWeight: 500,
          animation: `${fadeInUp} 1s ease-out 1s both`,
        }}
      >
        Give the gift of relaxation and rejuvenation. Our special Christmas vouchers
        and gift packages are perfect for treating yourself or your loved ones.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
          animation: `${fadeInUp} 1s ease-out 1.5s both`,
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/vouchers")}
          sx={{
            background: "linear-gradient(135deg, #DC143C 0%, #FF6347 100%)",
            color: "#ffffff",
            px: 4,
            py: 1.5,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            fontWeight: 600,
            borderRadius: "50px",
            boxShadow: `
              0 0 20px rgba(220, 20, 60, 0.6),
              0 5px 15px rgba(0, 0, 0, 0.3)
            `,
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(135deg, #FF6347 0%, #DC143C 100%)",
              boxShadow: `
                0 0 30px rgba(220, 20, 60, 0.8),
                0 8px 20px rgba(0, 0, 0, 0.4)
              `,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          View Christmas Vouchers
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate("/book-appointment")}
          sx={{
            borderColor: "#ffffff",
            color: "#ffffff",
            borderWidth: 2,
            px: 4,
            py: 1.5,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            fontWeight: 600,
            borderRadius: "50px",
            textTransform: "none",
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.1)",
            "&:hover": {
              borderColor: "#DC143C",
              color: "#DC143C",
              background: "rgba(220, 20, 60, 0.2)",
              borderWidth: 2,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Book Appointment
        </Button>
      </Box>
    </Box>
  );
}

