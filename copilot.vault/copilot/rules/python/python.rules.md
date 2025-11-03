# Python
## Packages
ASSUME Python >=3.13
ASSUME Poetry
ASSUME black
ASSUME pyright
## Modules
PREFER `argparse`
PREFER `pathlib`
## Code
PREFER f-strings for string interpolation
PREFER inner functions over lambdas
PREFER list/set/dict comprehensions
PREFER globbing over walking
PREFER `...` for stubbing
## Declarations
PREFER dataclasses
PREFER `@property` over method with no arguments
PREFER `@cached_property` for immutable classes
CONSIDER `@total_ordering`
## WHEN finishing your turn
ALWAYS run `poetry run pyright` to check for build errors.
ALWAYS run `poetry run black .` to apply formatting.
