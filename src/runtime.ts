import settings from "virtual:imageforge/settings";
import type { ImageForgeSettings } from "./settings.js";

export interface ImageForgeUrlOptions {
  w?: unknown;
  h?: unknown;
  fit?: unknown;
  q?: unknown;
  f?: unknown;
}

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

export function imageForge(
  path: string | null | undefined,
  options: ImageForgeUrlOptions = {},
): string | null {
  if (!path) {
    return null;
  }

  const sourceUrl = resolveSourceUrl(path, settings);
  return options.w == null ? sourceUrl : sourceUrl;
}
