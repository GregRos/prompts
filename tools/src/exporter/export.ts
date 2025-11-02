import { rm, writeFile } from "fs/promises";
import { getComputedIndexedFiles } from "./indexing/file-index.js";
import { seq } from "doddle";
import { globby } from "globby";
import { yamprint } from "yamprint";

export async function runExport(src: string, dest: string) {
  const fileIndex = await getComputedIndexedFiles(src);
  console.log(
    "FILES TO EXPORT",
    yamprint(fileIndex.map((x) => x.flattenedName))
  );
  const set = new Set<string>();
  const writeThem = fileIndex.map(async (mdFile) => {
    const contents = await mdFile.contents();
    const destPath = mdFile.flattenedPathAt(dest);
    set.add(destPath.replaceAll("\\", "/"));
    await writeFile(destPath, contents, "utf-8");
  });
  await Promise.all(writeThem);

  const foundFiles = await globby(`**/*.p.instructions.md`, {
    cwd: dest,
    onlyFiles: true,
    absolute: true,
  });
  const deleteThem = seq(foundFiles).map(async (f) => {
    if (!set.has(f)) {
      await rm(f);
    }
  });
  await Promise.all(deleteThem);
}
