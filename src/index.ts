import type { AstroConfig, AstroIntegration } from "astro";

export interface ImageForgeOptions {
  baseUrl?: string;
  service?: string;
  prefix?: string;
}

const integration = (options: ImageForgeOptions = {}): AstroIntegration => ({
  name: "@replworks/astro-imageforge",
  hooks: {
    "astro:config:setup": ({
      updateConfig,
    }: {
      updateConfig: (config: Partial<AstroConfig>) => void;
    }) => {
      updateConfig({});
    },
  },
});

export default integration;
