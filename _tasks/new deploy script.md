!! ONLY MODIFY tools/exporter.

Generate a deployment script that moves markdown from `SOURCE_DIR` to `DEST_DIR` while processing them.
# SOURCE_DIR format
`SOURCE_DIR` is a nested containing markdown files. 

Each folder starting with SOURCE_DIR can contain `_.ts`. The exports of this file must be merged with the frontmatter of all markdown files in the folder.

Deeper `_.ts` files overwrite previous `_.ts` files.

All source files and folders are named e.g. `01.something`, `10.something-else`. Each has index + name.

Files have `10.NAME.instructions.md`. NAME will never have periods, and extension `instructions.md` must be preserved.

Filter out any files and folders that don't have this structure. Use regex.
# Watch
Watch `SOURCE_DIR` recursively and trigger sync every time something changes, with a debounce of 2 seconds.

Use `rxjs` to process change events and debounce. Source events from `chokidar`.
# Sync process
Split sync process into functions so they can be tested separately from file access.

## Folder indexing
Retrieve all folders using `SOURCE_DIR/**/*` with folders only restriction.

Go over all the folders in `SOURCE_DIR`. For each folder, attempt to import `_.ts` and compute attached frontmatter without looking anywhere else.

WHEN importing, use caching busting techniques.

Build a Map of relative path -> frontmatter object.

Go over all the entries in the Map and merge frontmatter based on containment, with deeper frontmatter preferred. Mutate.

## File indexing
Retrieve all files using `SOURCE_DIR/**/*` with files only.

Build a Map of relative path -> file content.

For each entry, look in the folder map to see what its frontmatter should be.

Use `frontmatter` package to parse out any existing frontmatter. Merge with inherited, with existing frontmatter overriding. 

NOTE: `frontmatter` package types are broken, use default export with `as any`.

## File name flattening
Go over the file map, sort by name.

Given a path like:
```
1.code/10.ts/1.rules.instructions.md
```

Concat all indexes and join names with `_` so that above becomes:

```
1101.code_ts_rules.instructions.md
```

Make a function for this replacement.
## File creation
Create files with the new name and merged frontmatter in `DEST_DIR`.
## Tests
Write tests for:
1. File name replacer.
2. Frontmatter inheritance without `import`.
