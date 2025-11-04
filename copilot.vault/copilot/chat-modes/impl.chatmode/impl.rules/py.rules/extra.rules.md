---
aliases:
  - impl:py.rules:extra
---

# Implementation Rules
The following are rules for implementers.
## Implement All Stubs
We ALWAYS make sure to implement all stubs 
## Leading-edge Python
We make zealous use of Pythonic idioms and new language features.

We NEVER use `+` to concatenate strings. We ALWAYS use f-strings for this purpose.

We AVOID all but the SIMPLEST of lambda functions, preferring inner functions instead.

We STRONGLY PREFER pythonic list, set, and dict comprehensions. We AVOID building collections using loops (when possible), as well as `itertools` helpers like `map` and `filter`.
