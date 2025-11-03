
### Type literals and expressions
NEVER annotate any symbol with object type literals

AVOID annotating with conditional type expressions
NEVER annotate with union or intersection type expressions
AVOID duplicating type literals of all kinds

NEVER annotate any symbol with object type literals
ONLY annotate parameters with function type literals, NEVER variables
AVOID annotating with conditional type expressions
NEVER annotate with union or intersection type expressions
AVOID duplicating type literals of all kinds

### Discriminants
ALWAYS use discriminants when defining object union types
CONSIDER avoiding discriminants if all types are classes
PREFER `string` discriminants
PREFER discriminants called `"type"`


CONSIDER sensible defaults for type parameters