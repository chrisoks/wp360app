import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const workPilotApi = process.env.WORKPILOT_API_PROXY ?? "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3010,
    strictPort: false,
    proxy: {
      "/api": {
        target: workPilotApi,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3011,
    strictPort: false,
  },
});
