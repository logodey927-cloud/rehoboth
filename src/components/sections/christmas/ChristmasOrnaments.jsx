import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

const createFloat = (_index) => keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  50% {
    transform: translateY(-20px) rotate(180deg) scale(1.1);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

export default function ChristmasOrnaments() {
  const ornaments = [
    { left: "10%", top: "20%", delay: 0, color: "#FFD700" },
    { left: "85%", top: "25%", delay: 0.3, color: "#FF6347" },
    { left: "15%", top: "70%", delay: 0.6, color: "#4169E1" },
    { left: "80%", top: "75%", delay: 0.9, color: "#FF1493" },
    { left: "5%", top: "50%", delay: 1.2, color: "#00CED1" },
    { left: "90%", top: "45%", delay: 1.5, color: "#FFD700" },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {ornaments.map((ornament, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: ornament.left,
            top: ornament.top,
            width: { xs: "30px", sm: "40px", md: "50px" },
            height: { xs: "30px", sm: "40px", md: "50px" },
            animation: `${createFloat(index)} ${3 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${ornament.delay}s`,
          }}
        >
          {/* Ornament Ball */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, #ffffff, ${ornament.color})`,
              boxShadow: `
                0 0 20px ${ornament.color},
                0 0 40px ${ornament.color},
                inset -5px -5px 10px rgba(0,0,0,0.3),
                inset 5px 5px 10px rgba(255,255,255,0.3)
              `,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "8px",
                height: "8px",
                background: ornament.color,
                borderRadius: "50% 50% 0 0",
                boxShadow: `0 0 10px ${ornament.color}`,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "2px",
                height: "12px",
                background: "linear-gradient(to bottom, #8B4513, #A0522D)",
              },
            }}
          />
        </Box>
      ))}

      {/* Sparkles */}
      {Array.from({ length: 20 }, (_, i) => (
        <Box
          key={`sparkle-${i}`}
          sx={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#FFD700",
            boxShadow: "0 0 10px #FFD700, 0 0 20px #FFD700",
            animation: `${sparkle} ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </Box>
  );
}

