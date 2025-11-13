import { frontmatter } from "../../util/frontmatter.js"
import { Path } from "../../util/pathlib.js"
import { dumpMarkdown } from "../frontmatter/dump-frontmatter.js"
import { Frontmatter } from "../frontmatter/load-frontmatter.js"
import { DestContent } from "../src-dest.js"

export class PromptFile {
    constructor(
        readonly path: Path,
        readonly frontmatter: Frontmatter,
        readonly body: string
    ) {}

    get _targetName() {
        return `_CRITICAL_${this.path.parent().basename}.md`
    }

    static async fromPath(path: Path): Promise<PromptFile> {
        const content = await path.readFile("utf-8")
        const fm = frontmatter(content)
        return new PromptFile(path, fm.attributes as {}, fm.body)
    }

    destContent(root: Path): DestContent {
        const destPath = root.join(this._targetName)
        return DestContent.dest(
            this.path,
            destPath,
            dumpMarkdown(this.frontmatter, this.body)
        )
    }

    get srcContent() {
        return DestContent.src(this.path, this.body)
    }
}

export class SectionFile {
    constructor(
        readonly path: Path,
        readonly content: string
    ) {}

    static async create(path: Path): Promise<SectionFile> {
        const content = await path.readFile("utf-8")
        return new SectionFile(path, content)
    }
}

export class PromptGroup {
    constructor(
        readonly name: string,
        readonly promptFile: PromptFile,
        readonly secFiles: SectionFile[]
    ) {}

    destContent(root: Path): DestContent[] {
        const f = [this.promptFile.destContent(root)].map(dc => {
            return DestContent.dest(dc.src, Path(dc.path.path), dc.content)
        })
        return f
    }

    get srcContent() {
        return [this.promptFile.srcContent, ...this.secFiles]
    }

    static async create(path: Path): Promise<PromptGroup> {
        const indexPath = path.join("_.md")
        const chatModeFile = await PromptFile.fromPath(indexPath)

        const secFilePaths = await path.glob("*.sec.md", { onlyFiles: true })
        secFilePaths.sort((a, b) => (a.path < b.path ? -1 : 1))
        const secFilePromises = secFilePaths.map(secPath =>
            SectionFile.create(secPath)
        )
        const secFiles = await Promise.all(secFilePromises)

        return new PromptGroup(
            path.withExtension("").basename,
            chatModeFile,
            secFiles
        )
    }
}

export class PromptIndexer {
    findPromptByName(name: string) {
        const group = this.agents.find(a => a.name === name)
        if (!group) {
            throw new Error(`Prompt group not found: ${name}`)
        }
        return group
    }
    destContent(root: Path) {
        return this.agents.flatMap(cm => cm.destContent(root))
    }
    private constructor(
        readonly root: Path,
        readonly agents: PromptGroup[]
    ) {}

    get srcContents() {
        return this.agents.flatMap(cm => cm.srcContent)
    }

    static async create(root: Path): Promise<PromptIndexer> {
        const agentDirs = await root.glob("*.prompt", {
            onlyDirectories: true
        })
        const agentPromises = await Promise.all(
            agentDirs.map(dir => PromptGroup.create(dir))
        )

        return new PromptIndexer(root, agentPromises)
    }
}
