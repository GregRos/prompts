import type { Path } from "../util/pathlib.js"

export class SrcDest {
    constructor(
        readonly src: Path,
        readonly dest: Path
    ) {}
}

export class DestContent {
    constructor(
        readonly path: Path,
        readonly content: string
    ) {}

    withContent(newContent: string): DestContent {
        return new DestContent(this.path, newContent)
    }
}
