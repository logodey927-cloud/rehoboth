import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Alert,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  getAllTeamMembersAdmin,
  deleteTeamMember,
  updateTeamMember,
} from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";
import {
  swalConfirm,
  swalSuccess,
  swalError,
  ensureSweetAlertReady,
} from "../../utils/swal";

export default function TeamPage() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roleFilter]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.is_active = statusFilter === "active";
      if (roleFilter) params.role = roleFilter;

      const res = await getAllTeamMembersAdmin(params);
      if (res.data?.success) {
        setTeamMembers(res.data.teamMembers || []);
      } else {
        setError("Failed to load team members");
      }
    } catch (err) {
      setError("Failed to load team members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member) => {
    await ensureSweetAlertReady();

    const deleteType = await swalConfirm(
      "Delete Team Member",
      `How would you like to delete "${member.title}"?`,
      "Permanently Delete",
      "Cancel"
    );

    if (!deleteType.isConfirmed) return;

    const confirmPermanent = await swalConfirm(
      "Permanent Deletion",
      `Are you absolutely sure you want to PERMANENTLY delete "${member.title}"? This action cannot be undone and may affect linked appointments.`,
      "Yes, Delete Permanently",
      "Cancel"
    );

    if (confirmPermanent.isConfirmed) {
      try {
        const res = await deleteTeamMember(member.id, true);
        if (res.data?.success) {
          await swalSuccess("Team Member Deleted", "The team member has been permanently deleted.");
          fetchTeamMembers();
        } else {
          await swalError("Error", res.data?.error || "Failed to delete team member");
        }
      } catch (err) {
        await swalError("Error", err.response?.data?.error || "Failed to delete team member. Please try again.");
      }
    } else {
      const disableConfirm = await swalConfirm(
        "Disable Team Member",
        `Would you like to disable "${member.title}" instead? This will hide them from the public but keep their data and appointments.`,
        "Disable",
        "Cancel"
      );

      if (disableConfirm.isConfirmed) {
        try {
          const res = await deleteTeamMember(member.id, false);
          if (res.data?.success) {
            await swalSuccess("Team Member Disabled", "The team member has been disabled successfully.");
            fetchTeamMembers();
          } else {
            await swalError("Error", res.data?.error || "Failed to disable team member");
          }
        } catch (err) {
          await swalError("Error", err.response?.data?.error || "Failed to disable team member. Please try again.");
        }
      }
    }
  };

  const handleToggleActive = async (member) => {
    try {
      const res = await updateTeamMember(member.id, {
        ...member,
        is_active: !member.is_active,
      });
      if (res.data?.success) {
        await swalSuccess(
          "Team Member Updated",
          `Team member has been ${!member.is_active ? "activated" : "disabled"}.`
        );
        fetchTeamMembers();
      }
    } catch (err) {
      await swalError("Error", "Failed to update team member status.");
    }
  };

  const roles = [...new Set(teamMembers.map((m) => m.role).filter(Boolean))];

  const filteredTeamMembers = teamMembers.filter((member) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      member.title?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.specialisation?.toLowerCase().includes(searchLower)
    );
  });

  const initials = (m) =>
    (m.title || "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const renderMemberCell = (value, row) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, py: 0.5 }}>
      <Avatar
        src={row.image_url || row.avatar_url || undefined}
        alt={row.title}
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          bgcolor: "secondary.light",
          color: "secondary.dark",
          flexShrink: 0,
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        {initials(row)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.8125rem", lineHeight: 1.3 }}
          noWrap
        >
          {row.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 0.25 }}>
          {row.role && (
            <Chip
              icon={<GroupsIcon sx={{ fontSize: 12 }} />}
              label={row.role}
              size="small"
              sx={{
                backgroundColor: "secondary.light",
                color: "secondary.dark",
                fontSize: "0.7rem",
                height: 18,
                borderRadius: 0,
              }}
            />
          )}
          {row.gender && (
            <Chip
              label={row.gender}
              size="small"
              sx={{
                backgroundColor: "#e0f2f1",
                color: "#00695c",
                fontSize: "0.7rem",
                height: 18,
                borderRadius: 0,
              }}
            />
          )}
        </Box>
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
      label: "Member",
      width: 240,
      render: renderMemberCell,
    },
    {
      id: "email",
      label: "Contact",
      render: (value, row) => (
        <Box>
          {value ? (
            <Typography
              component="a"
              href={`mailto:${value}`}
              variant="body2"
              onClick={(e) => e.stopPropagation()}
              sx={{
                color: "text.primary",
                textDecoration: "none",
                fontSize: "0.8125rem",
                "&:hover": { color: "secondary.dark", textDecoration: "underline" },
              }}
            >
              {value}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">—</Typography>
          )}
          {row.phone && (
            <Typography variant="caption" color="text.secondary" display="block">
              {row.phone}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "appointment_count",
      label: "Appointments",
      width: 120,
      align: "center",
      render: (value) => (
        <Chip
          label={typeof value === "number" ? value : 0}
          size="small"
          sx={{
            backgroundColor: "#e3f2fd",
            color: "#1565c0",
            fontWeight: 500,
            borderRadius: 0,
          }}
        />
      ),
    },
    {
      id: "is_active",
      label: "Status",
      width: 100,
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
    {
      id: "actions",
      label: "Actions",
      width: 150,
      align: "right",
      render: (value, row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title={row.is_active ? "Disable" : "Activate"}>
            <IconButton
              size="small"
              onClick={() => handleToggleActive(row)}
              sx={{ color: row.is_active ? "warning.main" : "success.main" }}
            >
              {row.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/team/edit/${row.id}`)}
              sx={{ color: "primary.main" }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(row)}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <HeroPageSection
        title="Team Members Management"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Team Members" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        {/* Header Actions */}
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
            onClick={() => navigate("/admin/team/new")}
            sx={{ borderRadius: 0, textTransform: "none", px: 3 }}
          >
            Add New Team Member
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{ minWidth: 250 }}
            size="small"
          />

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>

          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 180 }}
            size="small"
          >
            <MenuItem value="">All Roles</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <DataTable
          columns={essentialColumns}
          rows={filteredTeamMembers}
          loading={loading && teamMembers.length === 0}
          searchable={false}
        />
      </Box>
    </Box>
  );
}
