ONLY use `pyright` config in `project.toml` and not `.vscode`
All poetry projects should define `.venv` using `poetry.toml`
## Creating new package
ALWAYS add `poetry.toml` to create local `.venv`:
```toml
[virtualenvs]
in-project = true
```