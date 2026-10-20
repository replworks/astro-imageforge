import { describe, expect, it } from "vitest";
import imageforge from "../src/index.js";
import { imageForge, resolveSourceUrl } from "../src/runtime.js";
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
    expect(imageForge(null)).toBeNull();
  });

  it("resolves source URLs for base and site settings", () => {
    expect(resolveSourceUrl("cat.jpg", { base: "/" })).toBe("/cat.jpg");
    expect(resolveSourceUrl("/cat.jpg", { base: "/docs" })).toBe(
      "/docs/cat.jpg",
    );
    expect(resolveSourceUrl("/cat.jpg", { base: "/docs/" })).toBe(
      "/docs/cat.jpg",
    );
    expect(
      resolveSourceUrl("/cat.jpg", {
        base: "/docs",
        site: "https://example.com",
      }),
    ).toBe("https://example.com/docs/cat.jpg");
  });

  it("passes through supported absolute URL forms", () => {
    expect(imageForge("https://example.com/cat.jpg")).toBe(
      "https://example.com/cat.jpg",
    );
    expect(imageForge("//cdn.example.com/cat.jpg")).toBe(
      "//cdn.example.com/cat.jpg",
    );
    expect(imageForge("data:image/gif;base64,AAAA")).toBe(
      "data:image/gif;base64,AAAA",
    );
  });

  it("returns the source URL when width is absent", () => {
    expect(
      imageForge("cat.jpg", { h: 320, fit: "fill", q: 80, f: "webp" }),
    ).toBe("/cat.jpg");
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
