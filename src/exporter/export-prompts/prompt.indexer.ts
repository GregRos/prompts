import { Path } from "../../util/pathlib.js"
import { ExtensionGroup, ExtFile } from "../base/extension-indexer.js"

export class PromptGroup extends ExtensionGroup {
    private constructor(
        root: Path,
        frontmatter: Record<string, any>,
        ruleFiles: ExtFile[]
    ) {
        super(root, frontmatter, ruleFiles, "prompt", "prompt")
    }

    static async create(root: Path): Promise<PromptGroup> {
        const base = await ExtensionGroup.create(root, "prompt", "prompt")
        return new PromptGroup(base.root, base.frontmatter, base.ruleFiles)
    }
}

export class PromptIndexer {
    private constructor(
        readonly root: Path,
        readonly namespace: string,
        readonly promptGroups: PromptGroup[] = []
    ) {}

    destContent(root: Path) {
        const files = this.promptGroups.map(g =>
            g.destContent(root, this.namespace)
        )
        return files
    }

    get srcContents() {
        return this.promptGroups.flatMap(g => g.srcContent)
    }

    static async create(root: Path, namespace: string): Promise<PromptIndexer> {
        const groupDirs = await root.glob("*.prompt", {
            cwd: root.toString(),
            onlyDirectories: true
        })

        const groups = await Promise.all(
            groupDirs.map(async dir => {
                return PromptGroup.create(dir)
            })
        )

        return new PromptIndexer(root, namespace, groups)
    }
}
