/**
 * In dev, unregister any service workers and clear caches left over from
 * production / preview testing. A stale SW intercepting /src/* breaks Vite HMR
 * and causes "Failed to fetch dynamically imported module" errors.
 */
export async function cleanupDevServiceWorkers() {
  if (!import.meta.env.DEV) return;

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}
