import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Only proxy actual backend API calls — never proxy React Router paths (/auth/*, /sign-in, etc.)
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
