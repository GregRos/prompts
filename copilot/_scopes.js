function makeExtensions(exts) {
    return exts.map(ext => `**/*.${ext}`).join(",")
}

export const jsExts = ["js", "jsx", "ts", "tsx", "cjs", "mjs"]
export const tsExts = ["ts", "tsx", "cts", "mts"]
export const pythonExts = ["py", "pyw", "pyi"]
export const dataExts = ["json", "yaml", "yml", "toml", "xml", "csv", "ini", "env", "dotenv"]
export const otherExts = [
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
export const jsFiles = makeExtensions(jsExts)

export const tsFiles = makeExtensions(tsExts)

export const jsTsFiles = makeExtensions([...jsExts, ...tsExts])

export const pythonFiles = makeExtensions(pythonExts)

export const allCode = makeExtensions([
    ...jsExts,
    ...tsExts,
    ...pythonExts,
    ...dataExts,
    ...otherExts
])
