import type { Path } from "../../util/pathlib.js"
import type { MasterIndex } from "../parse-markdown/master-index.js"
import { RuleIndexer } from "./rule-indexer.js"

export async function run(masterIndexer: MasterIndex, destRoot: Path) {
    const ruleRoot = masterIndexer.root.join("rules")
    const ruleIndexer = await RuleIndexer.create(ruleRoot)
}
