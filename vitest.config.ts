import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      thresholds: {
        branches: 94,
        functions: 95,
        lines: 95,
        statements: 95,
      },
      include: ["components/**/*.tsx", "hooks/**/*.ts", "lib/**/*.ts"],
      exclude: ["components/sections/Hero.tsx"],
    },
  },
});
