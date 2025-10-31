import path from "path";
import fs from "fs-extra";
import fm from "front-matter";
import { globby } from "globby";
import { fileURLToPath } from "url";

// Directory containing the source Markdown files to concatenate.
// Adjust this path if you want a different source directory.
// In ESM modules __dirname is not defined. Recreate it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SOURCE_DIR = path.resolve(__dirname, "..", "copilot", "1.system");
// Destination directory for the concatenated output. Change as needed.
export const DEST_DIR = path.resolve(__dirname, "..", ".out");

async function gatherMarkdownFiles(dir: string): Promise<string[]> {
  // Use globby to collect markdown files. We intentionally do not exclude
  // directories like `node_modules` or `.out` — the caller may decide the
  // TARGET_DIR to avoid those, but we will include all matches under the dir.
  const patterns = ["**/*.md"];
  const files = await globby(patterns, {
    cwd: dir,
    absolute: true,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: true,
  });

  return files;
}

function stripFrontMatter(content: string): string {
  // Rely solely on the `front-matter` library to parse and strip front matter.
  // Let parsing errors propagate rather than silently falling back — this
  // makes issues visible and avoids masking malformed front matter.
  // `front-matter` is imported as `fm`. In ESM interop we call it directly.
  const parsed = (fm as any)(content);
  return parsed.body.trim();
}

async function main() {
  const outDir = DEST_DIR;
  const outFile = path.join(outDir, "system.md");

  await fs.ensureDir(outDir);

  const files = await gatherMarkdownFiles(SOURCE_DIR);
  if (!files.length) {
    console.warn(`No markdown files found in ${SOURCE_DIR}`);
    await fs.writeFile(outFile, "");
    console.info(`Wrote empty ${outFile}`);
    return;
  }

  // Sort files by path relative to the TARGET_DIR for deterministic order.
  files.sort((a, b) => {
    const ra = path.relative(SOURCE_DIR, a);
    const rb = path.relative(SOURCE_DIR, b);
    return ra.localeCompare(rb);
  });

  const pieces: string[] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf8");
    const body = stripFrontMatter(raw);
    // Add a header comment with source filename for traceability
    const rel = path.relative(process.cwd(), f);
    pieces.push(`<!-- Source: ${rel} -->\n\n${body}`);
  }

  const final = pieces.join("\n\n---\n\n");
  await fs.writeFile(outFile, final, "utf8");
  console.info(`Wrote concatenated file to ${outFile} (${files.length} files)`);
}

main();
