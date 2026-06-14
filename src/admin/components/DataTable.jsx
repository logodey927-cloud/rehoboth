import React, { useState, useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

export default function DataTable({
  columns,
  rows,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  maxHeight,
  essentialColumns, // Columns to display in table (to avoid horizontal scroll)
  allColumns, // All columns including hidden ones (for details view)
  onViewDetails, // Optional callback when view details is clicked
  renderDetails, // Optional custom render function for details
  detailsActionIcon = "visibility", // "visibility" | "more" — icon in Actions column
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Use essentialColumns if provided, otherwise use all columns
  const displayColumns = essentialColumns || columns;
  // Use allColumns if provided, otherwise use columns
  const fullColumns = allColumns || columns;

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    // Ensure rows is always an array
    const safeRows = Array.isArray(rows) ? rows : [];

    if (!searchTerm) return safeRows;

    // Use the columns actually displayed for searching; fall back safely
    const searchableColumns =
      (Array.isArray(displayColumns) && displayColumns.length > 0
        ? displayColumns
        : Array.isArray(fullColumns)
        ? fullColumns
        : Array.isArray(columns)
        ? columns
        : []);

    if (searchableColumns.length === 0) return safeRows;

    return safeRows.filter((row) =>
      searchableColumns.some((column) => {
        if (!column || !column.id) return false;
        const value = row[column.id];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [rows, searchTerm, displayColumns, fullColumns, columns]);

  // Pagination
  const paginatedRows = useMemo(() => {
    const safeRows = Array.isArray(filteredRows) ? filteredRows : [];
    return safeRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  const handleViewDetails = (row) => {
    setSelectedRow(row);
    setDetailsOpen(true);
    if (onViewDetails) {
      onViewDetails(row);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRow(null);
  };

  const DetailsActionIcon = detailsActionIcon === "more" ? MoreHorizIcon : VisibilityIcon;
  const detailsTooltip = detailsActionIcon === "more" ? "View details" : "View Full Details";

  const renderDetailsContent = () => {
    if (!selectedRow) return null;

    // If custom renderDetails is provided, use it
    if (renderDetails) {
      return renderDetails(selectedRow, handleCloseDetails, detailsOpen);
    }

    // Default details view
    return (
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600, fontSize: "1.125rem", color: "#1a1f2e" }}>
              Full Details
            </Typography>
            <IconButton
              onClick={handleCloseDetails}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {fullColumns.map((column, index) => {
              // Skip the actions column in details view
              if (column.id === "actions") return null;
              
              const value = selectedRow[column.id];
              const displayValue = column.render
                ? column.render(value, selectedRow)
                : formatCellValue(value, column);

              return (
                <Box
                  key={column.id}
                  sx={{
                    mb: index < fullColumns.length - 1 ? 2.5 : 0,
                    pb: index < fullColumns.length - 1 ? 2.5 : 0,
                    borderBottom: index < fullColumns.length - 1 ? "1px solid" : "none",
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
            onClick={handleCloseDetails}
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

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#ffffff",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      {searchable && (
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: "1px solid", 
            borderColor: "divider",
            backgroundColor: "#f8f9fa",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                backgroundColor: "#ffffff",
              },
            }}
          />
        </Box>
      )}

      <TableContainer
        sx={{
          // Calculate height for rowsPerPage rows (52px per row + 52px for header)
          // Only apply maxHeight if explicitly provided, otherwise let it expand naturally
          ...(maxHeight ? { maxHeight } : {}),
          // Only show scrollbar if maxHeight is set
          ...(maxHeight ? {
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              },
            },
            // Firefox scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
          } : {}),
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
              {displayColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#1a1f2e",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    width: column.width || "auto",
                    minWidth: column.minWidth || column.width || "auto",
                    whiteSpace: column.nowrap ? "nowrap" : undefined,
                    ...column.headerSx,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {/* Actions Column Header */}
              {(fullColumns.length > displayColumns.length || onViewDetails || renderDetails) && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#1a1f2e",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    width: 80,
                    position: "sticky",
                    right: 0,
                    backgroundColor: "#f8f9fa",
                    zIndex: 2,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length + ((fullColumns.length > displayColumns.length || onViewDetails || renderDetails) ? 1 : 0)}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress size={28} thickness={4} sx={{ color: "secondary.main" }} />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={displayColumns.length + ((fullColumns.length > displayColumns.length || onViewDetails || renderDetails) ? 1 : 0)} 
                  align="center" 
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" sx={{ color: "#4b5563", fontSize: "0.8125rem" }}>
                    {searchTerm ? "No results found" : "No data available"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: onRowClick ? "action.hover" : "transparent",
                    },
                  }}
                >
                  {displayColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        width: column.width || "auto",
                        minWidth: column.minWidth || column.width || "auto",
                        fontSize: "0.8125rem",
                        color: "#1a1f2e",
                        whiteSpace: column.nowrap ? "nowrap" : undefined,
                        ...column.cellSx,
                      }}
                    >
                      {column.render && column.id === "row_number"
                        ? column.render(null, row, page * rowsPerPage + index + 1)
                        : column.render
                        ? column.render(row[column.id], row)
                        : formatCellValue(row[column.id], column)}
                    </TableCell>
                  ))}
                  {/* View Details Action Button */}
                  {(fullColumns.length > displayColumns.length || onViewDetails || renderDetails) && (
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        width: 80,
                        position: "sticky",
                        right: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title={detailsTooltip}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(row)}
                          sx={{
                            color: "secondary.main",
                            "&:hover": {
                              backgroundColor: "secondary.light",
                              color: "secondary.dark",
                            },
                          }}
                        >
                          <DetailsActionIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      />

      {/* Details Dialog */}
      {renderDetailsContent()}
    </Paper>
  );
}

