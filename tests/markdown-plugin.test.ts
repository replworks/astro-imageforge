import { satteri } from "@astrojs/markdown-satteri";
import { describe, expect, it } from "vitest";
import { createMarkdownImagePlugin } from "../src/markdown.js";
import imageforge from "../src/index.js";

const settings = {
  baseUrl: "https://img.repl.net",
  service: "images",
  prefix: "if-",
  base: "/",
};

describe("Markdown image plugin", () => {
  it("rejects a non-Sätteri Markdown processor", () => {
    const setup = imageforge().hooks["astro:config:setup"] as unknown as (
      context: unknown,
    ) => void;

    expect(() =>
      setup({
        command: "build",
        config: {
          root: new URL("file:///tmp/"),
          markdown: { processor: { name: "unified", options: {} } },
        },
        updateConfig: () => undefined,
      }),
    ).toThrow(/Sätteri/);
  });

  it("rewrites Markdown images through the Sätteri renderer", async () => {
    const processor = satteri({
      hastPlugins: [createMarkdownImagePlugin(settings)],
    });
    const renderer = await processor.createRenderer({});
    const result = await renderer.render(
      '![Cat](/cat.jpg "Hello if-w-480 if-h-320 if-crop")',
    );

    expect(result.code).toContain(
      "https://img.repl.net/images/cat.jpg?w=480&amp;h=320&amp;fit=fill",
    );
    expect(result.code).toContain('title="Hello"');
  });

  it("removes recognized title tokens and leaves ineligible sources unchanged", async () => {
    const processor = satteri({
      hastPlugins: [createMarkdownImagePlugin(settings)],
    });
    const renderer = await processor.createRenderer({});
    const result = await renderer.render(
      [
        '![Cat](/cat.jpg "if-w-480")',
        '![Remote](https://example.com/cat.jpg "if-w-480")',
        '![Plain](/plain.jpg "Hello")',
      ].join("\n\n"),
    );

    expect(result.code).toContain(
      'src="https://img.repl.net/images/cat.jpg?w=480"',
    );
    expect(result.code).toContain('src="https://example.com/cat.jpg"');
    expect(result.code).toContain('src="/plain.jpg" alt="Plain" title="Hello"');
    expect(result.code).not.toContain(
      'src="https://img.repl.net/images/cat.jpg?w=480" title=',
    );
  });

  it("rewrites the same Markdown image through the Sätteri MDX renderer", async () => {
    const processor = satteri({
      hastPlugins: [createMarkdownImagePlugin(settings)],
    });
    const renderer = await processor.createMdxRenderer({}, { optimize: false });
    const result = await renderer.process(
      '![Cat](/cat.jpg "Hello if-w-480 if-h-320 if-crop")',
      "content.mdx",
      {},
    );

    expect(result.code).toContain(
      "https://img.repl.net/images/cat.jpg?w=480&h=320&fit=fill",
    );
    expect(result.code).toContain('title: "Hello"');
  });

  it("rewrites literal MDX img classes and leaves expression classes unchanged", async () => {
    const processor = satteri({
      hastPlugins: [createMarkdownImagePlugin(settings)],
    });
    const renderer = await processor.createMdxRenderer({}, { optimize: false });
    const result = await renderer.process(
      [
        '<img src="/cat.jpg" class="rounded if-w-480" />',
        '<img src="/dog.jpg" class="if-w-480" />',
        "<img src={source} class={classes} />",
      ].join("\n"),
      "content.mdx",
      {},
    );

    expect(result.code).toContain(
      'src: "https://img.repl.net/images/cat.jpg?w=480"',
    );
    expect(result.code).toContain('class: "rounded"');
    expect(result.code).toContain(
      'src: "https://img.repl.net/images/dog.jpg?w=480"',
    );
    expect(result.code).not.toContain('class: "if-w-480"');
    expect(result.code).toContain("class: classes");
  });
});
