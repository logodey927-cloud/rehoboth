import React, { useState } from "react";
import { Box, Typography, Avatar, Button, CircularProgress, Alert, Tooltip } from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { resolveUserAvatarUrl, userHasCustomAvatar } from "../../utils/userAvatar";
import AvatarPickerModal from "./AvatarPickerModal";

export default function ProfileAvatarEditor({
  user,
  accessToken,
  _editing,      // kept for backwards compat
  avatarUrl,
  gender,
  onAvatarChange,
  onRemoveAvatar,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const previewUser = { id: user?.id, gender: gender ?? user?.gender, avatar_url: avatarUrl ?? user?.avatar_url };
  const displayUrl = resolveUserAvatarUrl(previewUser);
  const isCustom = userHasCustomAvatar(previewUser);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 3, flexWrap: "wrap" }}>
        {/* Avatar with hover overlay */}
        <Tooltip title="Change profile photo">
          <Box onClick={() => setModalOpen(true)} sx={{ position: "relative", cursor: "pointer", flexShrink: 0 }}>
            <Avatar
              src={displayUrl}
              alt="Profile"
              sx={{ width: 88, height: 88, borderRadius: 0, border: "2px solid", borderColor: "secondary.light" }}
            />
            <Box
              sx={{
                position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.38)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.2s",
                "&:hover": { opacity: 1 },
              }}
            >
              <PhotoCamera sx={{ color: "#fff", fontSize: 26 }} />
            </Box>
          </Box>
        </Tooltip>

        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography fontWeight={600} fontSize="0.9rem" color="secondary.dark">Profile Photo</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {isCustom ? "Your uploaded photo" : "Default photo based on your gender"}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              size="small" variant="outlined"
              startIcon={<PhotoCamera fontSize="small" />}
              onClick={() => setModalOpen(true)}
              sx={{ borderRadius: 0, textTransform: "none" }}
            >
              Change Photo
            </Button>
            {isCustom && (
              <Button
                size="small" color="error" variant="text"
                startIcon={<Delete fontSize="small" />}
                onClick={() => onRemoveAvatar?.()}
                sx={{ borderRadius: 0, textTransform: "none" }}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <AvatarPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        accessToken={accessToken}
        avatarUrl={avatarUrl}
        gender={gender}
        onAvatarChange={(url) => {
          onAvatarChange?.(url);
          setModalOpen(false);
        }}
      />
    </>
  );
}
