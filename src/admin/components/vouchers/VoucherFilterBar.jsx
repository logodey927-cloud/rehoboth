import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * VoucherFilterBar Component
 * Reusable filter bar for voucher lists
 * 
 * @param {Object} props
 * @param {string} props.statusFilter - Current status filter value
 * @param {string} props.typeFilter - Current type filter value
 * @param {Function} props.onStatusChange - Status filter change handler
 * @param {Function} props.onTypeChange - Type filter change handler
 * @param {Function} props.onClearFilters - Clear all filters handler
 */
export default function VoucherFilterBar({
  statusFilter = "",
  typeFilter = "",
  onStatusChange,
  onTypeChange,
  onClearFilters,
}) {
  const hasFilters = statusFilter || typeFilter;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
        mb: 3,
        p: 2,
        backgroundColor: "grey.50",
        borderRadius: 0,
        border: "1px solid #e0e0e0",
      }}
    >
      <FilterListIcon sx={{ color: "text.secondary" }} />
      
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          label="Status"
          sx={{ borderRadius: 0 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          label="Type"
          sx={{ borderRadius: 0 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="promo">Promotional</MenuItem>
          <MenuItem value="gift">Gift Card</MenuItem>
        </Select>
      </FormControl>

      {hasFilters && (
        <>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
            {statusFilter && (
              <Chip
                label={`Status: ${statusFilter}`}
                onDelete={() => onStatusChange("")}
                size="small"
                sx={{ borderRadius: 0 }}
              />
            )}
            {typeFilter && (
              <Chip
                label={`Type: ${typeFilter}`}
                onDelete={() => onTypeChange("")}
                size="small"
                sx={{ borderRadius: 0 }}
              />
            )}
          </Box>
          <Button
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            size="small"
            sx={{
              borderRadius: 0,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Clear All
          </Button>
        </>
      )}
    </Box>
  );
}

