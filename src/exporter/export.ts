import { frontmatter } from "../util/frontmatter.js"
import { Path } from "../util/pathlib.js"
import { dumpMarkdown } from "./frontmatter/dump-frontmatter.js"
import { MasterIndex } from "./parse-markdown/master-index.js"

function encodeUriSafe(str: string) {
    return encodeURI(str).replace(":", "%3A")
}

export async function runExport(sourceDir: string, destDir: string) {
    const sourcePath = Path(sourceDir)
    const destRoot = Path(destDir)

    const masterIndex = await MasterIndex.create(sourcePath)
    const writes = masterIndex.destContent(destRoot)
    const allWrites = writes.map(x => {
        const newContent = masterIndex.resolveMarkdown(x.src, x.content).raw()
        return x.withContent(newContent)
    })

    const writePs = allWrites.map(async write => {
        const relDest = destRoot.relative(write.path)
        const relSrc = sourcePath.relative(write.src)
        console.log(
            `${relSrc}: Writing ${write.content.length} bytes to ${relDest}`
        )
        let contents = write.content.trim()
        contents = contents.replaceAll(
            /\[\]\((vscode-userdata:)([^\)]+)\)/g,
            (_, protocol, file) => {
                const resolved = destRoot.join(file).toString()
                const encoded = encodeUriSafe(resolved)
                return `'${protocol}/${encoded}'`
            }
        )
        if (relDest.endsWith(".instructions.md")) {
            const newFm = frontmatter<any>(contents)
            if (!newFm.attributes?.applyTo) {
                newFm.attributes.applyTo = []
            }
            contents = dumpMarkdown(newFm.attributes, newFm.body)
        }
        await write.path.writeFile(contents, "utf-8")
    })
    const allWritesPaths = allWrites.map(x => x.path.path)
    destRoot
        .globSync("_*.md")
        .filter(x => !allWritesPaths.includes(x.path))
        .map(x => {
            console.log(`Removing stale file ${destRoot.relative(x)}`)
            return x.deleteSync()
        })

    await Promise.all(writePs)
}
