import { doddle } from "doddle"
import { string } from "parjs"
import { many, map, or, then } from "parjs/combinators"
import type {} from "rxjs"
import { frontmatter } from "../../util/frontmatter.js"
import { Path } from "../../util/pathlib.js"
import { AgentIndexer } from "../export-agents/agent-indexer.js"
import { PromptIndexer } from "../export-prompts/prompt.indexer.js"
import { RefIndexer } from "../export-ref/ref-indexer.js"
import { RuleIndexer } from "../export-rules/rule-indexer.js"
import { dumpMarkdown } from "../frontmatter/dump-frontmatter.js"
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
        readonly refIndexer: RefIndexer,
        readonly promptIndexer: PromptIndexer
    ) {}
    static async create(root: Path): Promise<MasterIndex> {
        const agentIndexer = await AgentIndexer.create(root.join("agents"))
        const ruleIndexer = await RuleIndexer.create(root.join("rules"), "_x")
        const refIndexer = await RefIndexer.create(root.join("refs"))
        const promptIndexer = await PromptIndexer.create(root.join("prompts"))

        return new MasterIndex(
            root,
            agentIndexer,
            ruleIndexer,
            refIndexer,
            promptIndexer
        )
    }

    findPromptByName(name: string) {
        return this.promptIndexer.findPromptByName(name)
    }

    get srcContent() {
        return [
            ...this.agentIndex.srcContents,
            ...this.rulesIndexer.srcContents,
            ...this.refIndexer.srcContents,
            ...this.promptIndexer.srcContents
        ]
    }

    destContent(root: Path) {
        const chatModes = this.agentIndex.destContent(root)
        const rules = this.rulesIndexer.destContent(root)
        const refs = this.refIndexer.destContent(root)
        const prompts = this.promptIndexer.destContent(root)
        return [...chatModes, ...rules, ...refs, ...prompts]
    }

    resolveMarkdown(file: Path, text: string) {
        const parsed = frontmatter(text)
        const linkParser = this._internalLinkParser.pull()
        let result = parsed.body
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
        const resolveToolReferences = /\`#([a-zA-Z0-9:_-]+)\`/g
        result = result.replace(
            resolveToolReferences,
            (_, toolName) => `#${toolName}`
        )
        return {
            body: result,
            frontmatter: parsed.frontmatter,
            raw() {
                return dumpMarkdown(parsed.attributes!, result)
            }
        }
    }

    private _internalLinkParser = doddle(() => {
        const embed = string("![[").pipe(map(x => "embed"))
        const link = string("[[").pipe(map(x => "link"))
        const embedOrLink = embed.pipe(or(link))
        const interLink = embedOrLink.pipe(
            then(textTillCloserWithAlt("]]")),
            map(([type, x]) => {
                if (x.main.endsWith(".sec")) {
                    const tagName = x.main.replace(".sec", "").replace(/^_/, "")
                    if (type === "embed") {
                        const content = this.getSrcFileContent(x.main)
                        const result = [
                            `<${tagName}>`,
                            content.trim(),
                            `</${tagName}>`
                        ].join("\n")
                        return result
                    }
                    return `<${tagName}>`
                }
                if (type === "embed") {
                    return this.getSrcFileContent(x.main)
                }
                const interlinkTarget = this.getDestFileByName(x.main)!

                const linkText = x.alt
                const linkTarget = interlinkTarget
                    .toString()
                    .replaceAll("\\", "/")
                const encoded = `vscode-userdata:${linkTarget}`
                if (!linkText) {
                    return `[](${encoded})`
                }
                return `[${linkText}](${encoded})`
            }),
            or(anyCharOrEscape.pipe(map(x => x))),
            many(),
            map(xs => xs.join(""))
        )
        return interLink
    })

    getSrcFileContent(name: string): string {
        if (name.includes("/")) {
            const relPath = this.root.join(name)
            console.log(`Resolving interlink by path: ${relPath}`)
            const relPaths = this.srcContent.map(x =>
                this.root.relative(x.path).toString()
            )
            return this.srcContent.find(
                file =>
                    this.root.relative(file.path).toString() === `${name}.md`
            )!.content
        }
        const file = this.srcContent.find(file =>
            file.path.withExtension("").toString().endsWith(`/${name}`)
        )
        if (!file) {
            throw new Error(`Could not find src file for interlink ${name}`)
        }
        return this.resolveMarkdown(file.path, file.content).body
    }

    getDestFileByName(name: string): string {
        const destFiles = this.destContent(this.root)
        const destFile = destFiles.find(file =>
            file.src.withExtension("").toString().endsWith(`/${name}`)
        )
        if (!destFile) {
            throw new Error(`Could not find dest file for interlink ${name}`)
        }
        const p = this.root.relative(destFile.path).toString()

        return p
    }
}
