import React, { useState } from "react";
import { Box, Typography, Tooltip, Button } from "@mui/material";
import {
  CalendarToday, ContentCopy, Check, LocalOffer, ReceiptLong,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import StyledButton from "../common09/StyledButton";
import UseVoucherDialog from "./UseVoucherDialog";
import {
  STATUS_CHIP,
  ACTIVE_STATUSES,
  formatDateShort,
  normalizeCatalogVoucher,
  normalizeIssuedVoucher,
} from "./voucherDisplayUtils";
import { copyToClipboard } from "../../utils/clipboard";

const NOTCH = 20;

// Dashed notch pseudo-element for the right panel (creates tear-line circle cutout)
const notchBefore = {
  content: '""',
  position: "absolute",
  width:  NOTCH,
  height: NOTCH,
  borderRadius: "50%",
  bgcolor: "#fff",
  zIndex: 1,
  // xs – horizontal tear: notch at top-center
  left: `calc(50% - ${NOTCH / 2}px)`,
  top:  -(NOTCH / 2),
  // sm+ – vertical tear: notch at left-center
  "@media (min-width: 600px)": {
    left:      -(NOTCH / 2),
    top:       "50%",
    transform: "translateY(-50%)",
  },
};

function MetaRow({ Icon, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
      <Box
        sx={{
          width: 24, height: 24, borderRadius: "50%",
          bgcolor: "#f3f4f6", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {React.createElement(Icon, { sx: { fontSize: 12, color: "text.disabled" } })}
      </Box>
      <Typography variant="caption" color="text.secondary" fontSize="0.76rem" lineHeight={1.4}>
        {children}
      </Typography>
    </Box>
  );
}

/**
 * VoucherTicketCard — unified ticket-style voucher card.
 *
 * variant: "shop" | "list" | "compact" | "hero"
 *
 * For shop (catalog): pass flat props (title, description, voucher_type, …, onClick).
 * For list/compact/hero (user-issued): pass voucher={<issued voucher object>}.
 */
export default function VoucherTicketCard({
  variant = "shop",
  // user-issued shape
  voucher: voucherProp,
  // catalog (shop) flat props
  title: titleProp, description: descProp,
  image, image_front_url, voucher_type, discount_type, discount_value,
  purchase_price, validity_start, validity_end,
  onClick,
}) {
  const [copied, setCopied] = useState(false);
  const [useVoucherOpen, setUseVoucherOpen] = useState(false);

  const norm = voucherProp
    ? normalizeIssuedVoucher(voucherProp)
    : normalizeCatalogVoucher({
        title: titleProp, description: descProp, image, image_front_url,
        voucher_type, discount_type, discount_value, purchase_price,
        validity_start, validity_end,
      });

  const {
    title, description, category,
    discountValue, discountUnit, priceDisplay,
    validityStart, validityEnd, imageUrl,
    themeColor, themeTextColor,
    status, code, minSpend, dateInfo,
  } = norm;

  const isInactive  = !ACTIVE_STATUSES.includes(status) && status !== null;
  const chipStyle   = STATUS_CHIP[status] || null;

  const isShop    = variant === "shop";
  const isList    = variant === "list";
  const isCompact = variant === "compact";
  const isHero    = variant === "hero";

  const copyCode = () => {
    copyToClipboard(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Left panel width (drives notch x-position) ──────────────────────────
  const leftWidth = isHero ? { xs: "100%", sm: 160 } : isCompact ? { xs: "100%", sm: 100 } : { xs: "100%", sm: 130 };

  // ── Outer card styling ───────────────────────────────────────────────────
  const cardSx = {
    position: "relative",
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    overflow: "hidden",
    borderRadius: isHero ? 0 : 2,
    border: isHero ? "none" : "1px solid",
    borderColor: "divider",
    boxShadow: isHero ? "none" : "0 2px 12px rgba(71,103,47,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: isShop ? "pointer" : "default",
    opacity: isInactive ? 0.72 : 1,
    ...((isShop || isList) && {
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 24px rgba(71,103,47,0.15)",
      },
    }),
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Optional image strip — shop variant only */}
      {isShop && imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt={title}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          sx={{
            width: "100%",
            height: 140,
            objectFit: "cover",
            display: "block",
            borderRadius: "8px 8px 0 0",
          }}
        />
      )}

      {/* ── Ticket body ─────────────────────────────────────────────────── */}
      <Box onClick={isShop ? onClick : undefined} sx={cardSx}>

        {/* ── Left: discount panel ────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: themeColor,
            flexShrink: 0,
            minWidth: leftWidth,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: isHero ? 4 : 2.5 },
            py: isCompact ? 2 : { xs: 2.5, sm: 3 },
            textAlign: "center",
          }}
        >
          {/* Discount value + unit */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.25 }}>
            <Typography
              fontWeight={800}
              lineHeight={1}
              color={themeTextColor}
              fontSize={
                isHero    ? { xs: "2.5rem", md: "3.5rem" } :
                isCompact ? "1.5rem" :
                            { xs: "1.6rem", sm: "1.9rem" }
              }
            >
              {discountValue}
            </Typography>
            {discountUnit && (
              <Typography
                fontWeight={700}
                color={themeTextColor}
                fontSize={isHero ? "1.1rem" : "0.85rem"}
              >
                {` ${discountUnit}`}
              </Typography>
            )}
          </Box>

          {/* Category / type label below discount */}
          {category && (
            <Typography
              fontSize={isCompact ? "0.6rem" : "0.7rem"}
              fontWeight={600}
              color={themeTextColor}
              mt={0.5}
              sx={{ opacity: 0.85, maxWidth: 110 }}
            >
              {category}
            </Typography>
          )}

          {/* Title line on left panel — compact only (mirrors VoucherWidget) */}
          {isCompact && title && (
            <Typography
              fontSize="0.68rem"
              color={themeTextColor}
              mt={0.75}
              sx={{ opacity: 0.9, maxWidth: 90 }}
              noWrap
            >
              {title}
            </Typography>
          )}
        </Box>

        {/* ── Right: details panel ────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            px: { xs: 2, sm: isHero ? 3.5 : 2.5 },
            py: isCompact ? 2 : { xs: 2, sm: 2.5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "#fff",
            // Tear-line dashed divider
            borderLeft: { xs: "none", sm: "2px dashed rgba(0,0,0,0.12)" },
            borderTop:  { xs: "2px dashed rgba(0,0,0,0.12)", sm: "none" },
            // Notch circle at tear-line midpoint
            "&::before": notchBefore,
          }}
        >

          {/* ── SHOP ─────────────────────────────────────────────────── */}
          {isShop && (
            <>
              <Typography
                fontWeight={700}
                fontSize={{ xs: "0.9rem", sm: "1rem" }}
                color="text.primary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
              {description && (
                <Typography
                  fontSize="0.78rem"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    mb: 1,
                  }}
                >
                  {description}
                </Typography>
              )}
              {priceDisplay && (
                <Typography fontSize="0.82rem" fontWeight={700} color="text.primary" mb={0.5}>
                  Price: {priceDisplay}
                </Typography>
              )}
              {(validityStart || validityEnd) && (
                <Typography fontSize="0.72rem" color="text.disabled" mb={0.75}>
                  Valid: {formatDateShort(validityStart)} – {formatDateShort(validityEnd)}
                </Typography>
              )}
              <Box
                component="span"
                sx={{
                  mt: "auto",
                  color: "secondary.dark",
                  textDecoration: "underline",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                View Details →
              </Box>
            </>
          )}

          {/* ── LIST ─────────────────────────────────────────────────── */}
          {isList && (
            <>
              {/* Status chip */}
              {chipStyle && (
                <Box
                  sx={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    px: 1.25, py: 0.3,
                    mb: 0.75,
                    bgcolor: chipStyle.bg,
                    color: chipStyle.color,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    borderRadius: 0,
                  }}
                >
                  {chipStyle.label}
                </Box>
              )}

              <Typography
                fontWeight={700}
                fontSize={{ xs: "0.9rem", sm: "1rem" }}
                color="text.primary"
                mb={0.25}
              >
                {title}
              </Typography>

              {description && (
                <Typography
                  fontSize="0.78rem"
                  color="text.secondary"
                  mb={0.5}
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </Typography>
              )}

              {dateInfo && (
                <MetaRow Icon={CalendarToday}>{dateInfo.short}</MetaRow>
              )}

              {/* Code + copy button */}
              {code && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
                  <Box
                    sx={{
                      width: 24, height: 24, borderRadius: "50%",
                      bgcolor: "#f3f4f6", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <LocalOffer sx={{ fontSize: 12, color: "text.disabled" }} />
                  </Box>
                  <Typography variant="caption" fontSize="0.76rem" color="text.secondary">
                    Code:{" "}
                    <Typography
                      component="span"
                      fontFamily="monospace"
                      fontWeight={700}
                      fontSize="0.76rem"
                      color="text.primary"
                      letterSpacing={0.5}
                    >
                      {code}
                    </Typography>
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Copy code"} placement="top">
                    <Box
                      onClick={(e) => { e.stopPropagation(); copyCode(); }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        color: copied ? "success.main" : "text.disabled",
                        "&:hover": { color: "secondary.main" },
                      }}
                    >
                      {copied ? <Check sx={{ fontSize: 14 }} /> : <ContentCopy sx={{ fontSize: 14 }} />}
                    </Box>
                  </Tooltip>
                </Box>
              )}

              <MetaRow Icon={ReceiptLong}>
                Min. Spend: {minSpend || "No minimum"}
              </MetaRow>

              {/* View Details + Use Voucher */}
              {norm.id && (
                <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <StyledButton
                    text="View Details"
                    to={`/my-account/vouchers/${norm.id}`}
                    variant="primary"
                    sx={{ fontSize: "0.8rem", px: 2, py: 0.75, minWidth: 110 }}
                  />
                  {ACTIVE_STATUSES.includes(status) && code && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EventAvailableIcon sx={{ fontSize: "0.9rem !important" }} />}
                      onClick={(e) => { e.stopPropagation(); setUseVoucherOpen(true); }}
                      sx={{
                        borderRadius: 0,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        px: 1.5,
                        py: 0.75,
                        borderColor: "secondary.main",
                        color: "secondary.dark",
                        "&:hover": { bgcolor: "#e8f5e9", borderColor: "secondary.dark" },
                      }}
                    >
                      Use Voucher
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}

          {/* ── COMPACT ──────────────────────────────────────────────── */}
          {isCompact && (
            <>
              {code && (
                <>
                  <Typography
                    fontSize="0.68rem"
                    color="text.disabled"
                    lineHeight={1.2}
                  >
                    Code:
                  </Typography>
                  <Typography
                    fontFamily="monospace"
                    fontWeight={700}
                    fontSize="0.95rem"
                    color="text.primary"
                    letterSpacing={1.5}
                    mb={0.75}
                  >
                    {code}
                  </Typography>
                </>
              )}
              {dateInfo && (
                <>
                  <Typography fontSize="0.66rem" color="text.disabled" lineHeight={1.2}>
                    Valid until
                  </Typography>
                  <Typography fontSize="0.8rem" fontWeight={600} color="text.primary">
                    {dateInfo.value}
                  </Typography>
                </>
              )}
            </>
          )}

          {/* ── HERO ─────────────────────────────────────────────────── */}
          {isHero && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                <Typography
                  fontWeight={700}
                  fontSize={{ xs: "1.1rem", md: "1.3rem" }}
                  color="text.primary"
                >
                  {title}
                </Typography>
                {chipStyle && (
                  <Box
                    sx={{
                      px: 1.5, py: 0.4,
                      bgcolor: chipStyle.bg,
                      color: chipStyle.color,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      borderRadius: 0,
                      flexShrink: 0,
                    }}
                  >
                    {chipStyle.label}
                  </Box>
                )}
              </Box>
              {description && (
                <Typography
                  fontSize="0.92rem"
                  color="text.secondary"
                  sx={{ opacity: 0.9, flex: 1 }}
                >
                  {description}
                </Typography>
              )}
              {category && (
                <Typography
                  fontSize="0.8rem"
                  fontWeight={600}
                  color="secondary.main"
                  mt={1}
                >
                  {category}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Use Voucher dialog — list variant only */}
      {isList && voucherProp && (
        <UseVoucherDialog
          open={useVoucherOpen}
          onClose={() => setUseVoucherOpen(false)}
          voucher={voucherProp}
        />
      )}
    </Box>
  );
}
