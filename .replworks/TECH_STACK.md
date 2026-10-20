# TECH_STACK

## 1. Languages / runtimes / frameworks / libraries

- Language: TypeScript with `strict` enabled.
- Runtime: Node.js `>=22.22.0` (the engine required by Astro 7).
- Framework: Astro, peer dependency `^7.0.0`.
- Markdown processor: Sätteri, Astro's default processor. The unified (remark/rehype) processor MUST NOT be supported.
- Package manager: npm.
- Module system: ESM only (`"type": "module"`).
- Runtime dependencies: none.
- Development dependency `typescript`. Reason: compiler and type check.
- Development dependency `vitest`. Reason: test runner.
- Development dependency `astro` `^7.0.0`. Reason: integration types and fixture builds.
- Development dependency `@astrojs/mdx`. Reason: `.mdx` fixture builds.
- Development dependency `satteri`, the version used by the installed `@astrojs/markdown-satteri`. Reason: hast plugin types and direct Markdown/MDX compilation in unit tests.
- Development dependency `prettier`. Reason: code formatter.

## 2. Framework- or tool-mandated paths and file names

- `package.json` MUST exist at the repository root.
- `package-lock.json` MUST NOT be committed.
- `src/` MUST hold package source.
- `tests/` MUST hold tests; fixture Astro projects MUST live under `tests/fixtures/`.
- `dist/` MUST hold build output and MUST NOT be committed.
- `tsconfig.json` MUST be the TypeScript config file name.
- `vitest.config.ts` MUST be the Vitest config file name.
- `.prettierrc.json` MUST be the Prettier config file name.
- `.github/workflows/` MUST hold GitHub Actions workflow files.
- `LICENSE` MUST exist at the repository root.
- The package entry `.` MUST default-export the integration factory.
- The package entry `./runtime` MUST export `imageForge`.

## 3. Coding conventions specific to the chosen stack

- Code MUST be formatted with Prettier using its default options.
- The Markdown plugin MUST be a Sätteri hast plugin appended to `config.markdown.processor.options.hastPlugins` in the `astro:config:setup` hook.
- The integration MUST detect Sätteri by `config.markdown.processor.name === "satteri"`.
- Runtime settings MUST reach `./runtime` through the Vite virtual module `virtual:imageforge/settings`, provided by a Vite plugin the integration adds.
- The integration MUST add the package to `vite.ssr.noExternal` so `./runtime` can import the virtual module.
- `satteri` and `astro` imports in `src/` MUST be type-only.

## 4. Testing rules

- Tests MUST use Vitest.
- Test files MUST be named `*.test.ts`.
- Unit tests of the Markdown plugin MUST compile Markdown and MDX with `satteri` directly.
- Fixture tests MUST build a fixture project with Astro's programmatic `build()` API and assert on the generated HTML.
- Code coverage MUST NOT be measured or required.

## 5. Configuration rules

- Integration option names MUST be `baseUrl`, `service`, `prefix`.
- Environment variable names MUST be `IMAGEFORGE_BASE_URL`, `IMAGEFORGE_SERVICE`.
- Environment variables MUST be read only in the settings definition module, with Vite `loadEnv(mode, root, "IMAGEFORGE_")`.
- The package MUST NOT define, read, or store secrets.

## 6. Deployment rules

- Distribution target MUST be npm.
- Package name MUST be `@replworks/astro-imageforge`, published with public access.
- Releases MUST be GitHub releases with semver tags in the format `vMAJOR.MINOR.PATCH`, for example `v1.0.0`.
- Publishing MUST run in GitHub Actions when a GitHub release is published, with npm provenance.
- CI MUST be GitHub Actions.
- The CI matrix MUST be Node `22` and `24`, each with the latest Astro `7.x`.
- CI MUST install dependencies with `npm install`.
- CI MUST run the verification commands below.
- License MUST be MIT.

Verification commands:

```text
npm run format:check
npm run typecheck
npm run build
npm test
```

## 7. Security rules tied to the chosen stack

- None stated.

## 8. Non-goals

- Linters and static analysis tools beyond the TypeScript type check, including ESLint, MUST NOT be used.
- Code coverage measurement MUST NOT be used.
- Bundlers for the package build MUST NOT be used; `tsc` emits `dist/`.
