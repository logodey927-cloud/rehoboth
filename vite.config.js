import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Stamp a unique SW version on each production build so caches invalidate. */
function pwaSwVersionPlugin() {
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
      writeFileSync(swPath, source);
    },
  };
}

export default defineConfig({
  plugins: [react(), pwaSwVersionPlugin()],
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
});
