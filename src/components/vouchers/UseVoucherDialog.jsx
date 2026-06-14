import React, { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Avatar, Button, MenuItem,
  Select, FormControl, InputLabel, Chip, Divider,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocalOffer as LocalOfferIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import BookingModal from "../booking/BookingModal";
import { useUserAuth } from "../../contexts/UserAuthContext";

// ── helpers ──────────────────────────────────────────────────────────────────

function parseEligibleServices(eligible) {
  if (!eligible || !Array.isArray(eligible) || eligible.length === 0) return [];
  const first = eligible[0];
  if (!first || typeof first !== "object") return []; // UUID-only format; not expanded
  return eligible
    .filter((s) => s && (s.title || s.name))
    .map((s) => ({
      id:    s.id,
      title: s.title || s.name,
      type:  s.type || "treatment",
      category: s.parent_service_title || s.category || "All Services",
    }));
}

function groupByCategory(services) {
  return services.reduce((acc, s) => {
    const cat = s.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});
}

// ── component ─────────────────────────────────────────────────────────────────

export default function UseVoucherDialog({ open, onClose, voucher }) {
  const { user } = useUserAuth();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  // Reset selections when the dialog opens
  React.useEffect(() => {
    if (!open) return;
    setSelectedCategory("");
    setSelectedTreatment("");
  }, [open]);

  const title        = voucher?.vouchers?.title || "Voucher";
  const code         = voucher?.code || "";
  const discountLabel = voucher?.discountLabel || "";
  const themeColor    = voucher?.themeColor || "#e8f5e9";
  const themeTextColor = voucher?.themeTextColor || "#2e7d32";

  const services  = useMemo(() => parseEligibleServices(voucher?.vouchers?.eligible_services), [voucher]);
  const grouped   = useMemo(() => groupByCategory(services), [services]);
  const categories = useMemo(() => Object.keys(grouped), [grouped]);
  const hasEligible = services.length > 0;
  const singleCategory = categories.length === 1;

  // Auto-select the only category
  const effectiveCategory = singleCategory ? categories[0] : selectedCategory;
  const treatmentsInCategory = effectiveCategory ? (grouped[effectiveCategory] || []) : [];

  const userName  = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "";
  const userEmail = user?.email || "";
  const userInitials = userName ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const handleBook = () => {
    onClose();
    setBookingOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: themeColor,
            px: 3, py: 2.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 48, height: 48,
              bgcolor: themeTextColor,
              borderRadius: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LocalOfferIcon sx={{ color: "#fff", fontSize: 24 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} fontSize="1.1rem" color={themeTextColor} lineHeight={1.25}>
              {title}
            </Typography>
            {discountLabel && (
              <Typography fontWeight={800} fontSize="1.5rem" color={themeTextColor} lineHeight={1.2}>
                {discountLabel}
              </Typography>
            )}
            {code && (
              <Typography
                fontFamily="monospace"
                fontSize="0.82rem"
                fontWeight={600}
                color={themeTextColor}
                sx={{ opacity: 0.8, mt: 0.25 }}
              >
                {code}
              </Typography>
            )}
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: "absolute", top: 10, right: 10,
              color: themeTextColor,
              "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* ── Booking as ───────────────────────────────────────── */}
          {user && (
            <Box>
              <Typography
                fontSize="0.72rem"
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="0.07em"
                mb={1}
              >
                Booking as
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 38, height: 38, borderRadius: 1,
                    bgcolor: "secondary.main", fontSize: "0.85rem", fontWeight: 700,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box>
                  <Typography fontWeight={700} fontSize="0.9rem" color="text.primary" lineHeight={1.3}>
                    {userName || userEmail}
                  </Typography>
                  {userName && (
                    <Typography fontSize="0.78rem" color="text.secondary">
                      {userEmail}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          <Divider />

          {/* ── Eligible treatments ───────────────────────────────── */}
          {!hasEligible ? (
            <Box sx={{ py: 1 }}>
              <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.07em" mb={1}>
                Eligible For
              </Typography>
              <Chip
                label="All Treatments"
                size="small"
                sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, borderRadius: 0 }}
              />
            </Box>
          ) : (
            <Box>
              <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.07em" mb={1.5}>
                Select a Treatment
              </Typography>

              {/* Category selection — hidden when only one */}
              {!singleCategory && (
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize="0.8rem" fontWeight={600} color="text.primary" mb={1}>
                    Service Category
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {categories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        clickable
                        onClick={() => { setSelectedCategory(cat); setSelectedTreatment(""); }}
                        sx={{
                          borderRadius: 0,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          bgcolor: selectedCategory === cat ? "secondary.main" : "#f3f4f6",
                          color:  selectedCategory === cat ? "#fff" : "text.primary",
                          border: "1px solid",
                          borderColor: selectedCategory === cat ? "secondary.dark" : "transparent",
                          "&:hover": { bgcolor: "secondary.light", color: "#fff" },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Treatment dropdown — shown once a category is selected (or always for single category) */}
              {effectiveCategory && (
                <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}>
                  <InputLabel>
                    {singleCategory ? `${effectiveCategory} — select treatment` : "Select Treatment"}
                  </InputLabel>
                  <Select
                    value={selectedTreatment}
                    label={singleCategory ? `${effectiveCategory} — select treatment` : "Select Treatment"}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                    IconComponent={ExpandMoreIcon}
                  >
                    <MenuItem value="">
                      <em>Any treatment in this category</em>
                    </MenuItem>
                    {treatmentsInCategory.map((t) => (
                      <MenuItem key={t.id || t.title} value={t.title}>
                        {t.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Placeholder when category not yet selected */}
              {!singleCategory && !selectedCategory && (
                <Typography fontSize="0.82rem" color="text.secondary" mt={0.5}>
                  Select a service category above to see available treatments.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
          <Button
            onClick={onClose}
            sx={{ textTransform: "none", borderRadius: 0, color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBook}
            sx={{
              borderRadius: 0,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              bgcolor: "secondary.main",
              "&:hover": { bgcolor: "secondary.dark" },
            }}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* BookingModal opened after user confirms */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialStep={1}
        initialVoucherCode={code}
        title={`Book with Voucher: ${code}`}
      />
    </>
  );
}
