import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

const createSnowfall = (translateX) => keyframes`
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(${translateX}px) rotate(360deg);
    opacity: 0;
  }
`;

export default function ChristmasSnowflakes() {
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 10 + 10,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.5 + 0.5,
    translateX: Math.random() * 100 - 50,
  }));

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {snowflakes.map((snowflake) => (
        <Box
          key={snowflake.id}
          sx={{
            position: "absolute",
            top: "-10px",
            left: `${snowflake.left}%`,
            color: "#ffffff",
            fontSize: `${snowflake.size}px`,
            fontFamily: "Arial, sans-serif",
            opacity: snowflake.opacity,
            animation: `${createSnowfall(snowflake.translateX)} ${snowflake.duration}s linear infinite`,
            animationDelay: `${snowflake.delay}s`,
            textShadow: "0 0 5px rgba(255,255,255,0.8)",
          }}
        >
          ❄
        </Box>
      ))}
    </Box>
  );
}

