import { pathToFileURL } from "node:url"
import type { Path } from "../../util/pathlib.js"

export type FrontmatterLeaf = string | number | boolean | Frontmatter
export type Frontmatter = {
    [key: string]: FrontmatterLeaf | FrontmatterLeaf[]
}

function getPureModuleUrl(folder: Path, name = "_.js") {
    return pathToFileURL(`${folder}/${name}`).href
}
function getCacheBustingModulePath(folder: Path) {
    return `${getPureModuleUrl(folder)}?t=${Date.now()}`
}
export async function getFrontmatterScriptAt(_path: Path): Promise<Frontmatter> {
    const attemptedPath = getPureModuleUrl(_path)
    try {
        console.log(`Loading frontmatter from ${attemptedPath}`)
        const imported = await import(attemptedPath)
        return {
            ...imported
        }
    } catch (error: any) {
        if (error?.code?.includes("NOT_FOUND")) {
            console.error(error.message)
            return {}
        }

        throw error
    }
}
