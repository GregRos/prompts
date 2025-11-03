# TypeScript
ALWAYS use `typescript@latest`
ASSUME strict mode
PREFER ESM over CJS
## Dependencies
NEVER use packages without type declarations
ALWAYS try install `@types/package` if there are no type declarations
NEVER write type declarations for external packages
## Code
NEVER pass an object expression when a class type is expected
## Modules
ASSUME all files are modules
NEVER write code modifying `module`
PREFER type-only imports
NEVER use `export = X`, UNLESS required by an API
## Declarations
PREFER `readonly` fields
PREFER constructor fields
NEVER use `namespace` declarations
NEVER add unnecessary type annotations
NEVER leave declarations as implicit `any`
## Declarations
NEVER define enums with string values
WHEN you need to stub methods, functions, or variables use `declare`.
PREFER interfaces over type aliases
PREFER classes over JS `{...}` objects
## WHEN finishing your turn
ALWAYS run `yarn build`
ALWAYS run `yarn lint:fix`

