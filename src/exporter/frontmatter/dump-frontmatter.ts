import { dump } from "js-yaml"

export function dumpYamlFrontmatter(frontmatter: object) {
    const dumped = dump(frontmatter, {
        quotingType: '"',
        forceQuotes: true
    })
    return ["---", dumped.trim(), "---"].join("\n")
}
