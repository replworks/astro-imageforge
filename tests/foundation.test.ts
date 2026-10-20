import { describe, expect, it } from "vitest";
import imageforge from "../src/index.js";
import { imageForge } from "../src/runtime.js";
import {
  DEFAULT_BASE_URL,
  DEFAULT_PREFIX,
  resolveSettings,
} from "../src/settings.js";

describe("package foundation", () => {
  it("exports an Astro integration factory", () => {
    expect(imageforge().name).toBe("@replworks/astro-imageforge");
  });

  it("exports the runtime entry", () => {
    expect(imageForge()).toBeNull();
  });

  it("resolves defaults and gives options precedence over environment values", () => {
    expect(resolveSettings()).toEqual({
      baseUrl: DEFAULT_BASE_URL,
      prefix: DEFAULT_PREFIX,
    });
    expect(
      resolveSettings(
        {
          baseUrl: "https://custom.example",
          service: "custom",
          prefix: "img-",
        },
        {
          IMAGEFORGE_BASE_URL: "https://environment.example",
          IMAGEFORGE_SERVICE: "environment",
        },
      ),
    ).toEqual({
      baseUrl: "https://custom.example",
      service: "custom",
      prefix: "img-",
    });
  });
});
