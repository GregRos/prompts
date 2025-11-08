Divide dependencies into groups:

1. Project-specific:
	1. Packages used in specific projects
	2. Dev dependencies used in specific projects
		1. Build tools, execution tools, packaging tools, etc
2. Root:
	1. Linting and formatting dependencies.

Each project should be able to run its own build scripts, rather than relying on the root's packages. The root should only contain linting and formatting dependencies.

