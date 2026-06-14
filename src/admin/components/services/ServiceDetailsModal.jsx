import React from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Avatar,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Spa as SpaIcon,
  Category as CategoryIcon,
  Inventory2 as PackagesIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Event as EventIcon,
} from "@mui/icons-material";

const BRAND = {
  green: "#84994f",
  greenDark: "#47672f",
  greenLight: "#a8b86d",
  greenMuted: "#84994f18",
  orange: "#f58c00",
};

const ACTION_BTN_SX = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.8125rem",
  whiteSpace: "nowrap",
  borderColor: BRAND.green,
  color: BRAND.greenDark,
  px: 1.75,
  minHeight: 36,
  bgcolor: "#fff",
  "&:hover": {
    borderColor: BRAND.greenDark,
    bgcolor: BRAND.greenMuted,
  },
};

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
  if (!durations.length) return "—";
  const prices = durations.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const fmt = (n) => `£${n.toFixed(2)}`;
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

function formatDurationRange(service) {
  const durations = collectDurations(service);
  if (!durations.length) return "—";
  const mins = durations.map((d) => d.minutes);
  const min = Math.min(...mins);
  const max = Math.max(...mins);
  return min === max ? `${min} min` : `${min}–${max} min`;
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StatusChip({ active }) {
  return (
    <Chip
      label={active ? "Active" : "Inactive"}
      size="small"
      sx={{
        backgroundColor: active ? "#4caf5018" : "#9e9e9e18",
        color: active ? "#4caf50" : "#757575",
        fontWeight: 600,
        borderRadius: 0,
      }}
    />
  );
}

function DetailField({ label, value, children, fullWidth = false, styled = false }) {
  const valueContent = children ?? (
    <Typography
      variant="body2"
      sx={{
        color: "#1a1f2e",
        fontWeight: 700,
        fontSize: "0.875rem",
        wordBreak: "break-word",
        lineHeight: 1.45,
      }}
    >
      {value ?? "—"}
    </Typography>
  );

  return (
    <Box sx={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: styled ? BRAND.greenDark : "text.secondary",
          fontSize: "0.6875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={
          styled
            ? {
                py: 1.1,
                px: 1.35,
                bgcolor: BRAND.greenMuted,
                borderLeft: `3px solid ${BRAND.green}`,
                borderRadius: 0,
              }
            : { mt: 0.25 }
        }
      >
        {valueContent}
      </Box>
    </Box>
  );
}

function SectionCard({ title, icon: Icon, children, variant = "default" }) {
  const accentBorder = variant === "pricing" ? BRAND.orange : BRAND.green;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: variant !== "default" ? `4px solid ${accentBorder}` : `4px solid ${BRAND.green}`,
        borderRadius: 1,
        bgcolor: "#fff",
        boxShadow: "0 1px 4px rgba(71, 103, 47, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mb: 2,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: BRAND.greenMuted,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: variant === "pricing" ? BRAND.orange : BRAND.green,
            color: "#fff",
            borderRadius: 0,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark, letterSpacing: 0.3 }}>
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

