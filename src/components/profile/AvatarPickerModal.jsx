import React, { useRef, useState } from "react";
import {
  Box, Typography, Avatar, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from "@mui/material";
import { Upload, Close as CloseIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { resolveUserAvatarUrl } from "../../utils/userAvatar";
import { uploadUserAvatar, updateMyProfile, unwrapApiData } from "../../api/api";

const PRESET_SEEDS = {
  female:  ["aurora", "bella", "cleo", "diana", "eve"],
  male:    ["alex", "blake", "chase", "derek", "evan"],
  neutral: ["sage", "river", "robin", "reeve", "rain"],
};

function getPresets(gender) {
  const seeds =
    gender === "male"   ? PRESET_SEEDS.male :
    gender === "female" ? PRESET_SEEDS.female :
    PRESET_SEEDS.neutral;
  return seeds.map((seed) => ({
    seed,
    url: `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&size=128&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  }));
}

/**
 * Standalone avatar picker modal — upload a photo or choose a preset.
 *
 * Props:
 *   open        — boolean
 *   onClose     — () => void
 *   user        — user object (for id + gender)
 *   accessToken — string
 *   avatarUrl   — current avatar_url (controlled)
 *   gender      — current gender value
 *   onAvatarChange — (url: string) => void   called after successful save
 */
export default function AvatarPickerModal({
  open,
  onClose,
  user,
  accessToken,
  avatarUrl,
  gender,
  onAvatarChange,
}) {
  const uploadRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [savingPreset, setSavingPreset] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const presets = getPresets(gender || user?.gender);

  const currentAvatarUrl = avatarUrl ?? user?.avatar_url;
  const previewUser = { id: user?.id, gender: gender ?? user?.gender, avatar_url: currentAvatarUrl };
  const displayUrl = resolveUserAvatarUrl(previewUser);

  const handleClose = () => {
    if (uploading || savingPreset) return;
    setUploadError("");
    onClose();
  };

  const handleFile = async (file) => {
    if (!file || !accessToken) return;
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setUploadError("Image must be under 2MB."); return; }
    setUploading(true);
    setUploadError("");
    try {
      const res = await uploadUserAvatar(accessToken, file);
      if (res.data?.success && res.data.url) {
        const url = res.data.url;
        const profileRes = await updateMyProfile(accessToken, { avatar_url: url });
        const u = profileRes.data?.user ?? unwrapApiData(profileRes);
        onAvatarChange?.(u?.avatar_url || url);
        handleClose();
      } else {
        throw new Error(res.data?.error || "Upload failed");
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) handleFile(file);
  };

  const handleSelectPreset = async (url) => {
    if (!accessToken || uploading || savingPreset) return;
    setSavingPreset(url);
    try {
      const res = await updateMyProfile(accessToken, { avatar_url: url });
      if (res.data?.success) {
        const u = res.data.user ?? unwrapApiData(res);
        onAvatarChange?.(u?.avatar_url || url);
      } else {
        onAvatarChange?.(url);
      }
      handleClose();
    } catch {
      onAvatarChange?.(url);
      handleClose();
    } finally {
      setSavingPreset(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h6" component="span" fontWeight={700} color="secondary.dark">
          Update Profile Photo
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={uploading || !!savingPreset}
          sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Current avatar preview */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            src={displayUrl}
            alt="Current"
            sx={{ width: 72, height: 72, borderRadius: 0, border: "2px solid", borderColor: "secondary.light" }}
          />
        </Box>

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{uploadError}</Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {/* Upload panel */}
          <Box
            sx={{
              border: "1px solid", borderColor: "divider", borderRadius: 1,
              p: 2.5, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 1.5, bgcolor: "#fafafa",
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "50%", bgcolor: "secondary.light",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Upload sx={{ fontSize: 26, color: "secondary.dark" }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} color="secondary.dark">Upload Avatar</Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Upload a custom photo from your device. Max 2MB.
            </Typography>
            <input ref={uploadRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput} />
            <Button
              variant="contained"
              size="small"
              startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Upload fontSize="small" />}
              disabled={uploading || !!savingPreset}
              onClick={() => { setUploadError(""); uploadRef.current?.click(); }}
              sx={{
                borderRadius: 0, textTransform: "none", fontWeight: 600,
                backgroundColor: "secondary.main", "&:hover": { backgroundColor: "secondary.dark" },
              }}
            >
              {uploading ? "Uploading…" : "Choose File"}
            </Button>
          </Box>

          {/* Choose preset panel */}
          <Box
            sx={{
              border: "1px solid", borderColor: "divider", borderRadius: 1,
              p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, bgcolor: "#fafafa",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="secondary.dark">Choose Avatar</Typography>
            <Typography variant="caption" color="text.secondary">
              Pick from predefined avatars{gender ? ` for ${gender}` : ""}.
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}>
              {presets.map(({ seed, url }) => {
                const isSelected = currentAvatarUrl === url;
                const isSaving = savingPreset === url;
                return (
                  <Box
                    key={seed}
                    onClick={() => handleSelectPreset(url)}
                    sx={{
                      position: "relative", cursor: uploading || savingPreset ? "default" : "pointer",
                      borderRadius: "50%", border: "2px solid",
                      borderColor: isSelected ? "secondary.main" : "transparent",
                      "&:hover": !(uploading || savingPreset) ? { borderColor: "secondary.light" } : {},
                    }}
                  >
                    <Avatar src={url} alt={seed} sx={{ width: "100%", height: "auto", aspectRatio: "1" }} />
                    {isSaving && (
                      <CircularProgress size={18} sx={{ position: "absolute", top: "50%", left: "50%", mt: "-9px", ml: "-9px" }} />
                    )}
                    {isSelected && !isSaving && (
                      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.25)", borderRadius: "50%" }}>
                        <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={uploading || !!savingPreset} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
