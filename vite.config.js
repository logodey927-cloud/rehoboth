import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Stamp a unique SW version and inject API origin on each production build. */
function pwaSwVersionPlugin(apiUrl) {
  return {
    name: "pwa-sw-version",
    apply: "build",
    closeBundle() {
      const swPath = resolve(__dirname, "dist/sw.js");
      let source = readFileSync(swPath, "utf8");
      const buildId = `build-${Date.now()}`;
      source = source.replace(
        /const SW_VERSION = "[^"]+"/,
        `const SW_VERSION = "${buildId}"`
      );

      if (!apiUrl) {
        throw new Error("VITE_API_URL is required for production builds (service worker API caching).");
      }
      const apiOrigin = new URL(apiUrl.replace(/\/api\/?$/, "")).origin;
      source = source.replace("__VITE_API_ORIGIN__", apiOrigin);

      writeFileSync(swPath, source);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;

  return {
  plugins: [react(), pwaSwVersionPlugin(apiUrl)],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: true,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url === "/sw.js" || url === "/manifest.webmanifest") {
          res.statusCode = 404;
          res.end("");
          return;
        }
        next();
      });
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
  },
};
});
