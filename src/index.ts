import type { AstroIntegration } from "astro";
import type { Plugin } from "vite";
import { loadSettings, type ImageForgeOptions } from "./settings.js";

export type { ImageForgeOptions } from "./settings.js";

const virtualModuleId = "virtual:imageforge/settings";
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

function settingsPlugin(settings: ReturnType<typeof loadSettings>): Plugin {
  return {
    name: "astro-imageforge-settings",
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : undefined;
    },
    load(id) {
      return id === resolvedVirtualModuleId
        ? `export default ${JSON.stringify(settings)};`
        : undefined;
    },
  };
}

const integration = (options: ImageForgeOptions = {}): AstroIntegration => ({
  name: "@replworks/astro-imageforge",
  hooks: {
    "astro:config:setup": ({ command, config, updateConfig }) => {
      const mode = command === "dev" ? "development" : "production";
      const settings = {
        ...loadSettings(options, mode, config.root.pathname),
        base: config.base,
        site: config.site?.toString(),
      };
      updateConfig({
        vite: {
          plugins: [settingsPlugin(settings)],
          ssr: {
            noExternal: ["@replworks/astro-imageforge"],
          },
        },
      });
    },
  },
});

export default integration;
