/**
 * Voucher QR helpers — encode/decode voucher codes for scan & display.
 */

/** Payload encoded in customer voucher QR (plain code). */
export function buildVoucherQrValue(code) {
  if (!code) return "";
  return String(code).trim().toUpperCase();
}

/**
 * Parse scanned QR text into a voucher code.
 * Supports plain codes and admin verify URLs with ?code=.
 */
export function parseVoucherCodeFromScan(raw) {
  if (!raw || typeof raw !== "string") return "";

  const text = raw.trim();
  if (!text) return "";

  try {
    if (text.includes("://") || text.startsWith("/")) {
      const url = text.startsWith("/")
        ? new URL(text, window.location.origin)
        : new URL(text);
      const fromQuery = url.searchParams.get("code");
      if (fromQuery) return fromQuery.trim().toUpperCase();

      const segments = url.pathname.split("/").filter(Boolean);
      const verifyIdx = segments.indexOf("verify");
      if (verifyIdx !== -1 && segments[verifyIdx + 1]) {
        return decodeURIComponent(segments[verifyIdx + 1]).trim().toUpperCase();
      }
    }
  } catch {
    // Not a URL — treat as plain code
  }

  return text.toUpperCase();
}

/** Optional admin verify URL (for printed materials / deep links). */
export function buildAdminVerifyUrl(code) {
  const normalized = buildVoucherQrValue(code);
  if (!normalized) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/admin/vouchers/verify?code=${encodeURIComponent(normalized)}`;
}
