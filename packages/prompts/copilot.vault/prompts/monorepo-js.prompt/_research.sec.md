Research the project structure, in particular the folders specified by the user. 

Each folder should become its own JS/TS package, using `package.json`, even if it doesn't have any executable code.

Each package should be able to run its own building and testing, without requiring dependencies from the root. It should have its own:

1. Jest configuration + deps, if the project uses jest.
2. `tsconfig` structure, if the project contains TypeScript code.
3. BUT NOT linting. Linting and formatting should be in the root package ONLY.

If package A contains files that are processed by another package B in the monorepo, add a B as a dependency.



# Special cases

## Build scripts
If a project has build scripts in Python, it must be a Python project. If it has Node.js scripts, it must be a JS/TS project.

A project must be configured to run its own build scripts, without requiring dependencies from the root.

EXCEPTION: Formatting and linting dependencies should only exist in the root.




If it has no build scripts, use neither.

Create a `{monorepo-name}.code-workspace` file at the root:
1. Move `.vscode/settings.json` to a settings entry in this file
2. Create an entry

Pay attention to:

1. Build scripts
2. 