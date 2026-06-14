import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const SERVICE_COLORS = [
  "#f58c00", // Orange
  "#84994f", // Olive Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
];

export default function ServiceDonutChart({ appointments = [] }) {

  // Extract unique service names from actual appointments
  const uniqueServices = [...new Set(
    appointments
      .map((apt) => apt.service)
      .filter((service) => service && service.trim() !== "")
  )];

  // Count appointments by service
  const serviceData = uniqueServices.map((service) => {
    const count = appointments.filter(
      (apt) => apt.service === service
    ).length;
    return {
      name: service,
      value: count,
    };
  });

  // Sort by count (descending) for better visualization
  const sortedData = serviceData.sort((a, b) => b.value - a.value);

  // Filter out services with 0 bookings for cleaner chart (shouldn't happen, but just in case)
  const filteredData = sortedData.filter((item) => item.value > 0);

  const totalBookings = appointments.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalBookings > 0 
        ? ((data.value / totalBookings) * 100).toFixed(1) 
        : 0;
      return (
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e9ecef",
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bookings: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#ffffff",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#1a1f2e",
          fontSize: "0.9375rem",
        }}
      >
        Service Distribution
      </Typography>

      {filteredData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 300,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">No bookings yet</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) =>
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  formatter={(value) => {
                    const item = filteredData.find((d) => d.name === value);
                    return item ? `${value} (${item.value})` : value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#4b5563", fontWeight: 500 }}>
              Total Bookings: <strong style={{ color: "#1a1f2e" }}>{totalBookings}</strong>
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}

