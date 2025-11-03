import type { Path } from "../../util/pathlib.js"
import { SrcDest } from "../src-dest.js"

async function getRuleFilesForChatMode(chatModePath: Path): Promise<Path[]> {
    const rulesDir = chatModePath.join("rules")
    return await rulesDir.glob("*.rules.md", {
        onlyFiles: true,
        absolute: true
    })
}

export class ChatMode {
    constructor(
        readonly chatModeFile: Path,
        readonly ruleFiles: Path[]
    ) {}

    get pairs() {
        const ruleFiles = this.ruleFiles.map(ruleFile => new SrcDest(ruleFile, ruleFile))
        const chatFile = new SrcDest(this.chatModeFile, this.chatModeFile)
        return [...ruleFiles, chatFile]
    }

    static async create(path: Path): Promise<ChatMode> {
        const chatModeFile = await path.glob("*.chatmode.md", {
            onlyFiles: true,
            absolute: true
        })
        const ruleFiles = await getRuleFilesForChatMode(path)

        return new ChatMode(chatModeFile[0], ruleFiles)
    }
}

export class ChatModeIndexer {
    private constructor(
        readonly root: Path,
        readonly chatModes: ChatMode[]
    ) {}

    get pairs() {
        return this.chatModes.flatMap(cm => cm.pairs)
    }

    static async create(root: Path): Promise<ChatModeIndexer> {
        const chatModeRoot = root.join("chat-modes")
        const chatModeDirs = await chatModeRoot.glob("*.chatmode", {
            onlyDirectories: true
        })
        const chatModePromises = await Promise.all(chatModeDirs.map(dir => ChatMode.create(dir)))
        return new ChatModeIndexer(root, chatModePromises)
    }
}
