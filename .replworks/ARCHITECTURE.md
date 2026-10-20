# ARCHITECTURE: @replworks/astro-imageforge

## 1. Purpose

The product has one explicit URL API and one content convenience layer. The convenience layer rewrites image nodes while the host compiles Markdown content, and delegates URL work to the same URL API.

## 2. Components

| ID | Component | Responsibility |
| --- | --- | --- |
| C1 | URL API | Accepts an Image Path and direct options; returns a Source URL, a Forge URL, or null. |
| C2 | Source URL Resolver | Builds the Source URL from the Image Path and the host's site and base settings. |
| C3 | Forge URL Composer | Builds the Forge URL and query string from a Source URL and direct options. |
| C4 | Settings Access | Supplies resolved settings to C1 at runtime and to C7 during content compilation. |
| C5 | Settings Definition | Defines settings, defaults, option-over-environment precedence, and environment mapping. |
| C6 | DSL Parser | Maps tokens to DSL options and consumed tokens. It clamps only DSL values. |
| C7 | Markdown Image Transformer | Finds eligible image nodes in the compiled document tree, applies C6, and rewrites `src`, `title`, and `class` through C1. |
| C8 | Registration | Resolves settings, verifies the host's Markdown processor, attaches C7 to it, and exposes settings to C4. |

External capabilities are supplied by the host: site and base settings, environment loading, the Markdown processor and its document tree, and HTML output. The product never contacts Image Forge.

## 3. Data flow

### Direct flow

`Developer -> C1 -> C2 -> C3 -> URL or null`

C1 returns null for an empty path and passes absolute URLs through. Otherwise it obtains the Source URL from C2, returns it unchanged when w is absent, and otherwise delegates to C3.

### DSL flow

`content source -> host Markdown processor -> C7 -> C6 -> C1 -> rewritten image node -> host HTML output`

C8 attaches C7 once at startup. For each compiled document, C7 visits image nodes, takes tokens from the title (Markdown images) or the literal class value (MDX `img` elements), and asks C6 for options. When C6 reports at least one recognized token, C7 removes the consumed tokens and, for an eligible `src`, replaces it with the C1 result. The DSL supplies `w=0` when a recognized token exists without a width token.

## 4. Transformer boundaries

- C7 handles two node kinds: Markdown image elements and MDX `img` elements.
- For Markdown images, tokens come only from the title; `alt` is never read or changed.
- For MDX `img` elements, tokens come only from a literal string `class`. An expression `class` leaves the element untouched.
- Only a literal `src` starting with a single `/` is eligible for rewriting. Any other `src` is kept as is.
- Consumed tokens are removed from their attribute; an attribute left empty is removed.
- C7 never inspects code, raw HTML, expressions, or component elements other than `img`.

## 5. DSL parser ownership

C6 owns all token-to-option decisions:

- width and height clamp to 0..2000;
- quality clamps to 1..100;
- format and fit aliases map to their documented values;
- repeated values use the last token in source order;
- only tokens with the configured prefix and a recognized form are consumed.

C6 returns `options` and `consumed`. It performs no URL work and does not depend on the document tree.

## 6. Settings ownership

- C5 is the only component that reads environment values.
- C8 resolves settings once per dev server or build start and hands the same values to C7 and C4.
- C1, C2, and C3 receive settings from C4 and do not read environment values or host configuration themselves.

## 7. Invariants

- Direct URL API options are never clamped or otherwise modified.
- DSL clamping does not change direct URL API behavior.
- C7 never duplicates Source URL resolution or Forge URL composition; it always calls C1.
- An image with no recognized token is left unchanged.
- A recognized token is removed exactly once; an unrecognized prefixed token remains.
- No state is shared between documents.
- The DSL flow and the direct flow produce the same URL for the same path and options.

## 8. Failure boundaries

- An unset service raises the service configuration error when a Forge URL is needed, in either flow.
- An unsupported host Markdown processor raises an error during registration.
- An ineligible `src` or an expression attribute is a no-op, not an error.
- Option values the Image Forge service treats specially produce no error in the product.

## 9. Non-goals

- No Image component.
- No scanning of component templates or raw HTML in Markdown.
- No handling of images managed by the host's own image pipeline.
- No network calls, URL validation, caching, or custom option presets.
