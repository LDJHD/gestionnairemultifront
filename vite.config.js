import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/", // Assure que toutes les routes fonctionnent correctement
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // En dev, on installe un SW « no-op » : il ne met rien en cache mais il
      // neutralise un éventuel SW de production resté actif (sinon page blanche).
      devOptions: {
        enabled: true,
        type: "module",
        suppressWarnings: true,
      },
      manifest: {
        name: "Le Gestionnaire",
        short_name: "Gestionnaire",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4f46e5",
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
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react-vendor";
            if (/node_modules\/(apexcharts|react-apexcharts)\//.test(id)) return "charts-vendor";
            if (/node_modules\/(\@material-tailwind|\@headlessui|\@heroicons|tw-elements-react)\//.test(id)) return "ui-vendor";
            return "vendor";
          }
        },
      },
    },
    sourcemap: false, // ✅ Désactive les sourcemaps en production
  },
});
