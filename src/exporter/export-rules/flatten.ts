import { RuleFile } from "./rule-indexer.js"

export function flattenRuleFiles(ruleFiles: RuleFile[]) {
    const contents = ruleFiles.map(file => file.body)
    const everything = contents
        .map(x => x.trim())
        .join("\n")
        .trim()
    return everything
}
