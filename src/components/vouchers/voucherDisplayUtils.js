/** Shared display helpers for all voucher card components. */

export const STATUS_CHIP = {
  active:  { label: "Active",  bg: "#ecfdf5", color: "#059669" },
  pending: { label: "Pending", bg: "#fff7ed", color: "#c2410c" },
  used:    { label: "Used",    bg: "#eff6ff", color: "#2563eb" },
  expired: { label: "Expired", bg: "#fef2f2", color: "#dc2626" },
  voided:  { label: "Voided",  bg: "#fff1f2", color: "#be123c" },
};

/** Statuses that mean the voucher is available to use. */
export const ACTIVE_STATUSES = ["active", "pending"];

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric", month: "short", day: "numeric",
  });
}

/**
 * Returns { label, value, short } for the user-issued voucher date context.
 * short is a single display string suitable for compact rows.
 */
export function parseDateLabel(voucher) {
  if (voucher.status === "used" && voucher.used_at) {
    const v = formatDate(voucher.used_at);
    return { label: "Used On", value: v, short: `Used on: ${v}` };
  }
  if (voucher.status === "expired" && voucher.expires_at) {
    const v = formatDate(voucher.expires_at);
    return { label: "Expired On", value: v, short: `Expired on: ${v}` };
  }
  if (voucher.expires_at) {
    const v = formatDate(voucher.expires_at);
    return { label: "Valid Until", value: v, short: `Valid until: ${v}` };
  }
  return { label: "Expiry", value: "—", short: "—" };
}

/**
 * Derives a discount label string from a user-issued voucher.
 * Prefers the backend-computed discountLabel, falls back to original_amount.
 */
export function parseDiscountLabel(voucher) {
  if (voucher.discountLabel) return voucher.discountLabel;
  const orig = parseFloat(voucher.original_amount) || 0;
  return orig > 0 ? `£${orig.toFixed(0)} OFF` : "—";
}

/**
 * Splits "10% OFF" -> { value: "10%", unit: "OFF" }
 * Splits "£50 OFF" -> { value: "£50", unit: "OFF" }
 * Splits "£99.00" -> { value: "£99.00", unit: "" }
 */
export function splitDiscountParts(label) {
  const m = (label || "").match(/^([£\d%]+(?:\.\d+)?)\s*(OFF|SERVICE|COVERAGE)?\s*(.*)$/);
  if (!m) return { value: label || "", unit: "" };
  return { value: m[1] || label, unit: m[2] || "" };
}

/**
 * Normalizes a public catalog voucher (flat props) into the shared display shape.
 */
export function normalizeCatalogVoucher({
  title, description, voucher_type, discount_type, discount_value,
  purchase_price, validity_start, validity_end, image_front_url, image,
}) {
  let discountValue = "OFFER";
  let discountUnit  = "";

  if (voucher_type === "gift") {
    if (purchase_price) {
      const p = parseFloat(purchase_price);
      discountValue = `£${p.toFixed(2)}`;
    } else if (discount_type === "full_coverage") {
      discountValue = "FULL";
      discountUnit  = "COVERAGE";
    } else if (discount_type === "amount" && discount_value) {
      discountValue = `£${parseFloat(discount_value).toFixed(2)}`;
    } else if (discount_value) {
      const v = parseFloat(discount_value);
      discountValue = Number.isFinite(v) ? `£${v.toFixed(2)}` : String(discount_value);
    }
  } else if (discount_type === "percent") {
    discountValue = `${discount_value}%`;
    discountUnit  = "OFF";
  } else if (discount_type === "amount") {
    discountValue = `£${discount_value}`;
    discountUnit  = "OFF";
  } else if (discount_type === "free_service") {
    discountValue = "FREE";
    discountUnit  = "SERVICE";
  } else if (discount_type === "full_coverage") {
    discountValue = "FULL";
    discountUnit  = "COVERAGE";
  }

  const priceDisplay = (() => {
    if (!purchase_price) return null;
    const p = parseFloat(purchase_price);
    return Number.isFinite(p) && p > 0 ? `£${p.toFixed(2)}` : null;
  })();

  const typeLabel =
    voucher_type === "promo" ? "Promotional" :
    voucher_type === "gift"  ? "Gift Card"   : "Voucher";

  return {
    title:         title || "Voucher",
    description:   description || "",
    typeLabel,
    discountValue,
    discountUnit,
    priceDisplay,
    validityStart: validity_start,
    validityEnd:   validity_end,
    imageUrl:      image_front_url || image || null,
    themeColor:    "#e8f5e9",
    themeTextColor:"#2e7d32",
    status:        null,
    code:          null,
    category:      typeLabel,
    minSpend:      null,
    dateInfo:      null,
    id:            null,
  };
}

/**
 * Normalizes a user-issued voucher (nested .vouchers shape) into the shared display shape.
 */
export function normalizeIssuedVoucher(voucher) {
  const label = parseDiscountLabel(voucher);
  const { value, unit } = splitDiscountParts(label);
  const dateInfo = parseDateLabel(voucher);

  return {
    title:         voucher.vouchers?.title || "Voucher",
    description:   voucher.vouchers?.description || "",
    typeLabel:     voucher.vouchers?.voucher_type === "gift" ? "Gift Card" : "Promotional",
    discountValue: value,
    discountUnit:  unit,
    priceDisplay:  null,
    validityStart: null,
    validityEnd:   voucher.expires_at || null,
    imageUrl:      null,
    themeColor:    voucher.themeColor    || "#e8f5e9",
    themeTextColor:voucher.themeTextColor || "#2e7d32",
    status:        voucher.status || null,
    code:          voucher.code   || null,
    category:      voucher.category || "All Services",
    minSpend:      voucher.minSpend || null,
    dateInfo,
    id:            voucher.id || null,
  };
}
