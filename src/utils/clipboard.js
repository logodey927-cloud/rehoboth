/**
 * Copy text to clipboard.
 * Uses the modern Clipboard API when available (HTTPS / localhost).
 * Falls back to document.execCommand for plain-HTTP local dev.
 * Returns a Promise that resolves to true on success, false on failure.
 */
export function copyToClipboard(text) {
  if (!text) return Promise.resolve(false);

  // Modern API — requires secure context
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => legacyCopy(text));
  }

  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
