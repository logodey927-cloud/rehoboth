import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { keyframes } from "@emotion/react";
import ChristmasSnowflakes from "./ChristmasSnowflakes";
// import ChristmasTree from "./ChristmasTree";
import ChristmasMessage from "./ChristmasMessage";
import ChristmasOrnaments from "./ChristmasOrnaments";
import christmasFrame from "../../../assets/images/christmas-frame-01.webp";

const backgroundShift = keyframes`
  0% {
    background-position: 0% 50%, center, center;
  }
  50% {
    background-position: 100% 50%, center, center;
  }
  100% {
    background-position: 0% 50%, center, center;
  }
`;

// const slideInLeft = keyframes`
//   0% {
//     opacity: 0;
//     transform: translateX(-100px);
//   }
//   100% {
//     opacity: 1;
//     transform: translateX(0);
//   }
// `;

const slideInRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const borderFlow = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
`;

export default function ChristmasGreetingSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isChristmasSeason, setIsChristmasSeason] = useState(false);

  useEffect(() => {
    // Check if it's Christmas season (December)
    const now = new Date();
    const month = now.getMonth(); // 0-11, where 11 is December
    setIsChristmasSeason(month === 11); // Show only in December

    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Don't render if not Christmas season
  if (!isChristmasSeason) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: "600px", sm: "700px", md: "800px" },
        backgroundImage: `url(${christmasFrame})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 6, sm: 8, md: 10 },
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1s ease-in",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(135deg, 
              rgba(139, 0, 0, 0.3) 0%, 
              rgba(220, 20, 60, 0.2) 25%, 
              rgba(255, 0, 0, 0.2) 50%, 
              rgba(220, 20, 60, 0.2) 75%, 
              rgba(139, 0, 0, 0.3) 100%
            )
          `,
          backgroundSize: "200% 200%",
          animation: `${backgroundShift} 15s ease infinite`,
          zIndex: 0,
        },
      }}
    >
      {/* Snowflakes Background */}
      <ChristmasSnowflakes />

      {/* Ornaments */}
      <ChristmasOrnaments />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
          }}
        >
          {/* Christmas Tree - Left Side (Desktop) */}
          {/* <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              animation: `${slideInLeft} 1s ease-out`,
            }}
          >
            <ChristmasTree />
          </Box> */}

          {/* Message Center */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `${fadeInScale} 1s ease-out 0.3s both`,
            }}
          >
            <ChristmasMessage />
          </Box>

          {/* Christmas Tree - Right Side (Desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              animation: `${slideInRight} 1s ease-out`,
            }}
          >
            {/* <Box
              sx={{
                transform: "scaleX(-1)", // Mirror the tree
              }}
            >
              <ChristmasTree />
            </Box> */}
          </Box>

          {/* Small Tree for Mobile */}
          {/* <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "center",
              animation: `${fadeInScale} 1s ease-out 0.5s both`,
            }}
          >
            <Box sx={{ transform: "scale(0.7)" }}>
              <ChristmasTree />
            </Box>
          </Box> */}
        </Box>
      </Container>

      {/* Decorative Bottom Border */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, transparent, #FFD700, #DC143C, #228B22, #FFD700, transparent)",
          backgroundSize: "200% 100%",
          animation: `${borderFlow} 3s linear infinite`,
        }}
      />
    </Box>
  );
}
