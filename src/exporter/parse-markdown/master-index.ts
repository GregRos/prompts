import { doddle } from "doddle"
import { string } from "parjs"
import { many, map, or, then } from "parjs/combinators"
import type {} from "rxjs"
import type { Path } from "../../util/pathlib.js"
import { AgentIndexer } from "../export-agents/agent-indexer.js"
import { RefIndexer } from "../export-ref/ref-indexer.js"
import { RuleIndexer } from "../export-rules/rule-indexer.js"
import {
    anyCharOrEscape,
    textTillCloserWithAlt
} from "./parse-bracketted-notation.js"
import { pRemovePercentComments } from "./remove-comments.js"

export class MasterIndex {
    private constructor(
        readonly root: Path,
        readonly agentIndex: AgentIndexer,
        readonly rulesIndexer: RuleIndexer,
        readonly refIndexer: RefIndexer
    ) {}
    static async create(root: Path): Promise<MasterIndex> {
        const agentIndexer = await AgentIndexer.create(root.join("agents"))
        const ruleIndexer = await RuleIndexer.create(root.join("rules"), "_x")
        const refIndexer = await RefIndexer.create(root.join("refs"))
        return new MasterIndex(root, agentIndexer, ruleIndexer, refIndexer)
    }

    get srcContent() {
        return [
            ...this.agentIndex.srcContent,
            ...this.rulesIndexer.srcContents,
            ...this.refIndexer.srcContent
        ]
    }

    destContent(root: Path) {
        const chatModes = this.agentIndex.destContent(root)
        const rules = this.rulesIndexer.destContent(root)
        const refs = this.refIndexer.destContent(root)
        return [...chatModes, ...rules, ...refs]
    }

    resolveMarkdown(file: Path, text: string): string {
        const noComments = text
        const linkParser = this._internalLinkParser.pull()
        let result = noComments
        for (let i = 0; i < 2; i++) {
            try {
                result = pRemovePercentComments.parse(result).value
                result = linkParser.parse(result).value
            } catch (e: any) {
                const relFile = this.root.relative(file)
                throw new Error(
                    `While parsing ${relFile}, failed to resolve link: ${e.message}`,
                    {
                        cause: e
                    }
                )
            }
        }

        return linkParser.parse(noComments).value
    }

    private _internalLinkParser = doddle(() => {
        const embed = string("![[").pipe(map(x => "embed"))
        const link = string("[[").pipe(map(x => "link"))
        const embedOrLink = embed.pipe(or(link))
        const interLink = embedOrLink.pipe(
            then(textTillCloserWithAlt("]]")),
            map(([type, x]) => {
                if (type === "embed") {
                    return this.getSrcFileContent(x.main)
                }
                const interlinkTarget = this.getDestFileByName(x.main)!

                const linkText = x.alt
                const linkTarget = interlinkTarget
                    .toString()
                    .replaceAll("\\", "/")
                return `[${linkText}](${linkTarget})`
            }),
            or(anyCharOrEscape.pipe(map(x => x))),
            many(),
            map(xs => xs.join(""))
        )
        return interLink
    })

    getSrcFileContent(name: string): string | undefined {
        return this.srcContent.find(file =>
            file.path.withExtension("").toString().endsWith(name)
        )?.content
    }

    getDestFileByName(name: string): string {
        const destFiles = this.destContent(this.root)
        const destFile = destFiles.find(file =>
            file.src.withExtension("").toString().endsWith(name)
        )
        if (!destFile) {
            throw new Error(`Could not find dest file for interlink ${name}`)
        }
        return destFile.path.toString()
    }
}
