import { doddle, type DoddleAsync } from "doddle"
import { Path } from "../../util/pathlib.js"
import { dumpYamlFrontmatter } from "../frontmatter/dump-frontmatter.js"
import { getFrontmatterScriptAt, type Frontmatter } from "../frontmatter/load-frontmatter.js"
import { SrcDest } from "../src-dest.js"

export class RuleFile {
    constructor(
        readonly path: string,
        readonly frontmatter: Frontmatter,
        private readonly _content: DoddleAsync<string>
    ) {}

    static async fromPath(path: Path): Promise<RuleFile> {
        return new RuleFile(
            path.toString(),
            {},
            doddle(async () => await path.readFile("utf-8"))
        )
    }

    static async fromContent(
        path: string,
        frontmatter: Frontmatter,
        content: string
    ): Promise<RuleFile> {
        return new RuleFile(
            path,
            frontmatter,
            doddle(async () => content)
        )
    }

    async content() {
        const pulled = await this._content.pull()
        return pulled.trim()
    }

    async contentWithFrontmatter() {
        const pulled = await this.content()
        return [dumpYamlFrontmatter(this.frontmatter), pulled].join("\n\n")
    }
}
export class RuleGroup {
    private constructor(
        readonly root: Path,
        readonly frontmatter: Frontmatter,
        readonly ruleFiles: RuleFile[]
    ) {}

    static async create(root: Path): Promise<RuleGroup> {
        const ruleFiles = await root.glob("**/*.rules.md")
        const ruleFilePromises = ruleFiles.map(file => RuleFile.fromPath(file))
        const resolvedRuleFiles = await Promise.all(ruleFilePromises)
        const frontmatter = await getFrontmatterScriptAt(root)
        return new RuleGroup(root, frontmatter, resolvedRuleFiles)
    }

    get targetPath() {
        const ruleDest = `_${this.root.basename}.instructions.md`
        return ruleDest
    }

    get pairs() {
        return this.ruleFiles.map(ruleFile => new SrcDest(Path(ruleFile.path), this.targetPath))
    }

    async flatten(): Promise<RuleFile> {
        const contents = this.ruleFiles.map(async file => {
            return file.contentWithFrontmatter()
        })
        const everything = Promise.all(contents).then(xs => xs.map(x => x.trim()).join("\n"))
        const ruleDest = this.targetPath.toString()
        return RuleFile.fromContent(ruleDest, this.frontmatter, await everything)
    }
}

export class RuleIndexer {
    private constructor(
        readonly root: Path,
        readonly ruleGroups: RuleGroup[] = []
    ) {}
    get pairs() {
        return this.ruleGroups.flatMap(group => group.pairs)
    }
    static async create(root: Path): Promise<RuleIndexer> {
        root = root.join("rules")
        const groupDirs = await root.glob("*", {
            cwd: root.toString(),
            onlyDirectories: true
        })

        const groups = await Promise.all(
            groupDirs.map(async dir => {
                return RuleGroup.create(dir)
            })
        )

        return new RuleIndexer(root, groups)
    }
}
