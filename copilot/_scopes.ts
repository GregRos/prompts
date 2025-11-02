function makeExtensions(...exts: string[]) {
  return exts.map((ext) => `**/*.${ext}`);
}
export const jsFiles = makeExtensions("js", "jsx", "ts", "tsx", "cjs", "mjs");

export const tsFiles = makeExtensions("ts", "tsx", "cts", "mts");

export const jsTsFiles = [...tsFiles, ...jsFiles];

export const pythonFiles = makeExtensions("py", "pyw", "pyi");

export const otherCodeFiles = makeExtensions(
  "java",
  "go",
  "rb",
  "php",
  "rs",
  "swift",
  "kt",
  "kts",
  "scala",
  "sh",
  "bash",
  "zsh",
  "ps1"
);
