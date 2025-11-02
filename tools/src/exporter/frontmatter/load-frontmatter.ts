export type FrontmatterLeaf = string | number | boolean | Frontmatter;
export type Frontmatter = {
  [key: string]: FrontmatterLeaf | FrontmatterLeaf[];
};

function getPureModulePath(folder: string) {
  return `${folder}/_.js`;
}
function getCacheBustingModulePath(folder: string) {
  return `${getPureModulePath(folder)}?t=${Date.now()}`;
}
export async function getFrontmatterScriptAt(
  path: string
): Promise<Frontmatter> {
  try {
    const imported = await import(getPureModulePath(path));
    return {
      ...imported,
    };
  } catch (error: any) {
    if (error?.code.includes("NOT_FOUND")) {
      console.warn(`No frontmatter found at ${getPureModulePath(path)}`);
      return {};
    }

    throw error;
  }
}
