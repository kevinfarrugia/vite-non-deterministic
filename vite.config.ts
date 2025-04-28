import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            const parts = id.split("node_modules/");
            if (parts.length > 1 && parts[1].includes("react")) {
              return `react`;
            }
          }
        },
      },
    },
  },
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
});
