import React, { useMemo } from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";

export default function MonthlyBookingsChart({ appointments = [], title = "Monthly Bookings" }) {
  // Get last 12 months of data
  const monthlyData = useMemo(() => {
    const months = [];
    const now = dayjs();
    
    for (let i = 11; i >= 0; i--) {
      const month = now.subtract(i, "month");
      const monthStart = month.startOf("month").format("YYYY-MM-DD");
      const monthEnd = month.endOf("month").format("YYYY-MM-DD");
      
      const monthAppointments = appointments.filter((apt) => {
        return apt.date >= monthStart && apt.date <= monthEnd;
      });
      
      months.push({
        month: month.format("MMM YYYY"),
        monthShort: month.format("MMM"),
        bookings: monthAppointments.length,
      });
    }
    
    return months;
  }, [appointments]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
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
            {payload[0].payload.month}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bookings: {payload[0].value}
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
        {title}
      </Typography>

      {monthlyData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 300,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">No booking data available</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis
                dataKey="monthShort"
                stroke="#4b5563"
                style={{ fontSize: "12px", fontWeight: 500 }}
              />
              <YAxis stroke="#4b5563" style={{ fontSize: "12px", fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="bookings"
                fill="#84994f"
                radius={[4, 4, 0, 0]}
                name="Bookings"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}

