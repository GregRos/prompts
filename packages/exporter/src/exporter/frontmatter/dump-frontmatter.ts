import { dump } from "js-yaml"

export function dumpYamlFrontmatter(frontmatter: object) {
    if (Object.keys(frontmatter).length === 0) {
        return ""
    }
    const dumped = dump(frontmatter, {
        quotingType: '"',
        forceQuotes: true
    })
    return ["---", dumped.trim(), "---"].join("\n")
}

export function dumpMarkdown(frontmatter: object, body: string) {
    const fmString = dumpYamlFrontmatter(frontmatter)
    return `${fmString}\n\n${body}`
}
