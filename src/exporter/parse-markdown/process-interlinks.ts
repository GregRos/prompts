import { string } from "parjs"
import { many, map, or, then } from "parjs/combinators"
import type { Path } from "../../util/pathlib.js"
import { anyCharOrEscape, textTillCloserWithAlt } from "./parse-bracketted-notation.js"

export function createInternalLinkParser(getTargetFile: (slug: string) => Promise<Path>) {
    const embed = string("![[").pipe(map(x => "embed"))
    const link = string("[[").pipe(map(x => "link"))
    const embedOrLink = embed.pipe(or(link))
    const interLink = embedOrLink.pipe(
        then(textTillCloserWithAlt("]]")),
        map(async ([type, x]) => {
            const interlinkTarget = await getTargetFile(x.main)
            if (!interlinkTarget) {
                return `[[${x.main}]]`
            }
            if (type === "embed") {
                const content = await interlinkTarget.readFile("utf-8")
                return content
            }
            const linkText = x.alt
            const linkTarget = interlinkTarget.toString().replaceAll("\\", "/")
            return `[${linkText}](${linkTarget})`
        }),
        or(anyCharOrEscape.pipe(map(x => Promise.resolve(x)))),
        many(),
        map(xs => Promise.all(xs).then(xs => xs.join("")))
    )
    return interLink
}
