import React from "react";
import { Box, Typography } from "@mui/material";

const Section = ({ title, children }) => (
  <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
    <Typography variant="h4" gutterBottom color="primary">
      {title}
    </Typography>
    <Box mt={3}>{children}</Box>
  </Box>
);

export default Section;
