import React from "react";
import {
  Box,
  Grid,
  Stack,
  Typography,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

export default function WellnessSection() {
  return (
    <Box sx={{}}>
      {/* Section Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          mb: 3,
          fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
        }}
      >
        Exceptional Wellness <br /> Treatments
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="subtitle2"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 3,
          mb: 3,
          fontFamily: "'Lato', sans-serif",
        }}
      >
        Best Skin Care
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          maxWidth: 600,
          mx: "auto",
          color: "#232323",
          mb: 6,
        }}
      >
        Experience the art of healing at Rehoboth Health & Wellness Clinic,
        where our therapists combine expertise and compassion to restore balance
        and vitality. From sports and deep tissue massage to advanced skincare
        and holistic therapies, every treatment is designed to help you relax,
        rejuvenate, and glow from within.
      </Typography>

      {/* Stats Section */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{ textAlign: "center" }}
      >
        {/* Rating */}
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
            }}
          >
            4.4
          </Typography>
          <Stack
            direction="row"
            justifyContent="center"
            spacing={0.5}
            sx={{ my: 1 }}
          >
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                sx={{
                  fontSize: 16,
                  color: i < 4 ? "primary.main" : "#ddd",
                }}
              />
            ))}
          </Stack>
          <Typography
            variant="subtitle2"
            sx={{
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'Lato', sans-serif",
              color: "#232323",
            }}
          >
            1500 Ratings
          </Typography>
        </Grid>

        {/* Customers */}
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
            }}
          >
            25k
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'Lato', sans-serif",
              color: "#232323",
            }}
          >
            Worldwide Customers
          </Typography>
        </Grid>

        {/* People Today */}
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <AvatarGroup
              max={3}
              sx={{ "& .MuiAvatar-root": { width: 40, height: 40 } }}
            >
              <Avatar alt="Person 1" src="https://i.pravatar.cc/40?img=1" />
              <Avatar alt="Person 2" src="https://i.pravatar.cc/40?img=2" />
              <Avatar alt="Person 3" src="https://i.pravatar.cc/40?img=3" />
              <Avatar sx={{ bgcolor: "#4a403a", fontSize: 14 }}>+26</Avatar>
            </AvatarGroup>
          </Stack>
          <Typography
            variant="subtitle2"
            sx={{
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'Lato', sans-serif",
              color: "#232323",
            }}
          >
            Peoples Tired Today
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
