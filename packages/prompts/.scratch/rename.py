from __future__ import annotations

from pathlib import Path
from typing import Callable
import shutil
import re

from typing import Pattern


def rename_by_glob(
    root: Path, glob: str, rename_fn: Callable[[Path], Path | None]
) -> list[Path]:
    """Rename/move files matching `glob` into `dest_dir` using `rename_fn`.

    The `rename_fn` receives the file's absolute `Path` and must return a
    `Path` describing the target. If the returned `Path` is absolute it will be
    used as-is; otherwise it will be interpreted relative to `dest_dir`.

    Returns a list of resulting target `Path`s in the order processed.
    """
    root = Path(root)

    renamed: list[Path] = []
    # Use a deterministic order
    for src in sorted(root.rglob(glob)):
        # Use an absolute/resolved path when calling the user's function
        abs_src = src.resolve()
        target = rename_fn(abs_src)
        if not isinstance(target, Path):
            target = Path(target)

        if target is None:
            continue

        if target.is_absolute():
            dest = target
        else:
            dest = src.parent / target
        # If src and dst point to the same location, skip moving
        if dest.exists() and abs_src.samefile(dest):
            renamed.append(dest)
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(abs_src), str(dest))
        print(f"moved {abs_src} to {dest}")
        renamed.append(dest)

    return renamed


def _rename_one_path(src: Path):
    if src.name == "_.md":
        parent_name = src.parent.name
        return src.parent.parent / f"{parent_name}.md"
    else:
        return None


vault_name = "copilot.vault"
root_path = Path(__file__).parent.parent / vault_name
rename_by_glob(root_path, "**/_.md", _rename_one_path)
