import React from "react";
import { Box } from "@mui/material";
import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";
import { isStandalone } from "../../../utils/pwa";

function Preloader() {
  return (
    <Box
      className="preloader"
      component="div"
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // Match manifest background_color for seamless standalone launch
        backgroundColor: isStandalone() ? "#0C6E6D" : "#f5f5f5",
        zIndex: 20000,
        overflow: "hidden",
        p: 2,
      }}
    >
      <Box
        component="div"
        className="preloader-logo"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <Box
          component="img"
          src="/rehoboth-logo-fa.webp"
          alt="Rehoboth Health & Wellness"
          sx={{
            width: { xs: 90, sm: 110 },
            height: { xs: 90, sm: 110 },
            borderRadius: "16px",
            boxShadow: isStandalone()
              ? "0 4px 20px rgba(0,0,0,0.25)"
              : "0 2px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Spiral
          size="40"
          speed="0.9"
          color={isStandalone() ? "#ffffff" : "#0C6E6D"}
        />
      </Box>
    </Box>
  );
}

export default Preloader;
