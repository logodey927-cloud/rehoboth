import React from "react";
import { Box, Typography } from "@mui/material";

const SpaServiceCategoriesCard = ({ title, icon }) => {
  return (
    <Box
      sx={{
        position: "relative",
        display: { xs: "block", sm: "flex" },
        flexDirection: { xs: "column", sm: "row" },
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        borderRadius: 0,
        overflow: "hidden",
        bgcolor: "#486830",
        height: { xs: "auto", sm: 150 },
        transition: "color 0.s ease",
        "&:hover::before": {
          left: "100%",
        },
        "&:hover": {
          color: "#000000",
          background:
            "linear-gradient(90deg, rgba(27, 36, 8, 1), rgba(27, 36, 8, 1), rgba(27, 36, 8, 1))",
        },
      }}
    >
      <Box
        sx={{
          flex: { xs: "0 0 100%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: { xs: "center" },
          textAlign: { xs: "center", sm: "center" },
          padding: { xs: 6, sm: 4 },
        }}
      >
        <Box sx={{ display: "flex", mb: 2 }}>
          <img width="50" height="50" src={icon} alt="oil-massage" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 0,
            color: "#fff",
            fontFamily: `"Raleway", sans-serif`,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default SpaServiceCategoriesCard;
