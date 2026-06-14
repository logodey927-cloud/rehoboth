import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import { getAllServicesAdmin, deleteService, updateService } from "../../api/api";
import { getCached, setCached, invalidateCache } from "../utils/adminCache";
import DataTable from "../components/DataTable";
import ServiceDetailsModal from "../components/services/ServiceDetailsModal";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { swalConfirm, swalSuccess, swalError, ensureSweetAlertReady } from "../../utils/swal";

const CACHE_KEY = "services";

function collectDurations(service) {
  const out = [];
  for (const item of service.items || []) {
    const durations = item.durations || item.service_item_durations || [];
    for (const d of durations) {
      if (d.minutes != null && d.price != null) {
        out.push({ minutes: Number(d.minutes), price: Number(d.price) });
      }
    }
  }
  return out;
}

function formatPriceRange(service) {
  const durations = collectDurations(service);
  if (!durations.length) return "-";
  const prices = durations.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const fmt = (n) => `£${n.toFixed(2)}`;
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

function formatDurationRange(service) {
  const durations = collectDurations(service);
  if (!durations.length) return "-";
  const mins = durations.map((d) => d.minutes);
  const min = Math.min(...mins);
  const max = Math.max(...mins);
  return min === max ? `${min} min` : `${min}–${max} min`;
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState(() => getCached(CACHE_KEY) || []);
  const [loading, setLoading] = useState(() => !getCached(CACHE_KEY));
  const [hasLoadedOnce, setHasLoadedOnce] = useState(() => Boolean(getCached(CACHE_KEY)));
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async (force = false) => {
    if (!force) {
      const cached = getCached(CACHE_KEY);
      if (cached) {
        setAllServices(cached);
        setHasLoadedOnce(true);
        setLoading(false);
        return;
      }
    } else {
      invalidateCache(CACHE_KEY);
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getAllServicesAdmin();
      if (res.data?.success) {
        const list = res.data.services || [];
        setAllServices(list);
        setCached(CACHE_KEY, list);
        setHasLoadedOnce(true);
      } else {
        setError("Failed to load services");
      }
    } catch {
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (service) => {
    await ensureSweetAlertReady();

    const deleteType = await swalConfirm(
      "Delete Service",
      `How would you like to delete "${service.title}"?`,
      "Permanently Delete",
      "Cancel"
    );

    if (!deleteType.isConfirmed) {
      return;
    }

    const confirmPermanent = await swalConfirm(
      "Permanent Deletion",
      `Are you absolutely sure you want to PERMANENTLY delete "${service.title}"? This action cannot be undone and will remove all associated benefits, items, and pricing data.`,
      "Yes, Delete Permanently",
      "Cancel"
    );

    if (confirmPermanent.isConfirmed) {
      try {
        const res = await deleteService(service.id, true);
        if (res.data?.success) {
          await swalSuccess("Service Deleted", "The service has been permanently deleted.");
          fetchServices(true);
        } else {
          await swalError("Error", res.data?.error || "Failed to delete service");
        }
      } catch (err) {
        await swalError(
          "Error",
          err.response?.data?.error || "Failed to delete service. Please try again."
        );
      }
    } else {
      const deactivateConfirm = await swalConfirm(
        "Deactivate Service",
        `Would you like to deactivate "${service.title}" instead? This will hide it from the public but keep all data.`,
        "Deactivate",
        "Cancel"
      );

      if (deactivateConfirm.isConfirmed) {
        try {
          const res = await deleteService(service.id, false);
          if (res.data?.success) {
            await swalSuccess("Service Deactivated", "The service has been deactivated successfully.");
            fetchServices(true);
          } else {
            await swalError("Error", res.data?.error || "Failed to deactivate service");
          }
        } catch (err) {
          await swalError(
            "Error",
            err.response?.data?.error || "Failed to deactivate service. Please try again."
          );
        }
      }
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await updateService(service.id, {
        ...service,
        is_active: !service.is_active,
      });
      if (res.data?.success) {
        await swalSuccess(
          "Service Updated",
          `Service has been ${!service.is_active ? "activated" : "deactivated"}.`
        );
        fetchServices(true);
      }
    } catch {
      await swalError("Error", "Failed to update service status.");
    }
  };

  const categories = useMemo(
    () => [...new Set(allServices.map((s) => s.category).filter(Boolean))].sort(),
    [allServices]
  );

  const filteredByControls = useMemo(() => {
    return allServices.filter((service) => {
      if (categoryFilter && service.category !== categoryFilter) return false;
      if (statusFilter === "active" && !service.is_active) return false;
      if (statusFilter === "inactive" && service.is_active) return false;
      return true;
    });
  }, [allServices, categoryFilter, statusFilter]);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return filteredByControls;
    const searchLower = searchTerm.toLowerCase();
    return filteredByControls.filter(
      (service) =>
        service.title?.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower) ||
        service.category?.toLowerCase().includes(searchLower)
    );
  }, [filteredByControls, searchTerm]);

  const showPreloader = loading && !hasLoadedOnce;

  const renderServiceCell = (value, row) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Avatar
        src={row.image_url || undefined}
        alt={value || "Service"}
        variant="rounded"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 0,
          bgcolor: row.image_url ? "transparent" : "#84994f22",
          color: "secondary.dark",
          fontSize: "0.875rem",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {(value || "?").charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
          {value || "-"}
        </Typography>
        {row.category && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.category}
          </Typography>
        )}
      </Box>
    </Box>
  );

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
      id: "title",
      label: "Service",
      width: 260,
      render: renderServiceCell,
    },
    {
      id: "category",
      label: "Category",
      render: (value) =>
        value ? (
          <Chip
            label={value}
            size="small"
            sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 500, borderRadius: 0 }}
          />
        ) : (
          "-"
        ),
    },
    {
      id: "price",
      label: "Price",
      render: (value, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatPriceRange(row)}
        </Typography>
      ),
    },
    {
      id: "duration",
      label: "Duration",
      render: (value, row) => (
        <Typography variant="body2" color="text.secondary">
          {formatDurationRange(row)}
        </Typography>
      ),
    },
    {
      id: "is_active",
      label: "Status",
      width: 110,
      render: (value) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          size="small"
          sx={{
            backgroundColor: value ? "#4caf5015" : "#9e9e9e15",
            color: value ? "#4caf50" : "#9e9e9e",
            fontWeight: 500,
            borderRadius: 0,
          }}
        />
      ),
    },
  ];

  const allColumns = [
    ...essentialColumns,
    {
      id: "description",
      label: "Description",
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value && value.length > 120 ? `${value.substring(0, 120)}...` : value || "-"}
        </Typography>
      ),
    },
    {
      id: "display_order",
      label: "Display Order",
      render: (value) => (value != null ? value : "-"),
    },
    {
      id: "items_count",
      label: "Packages",
      render: (value, row) => {
        const count = row.items?.length ?? 0;
        return (
          <Chip
            label={count}
            size="small"
            sx={{ backgroundColor: "#f58c0015", color: "#f58c00", fontWeight: 500, borderRadius: 0 }}
          />
        );
      },
    },
    {
      id: "created_at",
      label: "Created",
      render: (value) => formatDateTime(value),
    },
    {
      id: "updated_at",
      label: "Updated",
      render: (value) => formatDateTime(value),
    },
  ];

  const renderDetails = (row, onClose, isOpen) => (
    <ServiceDetailsModal
      open={isOpen}
      onClose={onClose}
      service={row}
      onEdit={(s) => {
        onClose();
        navigate(`/admin/services/edit/${s.id}`);
      }}
      onToggleActive={async (s) => {
        await handleToggleActive(s);
        onClose();
      }}
      onDelete={async (s) => {
        onClose();
        await handleDelete(s);
      }}
    />
  );

  return (
    <Box>
      <HeroPageSection
        title="Services Management"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Services" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/services/new")}
            sx={{ borderRadius: 0, textTransform: "none", px: 3 }}
          >
            Add New Service
          </Button>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {(categoryFilter || statusFilter || searchTerm) && (
              <Chip
                label={`Filtered: ${filteredServices.length}`}
                sx={{ backgroundColor: "#84994f15", color: "secondary.dark", fontWeight: 600, borderRadius: 0 }}
              />
            )}
            <TextField
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{ minWidth: 250, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 }, borderRadius: 1 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            {(categoryFilter || statusFilter || searchTerm) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setCategoryFilter("");
                  setStatusFilter("");
                  setSearchTerm("");
                }}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={() => fetchServices(true)}
            disabled={loading}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {showPreloader ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            essentialColumns={essentialColumns}
            allColumns={allColumns}
            rows={filteredServices}
            loading={loading && allServices.length === 0}
            searchable={false}
            searchPlaceholder="Search services by title, category..."
            renderDetails={renderDetails}
            detailsActionIcon="more"
          />
        )}
      </Box>
    </Box>
  );
}
