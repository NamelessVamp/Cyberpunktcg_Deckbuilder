import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // ← desactiva generación del manifest (ya lo tenemos en public/)
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: "afterlife-decks.[hash].js",
        chunkFileNames: "afterlife-decks.[hash].js",
        assetFileNames: "afterlife-decks.[hash].[ext]",
      },
    },
  },
});
