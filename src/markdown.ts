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
  mdxJsxTextElement: {
    filter: string[];
    visit: (
      node: Readonly<MdxImageNode>,
      context: MarkdownVisitorContext,
    ) => void;
  };
  mdxJsxFlowElement: {
    filter: string[];
    visit: (
      node: Readonly<MdxImageNode>,
      context: MarkdownVisitorContext,
    ) => void;
  };
}

interface MarkdownVisitorContext {
  setProperty(node: Readonly<Element>, key: string, value: unknown): void;
  replaceNode(node: Readonly<MdxImageNode>, replacement: MdxImageNode): void;
}

interface MdxAttribute {
  type: "mdxJsxAttribute" | "mdxJsxExpressionAttribute";
  name?: string;
  value?: string | { type: string; value: string } | null;
}

interface MdxImageNode {
  type: "mdxJsxTextElement" | "mdxJsxFlowElement";
  name: string | null;
  attributes: MdxAttribute[];
  children: unknown[];
}

function remainingTokens(value: string, consumed: string[]): string {
  const consumedSet = new Set(consumed);
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !consumedSet.has(token))
    .join(" ");
}

function transformMdxImage(
  node: Readonly<MdxImageNode>,
  context: MarkdownVisitorContext,
  settings: ImageForgeSettings,
): void {
  const classIndex = node.attributes.findIndex(
    (attribute) =>
      attribute.type === "mdxJsxAttribute" && attribute.name === "class",
  );
  if (classIndex < 0) {
    return;
  }

  const classAttribute = node.attributes[classIndex];
  if (typeof classAttribute.value !== "string") {
    return;
  }

  const parsed = parseDsl(classAttribute.value, settings.prefix);
  if (parsed.consumed.length === 0) {
    return;
  }

  const attributes = node.attributes.map((attribute) => ({ ...attribute }));
  const remaining = remainingTokens(classAttribute.value, parsed.consumed);
  if (remaining) {
    attributes[classIndex].value = remaining;
  } else {
    attributes.splice(classIndex, 1);
  }

  const srcAttribute = attributes.find(
    (attribute) =>
      attribute.type === "mdxJsxAttribute" && attribute.name === "src",
  );
  if (
    srcAttribute &&
    typeof srcAttribute.value === "string" &&
    srcAttribute.value.startsWith("/") &&
    !srcAttribute.value.startsWith("//")
  ) {
    srcAttribute.value = imageForgeWithSettings(
      srcAttribute.value,
      parsed.options,
      settings,
    );
  }

  context.replaceNode(node, { ...node, attributes });
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
    mdxJsxTextElement: {
      filter: ["img"],
      visit: (node, context) => transformMdxImage(node, context, settings),
    },
    mdxJsxFlowElement: {
      filter: ["img"],
      visit: (node, context) => transformMdxImage(node, context, settings),
    },
  };
}
