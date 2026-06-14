import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const CardItem = ({ title, description }) => (
  <Card sx={{ maxWidth: 345, borderRadius: "16px", boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export default CardItem;
