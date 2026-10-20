import { describe, expect, it } from "vitest";
import imageforge from "../src/index.js";
import { imageForge } from "../src/runtime.js";

describe("package foundation", () => {
  it("exports an Astro integration factory", () => {
    expect(imageforge().name).toBe("@replworks/astro-imageforge");
  });

  it("exports the runtime entry", () => {
    expect(imageForge()).toBeNull();
  });
});
