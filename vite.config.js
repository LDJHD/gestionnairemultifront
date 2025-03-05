import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/", // Assure que toutes les routes fonctionnent correctement
  plugins: [
    react(),
    VitePWA({ // ✅ Correction ici
      registerType: "autoUpdate",
      manifest: {
        name: "ATON HELIOSTORE",
        short_name: "Atonheliostore",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/image/logo.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/image/logo.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  build: {
    chunkSizeWarningLimit: 1000, // Augmente la limite pour éviter le warning
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Sépare les dépendances dans un fichier vendor.js
          }
        },
      },
    },
    sourcemap: false, // ✅ Désactive les sourcemaps en production
  },
});
