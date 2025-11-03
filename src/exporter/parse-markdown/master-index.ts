import { doddle } from "doddle"
import { string } from "parjs"
import { many, map, or, then } from "parjs/combinators"
import type {} from "rxjs"
import type { Path } from "../../util/pathlib.js"
import { ChatModeIndexer } from "../export-chatmodes/chat-mode-indexer.js"
import { RuleIndexer } from "../export-rules/rule-indexer.js"
import { anyCharOrEscape, textTillCloserWithAlt } from "./parse-bracketted-notation.js"
import { pRemovePercentComments } from "./remove-comments.js"

export class MasterIndex {
    constructor(
        readonly root: Path,
        readonly chatModeIndex: ChatModeIndexer,
        readonly rulesIndexer: RuleIndexer
    ) {}
    static async create(root: Path): Promise<MasterIndex> {
        const chatModeIndexer = await ChatModeIndexer.create(root)
        const ruleIndexer = await RuleIndexer.create(root)
        return new MasterIndex(root, chatModeIndexer, ruleIndexer)
    }

    resolveMarkdown(text: string): Promise<string> {
        const noComments = pRemovePercentComments.parse(text).value
        const parser = this._internalLinkParser.pull()
        return parser.parse(noComments).value
    }

    private _internalLinkParser = doddle(() => {
        const embed = string("![[").pipe(map(x => "embed"))
        const link = string("[[").pipe(map(x => "link"))
        const embedOrLink = embed.pipe(or(link))
        const interLink = embedOrLink.pipe(
            then(textTillCloserWithAlt("]]")),
            map(async ([type, x]) => {
                if (type === "embed") {
                    return await this.getSrcFileContent(x.main)
                }
                const interlinkTarget = this.getDestFileByName(x.main)!

                const linkText = x.alt
                const linkTarget = interlinkTarget.toString().replaceAll("\\", "/")
                return `[${linkText}](${linkTarget})`
            }),
            or(anyCharOrEscape.pipe(map(x => Promise.resolve(x)))),
            many(),
            map(xs => Promise.all(xs).then(xs => xs.join("")))
        )
        return interLink
    })

    get pairs() {
        return this.rulesIndexer.ruleGroups
            .flatMap(grp => grp.pairs)
            .concat(this.chatModeIndex.pairs)
    }

    async getSrcFileContent(name: string): Promise<string | undefined> {
        const { src } = this.pairs.find(file => file.src.toString().endsWith(name))!
        return await src.readFile("utf-8")
    }

    getDestFileByName(name: string): Path | undefined {
        const { dest } = this.pairs.find(file => file.src.toString().endsWith(name))!
        return dest
    }
}
