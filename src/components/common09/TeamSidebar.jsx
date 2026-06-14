import React, { useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function TeamSidebar({
  searchTerm,
  onSearchChange,
  roles,
  activeRole,
  onRoleChange,
  specialisations,
  activeSpecialisation,
  onSpecialisationChange,
  searchPlaceholder = "Search team members...",
}) {
  const sortedRoles = useMemo(
    () => ["All", ...roles].sort(),
    [roles]
  );
  const sortedSpecialisations = useMemo(() => [...specialisations].sort(), [specialisations]);

  return (
    <Box sx={{ px: { xs: 0, md: 0 }, py: { xs: 2, md: 4 } }}>
      {/* Search */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Search
      </Typography>
      <TextField
        variant="standard"
        fullWidth
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 4,
          "& .MuiInputBase-root": { borderBottom: "1px solid #ccc" },
        }}
      />

      {/* Roles */}
      {roles && roles.length > 0 && (
        <Box sx={{ my: 3, display: { xs: "none", md: "block" } }}>
          <Typography
            variant="h4"
            sx={{ mb: 0, fontWeight: 400, color: "secondary.dark" }}
          >
            Roles
          </Typography>
          <List sx={{ mb: 2 }}>
            {sortedRoles.map((role) => (
              <ListItemButton
                key={role}
                selected={activeRole === role}
                onClick={() => onRoleChange(role)}
                sx={{
                  borderBottom: "1px solid #eee",
                  "&.Mui-selected": {
                    backgroundColor: "transparent",
                    color: "text.primary",
                    fontWeight: 600,
                  },
                }}
              >
                <ListItemText primary={role} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {/* Specialisations */}
      {specialisations && specialisations.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 400, color: "secondary.dark" }}
          >
            Specialisations
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {sortedSpecialisations.map((spec) => (
              <Chip
                key={spec}
                label={spec}
                onClick={() => onSpecialisationChange(spec === activeSpecialisation ? "" : spec)}
                variant={activeSpecialisation === spec ? "filled" : "outlined"}
                color={activeSpecialisation === spec ? "secondary" : "default"}
                sx={{ borderRadius: 0 }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

