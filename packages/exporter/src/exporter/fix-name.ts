export function fixExportedFileName(name: string) {
    return `_${name.replace(".rules.md", ".instructions.md")}`
}

export function fixExportedPath(path: string) {
    const parts = path.split("/")
    const fileName = parts.pop()!
    const fixedName = fixExportedFileName(fileName)
    return [...parts, fixedName].join("/")
}
