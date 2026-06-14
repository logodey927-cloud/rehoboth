import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Paper, Switch, FormControlLabel,
  Button, CircularProgress, Alert, Divider, Grid,
  Chip, Tabs, Tab,
} from "@mui/material";
import {
  Image as ImageIcon, Upload as UploadIcon, Check as CheckIcon,
  Refresh as RefreshIcon, CampaignOutlined as PopupIcon,
  ViewCarousel as CarouselIcon,
} from "@mui/icons-material";
import {
  getAdminSiteSettings,
  updateAdminSiteSettings,
  uploadPopupImage,
  uploadHeroImage,
} from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import HeroPageSection from "../../components/sections/HeroPageSection";

const HERO_SLIDES = [
  { label: "Slide 1", desktopKey: "hero_slide_1_image_desktop", mobileKey: "hero_slide_1_image_mobile" },
  { label: "Slide 2", desktopKey: "hero_slide_2_image_desktop", mobileKey: "hero_slide_2_image_mobile" },
  { label: "Slide 3", desktopKey: "hero_slide_3_image_desktop", mobileKey: "hero_slide_3_image_mobile" },
];

const SECTIONS = [
  { key: "popup",    label: "Pop-up Ad",      icon: PopupIcon },
  { key: "carousel", label: "Hero Carousel",   icon: CarouselIcon },
];

function ImageUploadField({ label, settingKey, currentUrl, onUploaded, uploadFn, hint }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");

  useEffect(() => {
    setPreview(currentUrl || "");
  }, [currentUrl]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await uploadFn(form);
      if (res.data?.success && res.data?.url) {
        setPreview(res.data.url);
        onUploaded(settingKey, res.data.url);
      } else {
        await swalError("Upload Failed", res.data?.error || "Could not upload image.");
      }
    } catch (err) {
      await swalError("Upload Error", err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} mb={0.5} color="text.primary">{label}</Typography>
      {hint && <Typography variant="caption" color="text.secondary" display="block" mb={1}>{hint}</Typography>}

      <Box
        sx={{
          width: "100%",
          height: 140,
          borderRadius: 1,
          overflow: "hidden",
          border: "1px dashed",
          borderColor: preview ? "transparent" : "divider",
          bgcolor: preview ? "transparent" : "#f8f9fa",
          mb: 1.5,
          position: "relative",
        }}
      >
        {preview ? (
          <Box
            component="img"
            src={preview}
            alt={label}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 1,
            }}
          >
            <ImageIcon sx={{ fontSize: 36, color: "#d1d5db" }} />
            <Typography variant="caption" color="text.disabled">No image uploaded</Typography>
          </Box>
        )}
      </Box>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={14} /> : <UploadIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          sx={{ borderRadius: 0, textTransform: "none", fontSize: "0.8rem" }}
        >
          {uploading ? "Uploading…" : preview ? "Replace" : "Upload"}
        </Button>
        {preview && (
          <Chip
            label="Saved"
            size="small"
            color="success"
            icon={<CheckIcon />}
            sx={{ borderRadius: 0, fontSize: "0.7rem", height: 22 }}
          />
        )}
      </Box>
    </Box>
  );
}

