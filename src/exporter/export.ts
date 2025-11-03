import { aseq } from "doddle"
import { Path } from "../util/pathlib.js"
import { ChatModeIndexer } from "./export-chatmodes/chat-mode-indexer.js"
import { RuleIndexer } from "./export-rules/rule-indexer.js"
import { MasterIndex } from "./parse-markdown/master-index.js"
import { DestContent } from "./src-dest.js"

export async function runExport(sourceDir: string, destDir: string) {
    const sourcePath = Path(sourceDir)
    const destRoot = Path(destDir)
    const chatModeIndexer = await ChatModeIndexer.create(sourcePath)
    const ruleIndexer = await RuleIndexer.create(sourcePath)
    const masterIndex = new MasterIndex(sourcePath, chatModeIndexer, ruleIndexer)
    const writeRules = aseq(ruleIndexer.ruleGroups).map(async grp => {
        const flattened = await grp.flatten()
        const destPath = destRoot.join(flattened.path.toString())
        const content = flattened.content
        return new DestContent(destPath, content)
    })
    const writeChatModes = aseq(chatModeIndexer.chatModes).map(async cm => {
        const chatModeFile = await cm.chatModeFile.readFile("utf-8")
        const resolvedChatMode = await masterIndex.resolveMarkdown(chatModeFile)
        const destPath = destRoot.join(cm.chatModeFile.toString())
        return new DestContent(destPath, resolvedChatMode)
    })
    const allWrites = await writeRules
        .concat(writeChatModes)
        .map(async x => {
            const newContent = await masterIndex.resolveMarkdown(x.content)
            return x.withContent(newContent)
        })
        .toSeq()
        .pull()

    const writePs = allWrites.map(async write => {
        await write.path.writeFile(write.content, "utf-8")
    })
    await Promise.all(writePs)
}
