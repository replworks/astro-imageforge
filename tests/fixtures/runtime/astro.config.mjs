import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import imageforge from "../../../src/index.ts";

export default defineConfig({
  base: "/docs/",
  site: "https://example.com",
  integrations: [
    mdx(),
    imageforge({ baseUrl: "https://forge.example", service: "images" }),
  ],
});
