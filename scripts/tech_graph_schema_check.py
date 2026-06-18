#!/usr/bin/env python3
"""Validate docs/_tech_graph/graph.json against local graph_v2 schema.

Dual-track: docs/_tech_graph/graph_v2_schema.md (human-readable) +
docs/_tech_graph/graph_v2.schema.json (machine-readable) are the frontend's
own source of truth. This script does **not** require a backend checkout.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_SCHEMA = REPO_ROOT / "docs" / "_tech_graph" / "graph_v2.schema.json"
DEFAULT_GRAPH_JSON = REPO_ROOT / "docs" / "_tech_graph" / "graph.json"


class GraphV2SchemaError(ValueError):
    """schema 校验失败。"""


def _load_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"schema file not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _non_empty_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value:
        raise GraphV2SchemaError(f"{field} 须为非空 string")
    return value


def _check_simple_type(value: Any, expected: str, field: str) -> None:
    if expected == "string":
        if not isinstance(value, str):
            raise GraphV2SchemaError(f"{field} 须为 string")
        return
    if expected == "boolean":
        if not isinstance(value, bool):
            raise GraphV2SchemaError(f"{field} 须为 boolean")
        return
    if expected == "integer":
        if not isinstance(value, int):
            raise GraphV2SchemaError(f"{field} 须为 integer")
        return


def _validate_graphs(graphs: Any, schema: dict[str, Any]) -> set[str]:
    default_graph_id = schema["default_graph_id"]
    if graphs is None:
        return {default_graph_id}
    if not isinstance(graphs, list):
        raise GraphV2SchemaError("graphs 必须是 array")
    ids: set[str] = set()
    required_keys = tuple(schema["required_graph_keys"])
    optional_keys = tuple(schema.get("optional_graph_string_keys", []))
    type_map = schema["type_map"]
    for i, g in enumerate(graphs):
        if not isinstance(g, dict):
            raise GraphV2SchemaError(f"graphs[{i}] 必须是 object")
        for key in required_keys:
            if key not in g:
                raise GraphV2SchemaError(f"graphs[{i}] 缺少 {key}")
        gid = g["id"]
        _non_empty_string(gid, f"graphs[{i}].id")
        if gid in ids:
            raise GraphV2SchemaError(f"重复 graphs[].id: {gid}")
        ids.add(gid)
        _check_simple_type(g["title"], type_map["title"], f"graphs[{i}].title")
        for key in optional_keys:
            if key in g:
                _check_simple_type(g[key], type_map[key], f"graphs[{i}].{key}")
    return ids or {default_graph_id}


def _validate_graph_id(
    graph_id: Any,
    allowed: set[str],
    field: str,
    type_map: dict[str, str],
) -> None:
    if graph_id is None:
        return
    _non_empty_string(graph_id, field)
    if graph_id not in allowed:
        raise GraphV2SchemaError(f"{field} 未知 graph_id: {graph_id!r}")


def _validate_edge_ref(
    ref: Any,
    edge_index: int,
    node_ids: set[str],
    graph_ids: set[str],
    ref_schema: dict[str, Any],
    type_map: dict[str, str],
) -> None:
    if not isinstance(ref, dict):
        raise GraphV2SchemaError(f"edges[{edge_index}].ref 必须是 object")
    for key in ref_schema["required_keys"]:
        if key not in ref:
            raise GraphV2SchemaError(f"edges[{edge_index}].ref 缺少 {key}")
    node_id = ref["node_id"]
    _non_empty_string(node_id, f"edges[{edge_index}].ref.node_id")
    if node_id not in node_ids:
        raise GraphV2SchemaError(
            f"edges[{edge_index}].ref 指向未知节点: {node_id!r}"
        )
    if "graph_id" in ref:
        _validate_graph_id(
            ref.get("graph_id"),
            graph_ids,
            f"edges[{edge_index}].ref.graph_id",
            type_map,
        )


def _validate_node_kind(
    node: dict[str, Any], index: int, schema: dict[str, Any]
) -> None:
    if "kind" not in node:
        return
    kind = node["kind"]
    _non_empty_string(kind, f"nodes[{index}].kind")
    allowed = frozenset(schema["allowed_node_kinds"])
    if kind not in allowed:
        raise GraphV2SchemaError(
            f"nodes[{index}].kind 非法: {kind!r}（允许: {', '.join(sorted(allowed))}）"
        )


def validate_graph_v2(obj: Any, schema: dict[str, Any]) -> None:
    """校验 graph_v2；无 graphs/ref 时与 P2-0 兼容（FP-4-4）。"""
    if not isinstance(obj, dict):
        raise GraphV2SchemaError("根类型必须是 object")

    for key in schema["required_root_keys"]:
        if key not in obj:
            raise GraphV2SchemaError(f"缺少根字段: {key}")

    expected_version = schema["schema_version"]
    ver = obj.get("schema_version")
    if ver != expected_version:
        raise GraphV2SchemaError(
            f"schema_version 须为 {expected_version!r}，实际 {ver!r}"
        )

    graph_ids = _validate_graphs(obj.get("graphs"), schema)

    nodes = obj.get("nodes")
    if not isinstance(nodes, list):
        raise GraphV2SchemaError("nodes 必须是 array")

    type_map = schema["type_map"]
    required_node_keys = tuple(schema["required_node_keys"])
    seen_ids: set[str] = set()
    for i, node in enumerate(nodes):
        if not isinstance(node, dict):
            raise GraphV2SchemaError(f"nodes[{i}] 必须是 object")
        for key in required_node_keys:
            if key not in node:
                raise GraphV2SchemaError(f"nodes[{i}] 缺少 {key}")
        _validate_node_kind(node, i, schema)
        _validate_graph_id(
            node.get("graph_id"), graph_ids, f"nodes[{i}].graph_id", type_map
        )
        nid = node["id"]
        _non_empty_string(nid, f"nodes[{i}].id")
        if nid in seen_ids:
            raise GraphV2SchemaError(f"重复节点 id: {nid}")
        seen_ids.add(nid)
        _check_simple_type(node["label"], type_map["label"], f"nodes[{i}].label")

    edges = obj.get("edges")
    if not isinstance(edges, list):
        raise GraphV2SchemaError("edges 必须是 array")

    edge_mode = schema["edge_mode"]
    topo_keys = edge_mode["topological_keys"]
    ref_key = edge_mode["reference_key"]
    required_edge_keys = tuple(schema["required_edge_keys"])
    required_anchor_keys = tuple(schema["required_anchor_keys"])
    ref_schema = schema["ref"]
    for i, edge in enumerate(edges):
        if not isinstance(edge, dict):
            raise GraphV2SchemaError(f"edges[{i}] 必须是 object")
        has_ref = ref_key in edge
        has_from = topo_keys[0] in edge
        has_to = topo_keys[1] in edge
        if has_ref and (has_from or has_to):
            raise GraphV2SchemaError(
                f"edges[{i}]：ref 与 from/to 互斥，不能同时出现"
            )
        if has_ref:
            _validate_edge_ref(
                edge[ref_key], i, seen_ids, graph_ids, ref_schema, type_map
            )
            for key in required_edge_keys:
                if key not in edge:
                    raise GraphV2SchemaError(f"edges[{i}] 缺少 {key}")
        else:
            if not has_from or not has_to:
                raise GraphV2SchemaError(f"edges[{i}] 缺少 from 或 to")
            for key in required_edge_keys:
                if key not in edge:
                    raise GraphV2SchemaError(f"edges[{i}] 缺少 {key}")
            if edge["from"] not in seen_ids or edge["to"] not in seen_ids:
                raise GraphV2SchemaError(
                    f"edges[{i}] 引用未知节点: {edge['from']!r} -> {edge['to']!r}"
                )
            _validate_graph_id(
                edge.get("graph_id"), graph_ids, f"edges[{i}].graph_id", type_map
            )
        _check_simple_type(edge["sync"], type_map["sync"], f"edges[{i}].sync")
        anchors = edge["anchors"]
        if not isinstance(anchors, list):
            raise GraphV2SchemaError(f"edges[{i}].anchors 须为 array")
        for j, anc in enumerate(anchors):
            if not isinstance(anc, dict):
                raise GraphV2SchemaError(f"edges[{i}].anchors[{j}] 须为 object")
            for key in required_anchor_keys:
                if key not in anc:
                    raise GraphV2SchemaError(
                        f"edges[{i}].anchors[{j}] 缺少 {key}"
                    )
            for key in required_anchor_keys:
                _check_simple_type(
                    anc[key], type_map[key], f"edges[{i}].anchors[{j}].{key}"
                )
            if "line" in anc:
                _check_simple_type(
                    anc["line"], type_map["line"], f"edges[{i}].anchors[{j}].line"
                )


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


def _ensure_schema_sync() -> int | None:
    """若存在后端 checkout，校验前端 schema 与后端 canonical schema 一致。"""
    backend_root = _resolve_backend_root()
    if backend_root is None:
        print(
            "WARNING: backend checkout not found; skipping schema sync check",
            file=sys.stderr,
        )
        return None
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
    return None


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
    parser.add_argument(
        "--check-backend-sync",
        action="store_true",
        help="Also verify frontend schema matches backend canonical schema",
    )
    args = parser.parse_args(argv)

    graph_path: Path = args.graph

    if not FRONTEND_SCHEMA.is_file():
        print(f"ERROR: frontend schema missing: {FRONTEND_SCHEMA}", file=sys.stderr)
        return 1

    if args.check_backend_sync:
        sync_code = _ensure_schema_sync()
        if sync_code is not None:
            return sync_code

    if not graph_path.exists():
        print(f"ERROR: graph.json not found: {graph_path}", file=sys.stderr)
        return 1

    try:
        schema = _load_json(FRONTEND_SCHEMA)
        data = json.loads(graph_path.read_text(encoding="utf-8"))
        validate_graph_v2(data, schema)
    except json.JSONDecodeError as exc:
        print(f"JSON 解析失败：{exc}", file=sys.stderr)
        return 2
    except GraphV2SchemaError as exc:
        print(f"schema 校验失败：{exc}", file=sys.stderr)
        return 1
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print("OK: graph_v2 schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
