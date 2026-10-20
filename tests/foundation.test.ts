import { describe, expect, it } from "vitest";
import imageforge from "../src/index.js";
import {
  composeForgeUrl,
  imageForge,
  resolveSourceUrl,
} from "../src/runtime.js";
import {
  DEFAULT_BASE_URL,
  DEFAULT_PREFIX,
  resolveSettings,
} from "../src/settings.js";
import { parseDsl } from "../src/parser.js";

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

  it("composes a Forge URL in option order without encoding values", () => {
    expect(
      composeForgeUrl(
        "https://example.com/docs/cat.jpg",
        { w: 480, h: 320, fit: "fill", q: 80, f: "webp&raw" },
        { baseUrl: "https://img.repl.net", service: "service" },
      ),
    ).toBe(
      "https://img.repl.net/service/docs/cat.jpg?w=480&h=320&fit=fill&q=80&f=webp&raw",
    );
  });

  it("uses width zero and requires service only for Forge URLs", () => {
    expect(imageForge("cat.jpg", { w: 480 })).toBe(
      "https://img.repl.net/service/cat.jpg?w=480",
    );
    expect(() =>
      composeForgeUrl(
        "/cat.jpg",
        { w: 480 },
        { baseUrl: "https://img.repl.net" },
      ),
    ).toThrow(/service/i);
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

  it("maps every DSL token, clamps values, and uses the last value", () => {
    expect(
      parseDsl(
        "if-w--10 if-w-3000 if-h-320 if-q-0 if-q-120 if-crop if-fit-auto if-webp if-auto if-png",
      ),
    ).toEqual({
      options: { w: 2000, h: 320, q: 100, fit: "auto", f: "png" },
      consumed: [
        "if-w--10",
        "if-w-3000",
        "if-h-320",
        "if-q-0",
        "if-q-120",
        "if-crop",
        "if-fit-auto",
        "if-webp",
        "if-auto",
        "if-png",
      ],
    });
  });

  it("supplies width zero, preserves unknown tokens, and supports a custom prefix", () => {
    expect(parseDsl("keep if-fill if-unknown", "if-")).toEqual({
      options: { fit: "fill", w: 0 },
      consumed: ["if-fill"],
    });
    expect(parseDsl("img-w-480 img-crop", "img-")).toEqual({
      options: { w: 480, fit: "fill" },
      consumed: ["img-w-480", "img-crop"],
    });
  });
});
