import type { Element } from "hast";
import { parseDsl } from "./parser.js";
import { imageForgeWithSettings } from "./url-api.js";
import type { ImageForgeSettings } from "./settings.js";

interface ImageForgeHastPlugin {
  name: string;
  element: {
    filter: string[];
    visit: (node: Readonly<Element>, context: MarkdownVisitorContext) => void;
  };
}

interface MarkdownVisitorContext {
  setProperty(node: Readonly<Element>, key: string, value: unknown): void;
}

function remainingTokens(value: string, consumed: string[]): string {
  const consumedSet = new Set(consumed);
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !consumedSet.has(token))
    .join(" ");
}

export function createMarkdownImagePlugin(
  settings: ImageForgeSettings,
): ImageForgeHastPlugin {
  return {
    name: "astro-imageforge-markdown-images",
    element: {
      filter: ["img"],
      visit(node, context) {
        const title = node.properties.title;
        if (typeof title !== "string") {
          return;
        }

        const parsed = parseDsl(title, settings.prefix);
        if (parsed.consumed.length === 0) {
          return;
        }

        const remaining = remainingTokens(title, parsed.consumed);
        context.setProperty(node, "title", remaining || null);

        const src = node.properties.src;
        if (
          typeof src === "string" &&
          src.startsWith("/") &&
          !src.startsWith("//")
        ) {
          context.setProperty(
            node,
            "src",
            imageForgeWithSettings(src, parsed.options, settings),
          );
        }
      },
    },
  };
}
