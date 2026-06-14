import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

/**
 * AvailabilitySelector Component
 * Enhanced version that works with JSON format:
 * { "monday": { "enabled": true, "start": "09:00", "end": "17:00" }, ... }
 */
export default function AvailabilitySelector({
  control,
  errors,
  name = "availability",
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Parse availability - can be JSON object or string
          const parseAvailability = (value) => {
            if (!value) {
              // Return default structure with all days disabled
              return {
                monday: { enabled: false, start: null, end: null },
                tuesday: { enabled: false, start: null, end: null },
                wednesday: { enabled: false, start: null, end: null },
                thursday: { enabled: false, start: null, end: null },
                friday: { enabled: false, start: null, end: null },
                saturday: { enabled: false, start: null, end: null },
                sunday: { enabled: false, start: null, end: null },
              };
            }

            // If it's already an object (JSON format)
            if (typeof value === "object" && !Array.isArray(value)) {
              // Ensure all days are present
              const normalized = {};
              DAYS.forEach((day) => {
                if (value[day.value]) {
                  normalized[day.value] = {
                    enabled: value[day.value].enabled === true,
                    start: value[day.value].start || null,
                    end: value[day.value].end || null,
                  };
                } else {
                  normalized[day.value] = {
                    enabled: false,
                    start: null,
                    end: null,
                  };
                }
              });
              return normalized;
            }

            // If it's a string (legacy format), try to parse it
            if (typeof value === "string") {
              try {
                // Try parsing as JSON first
                const parsed = JSON.parse(value);
                if (typeof parsed === "object") {
                  return parseAvailability(parsed);
                }
              } catch {
                // Not JSON, try legacy format "monday:10am-4pm,tuesday:10am-4pm"
                if (value.includes(":")) {
                  const days = {};
                  DAYS.forEach((day) => {
                    days[day.value] = {
                      enabled: false,
                      start: null,
                      end: null,
                    };
                  });

                  value.split(",").forEach((item) => {
                    const [day, timeRange] = item.trim().split(":");
                    if (day && timeRange) {
                      // Try to parse time range like "10am-4pm" or "09:00-17:00"
                      const timeMatch = timeRange
                        .trim()
                        .match(
                          /(\d{1,2})(:?\d{2})?\s*(am|pm)?\s*-\s*(\d{1,2})(:?\d{2})?\s*(am|pm)?/i
                        );
                      if (timeMatch) {
                        // Legacy format - convert to 24-hour
                        // This is a simplified conversion, may need refinement
                        days[day.trim().toLowerCase()] = {
                          enabled: true,
                          start: "09:00", // Default, user will need to set properly
                          end: "17:00",
                        };
                      } else {
                        // Assume 24-hour format "09:00-17:00"
                        const [start, end] = timeRange.trim().split("-");
                        if (start && end) {
                          days[day.trim().toLowerCase()] = {
                            enabled: true,
                            start: start.trim(),
                            end: end.trim(),
                          };
                        }
                      }
                    }
                  });
                  return days;
                }
              }
            }

            // Default: return empty structure
            return parseAvailability(null);
          };

          const availabilityData = parseAvailability(field.value);

          const handleDayToggle = (day) => {
            const newData = {
              ...availabilityData,
              [day]: {
                enabled: !availabilityData[day]?.enabled,
                start: availabilityData[day]?.start || "09:00",
                end: availabilityData[day]?.end || "17:00",
              },
            };
            field.onChange(newData);
          };

          const handleStartTimeChange = (day, time) => {
            const newData = {
              ...availabilityData,
              [day]: {
                enabled: availabilityData[day]?.enabled !== false,
                start: time ? time.format("HH:mm") : null,
                end: availabilityData[day]?.end || "17:00",
              },
            };
            field.onChange(newData);
          };

          const handleEndTimeChange = (day, time) => {
            const newData = {
              ...availabilityData,
              [day]: {
                enabled: availabilityData[day]?.enabled !== false,
                start: availabilityData[day]?.start || "09:00",
                end: time ? time.format("HH:mm") : null,
              },
            };
            field.onChange(newData);
          };

          // Validate time ranges
          const validateTimeRange = (day) => {
            const dayData = availabilityData[day];
            if (!dayData || !dayData.enabled) return null;

            if (dayData.start && dayData.end) {
              const [startHour, startMin] = dayData.start
                .split(":")
                .map(Number);
              const [endHour, endMin] = dayData.end.split(":").map(Number);
              const startMinutes = startHour * 60 + startMin;
              const endMinutes = endHour * 60 + endMin;

              if (startMinutes >= endMinutes) {
                return "Start time must be before end time";
              }
            }

            return null;
          };

          return (
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, color: "text.secondary", fontSize: "0.875rem" }}
              >
                Select days and specify time ranges for each day (24-hour
                format)
              </Typography>
              <Grid container spacing={1.5}>
                {DAYS.map((day) => {
                  const dayData = availabilityData[day.value] || {
                    enabled: false,
                    start: null,
                    end: null,
                  };
                  const timeError = validateTimeRange(day.value);

                  return (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4 }}
                      lg={12 / 7}
                      key={day.value}
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: dayData.enabled
                            ? timeError
                              ? "error.main"
                              : "secondary.main"
                            : "divider",
                          borderRadius: 0,
                          bgcolor: dayData.enabled
                            ? timeError
                              ? "rgba(211, 47, 47, 0.05)"
                              : "rgba(132, 153, 79, 0.05)"
                            : "background.paper",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={dayData.enabled}
                              onChange={() => handleDayToggle(day.value)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.875rem",
                              }}
                            >
                              {day.label}
                            </Typography>
                          }
                          sx={{
                            mb: dayData.enabled ? 1.5 : 0,
                            marginRight: 0,
                            "& .MuiFormControlLabel-label": {
                              marginLeft: 0.5,
                            },
                          }}
                        />
                        {dayData.enabled && (
                          <Box sx={{ mt: 1.5 }}>
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 6 }}>
                                <TimePicker
                                  label="Start"
                                  value={
                                    dayData.start
                                      ? dayjs(dayData.start, "HH:mm")
                                      : null
                                  }
                                  onChange={(time) =>
                                    handleStartTimeChange(day.value, time)
                                  }
                                  slotProps={{
                                    textField: {
                                      size: "small",
                                      fullWidth: true,
                                      error: !!timeError,
                                      sx: {
                                        "& .MuiInputBase-root": {
                                          fontSize: "0.813rem",
                                        },
                                      },
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <TimePicker
                                  label="End"
                                  value={
                                    dayData.end
                                      ? dayjs(dayData.end, "HH:mm")
                                      : null
                                  }
                                  onChange={(time) =>
                                    handleEndTimeChange(day.value, time)
                                  }
                                  slotProps={{
                                    textField: {
                                      size: "small",
                                      fullWidth: true,
                                      error: !!timeError,
                                      sx: {
                                        "& .MuiInputBase-root": {
                                          fontSize: "0.813rem",
                                        },
                                      },
                                    },
                                  }}
                                />
                              </Grid>
                            </Grid>
                            {timeError && (
                              <FormHelperText
                                error
                                sx={{ mt: 0.5, fontSize: "0.75rem" }}
                              >
                                {timeError}
                              </FormHelperText>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
              {errors[name] && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {errors[name].message}
                </Typography>
              )}
            </Box>
          );
        }}
      />
    </LocalizationProvider>
  );
}
