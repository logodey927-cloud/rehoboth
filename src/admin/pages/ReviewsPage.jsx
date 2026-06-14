import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Chip, CircularProgress, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating, ToggleButtonGroup, ToggleButton, Tooltip,
  IconButton,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  EventNote as AppointmentIcon,
} from "@mui/icons-material";
import {
  adminGetReviews, adminUpdateReviewStatus, adminUpdateReview, adminDeleteReview,
} from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";

const STATUS_COLORS = {
  pending:  { bg: "#fff8e1", color: "#f9a825" },
  approved: { bg: "#e8f5e9", color: "#2e7d32" },
  rejected: { bg: "#ffebee", color: "#c62828" },
};

function StatusChip({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, borderRadius: 1 }}
    />
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [statusFilter, setStatus]   = useState("pending");

  // Edit modal
  const [editOpen, setEditOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editComment, setEditComment]   = useState("");
  const [editName, setEditName]         = useState("");
  const [editRating, setEditRating]     = useState(0);
  const [editLocation, setEditLocation] = useState("");
  const [editSaving, setEditSaving]     = useState(false);
  const [editError, setEditError]       = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const res = await adminGetReviews(params);
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      } else {
        setError("Failed to load reviews");
      }
    } catch {
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminUpdateReviewStatus(id, newStatus);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus, approved_at: newStatus === "approved" ? new Date().toISOString() : r.approved_at } : r
        )
      );
    } catch {
      setError("Failed to update status");
    }
  };

  // Edit modal handlers
  const openEdit = (review) => {
    setEditTarget(review);
    setEditComment(review.comment);
    setEditName(review.display_name);
    setEditRating(review.rating);
    setEditLocation(review.location || "");
    setEditError(null);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (editComment.trim().length < 50) {
      setEditError("Comment must be at least 50 characters");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await adminUpdateReview(editTarget.id, {
        comment: editComment.trim(),
        display_name: editName.trim(),
        rating: editRating,
        location: editLocation.trim() || null,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? { ...r, comment: editComment.trim(), display_name: editName.trim(), rating: editRating, location: editLocation.trim() || null, edited_by_admin: true }
            : r
        )
      );
      setEditOpen(false);
    } catch {
      setEditError("Failed to save changes");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete handlers
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await adminDeleteReview(deleteTarget.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete review");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      id: "row_number",
      label: "No.",
      width: 55,
      align: "center",
      render: (_, __, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 110,
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: "rating",
      label: "Rating",
      width: 130,
      render: (value) => (
        <Rating value={value} readOnly size="small"
          sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }} />
      ),
    },
    {
      id: "display_name",
      label: "Reviewer",
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{value}</Typography>
          {row.user_email && (
            <Typography variant="caption" color="text.secondary">{row.user_email}</Typography>
          )}
          {row.location && (
            <Typography variant="caption" color="text.disabled" display="block">{row.location}</Typography>
          )}
        </Box>
      ),
    },
    {
      id: "service_name",
      label: "Service",
      render: (value) => value || "—",
    },
    {
      id: "appointment_id",
      label: "Appointment",
      width: 130,
      render: (value, row) =>
        value ? (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AppointmentIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography
                variant="caption"
                sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "text.secondary" }}
                title={value}
              >
                {value.slice(0, 8)}…
              </Typography>
            </Box>
            {row.appointment_date && (
              <Typography variant="caption" color="text.disabled" display="block">
                {new Date(row.appointment_date).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </Typography>
            )}
            {(row.appointment_treatment || row.appointment_service) && (
              <Typography variant="caption" color="text.disabled" display="block"
                sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={row.appointment_treatment || row.appointment_service}
              >
                {row.appointment_treatment || row.appointment_service}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        ),
    },
    {
      id: "comment",
      label: "Comment",
      render: (value, row) => (
        <Box>
          <Typography
            variant="body2"
            sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={value}
          >
            {value}
          </Typography>
          {row.edited_by_admin && (
            <Chip label="Edited" size="small" sx={{ height: 16, fontSize: 10, mt: 0.5 }} />
          )}
        </Box>
      ),
    },
    {
      id: "created_at",
      label: "Submitted",
      type: "datetime",
    },
    {
      id: "actions",
      label: "Actions",
      width: 160,
      render: (_, row) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {row.status !== "approved" && (
            <Tooltip title="Approve">
              <IconButton
                size="small" color="success"
                onClick={() => handleStatusChange(row.id, "approved")}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {row.status !== "rejected" && (
            <Tooltip title="Reject">
              <IconButton
                size="small" color="error"
                onClick={() => handleStatusChange(row.id, "rejected")}
              >
                <RejectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const pendingCount  = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  return (
    <Box>
      <HeroPageSection
        title="Reviews"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Reviews" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        {/* Status filter tabs */}
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, val) => { if (val) setStatus(val); }}
          size="small"
        >
          <ToggleButton value="pending" sx={{ textTransform: "none" }}>
            Pending {statusFilter !== "pending" && pendingCount > 0 && (
              <Chip label={pendingCount} size="small" color="warning" sx={{ ml: 0.75, height: 16, fontSize: 10 }} />
            )}
          </ToggleButton>
          <ToggleButton value="approved" sx={{ textTransform: "none" }}>
            Approved {statusFilter !== "approved" && approvedCount > 0 && (
              <Chip label={approvedCount} size="small" color="success" sx={{ ml: 0.75, height: 16, fontSize: 10 }} />
            )}
          </ToggleButton>
          <ToggleButton value="rejected" sx={{ textTransform: "none" }}>
            Rejected
          </ToggleButton>
          <ToggleButton value="all" sx={{ textTransform: "none" }}>All</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label={`Showing: ${reviews.length}`}
            sx={{ backgroundColor: "#84994f15", color: "#84994f", fontWeight: 600, borderRadius: 0 }}
          />
          <Button startIcon={<RefreshIcon />} onClick={fetchReviews} variant="outlined" sx={{ borderRadius: 0 }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={reviews}
        loading={loading && reviews.length === 0}
        searchPlaceholder="Search by name, comment..."
      />

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Review</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setEditError(null)}>
              {editError}
            </Alert>
          )}

          {editTarget?.appointment_id && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f5f7f0", border: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                Linked appointment
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                {editTarget.appointment_id}
              </Typography>
              {editTarget.appointment_date && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(editTarget.appointment_date).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                  {editTarget.appointment_treatment ? ` — ${editTarget.appointment_treatment}` : ""}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>Rating</Typography>
            <Rating
              value={editRating}
              onChange={(_, val) => setEditRating(val)}
              sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }}
            />
          </Box>

          <TextField
            label="Display Name"
            fullWidth value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          />

          <TextField
            label="Location"
            fullWidth value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          />

          <TextField
            label="Comment"
            multiline rows={5} fullWidth
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            helperText={`${editComment.length} / 2000`}
            inputProps={{ maxLength: 2000 }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: 0, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained" onClick={handleEditSave} disabled={editSaving}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            {editSaving ? <CircularProgress size={18} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Review?</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete the review by <strong>{deleteTarget?.display_name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 0, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained" color="error" onClick={handleDeleteConfirm} disabled={deleteLoading}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            {deleteLoading ? <CircularProgress size={18} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
