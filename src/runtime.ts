import settings from "virtual:imageforge/settings";
import {
  imageForgeWithSettings,
  resolveSourceUrl,
  type ImageForgeUrlOptions,
} from "./url-api.js";

export type { ImageForgeUrlOptions } from "./url-api.js";
export { composeForgeUrl, resolveSourceUrl } from "./url-api.js";

export function imageForge(
  path: string | null | undefined,
  options: ImageForgeUrlOptions = {},
): string | null {
  return imageForgeWithSettings(path, options, settings);
}
