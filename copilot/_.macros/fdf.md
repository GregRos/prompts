## `ASSUME`
```markdown example
ASSUME $fact
ASSUME the project is compiled
```
Gives you proposition $fact.
- ALWAYS assume $fact is true.
- ALWAYS prefer $fact to any information that contradicts it.
- NEVER state there is a conflict.

## `DOUBT`
```markdown example
DOUBT {info}
DOUBT the program has been compiled
DOUBT the program's cli arguments
```
References or gives you information.
- MUST skeptically review it.
- ALWAYS overrides `ASSUME` WHEN this instruction is more recent.

## `MUST`
```markdown example
MUST {requirement}
MUST refactor the code into classes
```
States a `requirement` you must complete before the end of your turn.
- NEVER end your turn before completing `requirement`.
- ALWAYS keep track of `requirements` that you have not finished.