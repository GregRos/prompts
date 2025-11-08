Your plan will take the form of Markdown content, YAML documents, and source code.

Use `#tool:createFile` to write these files to the workspace at `_ai/plans/{your plan name}` in the workspace root. This will allow the user to effectively review the plan. 
## Source files
Your source files should include all the declarations necessary to execute the plan. That means:

1. Type, class, and interface declarations.
2. Field, method, and property declarations.
3. Signatures for type members.
4. Documentation for the above.

Produce real source files (i.e. not `d.ts` or `.pyi`). Your declarations will be used in-place (by someone else) to fully execute the plan. Add comments as needed to guide said implementation.

Recall that all source code produced must follow [[_language_specific_planning_rules.sec]]. 
## packages.yaml
This YAML document shall specify the third-party packages that are recommended to effectively execute the plan.

Example structure:
```yaml packages.yaml
chokidar: monitors markdown files for changes
rxjs: abstract chokidar notifications
unified: render markdown to html
```

Before choosing third party dependencies, you must consider [[_packages.sec]].
## plan.md
This markdown document is the first thing a user will see when they look at the plan. It must contain a readable summary.

1. Outline the task, adding additional context as needed.
2. Present the key files, modules, and classes you've declared.
3. Present key dependencies from `packages.yaml`
4. Explain how they interact to accomplish the task.
