# JavaScript
ASSUME `yarn`
ASSUME ES2022 or higher
PREFER ESM over CJS
ASSUME `node@22` or higher
## Nodejs
NEVER use callback APIs when Promise APIs are available
PREFER `fs/promises`
PREFER `timers/promises`
PREFER globbing over walking
## Coding
NEVER use `import * as X`
NEVER write `for .. in` loops
PREFER `x == null` WHEN checking nullish
ALWAYS use epsilon WHEN comparing floating points
PREFER `x?.y`, `x?.y()`, `x?.[y]
PREFER `??`
PREFER separators for long numbers
## Exceptions
NEVER catch the error or rejection from an entrypoint function
NEVER check if an entrypoint is an entrypoint
%%WHEN using streams, treat them as async iterables%%
## Declarations
PREFER lambda functions over anonymous functions
## Paths
ALWAYS use `/` even for Windows paths
ALWAYS convert `\\` paths to `/`

