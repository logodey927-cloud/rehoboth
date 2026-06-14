import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import {
  getAvailableDates,
  unblockCalendarDate,
  createBlockedTimeSlot,
  getBlockedTimeSlots,
  deleteBlockedTimeSlot,
} from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";

function normalizeDateKey(date) {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString().split("T")[0];
  if (typeof date === "string") return date.split("T")[0];
  return null;
}

export default function Calendar({
  showInfoBox = true,
  compact = false,
  adminMode = false,
  customerMode = false,
  teamMemberAppointments = null,
  onDayClick,
  onMonthChange = null,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [bookedDates, setBookedDates] = useState({});
  const [blockedDates, setBlockedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockError, setBlockError] = useState(null);
  const [blockLoadingDate, setBlockLoadingDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(null);
  const [dialogDateKey, setDialogDateKey] = useState("");
  const [dialogIsBlocked, setDialogIsBlocked] = useState(false);
  const [dialogReason, setDialogReason] = useState("");
  const [dialogBookingsCount, setDialogBookingsCount] = useState(0);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogIsFullDay, setDialogIsFullDay] = useState(true);
  const [dialogStartTime, setDialogStartTime] = useState(null);
  const [dialogEndTime, setDialogEndTime] = useState(null);
  const [existingBlockedSlots, setExistingBlockedSlots] = useState([]);

  // Fetch booked dates when month changes, or use team member appointments if provided
  useEffect(() => {
    // If team member appointments are provided, transform them instead of fetching
    if (teamMemberAppointments && Array.isArray(teamMemberAppointments)) {
      setLoading(true);
      try {
        const bookedDatesData = {};
        
        teamMemberAppointments.forEach((apt) => {
          const dateKey = normalizeDateKey(apt.date);
          if (!dateKey) return;
          if (!bookedDatesData[dateKey]) {
            bookedDatesData[dateKey] = [];
          }
          bookedDatesData[dateKey].push(apt);
        });

        setBookedDates(bookedDatesData);
        setBlockedDates({}); // Team members don't see blocked dates
        setError(null);
      } catch (err) {
        setError("Failed to load calendar data. Please try again.");
        setBookedDates({});
        setBlockedDates({});
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise, fetch all appointments (admin mode)
    const fetchBookedDates = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = currentDate.year();
        const month = currentDate.month() + 1; // dayjs months are 0-indexed
        const response = await getAvailableDates(year, month);
        
        if (response.data?.success) {
          const bookedDatesData = response.data.bookedDates || {};
          const blockedDatesData = response.data.blockedDates || {};
          setBookedDates(bookedDatesData);
          setBlockedDates(blockedDatesData);
          onMonthChange?.(year, month, bookedDatesData, blockedDatesData);
        } else {
          setError("Failed to load calendar data");
        }
      } catch (err) {
        setError("Failed to load calendar data. Please try again.");
        // Set empty booked dates on error so calendar still renders
        setBookedDates({});
        setBlockedDates({});
      } finally {
        setLoading(false);
      }
    };

    fetchBookedDates();
  }, [currentDate, teamMemberAppointments]);

  // Get the first day of the month and number of days
  const startOfMonth = currentDate.startOf("month");
  const daysInMonth = currentDate.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 = Sunday, 6 = Saturday

  // Generate array of days for the month
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Check if a date is available (not booked and not blocked)
  const isDateAvailable = (day) => {
    if (!day) return false;
    const date = currentDate.date(day);
    const today = dayjs();

    // Past dates are not available
    if (date.isBefore(today, "day")) return false;

    const dateKey = date.format("YYYY-MM-DD");

    // If admin has blocked this date, it's not available
    if (blockedDates[dateKey]) {
      return false;
    }

    // Check if date is in bookedDates
    const bookings = bookedDates[dateKey];
    
    // If there are any bookings, the date is not fully available
    // Return true only if there are NO bookings
    if (bookings && bookings.length > 0) {
      return false; // Has bookings, so not fully available
    }

    return true; // No bookings and not blocked, fully available
  };

  // Check if a date is fully booked
  const isDateFullyBooked = (day) => {
    if (!day) return false;
    const date = currentDate.date(day);
    const dateKey = date.format("YYYY-MM-DD");
    const bookings = bookedDates[dateKey];
    
    // Consider fully booked if there are 5+ bookings
    return bookings && bookings.length >= 5;
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => prev.add(1, "month"));
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const openBlockDialog = async (day, isBlocked, bookingCount) => {
    if (!adminMode || !day) return;

    const date = currentDate.date(day);
    const today = dayjs();

    // Do not allow blocking past dates
    if (date.isBefore(today, "day")) return;

    const dateKey = date.format("YYYY-MM-DD");

    setBlockError(null);
    setDialogOpen(true);
    setDialogDate(date);
    setDialogDateKey(dateKey);
    setDialogIsBlocked(isBlocked);
    setDialogBookingsCount(bookingCount || 0);
    setDialogIsFullDay(true);
    setDialogStartTime(null);
    setDialogEndTime(null);
    setDialogReason("");

    // If unblocking, fetch existing blocked slots for this date
    if (isBlocked) {
      try {
        const response = await getBlockedTimeSlots({
          date_from: dateKey,
          date_to: dateKey,
        });
        if (response.data?.success) {
          const slots = response.data.blockedTimeSlots || [];
          setExistingBlockedSlots(slots);
          // If there's a full-day block, show its reason
          const fullDayBlock = slots.find((slot) => slot.is_full_day);
          if (fullDayBlock) {
            setDialogReason(fullDayBlock.reason || "");
          }
        }
      } catch (err) {
        // Error handled silently
      }
    } else {
      setExistingBlockedSlots([]);
    }
  };

  const handleBlockDialogClose = () => {
    if (dialogSubmitting) return;
    setDialogOpen(false);
    setDialogReason("");
    setDialogBookingsCount(0);
    setDialogDate(null);
    setDialogDateKey("");
    setDialogIsBlocked(false);
    setDialogIsFullDay(true);
    setDialogStartTime(null);
    setDialogEndTime(null);
    setExistingBlockedSlots([]);
  };

  const handleBlockDialogSubmit = async () => {
    if (!dialogDate || !dialogDateKey) {
      handleBlockDialogClose();
      return;
    }

    const dateKey = dialogDateKey;
    const isCurrentlyBlocked = dialogIsBlocked;

    // Validation
    if (!isCurrentlyBlocked) {
      if (!dialogReason || dialogReason.trim().length === 0) {
        setBlockError("Please provide a reason for blocking");
        return;
      }

      if (!dialogIsFullDay) {
        if (!dialogStartTime || !dialogEndTime) {
          setBlockError("Please select both start and end times");
          return;
        }

        // dialogStartTime and dialogEndTime are already dayjs objects from TimePicker
        // TimePicker always returns dayjs objects, so we can use them directly
        if (!dialogStartTime || !dialogEndTime) {
          setBlockError("Please select both start and end times");
          return;
        }
        
        // Ensure they are dayjs objects (TimePicker returns dayjs, but double-check)
        const start = dayjs(dialogStartTime);
        const end = dayjs(dialogEndTime);
        
        if (!start.isValid() || !end.isValid()) {
          setBlockError("Please select valid start and end times");
          return;
        }
        
        // Compare times - isSameOrAfter requires a plugin, so use isAfter or isSame
        // Check if start is after or equal to end (using minute precision)
        if (start.isAfter(end, "minute") || start.isSame(end, "minute")) {
          setBlockError("Start time must be before end time");
          return;
        }
      }
    }

    setDialogSubmitting(true);
    setBlockError(null);
    setBlockLoadingDate(dateKey);

    try {
      if (!isCurrentlyBlocked) {
        // Create new blocked time slot
        const data = {
          date: dateKey,
          reason: dialogReason.trim(),
          is_full_day: dialogIsFullDay,
        };

        if (!dialogIsFullDay) {
          // dialogStartTime and dialogEndTime are already dayjs objects from TimePicker
          // Format them - ensure they're dayjs objects first
          const start = dayjs(dialogStartTime);
          const end = dayjs(dialogEndTime);
          
          if (!start.isValid() || !end.isValid()) {
            throw new Error("Invalid time format");
          }
          
          data.start_time = start.format("HH:mm");
          data.end_time = end.format("HH:mm");
        }

        const res = await createBlockedTimeSlot(data);
        if (!res.data?.success && res.data?.error) {
          throw new Error(res.data.error);
        }

        // Update blocked dates state
        setBlockedDates((prev) => ({
          ...prev,
          [dateKey]: { reason: dialogReason || null },
        }));

        // Close dialog first so alert is visible
        handleBlockDialogClose();
        
        await ensureSweetAlertReady();
        await swalSuccess(
          dialogIsFullDay ? "Day Blocked" : "Time Range Blocked",
          dialogIsFullDay
            ? `The date has been blocked. New bookings will not be accepted on this day.`
            : `The time range has been blocked. New bookings will not be accepted during this time.`
        );
      } else {
        // Delete existing blocked slots for this date
        if (existingBlockedSlots.length > 0) {
          // Delete all blocked slots for this date
          for (const slot of existingBlockedSlots) {
            try {
              await deleteBlockedTimeSlot(slot.id);
            } catch (err) {
              // Error handled silently
            }
          }
        } else {
          // Fallback to legacy API if no slots found
          const res = await unblockCalendarDate(dateKey);
          if (!res.data?.success && res.data?.error) {
            throw new Error(res.data.error);
          }
        }

        setBlockedDates((prev) => {
          const updated = { ...prev };
          delete updated[dateKey];
          return updated;
        });

        // Close dialog first so alert is visible
        handleBlockDialogClose();

        await ensureSweetAlertReady();
        await swalSuccess(
          "Day Unblocked",
          `The date has been unblocked. New bookings can now be made on this day.`
        );
      }
      
      // Refresh calendar data
      const year = currentDate.year();
      const month = currentDate.month() + 1;
      const response = await getAvailableDates(year, month);
      if (response.data?.success) {
        const blockedDatesData = response.data.blockedDates || {};
        setBlockedDates(blockedDatesData);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error ||
        err.message ||
        "Failed to update blocked date. Please try again.";
      
      setBlockError(errorMessage);
      
      // Close dialog first so alert is visible
      handleBlockDialogClose();
      
      // Show error alert
      await ensureSweetAlertReady();
      await swalError("Operation Failed", errorMessage);
    } finally {
      setDialogSubmitting(false);
      setBlockLoadingDate(null);
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Box
      sx={{
        px: compact ? 0 : { xs: 2, sm: 4, md: 6 },
        py: compact ? 1 : { xs: 4, sm: 6, md: 8 },
        maxWidth: compact ? "100%" : 1400,
        mx: compact ? 0 : "auto",
      }}
    >
      {/* Calendar Header */}
      <Paper
        elevation={2}
        sx={{
          p: compact ? 1.5 : { xs: 2, sm: 3 },
          mb: compact ? 1.5 : 3,
          borderRadius: 0,
          backgroundColor: "#f8f9fa",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: compact ? 1 : 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: compact ? 1 : 2 }}>
            {!compact && (
              <CalendarToday
                sx={{ fontSize: { xs: 28, sm: 32 }, color: "primary.main" }}
              />
            )}
            <Typography
              variant={compact ? "h6" : "h4"}
              sx={{
                fontSize: compact ? "1rem" : { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                fontWeight: 400,
                color: "text.primary",
              }}
            >
              {currentDate.format("MMMM YYYY")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: compact ? 0.5 : 1 }}>
            <IconButton
              onClick={handlePreviousMonth}
              size={compact ? "small" : "medium"}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
            >
              <ChevronLeft fontSize={compact ? "small" : "medium"} />
            </IconButton>
            {!compact && (
              <IconButton
                onClick={handleToday}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                  px: 2,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                    borderColor: "primary.main",
                  },
                }}
              >
                Today
              </IconButton>
            )}
            <IconButton
              onClick={handleNextMonth}
              size={compact ? "small" : "medium"}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
            >
              <ChevronRight fontSize={compact ? "small" : "medium"} />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {/* Legend */}
      {!compact && (
      <Box
        sx={{
          display: "flex",
          gap: customerMode ? { xs: 0.5, sm: 2 } : 2,
          mb: 3,
          flexWrap: customerMode ? "nowrap" : "wrap",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {customerMode ? (
          <>
            <Chip
              icon={isMobile ? undefined : <CalendarToday sx={{ fontSize: 16 }} />}
              label="My Appointment"
              variant="outlined"
              sx={{
                borderRadius: 0,
                borderColor: "secondary.main",
                color: "secondary.dark",
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                maxWidth: { xs: "33.33%", sm: "none" },
                "& .MuiChip-label": {
                  fontSize: { xs: "0.62rem", sm: "0.8125rem" },
                  px: { xs: 0.25, sm: 1 },
                  whiteSpace: "nowrap",
                },
              }}
            />
            <Chip
              label="Today"
              color="primary"
              variant="outlined"
              sx={{
                borderRadius: 0,
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                maxWidth: { xs: "33.33%", sm: "none" },
                "& .MuiChip-label": {
                  fontSize: { xs: "0.62rem", sm: "0.8125rem" },
                  px: { xs: 0.25, sm: 1 },
                  whiteSpace: "nowrap",
                },
              }}
            />
            <Chip
              label="Past Date"
              color="default"
              variant="outlined"
              sx={{
                borderRadius: 0,
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                maxWidth: { xs: "33.33%", sm: "none" },
                "& .MuiChip-label": {
                  fontSize: { xs: "0.62rem", sm: "0.8125rem" },
                  px: { xs: 0.25, sm: 1 },
                  whiteSpace: "nowrap",
                },
              }}
            />
          </>
        ) : (
          <>
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label="Available"
              color="success"
              variant="outlined"
              sx={{ borderRadius: 0 }}
            />
            <Chip
              icon={<Cancel sx={{ fontSize: 16 }} />}
              label="Fully Booked"
              color="error"
              variant="outlined"
              sx={{ borderRadius: 0 }}
            />
            <Chip
              label="Limited Availability"
              color="warning"
              variant="outlined"
              sx={{ borderRadius: 0 }}
            />
            <Chip
              label="Past Date"
              color="default"
              variant="outlined"
              sx={{ borderRadius: 0 }}
            />
            {adminMode && (
              <Chip
                label="Blocked (Admin)"
                color="default"
                variant="outlined"
                sx={{
                  borderRadius: 0,
                  borderStyle: "dashed",
                }}
              />
            )}
          </>
        )}
      </Box>
      )}

      {/* Calendar Grid */}
      <Paper
        elevation={2}
        sx={{
          p: compact ? 0.5 : { xs: 1, sm: 2 },
          borderRadius: 0,
          overflow: "hidden",
          ...(compact && {
            "& table": {
              fontSize: "0.75rem",
            },
          }),
        }}
      >
        {/* Week Day Headers */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
          }}
        >
          {weekDays.map((day) => (
            <Box
              key={day}
              sx={{
                flex: 1,
                borderRight: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderRight: "none" },
              }}
            >
                <Typography
                  variant="subtitle2"
                  sx={{
                    textAlign: "center",
                    py: compact ? 1 : 1.5,
                    fontWeight: 600,
                    fontSize: compact ? "0.7rem" : { xs: "0.75rem", sm: "0.875rem" },
                    color: "text.secondary",
                    backgroundColor: "grey.100",
                  }}
                >
                  {day}
                </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Days */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {days.map((day, index) => {
            const isAvailable = isDateAvailable(day);
            const isFullyBooked = isDateFullyBooked(day);
            const isToday =
              day && currentDate.date(day).isSame(dayjs(), "day");
            const isPast =
              day && currentDate.date(day).isBefore(dayjs(), "day");
            
            // Get booking count for this date
            const dateKey = day ? currentDate.date(day).format("YYYY-MM-DD") : null;
            const bookings = dateKey ? bookedDates[dateKey] : null;
            const bookingCount = bookings ? bookings.length : 0;
            const isBlocked = dateKey ? !!blockedDates[dateKey] : false;
            const isLoading = dateKey === blockLoadingDate;
            const hasMyAppointment = customerMode && bookingCount > 0;

            const dayBg = customerMode
              ? isPast
                ? "grey.50"
                : hasMyAppointment
                  ? "#e8f0dc"
                  : isToday
                    ? "#fff8e6"
                    : "#fff"
              : isToday
                ? "primary.light"
                : isPast
                  ? "grey.50"
                  : isBlocked
                    ? "grey.400"
                    : isFullyBooked
                      ? "error.light"
                      : !isAvailable
                        ? "warning.light"
                        : "success.light";

            const handleDayClick = () => {
              if (!day || !dateKey) return;
              if (adminMode && !isPast) {
                openBlockDialog(day, isBlocked, bookingCount);
                return;
              }
              if (customerMode && onDayClick) {
                onDayClick(dateKey, bookings || []);
              }
            };

            const isClickable =
              (adminMode && day && !isPast) || (customerMode && day && onDayClick);

            return (
              <Box
                key={index}
                onClick={isClickable ? handleDayClick : undefined}
                sx={{
                  flex: "0 0 calc(100% / 7)",
                  maxWidth: "calc(100% / 7)",
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                    minHeight: compact ? "45px" : { xs: "60px", sm: "80px", md: "100px" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  backgroundColor: dayBg,
                  opacity: isPast ? 0.65 : isLoading ? 0.6 : 1,
                  cursor: isClickable ? "pointer" : isPast ? "not-allowed" : "default",
                  outline: customerMode && hasMyAppointment ? "2px solid" : "none",
                  outlineColor: "secondary.main",
                  outlineOffset: -2,
                  "&:hover": isClickable ? {
                    backgroundColor: customerMode
                      ? hasMyAppointment
                        ? "#d4e4bc"
                        : "grey.100"
                      : isBlocked
                        ? "grey.500"
                        : isFullyBooked
                          ? "error.main"
                          : isAvailable
                            ? "success.main"
                            : "warning.main",
                    transform: customerMode ? "none" : "scale(1.05)",
                    transition: "background-color 0.2s",
                  } : {},
                }}
              >
                {day && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none", // Prevent double-click events
                    }}
                  >
                      <Typography
                        variant={compact ? "body2" : "h6"}
                        sx={{
                          fontSize: compact ? "0.875rem" : { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                          fontWeight: isToday ? 700 : 400,
                          color: isPast
                            ? "text.disabled"
                            : isToday
                            ? "primary.contrastText"
                            : "text.primary",
                        }}
                      >
                        {day}
                      </Typography>
                    {(!isMobile || adminMode || customerMode) && (
                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        {customerMode && hasMyAppointment && !isPast && (
                          <CalendarToday sx={{ fontSize: 12, color: "secondary.dark" }} />
                        )}
                        {!customerMode && isFullyBooked && !isPast && (
                          <Cancel sx={{ fontSize: 12, color: "error.dark" }} />
                        )}
                        {!customerMode && isAvailable && !isFullyBooked && !isPast && (
                          <CheckCircle sx={{ fontSize: 12, color: "success.dark" }} />
                        )}
                        {!customerMode && isBlocked && !isPast && (
                          <Cancel sx={{ fontSize: 12, color: "grey.700" }} />
                        )}
                        {!customerMode && !isAvailable && !isFullyBooked && !isPast && !isBlocked && bookingCount > 0 && (
                          <Typography variant="caption" sx={{ fontSize: 10, color: "warning.dark" }}>
                            {bookingCount}/5
                          </Typography>
                        )}
                        {adminMode && bookingCount > 0 && !isPast && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: isFullyBooked ? "error.dark" : "text.secondary",
                              lineHeight: 1,
                            }}
                          >
                            {bookingCount} apt{bookingCount !== 1 ? "s" : ""}
                          </Typography>
                        )}
                        {isLoading && (
                          <CircularProgress size={12} sx={{ mt: 0.5 }} />
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Admin Block/Unblock Dialog */}
      {adminMode && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Dialog
            open={dialogOpen}
            onClose={handleBlockDialogClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 0 } }}
          >
            <DialogTitle>
              {dialogIsBlocked ? "Unblock Day" : "Block Day/Time"}
            </DialogTitle>
            <DialogContent dividers>
              {dialogDate && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Date:</strong>{" "}
                  {dialogDate.format("dddd, DD MMMM YYYY")}
                </Typography>
              )}

              {dialogBookingsCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
                  There are <strong>{dialogBookingsCount}</strong> booking
                  {dialogBookingsCount > 1 ? "s" : ""} on this day. Blocking the
                  day will <strong>stop new bookings</strong>, but you still need
                  to cancel or reschedule existing appointments from the{" "}
                  <strong>Appointments</strong> page (customers will receive a
                  cancellation email when you cancel).
                </Alert>
              )}

              {blockError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
                  {blockError}
                </Alert>
              )}

              {!dialogIsBlocked && (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dialogIsFullDay}
                        onChange={(e) => {
                          setDialogIsFullDay(e.target.checked);
                          if (e.target.checked) {
                            setDialogStartTime(null);
                            setDialogEndTime(null);
                          }
                        }}
                        color="primary"
                      />
                    }
                    label="Block entire day"
                    sx={{ mb: 2 }}
                  />

                  {!dialogIsFullDay && (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="Start Time"
                          value={dialogStartTime}
                          onChange={(newValue) => setDialogStartTime(newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              sx: { borderRadius: 0 },
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="End Time"
                          value={dialogEndTime}
                          onChange={(newValue) => setDialogEndTime(newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              sx: { borderRadius: 0 },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  <TextField
                    label="Reason *"
                    value={dialogReason}
                    onChange={(e) => setDialogReason(e.target.value)}
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    placeholder="e.g., Team meeting, Staff training, Holiday"
                    helperText="Provide a reason for blocking this time slot"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                </>
              )}

              {dialogIsBlocked && existingBlockedSlots.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Existing Blocks:
                  </Typography>
                  {existingBlockedSlots.map((slot) => (
                    <Alert
                      key={slot.id}
                      severity="info"
                      sx={{ mb: 1, borderRadius: 0 }}
                    >
                      {slot.is_full_day ? (
                        <Typography variant="body2">
                          <strong>Full Day:</strong> {slot.reason}
                        </Typography>
                      ) : (
                        <Typography variant="body2">
                          <strong>Time Range:</strong> {slot.start_time} - {slot.end_time} ({slot.reason})
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Box>
              )}

              {dialogIsBlocked && existingBlockedSlots.length === 0 && dialogReason && (
                <Alert severity="info" sx={{ mt: 1, borderRadius: 0 }}>
                  <strong>Current note:</strong> {dialogReason}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={handleBlockDialogClose}
                disabled={dialogSubmitting}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Close
              </Button>
              <Button
                onClick={handleBlockDialogSubmit}
                variant="contained"
                disabled={dialogSubmitting}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                {dialogSubmitting
                  ? dialogIsBlocked
                    ? "Unblocking..."
                    : "Blocking..."
                  : dialogIsBlocked
                  ? "Unblock Day"
                  : dialogIsFullDay
                  ? "Block Day"
                  : "Block Time Range"}
              </Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>
      )}

      {/* Block error for admin */}
      {adminMode && blockError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 0 }}>
          {blockError}
        </Alert>
      )}

      {/* Info Box - Optional */}
      {showInfoBox && !customerMode && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "info.light",
            borderRadius: 0,
            border: "1px solid",
            borderColor: "info.main",
            textAlign: "center",
          }}
        >
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            <strong>Note:</strong> Green dates are fully available for booking. 
            Yellow dates have limited availability. Red dates are fully booked. 
            Past dates cannot be selected. Click on an available date to proceed with booking.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

