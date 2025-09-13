import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:4000'),
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/goals': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/progress': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/checkin': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/notifications': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
