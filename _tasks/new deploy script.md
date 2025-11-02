Generate a deployment script that moves markdown from `SOURCE_DIR` to `DEST_DIR` while processing them.
# SOURCE_DIR format
`SOURCE_DIR` is a nested containing markdown files. 

Each folder starting with SOURCE_DIR can contain `_.ts`. The exports of this file must be merged with the frontmatter of all mardkown files in the folder.

Deeper `_.ts` files overwrite previous `_.ts` files.

# Process
Use globbing for this.

## Indexing
First, index all files and folders as follows.

First, go over all the folders in `SOURCE_DIR` recursively. For each folder, compute its attached frontmatter. Keep 

