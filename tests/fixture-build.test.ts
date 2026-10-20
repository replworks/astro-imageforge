import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "astro";
import { afterAll, describe, expect, it } from "vitest";

const outputDirectories: string[] = [];

afterAll(async () => {
  await Promise.all(
    outputDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("runtime settings in a fixture build", () => {
  it("uses integration settings through the virtual module", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "astro-imageforge-"));
    outputDirectories.push(outDir);

    const fixtureRoot = join(process.cwd(), "tests/fixtures/runtime");
    await build({
      root: pathToFileURL(fixtureRoot),
      outDir,
      logLevel: "silent",
    });

    const html = await readFile(join(outDir, "index.html"), "utf8");
    expect(html).toContain(
      'src="https://forge.example/images/docs/cat.jpg?w=480"',
    );
  });
});
