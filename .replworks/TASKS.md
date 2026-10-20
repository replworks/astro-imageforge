# TASKS

Execution checklist in dependency order (AGENTS.md).
AC- IDs refer to PRODUCT_SPEC.md. C- IDs and section numbers refer to ARCHITECTURE.md.
"Unit tests passing" means the unit tests written for that task pass.

- [x] T-001 Project foundation
  - Satisfies: TECH_STACK.md
  - External boundary: no
  - Acceptance criteria:
    - Every constraint in TECH_STACK.md is satisfied.
    - Every verification command defined in TECH_STACK.md passes.
    - The package exposes the `.` and `./runtime` entries; the integration can be added to an Astro config without error.
    - CI runs on the Node matrix defined in TECH_STACK.md.

- [ ] T-002 Developer configures the product through integration options and environment variables
  - Satisfies: PRODUCT_SPEC.md Inputs and configuration
  - External boundary: no
  - Acceptance criteria:
    - AC-006 passes.
    - Without options or environment variables, `baseUrl` is `https://img.repl.net`, `service` is unset, and `prefix` is `if-`.
    - Environment values are read only by C5 (ARCHITECTURE.md Section 6).
    - Unit tests passing.

- [ ] T-003 Developer obtains a Source URL, or null, from `imageForge()`
  - Satisfies: PRODUCT_SPEC.md Explicit API behavior
  - External boundary: no
  - Acceptance criteria:
    - AC-002 passes for base `/`, `/docs`, and `/docs/`, with and without `site`.
    - AC-003 passes.
    - Absolute, protocol-relative, and `data:` URLs are returned unchanged.
    - With `w` absent, `h`, `fit`, `q`, and `f` supplied together still return the Source URL.
    - Unit tests passing.

- [ ] T-004 Developer obtains a Forge URL from `imageForge()`
  - Satisfies: PRODUCT_SPEC.md Explicit API behavior; Errors and non-goals
  - External boundary: no
  - Acceptance criteria:
    - AC-001 passes.
    - AC-004 passes.
    - AC-005 passes.
    - The Forge URL uses only the path component of the Source URL, including `base`, and never the `site` origin.
    - An option value containing URL-reserved characters appears in the query exactly as supplied.
    - `./runtime` reads settings through C4 in a fixture build.
    - Unit tests passing.

- [ ] T-005 DSL Parser maps tokens to options
  - Satisfies: PRODUCT_SPEC.md Markdown Image DSL (token table and rules)
  - External boundary: no
  - Acceptance criteria:
    - Every token in the table maps to its documented result.
    - AC-009, AC-010, AC-011, and AC-016 pass at the parser level.
    - The parser returns `options` and `consumed` and has no document-tree dependency (ARCHITECTURE.md Section 5).
    - Unit tests passing.

- [ ] T-006 Developer sizes Markdown images through the title in `.md` and `.mdx`
  - Satisfies: PRODUCT_SPEC.md Markdown Image DSL; Errors and non-goals
  - External boundary: no
  - Acceptance criteria:
    - AC-007, AC-008, AC-013 (Markdown images), AC-014, and AC-017 pass.
    - The integration appends C7 to the Sätteri processor's hast plugins (TECH_STACK.md Section 3).
    - A fixture Astro 7 build with `@astrojs/mdx` renders the expected HTML for the same Markdown image in both a `.md` and an `.mdx` page.
    - In that fixture build, a rewritten image is not altered by Astro's own image handling.
    - Unit tests passing.

- [ ] T-007 Developer sizes `<img>` elements through `class` in `.mdx`
  - Satisfies: PRODUCT_SPEC.md Markdown Image DSL
  - External boundary: no
  - Acceptance criteria:
    - AC-012, AC-013 (`<img>` elements), and AC-015 pass.
    - A fixture `.mdx` page with `<img class>` renders the expected HTML in an Astro 7 build.
    - Unit tests passing.

- [ ] T-008 README first-line slot states the package is a client for the Image Forge service
  - Satisfies: PRODUCT_SPEC.md AC-018
  - External boundary: no
  - Acceptance criteria:
    - AC-018 passes.
    - The wording beyond what AC-018 checks is not part of this task (human-owned, AGENTS.md HUMAN_OWNED_CHANGES).
