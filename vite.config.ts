import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const basePathRaw = process.env.VITE_BASE_PATH ?? "/";
const basePath = basePathRaw.endsWith("/") ? basePathRaw : `${basePathRaw}/`;
const faviconPath = basePath === "/" ? "/favicon.svg" : `${basePath}favicon.svg`;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "SkinnerBox",
        short_name: "SkinnerBox",
        description: "Routine and deadline tracker with variable reinforcement rewards",
        theme_color: "#f6f4ef",
        background_color: "#f6f4ef",
        display: "standalone",
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: faviconPath,
            sizes: "192x192",
            type: "image/svg+xml"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"]
      }
    })
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.test.ts", "src/test/**/*.test.tsx"]
  }
});
