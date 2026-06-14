/**
 * Register the PWA service worker in production only.
 * Dev mode (Vite HMR) breaks when a SW intercepts module requests.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        window.__pwaUpdateSW = (reloadPage = true) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
          if (reloadPage) {
            navigator.serviceWorker.addEventListener("controllerchange", () =>
              window.location.reload()
            );
          }
        };

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              window.dispatchEvent(new CustomEvent("pwa:update-available"));
            }
          });
        });
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));
  };

  // Register as early as possible so installability checks see a controlling SW.
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
