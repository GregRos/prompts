import type { Path } from "../../util/pathlib.js"
import { fixExportedFileName } from "../fix-name.js"
import { SrcDest } from "../src-dest.js"

async function getRuleFilesForChatMode(chatModePath: Path): Promise<Path[]> {
    const rulesDir = chatModePath
    return await rulesDir.glob("**/*.rules.md", {
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
        const ruleFiles = this.ruleFiles.map(
            ruleFile => new SrcDest(ruleFile, fixExportedFileName(ruleFile.basename))
        )
        const chatFile = new SrcDest(
            this.chatModeFile,
            fixExportedFileName(this.chatModeFile.basename)
        )
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
        readonly chatModes: ChatMode[],
        readonly extraPairs: SrcDest[]
    ) {}

    get pairs() {
        return this.chatModes.flatMap(cm => cm.pairs).concat(this.extraPairs)
    }

    static async create(root: Path): Promise<ChatModeIndexer> {
        const chatModeRoot = root.join("chat-modes")
        const chatModeDirs = await chatModeRoot.glob("*.chatmode", {
            onlyDirectories: true
        })
        const chatModePromises = await Promise.all(chatModeDirs.map(dir => ChatMode.create(dir)))
        const extras = await chatModeRoot.glob("*.md", {
            onlyFiles: true,
            absolute: true
        })
        const extraPairs = extras.map(file => new SrcDest(file, fixExportedFileName(file.basename)))
        return new ChatModeIndexer(root, chatModePromises, extraPairs)
    }
}
