import React from "react";
import { Box, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function HeroSectionPageUI({
  BgImg,
  title = "Page Title",
  breadcrumb = [{ label: "Home", link: "/" }, { label: "Current Page" }],
  children,
}) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, sm: 10 },
        px: { xs: 2, sm: 6 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        textAlign: "center",
        overflow: "hidden",
        minHeight: { xs: "300px", sm: "400px" },
        ...(children && {
          height: "auto",
          py: { xs: 4, sm: 6 },
        }),
      }}
    >
      {/* Title */}
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: "bold",
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          mb: 2,
          fontFamily: "Montserrat, sans-serif",
          color: "#fff",
          width: { xs: "100%", md: "80%" },
        }}
      >
        {title}
      </Typography>

      {/* Breadcrumbs */}
      <Box sx={{ display: "flex", alignItems: "center", mb: children ? 4 : 0 }}>
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={idx}>
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontFamily: "Montserrat, sans-serif",
                fontWeight: "530",
                cursor: item.link ? "pointer" : "default",
                color: item.link ? "#232323" : "#f58c00",
                transition: ".3s ease",
                "&:hover": item.link && { color: "#f58c00" },
              }}
              onClick={() => item.link && (window.location.href = item.link)}
            >
              {item.label}
            </Typography>

            {/* Add separator except last item */}
            {idx < breadcrumb.length - 1 && (
              <ChevronRightIcon
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  mx: 1,
                  color: "#232323",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Children content */}
      {children && (
        <Box sx={{ width: "100%", maxWidth: "1400px", mt: 2 }}>{children}</Box>
      )}
    </Box>
  );
}

export default HeroSectionPageUI;
