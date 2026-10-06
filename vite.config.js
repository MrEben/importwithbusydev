import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  envPrefix: ["VITE_", "PIXEL_ID"],
  plugins: [
    react(),
    tailwindcss(),
  ],
});