/**
 * Frontend environment helpers — all URLs come from Vite env vars.
 */

function requireViteEnv(name) {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Set it in rehoboth/.env (see .env.example).`
    );
  }
  return value;
}

/** Replace localhost in API URL when testing from a phone on the same WiFi. */
function resolveHostInUrl(url) {
  if (typeof window === "undefined") return url;

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return url;

  return url.replace("localhost", hostname).replace("127.0.0.1", hostname);
}

function assertHttpApiUrl(url, source = "VITE_API_URL") {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      `${source} must start with http:// or https:// (got "${url.slice(0, 40)}…"). ` +
        "Use your Railway public API URL, e.g. https://rehoboth-api-production.up.railway.app/api — not DATABASE_URL or REDIS_URL."
    );
  }
}

/** API base URL, e.g. https://api.example.com/api */
export function getApiBaseUrl() {
  const url = resolveHostInUrl(requireViteEnv("VITE_API_URL"));
  assertHttpApiUrl(url);
  return url;
}

/** Socket / HTTP origin without the /api suffix */
export function getServerOrigin() {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}

/** Public site origin for share links, SEO, etc. */
export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  if (typeof window !== "undefined") return window.location.origin;

  throw new Error(
    "Missing VITE_SITE_URL. Set it in rehoboth/.env for non-browser contexts."
  );
}
