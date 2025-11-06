import type { Path } from "../../util/pathlib.js"
import { RuleIndexer } from "../export-rules/rule-indexer.js"
import { DestContent } from "../src-dest.js"

export class AgentFile {
    constructor(
        readonly path: Path,
        readonly content: string
    ) {}

    get _targetName() {
        return `_${this.path.parent().basename}.md`
    }

    static async fromPath(path: Path): Promise<AgentFile> {
        const content = await path.readFile("utf-8")
        return new AgentFile(path, content)
    }

    destContent(root: Path): DestContent {
        const destPath = root.join(this._targetName)
        return DestContent.dest(this.path, destPath, this.content)
    }

    get srcContent() {
        return DestContent.src(this.path, this.content)
    }
}

export class Agent {
    constructor(
        readonly name: string,
        readonly agentFile: AgentFile,
        readonly ruleIndexer: RuleIndexer
    ) {}

    destContent(root: Path): DestContent[] {
        const f = [
            this.agentFile.destContent(root),
            ...this.ruleIndexer.destContent(root)
        ]
        return f
    }

    get srcContent() {
        const ruleFiles = this.ruleIndexer.ruleGroups.flatMap(
            grp => grp.srcContent
        )
        return [this.agentFile.srcContent, ...ruleFiles]
    }

    static async create(path: Path): Promise<Agent> {
        const indexPath = path.join("_.md")
        const chatModeFile = await AgentFile.fromPath(indexPath)
        const ruleFiles = await RuleIndexer.create(
            path.join("rules"),
            path.basename
        )

        return new Agent(path.basename, chatModeFile, ruleFiles)
    }
}

export class AgentIndexer {
    destContent(root: Path) {
        return this.agents.flatMap(cm => cm.destContent(root))
    }
    private constructor(
        readonly root: Path,
        readonly agents: Agent[]
    ) {}

    get srcContent() {
        return this.agents.flatMap(cm => cm.srcContent)
    }

    static async create(root: Path): Promise<AgentIndexer> {
        const agentDirs = await root.glob("*.agent", {
            onlyDirectories: true
        })
        const agentPromises = await Promise.all(
            agentDirs.map(dir => Agent.create(dir))
        )

        return new AgentIndexer(root, agentPromises)
    }
}
