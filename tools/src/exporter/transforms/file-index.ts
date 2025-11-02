import { readFile } from "fs/promises";
import { globby } from "globby";
import { dump } from "js-yaml";
import { seq } from "doddle";
import { FolderFrontmatterIndex } from "../indexing/folder-index.js";

const indexRegex = /^(?<index>\d+)(?<name>.+?)(?<ext>\..*)?$/;
export class MdFileNamePart {
  constructor(
    readonly index: number,
    readonly name: string,
    readonly ext: string
  ) {}

  static parse(part: string): MdFileNamePart {
    const match = indexRegex.exec(part);
    if (!match) {
      throw new Error(`Invalid indexed part: ${part}`);
    }
    const { index, name, ext } = match.groups!;
    return new MdFileNamePart(+index, name, ext);
  }
}

function formatFrontmatter(frontmatter: object) {
  const dumped = dump(frontmatter);
  return ["---", dumped.trim(), "---"].join("\n");
}
export class MdFile {
  readonly parts: MdFileNamePart[];
  constructor(readonly path: string, readonly frontmatter: object) {
    const parts = path.split("/");
    const partObjects = parts.map((part) => MdFileNamePart.parse(part));
    this.parts = partObjects;
  }

  async contents() {
    const contents = await readFile(this.path, "utf-8");
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
    return `${this.indexPart}_${this.namePart}${this.extPart}`;
  }
}

export async function getComputedIndexedFiles(root: string) {
  const folders = await FolderFrontmatterIndex.createFromRoot(root);
  const files = await globby("**/*.md", { cwd: root, onlyFiles: true });
  const mdFiles = await Promise.all(
    seq(files).map((fp) => {
      const fm = folders.getFrontmatter(fp);
      return new MdFile(fp, fm);
    })
  );
  return mdFiles;
}
