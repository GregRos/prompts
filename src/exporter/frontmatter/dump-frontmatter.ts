import { dump } from "js-yaml"

export function formatFrontmatter(frontmatter: object) {
    const dumped = dump(frontmatter, {
        quotingType: '"',
        forceQuotes: true
    })
    return ["---", dumped.trim(), "---"].join("\n")
}
