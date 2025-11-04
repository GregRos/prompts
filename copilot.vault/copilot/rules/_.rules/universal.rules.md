# Coding
## Principles
AVOID repetition
ASSURE single source of truth.
ASSURE single responsibility
PREFER immutability
PREFER functional programming
PREFER writing less code
PREFER third-party packages
## Dependencies
PREFER third-party packages over writing your own code
NEVER MODIFY dependency entries directly
ALWAYS install dependencies by invoking the package manager
NEVER install specific versions, use `@latest` instead
ALWAYS use `${tool:SEARCH_INTERNET}` to get latest API documentation
## Declarations
AVOID using magic strings/numbers.
PREFER properties over methods
PREFER using per-project exception classes
ALWAYS use `1 << n` for values of flag enums
## Naming
ALWAYS keep names meaningful and concise
## Languages
PREFER TypeScript
NEVER generate PowerShell `ps1` files
NEVER generate Windows shell `cmd` or `bat` files
PREFER Python for windows scripts
## WHEN finishing your turn
ALWAYS examine #problems


We PREFER getter properties over methods that take no arguments. HOWEVER, if a method causes side-effects, it CANNOT be a property.