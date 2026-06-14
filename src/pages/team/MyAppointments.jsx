import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Clear as ClearIcon, Close as CloseIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { getTeamMemberAppointmentsAuth } from "../../api/api";
import DataTable from "../../admin/components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getTeamMemberAppointmentsAuth();
      if (response.data?.success) {
        setAppointments(response.data.appointments || []);
      } else {
        setError("Failed to load appointments");
      }
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments by date and status
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by date
    if (filterDate) {
      const filterDateStr = dayjs(filterDate).format("YYYY-MM-DD");
      filtered = filtered.filter((apt) => {
        const aptDate = dayjs(apt.date).format("YYYY-MM-DD");
        return aptDate === filterDateStr;
      });
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((apt) => {
        return apt.status === statusFilter;
      });
    }

    return filtered;
  }, [appointments, filterDate, statusFilter]);

  // All columns including hidden ones (for details view)
  const allColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "full_name",
      label: "Name",
    },
    {
      id: "email",
      label: "Email",
    },
    {
      id: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      id: "service",
      label: "Service",
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: "#f58c0015",
            color: "#f58c00",
            fontWeight: 500,
            borderRadius: 0,
          }}
        />
      ),
    },
    {
      id: "date",
      label: "Date",
      type: "date",
    },
    {
      id: "time",
      label: "Time",
    },
    {
      id: "note",
      label: "Note",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 120,
      render: (value) => {
        const statusColors = {
          PENDING: { bg: "#f58c0015", color: "#f58c00" },
          CONFIRMED: { bg: "#2196f315", color: "#2196f3" },
          IN_PROCESS: { bg: "#9c27b015", color: "#9c27b0" },
          CLIENT_COMPLETED: { bg: "#ff980015", color: "#ff9800" },
          COMPLETED: { bg: "#4caf5015", color: "#4caf50" },
          REJECTED: { bg: "#f4433615", color: "#f44336" },
          CANCELLED: { bg: "#9e9e9e15", color: "#9e9e9e" },
        };
        const colors = statusColors[value] || { bg: "#e0e0e0", color: "#757575" };
        return (
          <Chip
            label={value || "PENDING"}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.color,
              fontWeight: 500,
              borderRadius: 0,
            }}
          />
        );
      },
    },
  ];

  // Essential columns to display in main table (visible columns)
  const essentialColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "full_name",
      label: "Name",
    },
    {
      id: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      id: "service",
      label: "Service",
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: "#f58c0015",
            color: "#f58c00",
            fontWeight: 500,
            borderRadius: 0,
          }}
        />
      ),
    },
    {
      id: "date",
      label: "Date",
      type: "date",
    },
    {
      id: "time",
      label: "Time",
    },
    {
      id: "status",
      label: "Status",
      width: 120,
      render: (value) => {
        const statusColors = {
          PENDING: { bg: "#f58c0015", color: "#f58c00" },
          CONFIRMED: { bg: "#2196f315", color: "#2196f3" },
          IN_PROCESS: { bg: "#9c27b015", color: "#9c27b0" },
          CLIENT_COMPLETED: { bg: "#ff980015", color: "#ff9800" },
          COMPLETED: { bg: "#4caf5015", color: "#4caf50" },
          REJECTED: { bg: "#f4433615", color: "#f44336" },
          CANCELLED: { bg: "#9e9e9e15", color: "#9e9e9e" },
        };
        const colors = statusColors[value] || { bg: "#e0e0e0", color: "#757575" };
        return (
          <Chip
            label={value || "PENDING"}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.color,
              fontWeight: 500,
              borderRadius: 0,
            }}
          />
        );
      },
    },
  ];

  // Helper function to format cell values
  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return "-";

    if (column.format) {
      return column.format(value);
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    if (column.type === "datetime") {
      return new Date(value).toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return String(value);
  };

  // Custom render function for details dialog
  const renderDetails = (row, onClose, isOpen) => {
    // Filter out row_number from display
    const displayColumns = allColumns.filter((col) => col.id !== "row_number");

    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: 600, fontSize: "1.125rem", color: "#1a1f2e", mb: 0.5 }}
              >
                Appointment Details
              </Typography>
              {row.full_name && (
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                  {row.full_name}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {displayColumns.map((column, index) => {
              const value = row[column.id];
              const displayValue = column.render
                ? column.render(value, row)
                : formatCellValue(value, column);

              return (
                <Box
                  key={column.id}
                  sx={{
                    mb: index < displayColumns.length - 1 ? 2.5 : 0,
                    pb: index < displayColumns.length - 1 ? 2.5 : 0,
                    borderBottom: index < displayColumns.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "#6b7280",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 1,
                    }}
                  >
                    {column.label}
                  </Typography>
                  <Box
                    sx={{
                      minHeight: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {typeof displayValue === "string" || typeof displayValue === "number" ? (
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#1a1f2e",
                          fontSize: "0.9375rem",
                          fontWeight: 400,
                          wordBreak: "break-word",
                          lineHeight: 1.6,
                        }}
                      >
                        {displayValue || "-"}
                      </Typography>
                    ) : (
                      displayValue
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontSize: "0.875rem",
              px: 3,
              backgroundColor: "secondary.main",
              "&:hover": {
                backgroundColor: "secondary.dark",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="My Appointments"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Team", link: "/team" },
          { label: "Appointments" },
        ]}
        borderRadius={true}
      />

      <Box
        sx={{
          mt: 4,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`Total: ${appointments.length}${
              filterDate || statusFilter ? ` | Filtered: ${filteredAppointments.length}` : ""
            }`}
            sx={{
              backgroundColor: "#84994f15",
              color: "secondary.dark",
              fontWeight: 600,
              borderRadius: 0,
            }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Filter by Date"
              value={filterDate}
              onChange={(newValue) => setFilterDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 200,
                    "& .MuiOutlinedInput-root": { borderRadius: 0 },
                  },
                },
              }}
            />
          </LocalizationProvider>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: 1,
                },
                borderRadius: 1,
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="IN_PROCESS">In Process</MenuItem>
              <MenuItem value="CLIENT_COMPLETED">Client Completed</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          {(filterDate || statusFilter) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                setFilterDate(null);
                setStatusFilter("");
              }}
              sx={{ borderRadius: 0, textTransform: "none" }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        essentialColumns={essentialColumns}
        allColumns={allColumns}
        rows={filteredAppointments}
        loading={loading}
        searchPlaceholder="Search appointments by name, email, service..."
        renderDetails={renderDetails}
      />
    </Box>
  );
}

