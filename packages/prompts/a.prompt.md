/_monorepo-js

## Differences
Don't reproduce the double ESM + CJS structure. Instead all `src` folders should be compiled with ESM and all test folders should be compiled with CJS

## Desired package structure
Divide into the following packages:

### 1. exporter
Will contain the TypeScript project at #file:src 

.vscode/tasks.json: build the TypeScript project.
.vscode/launch.json: see #file:./.vscode/launch.json

Most of the dependencies specified in #file:./package.json should come here. 
### 2. prompts
Will contain ALL the files from #file:copilot.vault/ . Will have a package.json containing metadata only. No tsconfig.

.vscode/settings.json: copy the `file.associations` from #file:.vscode/settings.json .

### 3. obsidian-styles
Based on SCSS files from #file:styles . Should also include a package.json containing metadata and build tools. No tsconfig or typescript dependencies. No tests.

Add a script to the package.json that will compile SCSS to CSS based on the command in #file:.vscode/tasks.json into the `prompts` package under the path `.obsidian/snippets/custom.css`.

Add a `.vscode/tasks.json` file that will execute the build script using a yarn command.

### 4. root
package.json: root references the other workspaces, take dev dependencies from the template.
prompts.code-workspace: again, see the template. should contain most of the settings from #file:./.vscode/settings.json

tsconfig.json: should contain only the entry for `packages/exporter/tsconfig.json`.
