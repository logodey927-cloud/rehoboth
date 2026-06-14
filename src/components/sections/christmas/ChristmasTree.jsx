import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

const rotate3d = keyframes`
  0% {
    transform: rotateY(0deg) rotateX(5deg);
  }
  50% {
    transform: rotateY(180deg) rotateX(-5deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(5deg);
  }
`;

const createPulse = (index) => keyframes`
  0%, 100% {
    transform: translateX(-50%) translateZ(${index * 10}px) scale(1);
  }
  50% {
    transform: translateX(-50%) translateZ(${index * 10}px) scale(1.05);
  }
`;

const createSparkle = (_delay) => keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.3) rotate(180deg);
    opacity: 0.8;
  }
`;

const starTwinkle = keyframes`
  0%, 100% {
    transform: translateX(-50%) translateZ(20px) scale(1) rotate(0deg);
    filter: drop-shadow(0 0 10px #FFD700);
  }
  50% {
    transform: translateX(-50%) translateZ(20px) scale(1.2) rotate(180deg);
    filter: drop-shadow(0 0 20px #FFD700);
  }
`;

export default function ChristmasTree() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "200px",
        height: "250px",
        perspective: "1000px",
        "@media (max-width: 768px)": {
          width: "150px",
          height: "200px",
        },
      }}
    >
      {/* Tree Container with 3D rotation */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          animation: `${rotate3d} 20s linear infinite`,
        }}
      >
        {/* Tree Layers */}
        {[1, 2, 3].map((layer, index) => (
          <Box
            key={layer}
            sx={{
              position: "absolute",
              left: "50%",
              transform: `translateX(-50%) translateZ(${index * 10}px)`,
              bottom: `${index * 30}px`,
              width: `${200 - index * 40}px`,
              height: `${80 - index * 15}px`,
              background: `linear-gradient(135deg, #228B22 0%, #32CD32 50%, #228B22 100%)`,
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              boxShadow: `
                0 0 20px rgba(34, 139, 34, 0.5),
                inset 0 0 20px rgba(50, 205, 50, 0.3)
              `,
              animation: `${createPulse(index)} ${2 + index}s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          />
        ))}

        {/* Tree Trunk */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: "0px",
            transform: "translateX(-50%) translateZ(0px)",
            width: "30px",
            height: "40px",
            background: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
            borderRadius: "4px",
            boxShadow: "0 0 10px rgba(139, 69, 19, 0.5)",
          }}
        />

        {/* Ornaments */}
        {[
          { top: "30%", left: "45%", color: "#FFD700" },
          { top: "45%", left: "35%", color: "#FF6347" },
          { top: "45%", left: "60%", color: "#4169E1" },
          { top: "60%", left: "50%", color: "#FF1493" },
          { top: "60%", left: "40%", color: "#FFD700" },
          { top: "60%", left: "60%", color: "#00CED1" },
        ].map((ornament, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: ornament.top,
              left: ornament.left,
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, #ffffff, ${ornament.color})`,
              boxShadow: `
                0 0 10px ${ornament.color},
                0 0 20px ${ornament.color},
                inset -2px -2px 4px rgba(0,0,0,0.3)
              `,
              animation: `${createSparkle(index)} ${1.5 + index * 0.2}s ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}

        {/* Star on Top */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%) translateZ(20px)",
            width: "0",
            height: "0",
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: "25px solid #FFD700",
            filter: "drop-shadow(0 0 10px #FFD700)",
            animation: `${starTwinkle} 2s ease-in-out infinite`,
            "&::after": {
              content: '""',
              position: "absolute",
              top: "8px",
              left: "-15px",
              width: "0",
              height: "0",
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "25px solid #FFD700",
            },
          }}
        />
      </Box>
    </Box>
  );
}

