import { Path } from "../util/pathlib.js"
import { MasterIndex } from "./parse-markdown/master-index.js"

export async function runExport(sourceDir: string, destDir: string) {
    const sourcePath = Path(sourceDir)
    const destRoot = Path(destDir)
    destRoot.globSync("_*.md").map(x => x.deleteSync())

    const masterIndex = await MasterIndex.create(sourcePath)
    const writes = masterIndex.destContent(destRoot)
    const allWrites = writes.map(x => {
        const newContent = masterIndex.resolveMarkdown(x.src, x.content)
        return x.withContent(newContent)
    })

    const writePs = allWrites.map(async write => {
        const relDest = destRoot.relative(write.path)
        const relSrc = sourcePath.relative(write.src)
        console.log(
            `${relSrc}: Writing ${write.content.length} bytes to ${relDest}`
        )
        await write.path.writeFile(write.content.trim(), "utf-8")
    })
    await Promise.all(writePs)
}
