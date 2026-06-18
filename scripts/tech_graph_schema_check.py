#!/usr/bin/env python3
"""Validate docs/_tech_graph/graph.json against graph_v2 schema.

Dual-track: docs/_tech_graph/graph_v2_schema.md (human-readable) +
docs/_tech_graph/graph_v2.schema.json (machine-readable) must stay in sync
with the backend's canonical schema file.
"""

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_SCHEMA = REPO_ROOT / "docs" / "_tech_graph" / "graph_v2.schema.json"
DEFAULT_GRAPH_JSON = REPO_ROOT / "docs" / "_tech_graph" / "graph.json"


def _resolve_backend_root() -> Path | None:
    """Support both sibling checkout (local) and nested checkout (CI)."""
    candidates = [
        REPO_ROOT / "ai-ink-brain-api-python",
        REPO_ROOT / ".." / "ai-ink-brain-api-python",
    ]
    for candidate in candidates:
        resolved = candidate.resolve()
        if (resolved / "tools" / "tech_graph_graph_v2_schema.py").is_file():
            return resolved
    return None


def _load_json(path: Path) -> dict:
    if not path.is_file():
        raise FileNotFoundError(f"schema file not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate docs/_tech_graph/graph.json against graph_v2 schema"
    )
    parser.add_argument(
        "--graph",
        type=Path,
        default=DEFAULT_GRAPH_JSON,
        help="Path to graph.json (default: docs/_tech_graph/graph.json)",
    )
    args = parser.parse_args(argv)

    graph_path: Path = args.graph

    if not FRONTEND_SCHEMA.is_file():
        print(f"ERROR: frontend schema missing: {FRONTEND_SCHEMA}", file=sys.stderr)
        return 1

    backend_root = _resolve_backend_root()
    if backend_root is None:
        print(
            "WARNING: backend checkout not found; skipping schema sync check",
            file=sys.stderr,
        )
    else:
        backend_schema = backend_root / "docs" / "_tech_graph" / "graph_v2.schema.json"
        try:
            frontend_data = _load_json(FRONTEND_SCHEMA)
            backend_data = _load_json(backend_schema)
        except (FileNotFoundError, json.JSONDecodeError) as exc:
            print(f"ERROR: unable to load schema: {exc}", file=sys.stderr)
            return 1
        if frontend_data != backend_data:
            print(
                "ERROR: frontend graph_v2.schema.json drifted from backend canonical schema",
                file=sys.stderr,
            )
            return 1

    if not graph_path.exists():
        print(f"ERROR: graph.json not found: {graph_path}", file=sys.stderr)
        return 1

    if str(backend_root) not in sys.path and backend_root is not None:
        sys.path.insert(0, str(backend_root))

    try:
        from tools.tech_graph_graph_v2_schema import validate_graph_v2  # noqa: E402
    except ImportError as exc:
        print(f"ERROR: unable to import backend validator: {exc}", file=sys.stderr)
        return 1

    data = json.loads(graph_path.read_text(encoding="utf-8"))
    validate_graph_v2(data)
    print("OK: graph_v2 schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
