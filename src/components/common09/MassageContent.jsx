import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import StyledButton from "../common09/StyledButton";

const fade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -6 },
};

const MassageContent = ({ item }) => {
  return (
    <motion.div
      key={item.id}
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Box
        sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        {(item.image_url || item.image) && (
          <Box
            component="img"
            src={item.image_url || item.image}
            alt={item.title}
            sx={{
              width: { xs: "100%", md: "45%" },
              height: { xs: "300px", md: "auto" },
              objectFit: "cover",
              borderRadius: "0px",
            }}
          />
        )}

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              mb: 1,
              fontSize: { xs: "1.3rem", sm: "1.8rem", md: "2.2rem" },
              fontFamily: `"Raleway", sans-serif`,
            }}
          >
            {item.title}
          </Typography>
          <Typography
            sx={{
              color: "#757575",
              mb: 2,
              lineHeight: 1.7,
              fontSize: { xs: "0.95rem", sm: "1rem" },
              textAlign: "justify",
            }}
          >
            {item.description || item.desc}
          </Typography>
          {item.benefits && (
            <Box
              component="ul"
              sx={{
                display: "flex",
                flexDirection: "column",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                gap: "6px",
                color: "#757575",
                lineHeight: 1.7,
                mb: 3,
                pl: 3, // keep bullet indentation clean
                "& li": {
                  listStyle: "disc",
                },
              }}
            >
              {item.benefits.map((b, i) => {
                // Handle both object and string benefits
                if (typeof b === "object" && b !== null) {
                  // If it's an object with heading and description, show both
                  if (b.heading && b.description) {
                    return (
                      <li key={b.id || i}>
                        <strong>{b.heading}:</strong> {b.description}
                      </li>
                    );
                  }
                  // If it only has heading, show that
                  if (b.heading) {
                    return <li key={b.id || i}>{b.heading}</li>;
                  }
                  // If it only has description, show that
                  if (b.description) {
                    return <li key={b.id || i}>{b.description}</li>;
                  }
                  // Fallback: don't render if no valid content
                  return null;
                }
                // Handle string benefits (legacy format)
                return <li key={i}>{b}</li>;
              })}
            </Box>
          )}
          <StyledButton
            text="Book Now"
            to="/book-appointment"
            variant="custom"
          />
        </Box>
      </Box>
    </motion.div>
  );
};

export default MassageContent;
