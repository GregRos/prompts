import { anyChar, string } from "parjs"
import { each, manyTill, or, qthen, then } from "parjs/combinators"

export const textTillCloserWithAlt = <T extends string>(closer: T) => {
    const altSection = string("|").pipe(then(anyCharOrEscape.pipe(manyTill(closer))))
    const tillAltSectionOrCloser = manyTill(altSection.pipe(or(closer)), (_main, till) => {
        const main = _main.join("")
        if (Array.isArray(till)) {
            return {
                main,
                alt: till[1].join("")
            }
        }
        return {
            main,
            alt: undefined
        }
    })
    const textTillAltOrCloser = anyCharOrEscape.pipe(
        tillAltSectionOrCloser,
        each(x => {
            x.main = x.main.replaceAll(" ", "-").toLowerCase()
        })
    )
    return textTillAltOrCloser
}

export const anyCharOrEscape = anyChar().pipe(or(string("\\").pipe(qthen(anyChar()))))
