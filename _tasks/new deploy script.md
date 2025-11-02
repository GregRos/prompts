Generate a deployment script that moves markdown from `SOURCE_DIR` to `DEST_DIR` while processing them.
# SOURCE_DIR format
`SOURCE_DIR` is a nested containing markdown files. 

Each folder starting with SOURCE_DIR can contain `_.ts`. The exports of this file must be merged with the frontmatter of all mardkown files in the folder.

Deeper `_.ts` files overwrite previous `_.ts` files.

# Process
Use globbing for this.
## Folder indexing
Retrieve all folders using `SOURCE_DIR/**/*` with folders only restriction.

Go over all the folders in `SOURCE_DIR`. For each folder, compute its attached frontmatter without looking anywhere else.

Build a Map of relative path -> frontmatter object.

Go over all the entries in the Map and merge frontmatter based on containment, with deeper frontmatter preferred. Mutate.

## File indexing
Retrieve all files using `SOURCE_DIR/**/*` with files only.

Build a Map of relative path -> file content.

For each entry, look in the folder map to see what its frontmatter should be.

Use 




