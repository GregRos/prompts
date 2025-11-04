import { aseq } from "doddle"
import { Path } from "../util/pathlib.js"
import { ChatModeIndexer } from "./export-chatmodes/chat-mode-indexer.js"
import { RuleIndexer } from "./export-rules/rule-indexer.js"
import { MasterIndex } from "./parse-markdown/master-index.js"
import { DestContent } from "./src-dest.js"

export async function runExport(sourceDir: string, destDir: string) {
    const sourcePath = Path(sourceDir)
    const destRoot = Path(destDir)
    destRoot.globSync("_*.md").map(x => x.deleteSync())
    const chatModeIndexer = await ChatModeIndexer.create(sourcePath)
    const ruleIndexer = await RuleIndexer.create(sourcePath)
    const masterIndex = new MasterIndex(sourcePath, chatModeIndexer, ruleIndexer)
    const writeRules = aseq(ruleIndexer.ruleGroups).map(async grp => {
        const flattened = await grp.flatten()
        const destPath = destRoot.join(flattened.path.toString())
        const content = await flattened.contentWithFrontmatter()
        return new DestContent(destPath, content)
    })
    const writeChatModes = aseq(chatModeIndexer.chatModes).flatMap(async cm => {
        const chatModeFile = await cm.chatModeFile.readFile("utf-8")
        const destFiles = [...cm.pairs].map(async x => {
            const content = await x.src.readFile("utf-8")
            const resolved = await masterIndex.resolveMarkdown(content)
            const destPath = destRoot.join(x.dest)
            return new DestContent(destPath, resolved)
        })
        return destFiles
    })
    const writeChatModesExtras = aseq(chatModeIndexer.extraPairs).map(async x => {
        const content = await x.src.readFile("utf-8")
        const resolved = await masterIndex.resolveMarkdown(content)
        const destPath = destRoot.join(x.dest)
        return new DestContent(destPath, resolved)
    })
    const allWrites = await writeRules
        .concat(writeChatModes)
        .concat(writeChatModesExtras)
        .map(async x => {
            const newContent = await masterIndex.resolveMarkdown(x.content)
            return x.withContent(newContent)
        })
        .toSeq()
        .pull()

    const writePs = allWrites.map(async write => {
        console.log(`Writing ${write.content.length} bytes to ${write.path.toString()}`)
        await write.path.writeFile(write.content.trim(), "utf-8")
    })
    await Promise.all(writePs)
}
