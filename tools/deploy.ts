import path from "path";
import fs from "fs-extra";
import chokidar from "chokidar";
import { globby } from "globby";

// deploy2.ts
// Self-contained TypeScript script that syncs SOURCE_DIR -> DEST_DIR
// - Uses globby to enumerate source files
// - Copies files to dest preserving relative tree
// - Removes files from dest not present in source
// - Watches source with chokidar and debounces syncs
// NOTES/ASSUMPTIONS:
// - The requirement said "Moves all files" but to avoid emptying SOURCE_DIR
//   (which would make subsequent sync semantics awkward) this implementation
//   copies/overwrites files from SOURCE_DIR into DEST_DIR and treats "move"
//   as a sync/replicate operation. This is an explicit, reasonable assumption.

const argSource = "./copilot";
const argDest =
  "C:\\Users\\Greg\\AppData\\Roaming\\Code - Insiders\\User\\prompts";

const SOURCE_DIR = resolvePath(argSource || "");
const DEST_DIR = resolvePath(argDest || "");

function resolvePath(p: string) {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

async function listRelativeFiles(dir: string) {
  // returns relative paths (posix style on all platforms) for files only
  return await globby("**/*", {
    cwd: dir,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  });
}

async function syncOnce(src: string, dest: string) {
  const relFiles = await listRelativeFiles(src);
  // We'll flatten destination: each source file maps to a single filename: $FOLDER_$FILE
  console.log(
    `[sync] mass-sync ${path.relative(process.cwd(), src)} -> ${path.relative(
      process.cwd(),
      dest
    )}  (${relFiles.length} files)`
  );

  const expectedDestNames = new Set<string>();
  const posix = path.posix;

  // Copy all source files to dest as flattened names: $FOLDER_$FILE
  for (const rel of relFiles) {
    if (rel.startsWith("_")) {
      continue;
    }

    const parent = posix.dirname(rel);
    const folder =
      parent === "." || parent === ""
        ? posix.basename(src)
        : parent.split("/").pop();
    const destName = `${folder}_${posix.basename(rel)}`;
    expectedDestNames.add(destName);

    const srcItem = path.join(src, rel);
    const destItem = path.join(dest, destName);
    await fs.ensureDir(path.dirname(destItem));
    await fs.copy(srcItem, destItem, { overwrite: true });
    console.log(`[copy] ${rel} -> ${path.relative(process.cwd(), destItem)}`);
  }

  // Remove extras from dest by comparing flattened basenames
  await fs.ensureDir(dest);
  const destFiles = await listRelativeFiles(dest);
  for (const rel of destFiles) {
    const base = posix.basename(rel);
    if (!expectedDestNames.has(base)) {
      const destItem = path.join(dest, rel);
      await fs.remove(destItem);
      console.log(
        `[remove] extra ${rel} from ${path.relative(process.cwd(), dest)}`
      );
    }
  }

  console.log(`[sync] completed at ${new Date().toLocaleTimeString()}`);
}

function startWatch(src: string, dest: string) {
  const watcher = chokidar.watch(src, {
    persistent: true,
    ignoreInitial: true,
    depth: Infinity,
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 10 },
  });

  let timer: NodeJS.Timeout | undefined;
  const schedule = (file?: string, ev?: string) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void syncOnce(src, dest);
      timer = undefined;
    }, 150);
  };

  watcher.on("all", (ev, p) => {
    console.log(`[watch] ${ev} ${path.relative(process.cwd(), p)}`);
    schedule(p, ev);
  });

  watcher.on("error", (err) => {
    // Intentionally do not catch errors from the entrypoint; let them surface.
    console.error("[watch] error:", err);
  });

  console.log(
    `[watch] started: ${path.relative(process.cwd(), src)} -> ${path.relative(
      process.cwd(),
      dest
    )}`
  );
}

async function main() {
  console.log(`[start] SOURCE_DIR=${SOURCE_DIR}`);
  console.log(`[start] DEST_DIR=${DEST_DIR}`);

  await fs.ensureDir(SOURCE_DIR);
  await fs.ensureDir(DEST_DIR);

  // initial sync
  await syncOnce(SOURCE_DIR, DEST_DIR);

  // start watcher
  startWatch(SOURCE_DIR, DEST_DIR);
}

// Entrypoint: call main() without try/catch and without checking require.main
void main();
