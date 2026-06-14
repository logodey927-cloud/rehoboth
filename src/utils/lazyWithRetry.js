import { lazy } from "react";

/**
 * Wrap React.lazy() so a one-time full reload recovers from Vite HMR / chunk
 * load failures ("Failed to fetch dynamically imported module").
 */
export function lazyWithRetry(importFn) {
  return lazy(async () => {
    const storageKey = "vite:chunk-reload";
    const alreadyReloaded = sessionStorage.getItem(storageKey) === "1";

    try {
      const mod = await importFn();
      sessionStorage.removeItem(storageKey);
      return mod;
    } catch (err) {
      if (!alreadyReloaded) {
        sessionStorage.setItem(storageKey, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(storageKey);
      throw err;
    }
  });
}
