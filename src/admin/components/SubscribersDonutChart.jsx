import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const SUBSCRIBER_COLORS = [
  "#84994f", // Active - Olive Green
  "#6c757d", // Inactive - Gray
];

export default function SubscribersDonutChart({ subscribers = [] }) {
  // Count active vs inactive subscribers
  const subscriberData = [
    {
      name: "Active",
      value: subscribers.filter((sub) => !sub.status || sub.status === "active").length,
    },
    {
      name: "Inactive",
      value: subscribers.filter((sub) => sub.status === "inactive").length,
    },
  ].filter((item) => item.value > 0);

  const totalSubscribers = subscribers.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalSubscribers > 0 
        ? ((data.value / totalSubscribers) * 100).toFixed(1) 
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
            Count: {data.value}
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
        Subscribers Status
      </Typography>

      {subscriberData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 250,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">No subscribers yet</Typography>
        </Box>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subscriberData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriberData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SUBSCRIBER_COLORS[index % SUBSCRIBER_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#4b5563", fontWeight: 500 }}>
              Total Subscribers: <strong style={{ color: "#1a1f2e" }}>{totalSubscribers}</strong>
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}

