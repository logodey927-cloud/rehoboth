import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Email,
  Notifications,
  CalendarToday,
  AccessTime,
} from "@mui/icons-material";
import StyledButton from "../common09/StyledButton";

const ComingSoonPage = ({
  title = "Something Amazing is Coming Soon",
  subtitle = "Stay Tuned",
  description = "We're working hard to bring you something extraordinary. Get notified when we launch!",
  launchDate = "2024-12-31",
  // features = [],
  showNewsletter = true,
  showCountdown = true,
}) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const launch = new Date(launchDate).getTime();
      const difference = launch - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      // Handle email subscription here
    }
  };

  // const defaultFeatures = [
  //   {
  //     icon: <CalendarToday sx={{ fontSize: 40, color: "#0C6E6D" }} />,
  //     title: "New Services",
  //     description: "Exciting new spa treatments and wellness programs",
  //   },
  //   {
  //     icon: <AccessTime sx={{ fontSize: 40, color: "#0C6E6D" }} />,
  //     title: "Extended Hours",
  //     description: "More flexible scheduling options for your convenience",
  //   },
  //   {
  //     icon: <Notifications sx={{ fontSize: 40, color: "#0C6E6D" }} />,
  //     title: "Smart Booking",
  //     description: "AI-powered appointment scheduling and reminders",
  //   },
  // ];

  // const featuresToShow = features.length > 0 ? features : defaultFeatures;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(12, 110, 109, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 140, 0, 0.1) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: "center" }}>
            {/* Coming Soon Badge */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Chip
                label="Coming Soon"
                sx={{
                  backgroundColor: "#0C6E6D",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  mb: 4,
                }}
              />
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "#0C6E6D",
                  mb: 2,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  color: "#666",
                  mb: 3,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {subtitle}
              </Typography>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 6,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  maxWidth: "600px",
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {description}
              </Typography>
            </motion.div>

            {/* Countdown Timer */}
            {showCountdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mb: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((item) => (
                    <Paper
                      key={item.label}
                      elevation={3}
                      sx={{
                        p: 3,
                        textAlign: "center",
                        minWidth: 100,
                        backgroundColor: "white",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: "#0C6E6D",
                          mb: 1,
                        }}
                      >
                        {item.value.toString().padStart(2, "0")}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            )}

            {/* Newsletter Subscription */}
            {showNewsletter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    maxWidth: "500px",
                    mx: "auto",
                    mb: 6,
                    backgroundColor: "white",
                    borderRadius: 2,
                  }}
                >
                  {!isSubscribed ? (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#0C6E6D",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Email sx={{ fontSize: 20 }} />
                        Get Notified
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          mb: 3,
                        }}
                      >
                        Be the first to know when we launch. Enter your email
                        below.
                      </Typography>
                      <Box
                        component="form"
                        onSubmit={handleEmailSubmit}
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <TextField
                          fullWidth
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 0,
                              border: "1px solid #e0e0e0",
                              "&:hover": {
                                borderColor: "#0C6E6D",
                              },
                              "&.Mui-focused": {
                                borderColor: "#0C6E6D",
                              },
                            },
                          }}
                        />
                        <StyledButton
                          text="Notify Me"
                          variant="primary"
                          type="submit"
                          sx={{
                            px: 4,
                            py: 1.5,
                            whiteSpace: "nowrap",
                          }}
                        />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#0C6E6D",
                          mb: 2,
                        }}
                      >
                        Thank You!
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                        }}
                      >
                        We'll notify you as soon as we launch.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            )}

            {/* Features Preview */}
            {/* <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "#0C6E6D",
                  mb: 4,
                }}
              >
                What to Expect
              </Typography>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {featuresToShow.map((feature, _index) => (
                  <Grid item xs={12} sm={6} md={4} key={_index}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#0C6E6D",
                          mb: 1,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </motion.div> */}

            {/* Back to Home Button */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <StyledButton
                text="Back to Home"
                variant="secondary"
                href="/"
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: "1.1rem",
                }}
              />
            </motion.div> */}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ComingSoonPage;
