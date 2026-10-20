import type { ImageForgeUrlOptions } from "./runtime.js";

export interface ParsedDsl {
  options: ImageForgeUrlOptions;
  consumed: string[];
}

function boundedNumber(
  value: string,
  minimum: number,
  maximum: number,
): number | undefined {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) {
    return undefined;
  }

  return Math.min(maximum, Math.max(minimum, Number(value)));
}

export function parseDsl(value: string, prefix = "if-"): ParsedDsl {
  const options: ImageForgeUrlOptions = {};
  const consumed: string[] = [];
  let hasWidth = false;

  for (const token of value.split(/\s+/).filter(Boolean)) {
    if (!token.startsWith(prefix)) {
      continue;
    }

    const name = token.slice(prefix.length);
    const numberMatch = /^(w|h|q)-(.+)$/.exec(name);
    if (numberMatch) {
      const kind = numberMatch[1] as "w" | "h" | "q";
      const rawValue = numberMatch[2];
      const limits = kind === "q" ? [1, 100] : [0, 2000];
      const parsed = boundedNumber(rawValue, limits[0], limits[1]);
      if (parsed !== undefined) {
        options[kind] = parsed;
        consumed.push(token);
        if (kind === "w") {
          hasWidth = true;
        }
      }
      continue;
    }

    const fit = {
      fit: "fit",
      fill: "fill",
      crop: "fill",
      "fit-auto": "auto",
    }[name];
    if (fit) {
      options.fit = fit;
      consumed.push(token);
      continue;
    }

    const format = {
      webp: "webp",
      avif: "avif",
      jpeg: "jpeg",
      png: "png",
    }[name];
    if (format) {
      options.f = format;
      consumed.push(token);
      continue;
    }

    if (name === "auto") {
      delete options.f;
      consumed.push(token);
    }
  }

  if (consumed.length > 0 && !hasWidth) {
    options.w = 0;
  }

  return { options, consumed };
}
