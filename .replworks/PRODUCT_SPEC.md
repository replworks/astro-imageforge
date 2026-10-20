# PRODUCT_SPEC: @replworks/astro-imageforge

## Purpose

- The product is an Astro integration named `@replworks/astro-imageforge`.
- The product is a client for the Image Forge service and generates Forge URLs from image paths.
- The primary interface is a Markdown Image DSL: recognized tokens in the title of a Markdown image (`.md` and `.mdx`) and in the `class` attribute of an `<img>` element written in `.mdx`.
- `imageForge()` is the explicit API for `.astro` components, endpoints, and other non-Markdown use.

Definitions:

- Image Path: a path string of a file served from the Astro `public/` directory, with or without a leading `/`, or null/undefined.
- Source URL: the URL of that public file, built from the Astro `base` and, when set, the Astro `site`.
- Forge URL: a URL pointing to Image Forge.
- Option: one of `w`, `h`, `fit`, `q`, or `f`.
- DSL Token: a whitespace-separated word in a Markdown image title or an `.mdx` `<img>` `class` value that starts with the configured prefix.

## Goals

- Configure Image Forge once through integration options or environment variables.
- Let a Developer write `![Cat](/cat.jpg "if-w-480 if-h-320")` in `.md` or `.mdx` content without SDK calls.
- Let a Developer write `<img src="/cat.jpg" class="rounded if-w-480" />` in `.mdx` content.
- Preserve an explicit API for contexts outside Markdown content.

## Inputs and configuration

- The integration is added to `integrations` in the Astro config as `imageforge(options?)`.
- Integration options are `baseUrl`, `service`, and `prefix`.
- `baseUrl` defaults to `https://img.repl.net`.
- `service` has no default.
- `prefix` defaults to `if-`.
- `IMAGEFORGE_BASE_URL` and `IMAGEFORGE_SERVICE` map to `baseUrl` and `service`. They are read from the process environment and the project's `.env` files.
- An integration option value takes precedence over its environment variable.
- `prefix` is set only through integration options.
- Settings are read when Astro starts a dev server or a build; changes apply after a restart.

## Explicit API behavior

- `imageForge(path, options?)` accepts an Image Path and an optional object with `w`, `h`, `fit`, `q`, and `f`.
- It returns null for a null, undefined, or empty path.
- It returns an absolute URL (`http:`, `https:`), a protocol-relative URL (`//`), or a `data:` URL unchanged.
- With `w` absent (null or undefined), it returns the Source URL.
- With `w` present (including `0`), it returns a Forge URL.
- The Source URL is the Astro `base` joined with the Image Path by exactly one `/`. When Astro `site` is set, the Source URL is absolute against `site`; otherwise it is root-relative.
- The Forge URL is `baseUrl` + `/` + `service` + the path component of the Source URL + `?` + query.
- The query order is `w`, `h`, `fit`, `q`, `f`; null and undefined options are omitted.
- Option values are passed through without validation, clamping, encoding, or modification.

## Markdown Image DSL

The integration attaches a plugin to Astro's Markdown processor. The plugin rewrites eligible images while `.md` and `.mdx` content is compiled.

Eligible images:

- A Markdown image `![alt](src "title")` in `.md` or `.mdx`. Tokens are read from the title.
- An `<img>` element written in `.mdx` whose `class` attribute is a literal string. Tokens are read from `class`.

The default prefix is `if-`; every token below uses the configured prefix.

| Token | Result |
| --- | --- |
| `if-w-{n}` | `w=n`, clamped to 0..2000 |
| `if-h-{n}` | `h=n`, clamped to 0..2000 |
| `if-q-{n}` | `q=n`, clamped to 1..100 |
| `if-fit` | `fit=fit` |
| `if-fill`, `if-crop` | `fit=fill` |
| `if-fit-auto` | `fit=auto` |
| `if-webp`, `if-avif`, `if-jpeg`, `if-png` | matching `f` |
| `if-auto` | omit `f` |

Rules:

- Tokens are processed in source order; the last recognized value of each option wins.
- If no width token is present but another recognized token is present, the DSL supplies `w=0`.
- Only recognized tokens are removed; unknown prefixed tokens and other words remain, joined by single spaces.
- If nothing remains in a title, the `title` attribute is removed. If nothing remains in a `class`, the `class` attribute is removed.
- If no recognized token is present, the image is unchanged.
- Only a literal `src` starting with a single `/` is rewritten to the `imageForge()` result for that path and the parsed options.
- Any other `src` (relative, absolute, protocol-relative, `data:`, missing, or an `.mdx` expression) is left unchanged; recognized tokens are still removed.
- An `.mdx` `<img>` whose `class` is an expression is unchanged.
- `alt` and all other attributes are unchanged.

## Installation

- `npm install @replworks/astro-imageforge` installs the package.
- The Developer adds `imageforge()` to `integrations` in the Astro config.
- MDX support requires the Developer's own `@astrojs/mdx` integration; the product does not install it.

## Errors and non-goals

- A Forge URL request with an unset service raises an error mentioning `service`. In Markdown content this fails the build or the page render.
- If the configured Markdown processor is not Astro's default Sätteri processor, the integration raises an error at startup mentioning Sätteri.
- The product does not provide an Image component.
- The product does not scan `.astro` templates or raw HTML inside `.md` files.
- The product does not process local images handled by Astro's own image pipeline.
- The product does not validate or clamp values passed directly to `imageForge()`.
- The product does not contact Image Forge itself.

## Acceptance criteria

- AC-001: With `service` set and no other settings, `imageForge("cat.jpg", { w: 480 })` returns `https://img.repl.net/{service}/cat.jpg?w=480`.
- AC-002: `imageForge("/cat.jpg")` returns the Source URL; with base `/docs` it is `/docs/cat.jpg`, and with site `https://example.com` it is `https://example.com/docs/cat.jpg`.
- AC-003: `imageForge(null)`, `imageForge(undefined)`, and `imageForge("")` return null.
- AC-004: The query lists only present options, in the order `w`, `h`, `fit`, `q`, `f`, with values exactly as supplied.
- AC-005: With `service` unset and `w` present, `imageForge()` raises an error mentioning `service`; with `w` absent, it returns the Source URL.
- AC-006: Integration options override `IMAGEFORGE_BASE_URL` and `IMAGEFORGE_SERVICE`; without either, defaults apply.
- AC-007: `![Cat](/cat.jpg "Hello if-w-480 if-h-320 if-crop")` renders `src` as the Forge URL with `w=480&h=320&fit=fill` and `title="Hello"`.
- AC-008: `![Cat](/cat.jpg "if-w-480")` renders with no `title` attribute.
- AC-009: Last values win, `if-crop` maps to fill, and out-of-range DSL numbers clamp to the ranges above.
- AC-010: A recognized token without a width token emits `w=0`.
- AC-011: Unknown prefixed tokens remain in the title or class.
- AC-012: In `.mdx`, `<img src="/cat.jpg" class="rounded if-w-480" />` renders the Forge URL with `class="rounded"`; `class="if-w-480"` alone removes `class`.
- AC-013: A relative, absolute, protocol-relative, or `data:` `src` stays unchanged while recognized tokens are removed.
- AC-014: An image with no recognized token is unchanged.
- AC-015: An `.mdx` `<img>` with an expression `src` keeps that expression and has recognized class tokens removed; an `<img>` with an expression `class` is unchanged.
- AC-016: A custom `prefix` replaces `if-` for every token.
- AC-017: A non-Sätteri Markdown processor causes a startup error mentioning Sätteri.
- AC-018: The first line of the README states that the package is a client for the Image Forge service.
