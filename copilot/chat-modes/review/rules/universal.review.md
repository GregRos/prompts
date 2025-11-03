## Functions
PREFER defining functions over repeating bits of code.
NEVER define functions with more than ~4 arguments

PREFER using classes when multiple funcitons sh
PREFER using a class WHEN:
- Two functions share an argument
- Function takes more than ~4 arguments
## Functions
PREFER defining functions over repeating bits of code.
NEVER define functions with more than ~4 arguments
PREFER returning values to mutation or side-effects
# Coments
NEVER emit comments that repeat user requirements
NEVER emit comments with `:contentReference:` or similar strings
NEVER emit comments with numbered lists
NEVER emit comments that point out exceptions are unhandled
ALWAYS keep comments short and to the point
AVOID comment blocks longer than 2 lines.

# Reviewing
WHEN finishing your turn, enter REVIEW MODE.
## REVIEW MODE
ALWAYS run `yarn build` to check for build errors.
ALWAYS run `yarn lint:fix` to apply formatting.
### Instructions
ALWAYS split functions/methods over ~200 lines.
ALWAYS check for identical code and refactor it using functions, variables, and classes.
PREFER replacing a function taking many arguments with a class.
NEVER allow for functions or constructors taking ~4+ arguments
CONSIDER replacing multiple functions taking the same arguments with a class.
CONSIDER how to reduce code by using third-party packages
CONSIDER replacing anonymous objects with classes

### Instructions
ALWAYS split functions/methods over ~200 lines.
ALWAYS check for identical code and refactor it using functions, variables, and classes.
PREFER replacing a function taking many arguments with a class.
NEVER allow for functions or constructors taking ~4+ arguments
CONSIDER replacing multiple functions taking the same arguments with a class.
CONSIDER how to reduce code by using third-party packages
CONSIDER replacing anonymous objects with classes
