import settings from "virtual:imageforge/settings";
import type { ImageForgeSettings } from "./settings.js";

export interface ImageForgeUrlOptions {
  w?: unknown;
  h?: unknown;
  fit?: unknown;
  q?: unknown;
  f?: unknown;
}

const optionOrder = ["w", "h", "fit", "q", "f"] as const;

function isPassThroughUrl(path: string): boolean {
  return /^(?:https?:)?\/\//.test(path) || path.startsWith("data:");
}

export function resolveSourceUrl(
  path: string,
  configuration: Pick<ImageForgeSettings, "base" | "site">,
): string {
  if (isPassThroughUrl(path)) {
    return path;
  }

  const base = configuration.base ?? "/";
  const sourcePath = `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  return configuration.site
    ? new URL(sourcePath, configuration.site).toString()
    : sourcePath;
}

export function composeForgeUrl(
  sourceUrl: string,
  options: ImageForgeUrlOptions,
  configuration: Pick<ImageForgeSettings, "baseUrl" | "service">,
): string {
  if (!configuration.service) {
    throw new Error("Image Forge service is not configured");
  }

  const source = new URL(sourceUrl, "http://imageforge.local");
  const query = optionOrder
    .filter((name) => options[name] != null)
    .map((name) => `${name}=${String(options[name])}`)
    .join("&");
  const baseUrl = configuration.baseUrl.replace(/\/+$/, "");

  return `${baseUrl}/${configuration.service.replace(/^\/+|\/+$/g, "")}${source.pathname}?${query}`;
}

export function imageForge(
  path: string | null | undefined,
  options: ImageForgeUrlOptions = {},
): string | null {
  if (!path) {
    return null;
  }

  const sourceUrl = resolveSourceUrl(path, settings);
  if (options.w == null || isPassThroughUrl(path)) {
    return sourceUrl;
  }

  return composeForgeUrl(sourceUrl, options, settings);
}
