import { globby } from "globby";
import path from "path";
import { getFrontmatterScriptAt } from "./frontmatter/load-frontmatter.js";
import watchDir from "./watching/watch.js";
import { mergeMap } from "rxjs";
import { runExport } from "./export.js";
const SOURCE_DIR = "./copilot";
const DEST_DIR = "./.out";

async function run() {
  await runExport(SOURCE_DIR, DEST_DIR);
}
void run();
