!![[1.ts.rules]]

%%
# Declarations
ALWAYS use static factory functions when class init must be async
NEVER return broken/uninitialized instances from constructors
WHEN defining an options interface for a class, call it `${Class}Options`%%