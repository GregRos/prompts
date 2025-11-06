import { default as origFm } from "front-matter"

export const frontmatter = origFm as any as typeof origFm.default
