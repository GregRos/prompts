import { seq } from "doddle"
import { rm, writeFile } from "fs/promises"
import { globby } from "globby"
import {} from "timers/promises"
import { yamprint } from "yamprint"
import { getComputedIndexedFiles } from "./indexing/file-index.js"
export async function runExport(src: string, dest: string) {
    const fileIndex = await getComputedIndexedFiles(src)
    console.log("FILES TO EXPORT", yamprint(fileIndex.map(x => x.flattenedName)))
    const set = new Set<string>()
    let totalTokens = 0
    const writeThem = fileIndex.map(async mdFile => {
        const cost = await mdFile.tokenCost()
        console.log(`tokens for ${mdFile.flattenedName}:`, cost)
        totalTokens += cost
        const contents = await mdFile.contents()
        const destPath = mdFile.flattenedPathAt(dest)
        set.add(destPath.replaceAll("\\", "/"))
        await writeFile(destPath, contents, "utf-8")
    })
    await Promise.all(writeThem)
    console.log("TOTAL TOKENS", totalTokens)

    const foundFiles = await globby(`**/*.p.instructions.md`, {
        cwd: dest,
        onlyFiles: true,
        absolute: true
    })
    const deleteThem = seq(foundFiles).map(async f => {
        if (!set.has(f)) {
            await rm(f)
        }
    })
    await Promise.all(deleteThem)
}
