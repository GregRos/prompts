import PathNs from "pathlib-js"

export type Path = PathNs.default
export function Path(pathStr: string): Path {
    return new PathNs.default(pathStr)
}
