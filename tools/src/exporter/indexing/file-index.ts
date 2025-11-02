import { readFile } from "fs/promises";
import { globby } from "globby";
import { dump } from "js-yaml";
import { FolderFrontmatterIndex } from "./folder-index.js";
import { aseq, seq } from "doddle";
import { yamprint } from "yamprint";
import { basename } from "path";

const indexRegex = /^(?<index>\d+)\.(?<name>.+?)(?<ext>\..*)?$/;
export class MdFileNamePart {
  constructor(
    readonly index: number,
    readonly name: string,
    readonly ext: string
  ) {}

  static parse(part: string): MdFileNamePart | undefined {
    const match = indexRegex.exec(part);
    if (!match) {
      return undefined;
    }
    const { index, name, ext } = match.groups!;
    return new MdFileNamePart(+index, name, ext);
  }
}

function formatFrontmatter(frontmatter: object) {
  const dumped = dump(frontmatter, {
    quotingType: '"',
    forceQuotes: true,
  });
  return ["---", dumped.trim(), "---"].join("\n");
}
export class MdFile {
  private constructor(
    readonly root: string,
    readonly path: string,
    readonly parts: MdFileNamePart[],
    readonly frontmatter: object
  ) {}

  static tryCreate(
    root: string,
    path: string,
    frontmatter: object
  ): MdFile | undefined {
    const pathParts = path.split("/");
    const parts = pathParts.map((part) => MdFileNamePart.parse(part));
    if (parts.some((x) => x == null)) {
      return undefined;
    }
    return new MdFile(root, path, parts as any, frontmatter);
  }

  async contents() {
    const contents = await readFile(`${this.root}/${this.path}`, "utf-8");
    return [formatFrontmatter(this.frontmatter), contents].join("\n");
  }

  get indexPart() {
    return +this.parts.map((x) => x.index).join("");
  }

  get namePart() {
    return this.parts.map((x) => x.name).join("_");
  }

  get extPart() {
    const last = this.parts.at(-1);
    return last ? last.ext : "";
  }

  get flattenedName() {
    return `${this.indexPart}_${this.namePart}.p${this.extPart}`;
  }

  flattenedPathAt(destRoot: string) {
    return `${destRoot}/${this.flattenedName}`;
  }
}
export async function getComputedIndexedFiles(root: string) {
  const folders = await FolderFrontmatterIndex.createFromRoot(root);
  const files = await aseq(() =>
    globby("**/*.md", { cwd: root, onlyFiles: true })
  )
    .toSeq()
    .pull();
  console.log("FOUND FILES", yamprint(files));
  const mdFiles = await Promise.all(
    files
      .map((fp) => {
        const fm = folders.getFrontmatter(fp);
        return MdFile.tryCreate(root, fp, fm);
      })
      .filter((x) => x != null)
  );
  return mdFiles;
}
