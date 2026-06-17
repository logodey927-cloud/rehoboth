import React from "react";
import {
  Box, Typography, Paper, TextField, Grid, MenuItem,
  CircularProgress, Alert, IconButton,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import StyledButton from "../common09/StyledButton";
import ProfileAvatarEditor from "./ProfileAvatarEditor";
import { profileCardSx, profileSectionTitleSx, accountFieldSx, accountStyledButtonSx } from "./profileStyles";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function PersonalInfoCard({
  user,
  accessToken,
  form,
  email,
  editing,
  saving,
  error,
  onEdit,
  onChange,
  onSubmit,
  onAvatarChange,
  onRemoveAvatar,
}) {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Typography sx={profileSectionTitleSx}>Personal Information</Typography>
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            px: 1.5,
            py: 0.75,
            gap: 0.5,
            color: "text.secondary",
            "&:hover": { borderColor: "secondary.main", color: "secondary.main", bgcolor: "secondary.light" },
          }}
        >
          <Edit sx={{ fontSize: 16 }} />
          <Typography fontSize="0.8rem" component="span" fontWeight={600}>
            Edit
          </Typography>
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

      <ProfileAvatarEditor
        user={user}
        accessToken={accessToken}
        editing={editing}
        avatarUrl={form.avatar_url}
        gender={form.gender}
        onAvatarChange={onAvatarChange}
        onRemoveAvatar={onRemoveAvatar}
      />

      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              First Name
            </Typography>
            <TextField
              fullWidth size="small" name="first_name"
              value={form.first_name} onChange={onChange}
              disabled={!editing} required sx={accountFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              Last Name
            </Typography>
            <TextField
              fullWidth size="small" name="last_name"
              value={form.last_name} onChange={onChange}
              disabled={!editing} required sx={accountFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              Email Address
            </Typography>
            <TextField fullWidth size="small" value={email || ""} disabled sx={accountFieldSx} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              Gender
            </Typography>
            <TextField
              fullWidth select size="small" name="gender"
              value={form.gender} onChange={onChange}
              disabled={!editing} sx={accountFieldSx}
            >
              <MenuItem value=""><em>Select gender</em></MenuItem>
              {GENDER_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              Phone (optional)
            </Typography>
            <TextField
              fullWidth size="small" name="phone"
              value={form.phone} onChange={onChange}
              disabled={!editing} sx={accountFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              Date of Birth
            </Typography>
            <TextField
              fullWidth size="small" type="date" name="date_of_birth"
              value={form.date_of_birth} onChange={onChange}
              disabled={!editing}
              InputLabelProps={{ shrink: true }}
              sx={accountFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75} fontWeight={500}>
              Address
            </Typography>
            <TextField
              fullWidth size="small" name="address"
              value={form.address} onChange={onChange}
              disabled={!editing}
              multiline
              minRows={2}
              sx={accountFieldSx}
            />
          </Grid>
        </Grid>

        {editing && (
          <Box sx={{ mt: 3 }}>
            {saving ? (
              <CircularProgress size={24} color="secondary" />
            ) : (
              <StyledButton
                text="Update Profile"
                variant="primary"
                type="submit"
                sx={accountStyledButtonSx}
              />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
