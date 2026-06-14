import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App.jsx";
import theme from "./theme.js";
import "./index.css";
import { registerServiceWorker } from "./utils/registerServiceWorker.js";
import { cleanupDevServiceWorkers } from "./utils/devPwaCleanup.js";

// Remove stale SW/caches from prod/preview testing — they break Vite dev imports
async function bootstrap() {
  await cleanupDevServiceWorkers();

  // Recover from Vite HMR chunk load failures without a manual refresh
  if (import.meta.env.DEV) {
    window.addEventListener("vite:preloadError", (event) => {
      event.preventDefault();
      const key = "vite:chunk-reload";
      if (sessionStorage.getItem(key) !== "1") {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    });
  }

  registerServiceWorker();

  // Disable browser scroll restoration to prevent scroll position from being remembered on refresh
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // Scroll to top on initial page load
  window.scrollTo(0, 0);

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

bootstrap();
