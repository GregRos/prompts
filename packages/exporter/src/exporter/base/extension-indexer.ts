import { frontmatter } from "../../util/frontmatter.js"
import { Path } from "../../util/pathlib.js"
import { dumpYamlFrontmatter } from "../frontmatter/dump-frontmatter.js"
import { type Frontmatter } from "../frontmatter/load-frontmatter.js"
import { DestContent, SrcDest } from "../src-dest.js"
import { flattenExtFiles } from "./flatten.js"

export class ExtFile {
    constructor(
        readonly path: string,
        readonly frontmatter: Frontmatter,
        readonly _content: string
    ) {}

    static async fromPath(path: Path): Promise<ExtFile> {
        const content = await path.readFile("utf-8")
        const fm = frontmatter<{ [key: string]: any }>(content)
        return new ExtFile(path.toString(), fm.attributes, fm.body)
    }

    static fromContent(
        path: string,
        frontmatter: Frontmatter,
        content: string
    ): ExtFile {
        return new ExtFile(path, frontmatter, content)
    }

    get body() {
        return this._content.trim()
    }

    get data(): string {
        const fmString = dumpYamlFrontmatter(this.frontmatter)
        return `${fmString}\n\n${this.body}`
    }
}

export class ExtensionGroup {
    protected constructor(
        readonly root: Path,
        readonly frontmatter: Frontmatter,
        readonly ruleFiles: ExtFile[],
        readonly ext: string,
        readonly targetExt: string
    ) {
        this.ruleFiles.sort((a, b) => a.path.localeCompare(b.path))
    }

    static async create(
        root: Path,
        ext: string,
        targetExt: string
    ): Promise<ExtensionGroup> {
        const pattern = `*.${ext}.md`
        const ruleFiles = await root.glob(pattern)
        ruleFiles.sort((a, b) => (a.path < b.path ? -1 : 1))
        const ruleFilePromises = ruleFiles.map(file => ExtFile.fromPath(file))
        const resolvedRuleFiles = await Promise.all(ruleFilePromises)
        const indexRuleFilePath = root.join("_.md")
        if (!(await indexRuleFilePath.exists())) {
            throw new Error(
                `No main rule file found in group: ${root.toString()}`
            )
        }
        const indexRuleFile = await ExtFile.fromPath(indexRuleFilePath)

        if (!indexRuleFile) {
            throw new Error(
                `No main rule file found in group: ${root.toString()}`
            )
        }
        const frontmatter = indexRuleFile.frontmatter

        const eg = new ExtensionGroup(
            root,
            frontmatter,
            resolvedRuleFiles,
            ext,
            targetExt
        )

        return eg
    }

    get indexFilePath() {
        return this.root.join("_.md")
    }

    get srcIndexFile() {
        const indexPath = this.indexFilePath
        const indexC = DestContent.src(
            indexPath,
            flattenExtFiles(this.ruleFiles)
        )
        return indexC
    }

    get srcContent() {
        const otherStuff = this.ruleFiles.map(rf =>
            DestContent.src(Path(rf.path), rf.data)
        )
        return [this.srcIndexFile, ...otherStuff]
    }

    destContent(root: Path, ns: string): DestContent {
        const rf = ExtFile.fromContent(
            this.indexFilePath.toString(),
            this.frontmatter,
            flattenExtFiles(this.ruleFiles)
        )
        let nameBit = `${this.root.basename}.md`.replace(
            `.${this.ext}`,
            `.${this.targetExt}`
        )
        nameBit = [ns, nameBit].filter(x => x).join(".")
        const destx = `_CRITICAL_${nameBit}`
        const index = this.srcIndexFile
        const d = DestContent.dest(index.src, root.join(destx), rf.data)
        return d
    }

    private get _targetPath() {
        const ruleDest = `_CRITICAL_${this.root.basename}.instructions.md`
        return ruleDest
    }

    get srcDest() {
        return new SrcDest(this.root, this._targetPath)
    }
}
