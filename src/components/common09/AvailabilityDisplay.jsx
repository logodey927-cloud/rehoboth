import React from "react";
import { Box, Typography, Stack, Chip, Divider } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

/**
 * AvailabilityDisplay Component
 * Parses and displays team member availability in a structured format
 * Supports:
 * - New JSONB format: { "monday": { "enabled": true, "start": "09:00", "end": "17:00" }, ... }
 * - Legacy string format: "monday:10am-4pm,tuesday:9am-5pm"
 */
export default function AvailabilityDisplay({ availability, variant = "default" }) {
  // Helper to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24) => {
    if (!time24) return null;
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // Check if availability is empty
  if (!availability) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
        Not specified
      </Typography>
    );
  }

  // Check if it's a string (legacy format) or object (new JSONB format)
  const isString = typeof availability === "string";
  const isEmptyString = isString && availability.trim() === "";
  const isEmptyObject = !isString && (typeof availability !== "object" || Object.keys(availability).length === 0);

  if (isEmptyString || isEmptyObject) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
        Not specified
      </Typography>
    );
  }

  // Parse availability - handle both JSONB object and legacy string format
  const parseAvailability = (avail) => {
    const days = [];
    const dayMap = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };

    // New JSONB format: { "monday": { "enabled": true, "start": "09:00", "end": "17:00" }, ... }
    if (typeof avail === "object" && !Array.isArray(avail)) {
      Object.keys(avail).forEach((dayKey) => {
        const dayData = avail[dayKey];
        if (dayData && dayData.enabled === true && dayData.start && dayData.end) {
          const dayLabel = dayMap[dayKey.toLowerCase()] || dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
          const startTime = formatTime12Hour(dayData.start);
          const endTime = formatTime12Hour(dayData.end);
          if (startTime && endTime) {
            days.push({
              day: dayLabel,
              time: `${startTime} - ${endTime}`,
              dayKey: dayKey.toLowerCase(),
            });
          }
        }
      });
    }
    // Legacy string format: "monday:10am-4pm,tuesday:9am-5pm"
    else if (typeof avail === "string") {
      // Check if it's structured format (contains colons)
      if (avail.includes(":")) {
        avail.split(",").forEach((item) => {
          const [day, time] = item.trim().split(":");
          if (day && time) {
            const dayName = day.trim().toLowerCase();
            const dayLabel = dayMap[dayName] || day.trim().charAt(0).toUpperCase() + day.trim().slice(1);
            days.push({
              day: dayLabel,
              time: time.trim(),
              dayKey: dayName,
            });
          }
        });
      }
    }

    return days.length > 0 ? days : null;
  };

  const parsedDays = parseAvailability(availability);

  // If parsing failed or it's legacy format, display as plain text
  if (!parsedDays) {
    return (
      <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: "pre-line" }}>
        {availability}
      </Typography>
    );
  }

  // Group consecutive days with same time
  const groupDays = (days) => {
    if (days.length === 0) return [];
    
    const groups = [];
    let currentGroup = {
      days: [days[0].day],
      time: days[0].time,
      startIndex: 0,
    };

    for (let i = 1; i < days.length; i++) {
      if (days[i].time === currentGroup.time) {
        currentGroup.days.push(days[i].day);
      } else {
        groups.push(currentGroup);
        currentGroup = {
          days: [days[i].day],
          time: days[i].time,
          startIndex: i,
        };
      }
    }
    groups.push(currentGroup);

    return groups;
  };

  const dayGroups = groupDays(parsedDays);

  // Format day range (e.g., "Monday - Friday" or "Monday, Tuesday, Wednesday")
  const formatDayRange = (dayArray) => {
    if (dayArray.length === 1) return dayArray[0];
    
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    // Create a copy to avoid mutating the original array
    const sortedDays = [...dayArray].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    // Check if consecutive
    let isConsecutive = true;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevIndex = dayOrder.indexOf(sortedDays[i - 1]);
      const currIndex = dayOrder.indexOf(sortedDays[i]);
      if (currIndex !== prevIndex + 1) {
        isConsecutive = false;
        break;
      }
    }

    if (isConsecutive && sortedDays.length > 2) {
      return `${sortedDays[0]} - ${sortedDays[sortedDays.length - 1]}`;
    } else if (isConsecutive && sortedDays.length === 2) {
      return `${sortedDays[0]} & ${sortedDays[1]}`;
    } else {
      // Not consecutive, join with commas
      if (sortedDays.length === 2) {
        return sortedDays.join(" & ");
      }
      const lastDay = sortedDays.pop();
      return `${sortedDays.join(", ")}, & ${lastDay}`;
    }
  };

  if (variant === "compact") {
    // Compact horizontal display
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        {dayGroups.map((group, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              {formatDayRange(group.days)}
            </Typography>
            <Chip
              label={group.time}
              size="small"
              icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 22,
                fontSize: "0.75rem",
                borderRadius: 0,
                bgcolor: "secondary.light",
                color: "secondary.contrastText",
                "& .MuiChip-icon": {
                  color: "secondary.contrastText",
                },
              }}
            />
            {index < dayGroups.length - 1 && (
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16 }} />
            )}
          </Box>
        ))}
      </Stack>
    );
  }

  // Default vertical display
  return (
    <Box>
      <Stack spacing={1.5}>
        {dayGroups.map((group, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              bgcolor: "rgba(132, 153, 79, 0.05)",
              borderLeft: "3px solid",
              borderColor: "secondary.main",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 0.5,
                }}
              >
                {formatDayRange(group.days)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minWidth: "fit-content",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 18, color: "secondary.main" }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "secondary.dark",
                }}
              >
                {group.time}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

