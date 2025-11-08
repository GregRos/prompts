import { ExtFile } from "./extension-indexer.js"

export function flattenExtFiles(ruleFiles: ExtFile[]) {
    const contents = ruleFiles.map(file => file.body)
    const everything = contents
        .map(x => x.trim())
        .join("\n")
        .trim()
    return everything
}
