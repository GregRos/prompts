import { frontmatter } from "../../util/frontmatter.js"
import { Path } from "../../util/pathlib.js"
import { dumpYamlFrontmatter } from "../frontmatter/dump-frontmatter.js"
import { type Frontmatter } from "../frontmatter/load-frontmatter.js"
import { DestContent, SrcDest } from "../src-dest.js"
import { expandRuleFrontmatter } from "./expander.js"
import { flattenRuleFiles } from "./flatten.js"

export class RuleFile {
    constructor(
        readonly path: string,
        readonly frontmatter: Frontmatter,
        readonly _content: string
    ) {}

    static async fromPath(path: Path): Promise<RuleFile> {
        const content = await path.readFile("utf-8")
        const fm = frontmatter<{ [key: string]: any }>(content)
        return new RuleFile(path.toString(), fm.attributes, fm.body)
    }

    static fromContent(
        path: string,
        frontmatter: Frontmatter,
        content: string
    ): RuleFile {
        return new RuleFile(path, frontmatter, content)
    }

    get body() {
        return this._content.trim()
    }

    get data(): string {
        const fmString = dumpYamlFrontmatter(this.frontmatter)
        return `${fmString}\n\n${this.body}`
    }
}
export class RuleGroup {
    private constructor(
        readonly root: Path,
        readonly frontmatter: Frontmatter,
        readonly ruleFiles: RuleFile[]
    ) {
        this.ruleFiles.sort((a, b) => a.path.localeCompare(b.path))
    }

    static async create(root: Path): Promise<RuleGroup> {
        const ruleFiles = await root.glob("*.rules.md")
        ruleFiles.sort((a, b) => (a.path < b.path ? -1 : 1))
        const ruleFilePromises = ruleFiles.map(file => RuleFile.fromPath(file))
        const resolvedRuleFiles = await Promise.all(ruleFilePromises)
        const indexRuleFilePath = root.join("_.md")
        if (!(await indexRuleFilePath.exists())) {
            throw new Error(
                `No main rule file found in group: ${root.toString()}`
            )
        }
        const indexRuleFile = await RuleFile.fromPath(indexRuleFilePath)

        if (!indexRuleFile) {
            throw new Error(
                `No main rule file found in group: ${root.toString()}`
            )
        }
        const frontmatter = indexRuleFile.frontmatter
        const expanded = expandRuleFrontmatter(frontmatter)

        const rg = new RuleGroup(root, expanded, resolvedRuleFiles)

        return rg
    }

    get indexFilePath() {
        return this.root.join("_.md")
    }

    get srcIndexFile() {
        const indexPath = this.indexFilePath
        const indexC = DestContent.src(
            indexPath,
            flattenRuleFiles(this.ruleFiles)
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
        const rf = RuleFile.fromContent(
            this.indexFilePath.toString(),
            this.frontmatter,
            flattenRuleFiles(this.ruleFiles)
        )
        let nameBit = `${this.root.basename}.md`.replace(
            ".rules",
            ".instructions"
        )
        nameBit = [ns, nameBit].filter(x => x).join(".")
        const destx = `_${nameBit}`
        const ruleDest = destx
        const index = this.srcIndexFile
        const d = DestContent.dest(index.src, root.join(ruleDest), rf.data)
        return d
    }

    private get _targetPath() {
        const ruleDest = `_${this.root.basename}.instructions.md`
        return ruleDest
    }

    get srcDest() {
        return new SrcDest(this.root, this._targetPath)
    }
}

export class RuleIndexer {
    private constructor(
        readonly root: Path,
        readonly namespace: string,
        readonly ruleGroups: RuleGroup[] = []
    ) {}

    destContent(root: Path): DestContent[] {
        const ruleFiles = this.ruleGroups.map(grp =>
            grp.destContent(root, this.namespace)
        )
        return ruleFiles
    }
    get srcContents() {
        return this.ruleGroups.flatMap(grp => grp.srcContent)
    }
    static async create(root: Path, namespace: string): Promise<RuleIndexer> {
        const groupDirs = await root.glob("*.rules", {
            cwd: root.toString(),
            onlyDirectories: true
        })

        const groups = await Promise.all(
            groupDirs.map(async dir => {
                return RuleGroup.create(dir)
            })
        )

        return new RuleIndexer(root, namespace, groups)
    }
}
