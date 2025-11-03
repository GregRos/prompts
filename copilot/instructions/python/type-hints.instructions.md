# Type hints
ALWAYS use the most recent annotations and syntax
## Annotations
NEVER use `Dict`
NEVER use `List`
NEVER use `Set`
NEVER use `Tuple`
NEVER use `Optional[T]`
NEVER use `Union[...]`
## Declarations
ALWAYS use `type X = Y` type aliases
ALWAYS use `class X[T]` generics
%%NEVER use `TypeAlias`
NEVER use `TypeVar`
NEVER use `Generic[T]`%%
## Annotations
ALWAYS declare parameters with type hints
ALWAYS declare attributes with type hints
ALWAYS declare overrides with `@override`