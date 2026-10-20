import { defineConfig } from "astro/config";
import imageforge from "../../../src/index.ts";

export default defineConfig({
  base: "/docs/",
  site: "https://example.com",
  integrations: [
    imageforge({ baseUrl: "https://forge.example", service: "images" }),
  ],
});
