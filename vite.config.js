import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
