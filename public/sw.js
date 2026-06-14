// Rehoboth PWA Service Worker — Cache API (no workbox-build dependency)
// Version: replaced automatically on each `npm run build`
const SW_VERSION = "v1.0.0";

const PRECACHE = "rehoboth-precache-" + SW_VERSION;
const IMG_CACHE = "rehoboth-images";
const API_CACHE = "rehoboth-api-public";
const FONTS_CSS = "rehoboth-fonts-css";
const FONTS_FNT = "rehoboth-fonts-files";
const PAGES_CACHE = "rehoboth-pages";

// ── Assets to precache on install ────────────────────────────────────────────
// Minimal shell — full JS/CSS is version-hashed so list by pattern not filename.
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/rehoboth-logo-fa.webp",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const API_ORIGIN = "https://api.rehobothhealthmassage.com";

function isPublicApiRead(request) {
  if (request.method !== "GET") return false;
  try {
    const url = new URL(request.url);
    if (url.hostname !== "api.rehobothhealthmassage.com") return false;
    return /^\/(services|team|blog|reviews|vouchers\/purchase|social-links|site-settings\/public|reviews\/stats)/.test(
      url.pathname
    );
  } catch {
    return false;
  }
}

function isNetworkOnly(request) {
  try {
    const url = new URL(request.url);
    if (url.hostname !== "api.rehobothhealthmassage.com") return false;
    // Never cache auth, payments, uploads, chat, appointments, admin, socket.io
    return /\/(auth|users|upload|stripe|paypal|appointments|chat|newsletter|contact|admin|socket\.io)/.test(
      url.pathname
    ) || request.method !== "GET";
  } catch {
    return false;
  }
}

function isImage(request) {
  return request.destination === "image" ||
    /\.(png|webp|jpg|jpeg|svg|gif|ico)$/i.test(new URL(request.url).pathname);
}

function isGoogleFontsCss(request) {
  try {
    return new URL(request.url).hostname === "fonts.googleapis.com";
  } catch { return false; }
}

function isGoogleFontsFile(request) {
  try {
    return new URL(request.url).hostname === "fonts.gstatic.com";
  } catch { return false; }
}

// ── Install: precache the app shell ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch((err) => {
        // Don't fail install if a precache asset is missing
        console.warn("[SW] Precache partial failure:", err);
      })
    )
  );
  // Don't skip waiting automatically — PwaUpdatePrompt handles it
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, IMG_CACHE, API_CACHE, FONTS_CSS, FONTS_FNT, PAGES_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !currentCaches.includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Pass through non-GET navigation to admin routes without SW interference
  if (request.mode === "navigate") {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) {
        return; // let browser handle it
      }
    } catch { /* continue */ }
  }

  // NetworkOnly: auth, payments, chat, socket.io
  if (isNetworkOnly(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Google Fonts CSS — StaleWhileRevalidate
  if (isGoogleFontsCss(request)) {
    event.respondWith(staleWhileRevalidate(FONTS_CSS, request));
    return;
  }

  // Google Fonts files — CacheFirst (immutable, year-long)
  if (isGoogleFontsFile(request)) {
    event.respondWith(cacheFirst(FONTS_FNT, request));
    return;
  }

  // Images — CacheFirst
  if (isImage(request)) {
    event.respondWith(cacheFirst(IMG_CACHE, request));
    return;
  }

  // Public read-only API — NetworkFirst with 3s timeout
  if (isPublicApiRead(request)) {
    event.respondWith(networkFirst(API_CACHE, request, 3000));
    return;
  }

  // SPA navigation — NetworkFirst, fall back to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(PAGES_CACHE, request, 3000).catch(() =>
        caches.match("/index.html")
      )
    );
    return;
  }

  // Static assets (JS/CSS/fonts already hashed by Vite) — CacheFirst
  if (request.destination === "script" || request.destination === "style" ||
      request.destination === "font") {
    event.respondWith(cacheFirst(PRECACHE, request));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── Strategy helpers ──────────────────────────────────────────────────────────
async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}

async function networkFirst(cacheName, request, timeoutMs) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    clearTimeout(timeout);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Network failed and no cache available");
  }
}

// ── SKIP_WAITING message from update prompt ───────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
