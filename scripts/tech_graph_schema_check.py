#!/usr/bin/env python3
"""Validate docs/_tech_graph/graph.json against backend graph_v2 schema."""

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = (REPO_ROOT / ".." / "ai-ink-brain-api-python").resolve()
GRAPH_JSON = REPO_ROOT / "docs" / "_tech_graph" / "graph.json"

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from tools.tech_graph_graph_v2_schema import validate_graph_v2  # noqa: E402


def main() -> int:
    if not GRAPH_JSON.exists():
        print(f"ERROR: graph.json not found: {GRAPH_JSON}", file=sys.stderr)
        return 1
    data = json.loads(GRAPH_JSON.read_text(encoding="utf-8"))
    validate_graph_v2(data)
    print("OK: graph_v2 schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
