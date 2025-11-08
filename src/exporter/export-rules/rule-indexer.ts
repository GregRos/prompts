import { Path } from "../../util/pathlib.js"
import { ExtensionGroup, ExtFile } from "../base/extension-indexer.js"
import { type Frontmatter } from "../frontmatter/load-frontmatter.js"
import { DestContent } from "../src-dest.js"
import { expandRuleFrontmatter } from "./expander.js"

export class RuleGroup extends ExtensionGroup {
    private constructor(
        root: Path,
        frontmatter: Frontmatter,
        ruleFiles: ExtFile[]
    ) {
        super(root, frontmatter, ruleFiles, "rules", "instructions")
    }

    static async create(root: Path): Promise<RuleGroup> {
        const base = await ExtensionGroup.create(root, "rules", "instructions")
        const expanded = expandRuleFrontmatter(base.frontmatter)
        return new RuleGroup(base.root, expanded, base.ruleFiles)
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
