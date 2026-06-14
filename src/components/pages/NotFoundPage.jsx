import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowBack, Search } from "@mui/icons-material";
import { Link } from "react-router-dom";
import StyledButton from "../common09/StyledButton";

const NotFoundPage = () => {
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

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: "center" }}>
            {/* 404 Number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "8rem", sm: "12rem", md: "15rem" },
                  fontWeight: 700,
                  color: "#0C6E6D",
                  lineHeight: 0.8,
                  mb: 2,
                  textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                404
              </Typography>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#222",
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                Oops! Page Not Found
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 4,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  maxWidth: "600px",
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                The page you're looking for seems to have vanished into the digital void. 
                Don't worry, even the best spa treatments can't fix everything, but we can help you find what you need.
              </Typography>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 6,
                }}
              >
                <StyledButton
                  text="Go Home"
                  variant="primary"
                  href="/"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                  }}
                />
                <Button
                  component={Link}
                  to="/"
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  sx={{
                    borderColor: "#0C6E6D",
                    color: "#0C6E6D",
                    px: 4,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "#0C6E6D",
                      color: "white",
                    },
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  p: 4,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  maxWidth: "500px",
                  mx: "auto",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#0C6E6D",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Search sx={{ fontSize: 20 }} />
                  Popular Pages
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    component={Link}
                    to="/services"
                    variant="text"
                    sx={{
                      color: "#0C6E6D",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(12, 110, 109, 0.1)",
                      },
                    }}
                  >
                    Our Services
                  </Button>
                  <Button
                    component={Link}
                    to="/products"
                    variant="text"
                    sx={{
                      color: "#0C6E6D",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(12, 110, 109, 0.1)",
                      },
                    }}
                  >
                    Products
                  </Button>
                  <Button
                    component={Link}
                    to="/about"
                    variant="text"
                    sx={{
                      color: "#0C6E6D",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(12, 110, 109, 0.1)",
                      },
                    }}
                  >
                    About Us
                  </Button>
                  <Button
                    component={Link}
                    to="/contact"
                    variant="text"
                    sx={{
                      color: "#0C6E6D",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(12, 110, 109, 0.1)",
                      },
                    }}
                  >
                    Contact
                  </Button>
                </Box>
              </Box>
            </motion.div>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "rgba(12, 110, 109, 0.1)",
                zIndex: -1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "20%",
                right: "10%",
                width: 150,
                height: 150,
                borderRadius: "50%",
                backgroundColor: "rgba(245, 140, 0, 0.1)",
                zIndex: -1,
              }}
            />
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
