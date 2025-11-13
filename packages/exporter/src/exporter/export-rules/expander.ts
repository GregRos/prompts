import type { Frontmatter } from "../frontmatter/load-frontmatter.js"

function makeExtensions(exts: string[]): string {
    return exts.map(ext => `**/*.${ext}`).join(",")
}

const jsExts = ["js", "jsx", "ts", "tsx", "cjs", "mjs"]
const tsExts = ["ts", "tsx", "cts", "mts"]
const pythonExts = ["py", "pyw", "pyi"]
const dataExts = [
    "json",
    "yaml",
    "yml",
    "toml",
    "xml",
    "csv",
    "ini",
    "env",
    "dotenv"
]
const otherExts = [
    "java",
    "go",
    "rb",
    "php",
    "rs",
    "swift",
    "kt",
    "kts",
    "scala",
    "sh",
    "bash",
    "zsh",
    "ps1"
]
const jsFiles = makeExtensions(jsExts)

const tsFiles = makeExtensions(tsExts)

const jsTsFiles = makeExtensions([...jsExts, ...tsExts])

const pythonFiles = makeExtensions(pythonExts)

const allCode = makeExtensions([
    ...jsExts,
    ...tsExts,
    ...pythonExts,
    ...dataExts,
    ...otherExts
])

const replaceRegex = /\$\{(\w+)\}/
function expandApplyTo(applyTo: string): string {
    const match = applyTo.match(replaceRegex)
    if (!match) {
        // If it's a path or glob (contains path separators, wildcards, or a file extension like `a.txt`), return it as-is.
        const pathOrGlobRegex = /(^\.{0,2}[\/\\])|[\/\\]|[*?]|\.[a-z0-9]+$/i
        if (pathOrGlobRegex.test(applyTo)) {
            return applyTo
        }
    }
    if (!match) {
        throw new Error(`applyTo does not match regex: ${applyTo}`)
    }
    const code = match[1]
    switch (code) {
        case "JS_FILES":
            return jsFiles
        case "TS_FILES":
            return tsFiles
        case "JS_TS_FILES":
            return jsTsFiles
        case "PY_FILES":
            return pythonFiles
        case "CODE_FILES":
            return allCode
        default:
            throw new Error(`applyTo has unknown code: ${applyTo}`)
    }
}
export function expandRuleFrontmatter(frontmatter: Frontmatter): Frontmatter {
    const expanded = { ...frontmatter }
    if (typeof expanded.applyTo === "string") {
        expanded.applyTo = expandApplyTo(expanded.applyTo)
    }
    return expanded
}
