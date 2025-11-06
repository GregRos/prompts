import type { Path } from "../../util/pathlib.js"
import { DestContent } from "../src-dest.js"

export class RefFile {
    constructor(
        readonly path: Path,
        readonly content: string
    ) {}

    static async fromPath(path: Path): Promise<RefFile> {
        const content = await path.readFile("utf-8")
        return new RefFile(path, content)
    }

    get _targetName() {
        let nameBit = ["__ref", this.path.basename]
            .join(".")
            .replace(".ref", ".instructions")
        return nameBit
    }

    destContent(root: Path): DestContent {
        const destPath = root.join(this._targetName)
        return DestContent.dest(this.path, destPath, this.content)
    }

    get srcContent() {
        return DestContent.src(this.path, this.content)
    }
}

export class RefIndexer {
    private constructor(
        readonly root: Path,
        readonly refFiles: RefFile[] = []
    ) {}

    get srcContent() {
        return this.refFiles.map(rf => rf.srcContent)
    }

    destContent(root: Path): DestContent[] {
        return this.refFiles.map(rf => rf.destContent(root))
    }

    static async create(root: Path): Promise<RefIndexer> {
        const files = await root.glob("*.ref.md", { onlyFiles: true })
        files.sort((a, b) => (a.path < b.path ? -1 : 1))
        const promises = files.map(file => RefFile.fromPath(file))
        const refFiles = await Promise.all(promises)
        return new RefIndexer(root, refFiles)
    }
}
