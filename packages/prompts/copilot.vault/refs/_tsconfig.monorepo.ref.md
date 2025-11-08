Monorepo projects containing TypeScript packages must be structured as follows.

```yaml
tsconfig.base.json: 
	desc: base for all TypeScript projects
	refs: none
tsconfig.base.esm.json: 
	desc: Base for ESM typescript projects
	extends: tsconfig.base.json
tsconfig.base.cjs.json: Base for CJS typescript
```
Packages that contain TypeScript must be set up as follows.




