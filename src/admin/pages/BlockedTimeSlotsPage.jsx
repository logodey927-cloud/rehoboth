import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import HeroPageSection from "../../components/sections/HeroPageSection";
import {
  createBlockedTimeSlot,
  getBlockedTimeSlots,
  deleteBlockedTimeSlot,
} from "../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";

export default function BlockedTimeSlotsPage() {
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [reason, setReason] = useState("");
  
  // Date range filter for list
  const [dateFrom, setDateFrom] = useState(dayjs().startOf("month"));
  const [dateTo, setDateTo] = useState(dayjs().endOf("month"));
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  useEffect(() => {
    fetchBlockedSlots();
  }, [dateFrom, dateTo]);

  const fetchBlockedSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        date_from: dateFrom.format("YYYY-MM-DD"),
        date_to: dateTo.format("YYYY-MM-DD"),
      };
      const response = await getBlockedTimeSlots(params);
      if (response.data?.success) {
        setBlockedSlots(response.data.blockedTimeSlots || []);
      } else {
        setError("Failed to load blocked time slots");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load blocked time slots");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      await swalError("Error", "Please select a date");
      return;
    }

    if (!reason || reason.trim().length === 0) {
      await swalError("Error", "Please provide a reason for blocking");
      return;
    }

    if (!isFullDay && (!startTime || !endTime)) {
      await swalError("Error", "Please select both start and end times");
      return;
    }

    if (!isFullDay) {
      const start = dayjs(startTime);
      const end = dayjs(endTime);
      if (start.isSameOrAfter(end)) {
        await swalError("Error", "Start time must be before end time");
        return;
      }
    }

    try {
      setSubmitting(true);
      await ensureSweetAlertReady();
      
      const data = {
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        reason: reason.trim(),
        is_full_day: isFullDay,
      };

      if (!isFullDay) {
        data.start_time = dayjs(startTime).format("HH:mm");
        data.end_time = dayjs(endTime).format("HH:mm");
      }

      const response = await createBlockedTimeSlot(data);
      
      if (response.data?.success) {
        await swalSuccess(
          "Time Slot Blocked",
          response.data.message || "Time slot has been blocked successfully"
        );
        
        // Show warning if there are conflicts
        if (response.data.conflicts && response.data.conflicts.count > 0) {
          await swalError(
            "Warning: Existing Appointments",
            `There are ${response.data.conflicts.count} existing appointment(s) that overlap with this blocked time slot. Please review them.`
          );
        }
        
        // Reset form
        setSelectedDate(null);
        setIsFullDay(true);
        setStartTime(null);
        setEndTime(null);
        setReason("");
        
        // Refresh list
        fetchBlockedSlots();
      } else {
        await swalError("Error", response.data?.error || "Failed to block time slot");
      }
    } catch (err) {
      await swalError(
        "Error",
        err.response?.data?.error || "Failed to block time slot. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (slot) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!slotToDelete) return;

    try {
      await ensureSweetAlertReady();
      const response = await deleteBlockedTimeSlot(slotToDelete.id);
      
      if (response.data?.success) {
        await swalSuccess("Time Slot Unblocked", response.data.message);
        setDeleteDialogOpen(false);
        setSlotToDelete(null);
        fetchBlockedSlots();
      } else {
        await swalError("Error", response.data?.error || "Failed to delete blocked time slot");
      }
    } catch (err) {
      await swalError(
        "Error",
        err.response?.data?.error || "Failed to delete blocked time slot. Please try again."
      );
    }
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return null;
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("ddd, MMM D, YYYY");
  };

  return (
    <Box>
      <HeroPageSection
        title="Blocked Time Slots"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Blocked Time Slots" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        <Grid container spacing={3}>
          {/* Create Blocked Slot Form */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "#ffffff",
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#1a1f2e" }}>
                Block Time Slot
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select Date"
                        value={selectedDate ? dayjs(selectedDate) : null}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        minDate={dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            sx: { borderRadius: 0 },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isFullDay}
                          onChange={(e) => setIsFullDay(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Block entire day"
                    />
                  </Grid>

                  {!isFullDay && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            label="Start Time"
                            value={startTime ? (typeof startTime === "string" ? dayjs(startTime, "HH:mm") : startTime) : null}
                            onChange={(newValue) => setStartTime(newValue)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                sx: { borderRadius: 0 },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            label="End Time"
                            value={endTime ? (typeof endTime === "string" ? dayjs(endTime, "HH:mm") : endTime) : null}
                            onChange={(newValue) => setEndTime(newValue)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                sx: { borderRadius: 0 },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      fullWidth
                      required
                      multiline
                      rows={3}
                      placeholder="e.g., Team meeting, Staff training, Holiday"
                      helperText="Provide a reason for blocking this time slot"
                      sx={{ borderRadius: 0 }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={submitting}
                      startIcon={<BlockIcon />}
                      sx={{ borderRadius: 0, py: 1.5, textTransform: "none" }}
                    >
                      {submitting ? "Blocking..." : "Block Time Slot"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Blocked Slots List */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1f2e" }}>
                  Blocked Time Slots
                </Typography>
                
                <Box sx={{ display: "flex", gap: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From"
                      value={dateFrom}
                      onChange={(newValue) => setDateFrom(newValue || dayjs().startOf("month"))}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { width: 120, borderRadius: 0 },
                        },
                      }}
                    />
                    <DatePicker
                      label="To"
                      value={dateTo}
                      onChange={(newValue) => setDateTo(newValue || dayjs().endOf("month"))}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { width: 120, borderRadius: 0 },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : blockedSlots.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 0 }}>
                  No blocked time slots found for the selected date range.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#1a1f2e" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#1a1f2e" }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#1a1f2e" }}>Reason</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#1a1f2e" }}>Created</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#1a1f2e" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {blockedSlots.map((slot) => (
                        <TableRow key={slot.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CalendarTodayIcon fontSize="small" color="action" />
                              {formatDate(slot.date)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {slot.is_full_day ? (
                              <Chip
                                label="Full Day"
                                size="small"
                                icon={<BlockIcon />}
                                sx={{
                                  backgroundColor: "#f58c0015",
                                  color: "#f58c00",
                                  fontWeight: 500,
                                  borderRadius: 0,
                                }}
                              />
                            ) : (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {slot.reason}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(slot.created_at).format("MMM D, YYYY")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(slot)}
                                sx={{ 
                                  borderRadius: 0,
                                  color: "error.main",
                                  "&:hover": {
                                    backgroundColor: "error.light",
                                    color: "error.dark",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSlotToDelete(null);
        }}
        PaperProps={{
          sx: { borderRadius: 0 },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unblock this time slot?
          </Typography>
          {slotToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Date: {formatDate(slotToDelete.date)}
              </Typography>
              <Typography variant="body2">
                {slotToDelete.is_full_day
                  ? "Full Day Block"
                  : `${formatTime12Hour(slotToDelete.start_time)} - ${formatTime12Hour(slotToDelete.end_time)}`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Reason: {slotToDelete.reason}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSlotToDelete(null);
            }}
            sx={{ borderRadius: 0 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ borderRadius: 0 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

