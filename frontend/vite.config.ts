import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // loadEnv reads .env, .env.local, .env.{mode}, .env.{mode}.local
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || "http://localhost:8080";

  return {
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
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
})