function SettingRow({ title, description, control }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        gap: 2,
        py: 2.5,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight={600}>{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {description}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Box>
  );
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminSiteSettings();
      if (res.data?.success) {
        setSettings(res.data.settings);
      } else {
        setError("Failed to load settings.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = (key) => (e) => {
    const val = e.target.checked ? "true" : "false";
    setSettings((s) => ({ ...s, [key]: val }));
    setDirty((d) => ({ ...d, [key]: val }));
  };

  const handleUploaded = (key, url) => {
    setSettings((s) => ({ ...s, [key]: url }));
    setDirty((d) => ({ ...d, [key]: url }));
  };

  const handleSave = async () => {
    if (Object.keys(dirty).length === 0) return;
    setSaving(true);
    try {
      const res = await updateAdminSiteSettings(dirty);
      if (res.data?.success) {
        await swalSuccess("Saved", "Site settings updated successfully.");
        setDirty({});
      } else {
        await swalError("Save Failed", res.data?.error || "Could not save settings.");
      }
    } catch (err) {
      await swalError("Error", err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasDirty = Object.keys(dirty).length > 0;

  return (
    <Box>
      <HeroPageSection
        title="Site Settings"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Site Settings" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 3, px: { xs: 0, md: 0 } }}>
        {/* ── Action bar ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          {hasDirty && (
            <Chip
              label="Unsaved changes"
              size="small"
              color="warning"
              sx={{ borderRadius: 0, fontWeight: 600 }}
            />
          )}
          <Button
            startIcon={<RefreshIcon />}
            onClick={load}
            variant="outlined"
            size="small"
            disabled={loading}
            sx={{ borderRadius: 0, textTransform: "none" }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !hasDirty}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
            sx={{
              borderRadius: 0, textTransform: "none",
              bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" },
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* ── Left sidebar nav ── */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 0, overflow: "hidden", position: { md: "sticky" }, top: { md: 88 } }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="overline" sx={{ fontWeight: 700, fontSize: "0.65rem", color: "text.disabled", letterSpacing: 1.2 }}>
                    Sections
                  </Typography>
                </Box>
                {SECTIONS.map((sec, idx) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === idx;
                  return (
                    <Box
                      key={sec.key}
                      onClick={() => setActiveSection(idx)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        cursor: "pointer",
                        borderLeft: "3px solid",
                        borderColor: isActive ? "secondary.main" : "transparent",
                        bgcolor: isActive ? "secondary.light" : "transparent",
                        color: isActive ? "secondary.dark" : "text.primary",
                        transition: "all 0.15s",
                        "&:hover": { bgcolor: isActive ? "secondary.light" : "action.hover" },
                      }}
                    >
                      <Icon sx={{ fontSize: "1.1rem", color: isActive ? "secondary.main" : "text.secondary" }} />
                      <Typography variant="body2" fontWeight={isActive ? 700 : 400}>
                        {sec.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Paper>
            </Grid>

            {/* ── Right content area ── */}
            <Grid size={{ xs: 12, md: 9 }}>
              {/* Pop-up Ad */}
              {activeSection === 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 0 }}>
                  <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" fontWeight={700}>Pop-up Advertisement</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.25}>
                      Control the promotional pop-up shown to visitors on the home page.
                    </Typography>
                  </Box>

                  <Box sx={{ px: 3 }}>
                    <SettingRow
                      title="Show Pop-up"
                      description="Display a promotional pop-up modal when visitors land on the home page."
                      control={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={settings?.popup_enabled === "true" ? "Enabled" : "Disabled"}
                            size="small"
                            color={settings?.popup_enabled === "true" ? "success" : "default"}
                            sx={{ borderRadius: 0, fontSize: "0.7rem", height: 22 }}
                          />
                          <Switch
                            checked={settings?.popup_enabled === "true"}
                            onChange={handleToggle("popup_enabled")}
                            color="secondary"
                          />
                        </Box>
                      }
                    />
                  </Box>

                  <Divider />

                  <Box sx={{ px: 3, py: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Pop-up Image</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Recommended: 600×800px, JPG or PNG under 2MB.
                    </Typography>
                    <Box sx={{ maxWidth: 320 }}>
                      <ImageUploadField
                        label=""
                        settingKey="popup_image_url"
                        currentUrl={settings?.popup_image_url}
                        onUploaded={handleUploaded}
                        uploadFn={uploadPopupImage}
                      />
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Hero Carousel */}
              {activeSection === 1 && (
                <Paper variant="outlined" sx={{ borderRadius: 0 }}>
                  <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" fontWeight={700}>Hero Carousel Images</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.25}>
                      Upload custom images for each hero slide. Recommended: desktop 1920×900px, mobile 768×600px.
                    </Typography>
                  </Box>

                  {HERO_SLIDES.map((slide, idx) => (
                    <Box key={slide.label}>
                      {idx > 0 && <Divider />}
                      <Box sx={{ px: 3, py: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                          <Box
                            sx={{
                              width: 28, height: 28, borderRadius: "50%",
                              bgcolor: "secondary.light", display: "flex",
                              alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <Typography variant="caption" fontWeight={700} color="secondary.dark">
                              {idx + 1}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1" fontWeight={700}>{slide.label}</Typography>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <ImageUploadField
                              label="Desktop Image"
                              settingKey={slide.desktopKey}
                              currentUrl={settings?.[slide.desktopKey]}
                              onUploaded={handleUploaded}
                              uploadFn={uploadHeroImage}
                              hint="1920 × 900 px recommended"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <ImageUploadField
                              label="Mobile Image"
                              settingKey={slide.mobileKey}
                              currentUrl={settings?.[slide.mobileKey]}
                              onUploaded={handleUploaded}
                              uploadFn={uploadHeroImage}
                              hint="768 × 600 px recommended"
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
