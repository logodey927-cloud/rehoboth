#!/usr/bin/env node
/**
 * Verifies PWA assets exist in dist/ after `npm run build`.
 * Run: node scripts/verify-pwa-build.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const required = [
  "index.html",
  "sw.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png",
];

let failed = false;

for (const file of required) {
  const path = resolve(dist, file);
  if (!existsSync(path)) {
    console.error(`❌ Missing: dist/${file}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

const indexHtml = readFileSync(resolve(dist, "index.html"), "utf8");
if (!indexHtml.includes('rel="manifest"')) {
  console.error("❌ dist/index.html has no manifest link");
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(resolve(dist, "manifest.webmanifest"), "utf8")
);
if (!manifest.icons?.some((i) => i.sizes === "192x192")) {
  console.error("❌ manifest missing 192x192 icon");
  process.exit(1);
}

const sw = readFileSync(resolve(dist, "sw.js"), "utf8");
if (!sw.includes("addEventListener(\"fetch\"")) {
  console.error("❌ sw.js has no fetch handler");
  process.exit(1);
}

console.log("✅ PWA build verification passed");
