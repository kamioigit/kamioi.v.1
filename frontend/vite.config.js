import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Force IPv4 to avoid permission issues
    port: 4604,
    strictPort: false, // Allow fallback to next available port if 4000 is taken
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://127.0.0.1:5111",
        changeOrigin: false
      }
    }
  }
});