export default function ServiceDetailsModal({
  open,
  onClose,
  service,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  if (!service) return null;

  const packageCount = service.items?.length ?? 0;
  const benefits = service.benefits || service.service_benefits || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          maxHeight: "92vh",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          background: `linear-gradient(135deg, ${BRAND.greenDark} 0%, ${BRAND.green} 55%, ${BRAND.greenLight} 100%)`,
          color: "#fff",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "rgba(255,255,255,0.85)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", pr: 4 }}>
          <Avatar
            src={service.image_url || undefined}
            alt={service.title}
            variant="rounded"
            sx={{
              width: 64,
              height: 64,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.35)",
              flexShrink: 0,
            }}
          >
            {!service.image_url && <SpaIcon sx={{ fontSize: 32 }} />}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>
              Service
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.5 }}>
              {service.title || "Untitled service"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              <StatusChip active={service.is_active} />
              {service.category && (
                <Chip
                  label={service.category}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 0,
                    border: "1px solid rgba(255,255,255,0.35)",
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            mt: 2.5,
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {[
            { label: "Price", value: formatPriceRange(service) },
            { label: "Duration", value: formatDurationRange(service) },
            { label: "Packages", value: String(packageCount) },
            { label: "Display order", value: service.display_order != null ? String(service.display_order) : "0" },
          ].map((item) => (
            <Box key={item.label} sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", display: "block" }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", fontSize: "0.8125rem" }} noWrap>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f4f5f7" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Overview" icon={DescriptionIcon} variant="overview">
              <DetailField styled label="Category" value={service.category || "—"} />
              <DetailField styled label="Display order" value={service.display_order ?? 0} />
              <DetailField styled label="Status" children={<StatusChip active={service.is_active} />} />
              <DetailField
                styled
                label="Description"
                fullWidth
                children={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "#1a1f2e",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {service.description || "No description provided."}
                  </Typography>
                }
              />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Service info" icon={CategoryIcon}>
              {service.image_url && (
                <DetailField label="Image" fullWidth>
                  <Box
                    component="img"
                    src={service.image_url}
                    alt={service.title}
                    sx={{
                      width: "100%",
                      maxHeight: 140,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </DetailField>
              )}
              <DetailField styled label="Price range" value={formatPriceRange(service)} />
              <DetailField styled label="Duration range" value={formatDurationRange(service)} />
              <DetailField styled label="Pricing packages" value={packageCount} />
            </SectionCard>
          </Grid>

          {(service.items || []).length > 0 && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Pricing packages" icon={PackagesIcon} variant="pricing">
                <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {(service.items || []).map((item) => (
                    <Paper
                      key={item.id || item.name}
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark, mb: 1 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                        {(item.durations || item.service_item_durations || []).map((d) => (
                          <Box
                            key={d.id || `${d.minutes}-${d.price}`}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 0.75,
                              px: 1.25,
                              bgcolor: "#fff",
                              borderLeft: `3px solid ${BRAND.orange}`,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                              {d.minutes} min
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
                              £{Number(d.price).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                        {!(item.durations || item.service_item_durations || []).length && (
                          <Typography variant="caption" color="text.secondary">
                            No durations configured
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </SectionCard>
            </Grid>
          )}

          {benefits.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Benefits" icon={SpaIcon}>
                <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 1 }}>
                  {benefits.map((b, i) => (
                    <Box
                      key={b.id || i}
                      sx={{
                        py: 1,
                        px: 1.25,
                        bgcolor: BRAND.greenMuted,
                        borderLeft: `3px solid ${BRAND.green}`,
                      }}
                    >
                      {b.heading && (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
                          {b.heading}
                        </Typography>
                      )}
                      {b.description && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                          {b.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </SectionCard>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, px: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Created {formatDateTime(service.created_at)}
                </Typography>
              </Box>
              {service.updated_at && (
                <Typography variant="caption" color="text.secondary">
                  Updated {formatDateTime(service.updated_at)}
                </Typography>
              )}
              {service.id && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  ID: {service.id}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: 2.5,
            border: "2px solid",
            borderColor: BRAND.greenLight,
            borderRadius: 1,
            bgcolor: BRAND.greenMuted,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              pb: 1.5,
              borderBottom: "1px solid",
              borderColor: "rgba(132, 153, 79, 0.25)",
            }}
          >
            <Box sx={{ width: 8, height: 8, bgcolor: BRAND.orange, borderRadius: "50%" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRAND.greenDark }}>
              Admin actions
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              gap: 1,
              "& .MuiButton-root": {
                ...ACTION_BTN_SX,
                width: { xs: "100%", sm: "auto" },
              },
            }}
          >
            {onToggleActive && (
              <Button
                variant="outlined"
                size="small"
                startIcon={service.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                onClick={() => onToggleActive(service)}
              >
                {service.is_active ? "Deactivate" : "Activate"}
              </Button>
            )}
            {onEdit && (
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => onEdit(service)}>
                Edit service
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(service)}
                sx={{
                  borderColor: "#ef4444",
                  color: "#dc2626",
                  "&:hover": { borderColor: "#dc2626", bgcolor: "#ef444410" },
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontSize: "0.875rem",
            px: 3,
            backgroundColor: "secondary.main",
            "&:hover": { backgroundColor: "secondary.dark" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
