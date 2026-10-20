import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "virtual:imageforge/settings": new URL(
        "./tests/virtual-settings.ts",
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
