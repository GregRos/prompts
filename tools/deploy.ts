import chokidar from "chokidar";
import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

const copilotPromptsDir = String.raw`C:\Users\Greg\AppData\Roaming\Code - Insiders\User\prompts`;
// Map relative source dirs -> relative destination dirs
// Personal script: constants only
export const MAPPED: Record<string, string> = {
  prompts: copilotPromptsDir,
};

type LockMap = Map<string, Promise<void>>;

function normRel(p: string) {
  return p.split(path.sep).join("/");
}

async function listFiles(dir: string): Promise<Set<string>> {
  const result = new Set<string>();

  async function walk(curr: string, relParent = "") {
    const entries = await fs.readdir(curr, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name;
      if (name === ".trash") continue; // ignore trash
      const full = path.join(curr, name);
      const rel = relParent ? path.posix.join(relParent, name) : name;
      if (e.isDirectory()) {
        await walk(full, rel);
      } else if (e.isFile()) {
        result.add(normRel(rel));
      } else if (e.isSymbolicLink()) {
        result.add(normRel(rel));
      }
    }
  }

  try {
    await walk(dir);
  } catch (err: any) {
    if (err && err.code === "ENOENT") return result;
    throw err;
  }

  return result;
}

async function copySourceToDest(src: string, dest: string) {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true }).catch((e) => {
    if (e && e.code === "ENOENT") return [] as fs.Dirent[];
    throw e;
  });

  for (const e of entries) {
    const srcItem = path.join(src, e.name);
    const destItem = path.join(dest, e.name);
    await fs.remove(destItem).catch(() => {});
    await fs.copy(srcItem, destItem, { overwrite: true });
  }
}

async function moveExtrasToTrash(src: string, dest: string) {
  const srcFiles = await listFiles(src);
  const destFiles = await listFiles(dest);

  const extras: string[] = [];
  for (const f of destFiles) if (!srcFiles.has(f)) extras.push(f);
  if (extras.length === 0) return;

  const trashRoot = path.join(dest, ".trash");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const trashSub = path.join(trashRoot, stamp);
  for (const rel of extras) {
    const srcDestItem = path.join(dest, rel);
    const target = path.join(trashSub, rel);
    await fs.ensureDir(path.dirname(target));
    try {
      await fs.move(srcDestItem, target, { overwrite: true });
      console.log(
        `Moved extra ${rel} -> ${path.relative(process.cwd(), target)}`
      );
    } catch (err) {
      console.error(`Failed moving ${srcDestItem} to trash:`, err);
    }
  }
}

async function syncOnce(srcRel: string, destRel: string) {
  const src = path.join(process.cwd(), srcRel);
  const dest = path.join(process.cwd(), destRel);

  try {
    await fs.ensureDir(dest);
    await copySourceToDest(src, dest);
    await moveExtrasToTrash(src, dest);
    console.log(
      `[sync] ${srcRel} -> ${destRel} at ${new Date().toLocaleTimeString()}`
    );
  } catch (err) {
    console.error(`[sync] error syncing ${srcRel} -> ${destRel}:`, err);
  }
}

async function main() {
  if (!MAPPED || Object.keys(MAPPED).length === 0) {
    console.log(
      "MAPPED is empty — please set mappings in tools/deploy.ts before running."
    );
    process.exit(1);
  }

  const locks: LockMap = new Map();
  const timers: Map<string, NodeJS.Timeout> = new Map();

  for (const [srcRel, destRel] of Object.entries(MAPPED)) {
    const absSrc = path.join(process.cwd(), srcRel);
    locks.set(srcRel, syncOnce(srcRel, destRel));

    const watcher = chokidar.watch(absSrc, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 10 },
    });

    const schedule = () => {
      if (timers.has(srcRel)) clearTimeout(timers.get(srcRel)!);
      const t = setTimeout(async () => {
        const prev = locks.get(srcRel);
        if (prev) await prev.catch(() => {});
        const p = syncOnce(srcRel, destRel);
        locks.set(srcRel, p);
        timers.delete(srcRel);
      }, 150);
      timers.set(srcRel, t);
    };

    watcher.on("all", (event, p) => {
      console.log(
        `[watch] ${srcRel}: ${event} ${path.relative(process.cwd(), p)}`
      );
      schedule();
    });

    watcher.on("error", (err) => {
      console.error(`[watch] ${srcRel} watcher error:`, err);
    });
  }

  console.log("deploy watcher started for mappings:");
  for (const [s, d] of Object.entries(MAPPED)) console.log(`  ${s} -> ${d}`);
}

main();
