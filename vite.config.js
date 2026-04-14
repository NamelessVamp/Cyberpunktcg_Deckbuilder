import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// NON OMNIS MORIAR — vite.config.js sin vite-plugin-pwa
// PWA implementado manualmente via public/manifest.webmanifest + public/sw.js
export default defineConfig({
  plugins: [react()],
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
