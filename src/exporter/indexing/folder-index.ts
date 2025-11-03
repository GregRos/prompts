import { seq } from "doddle"
import { globby } from "globby"

import { Path } from "../../util/pathlib.js"
import { getFrontmatterScriptAt } from "../frontmatter/load-frontmatter.js"
export class Folder {
    private constructor(
        readonly root: string,
        readonly path: Path,
        public frontmatter: object
    ) {}

    static async create(root: string, path: string) {
        const frontmatter = await getFrontmatterScriptAt(`${root}/${path}`)
        return new Folder(root, Path(path), frontmatter)
    }

    get parents() {
        return seq(this.path.parts)
            .skip(-1)
            .scan((acc, cur) => {
                return [...acc, cur]
            }, [] as string[])
            .map(ps => ps.join("/"))
    }
}

export class FolderFrontmatterIndex {
    private _folderMap: Map<string, Folder>
    constructor(readonly folders: Folder[]) {
        this._folderMap = new Map<string, Folder>(folders.map(x => [x.path, x]))
    }

    static async createFromRoot(root: string) {
        const folderPaths = await globby("**/*", {
            cwd: root,
            onlyDirectories: true
        })
        const folderObjects = await Promise.all(
            seq(folderPaths).map(async x => {
                return Folder.create(root, x)
            })
        )
        return new FolderFrontmatterIndex(folderObjects)
    }

    getFrontmatter(path: string) {
        const mergedFrontmatter = seq(path.split("/"))
            .scan((acc, cur) => {
                return [...acc, cur]
            }, [] as string[])
            .map(ps => ps.join("/"))
            .map(p => {
                return this._folderMap.get(p)
            })
            .filter(x => x != null)
            .map(x => x.frontmatter)
            .reduce((acc, cur) => {
                return { ...acc, ...cur }
            }, {})
            .pull()

        return mergedFrontmatter
    }
}
