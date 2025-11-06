import type { Path } from "../util/pathlib.js"

export class SrcDest {
    constructor(
        readonly src: Path,
        readonly dest: string
    ) {}
}

export class DestContent {
    constructor(
        readonly src: Path,
        readonly path: Path,
        readonly content: string
    ) {}

    static src(src: Path, content: string): DestContent {
        return new DestContent(src, src, content)
    }

    static dest(src: Path, path: Path, content: string): DestContent {
        return new DestContent(src, path, content)
    }

    withContent(newContent: string): DestContent {
        return new DestContent(this.src, this.path, newContent)
    }
}
