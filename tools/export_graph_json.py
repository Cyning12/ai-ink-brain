#!/usr/bin/env python3
"""
从 docs/_tech_graph/*.ai.md 解析 Mermaid flowchart 边，生成 graph.json（scheme_1）。

用法（cwd 为 ai-ink-brain 仓根）:
  python tools/export_graph_json.py --input docs/_tech_graph --output docs/_tech_graph/graph.json
  python tools/export_graph_json.py --input docs/_tech_graph --output docs/_tech_graph/graph.json --check

--check: 与已提交 graph.json 在语义上等价（忽略 generated_at）则 0，否则 stderr 摘要并非 0。
依赖: Python 3.11+ 标准库。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


SCHEMA_VERSION = "graph_v1"

# 节点 ID（Mermaid 标识符）
NODE_ID_RE = re.compile(r"\s*(\w+)")

# 带引文标签的边：L --"->"--> NAV
EDGE_QUOTED = re.compile(r'--"([^"]*)"\s*-->')
# 无标签箭头（当前仓 .ai.md 未使用，保留以符合 SPEC）
EDGE_PLAIN = re.compile(r"-->")

SKIP_LINE_PREFIXES = (
    "%%",
    "subgraph",
    "end",
    "classDef",
    "class ",
    "style ",
    "linkStyle",
    "direction",
    "flowchart",
    "graph ",
)


@dataclass(frozen=True)
class Edge:
    from_: str
    to: str
    type: str
    sync: bool

    def as_dict(self) -> dict[str, Any]:
        return {"from": self.from_, "to": self.to, "type": self.type, "sync": self.sync}


def _label_to_type_sync(label: str) -> tuple[str, bool]:
    t = label.strip()
    if t == "~>" or t == "~":
        return "async_calls", False
    if t == "?>" or t.startswith("?"):
        return "condition", True
    if t.startswith("::"):
        rel = t[2:].strip() or "meta"
        return rel, True
    if t.startswith("[") and t.endswith("]"):
        return "condition", True
    return "depends_on", True


def _strip_mermaid_comments(line: str) -> str:
    if "%%" in line:
        line = line.split("%%", 1)[0].rstrip()
    return line.strip()


def _consume_node_shape(s: str, i: int) -> int | None:
    """自索引 i（指向可选形状首字符）起消费节点形状，返回结束下标；无形状则返回 i。"""
    if i >= len(s):
        return i
    # 1) [[...]]（允许标签内出现成对 []）
    if i + 1 < len(s) and s[i : i + 2] == "[[":
        # 外层 [[...]]；内层可含单对方括号（如 [[/blog/[...slug]]]）
        j = i + 2
        inner_square = 0
        while j < len(s) - 1:
            if s[j : j + 2] == "]]" and inner_square == 0:
                return j + 2
            if s[j] == "[":
                if j + 1 < len(s) and s[j : j + 2] == "[[":
                    inner_square += 1
                    j += 2
                else:
                    inner_square += 1
                    j += 1
            elif s[j] == "]":
                inner_square -= 1
                j += 1
            else:
                j += 1
        return None
    # 2) [(...)] stadium
    if i + 1 < len(s) and s[i] == "[" and s[i + 1] == "(":
        close = s.find(")]", i + 2)
        if close == -1:
            return None
        return close + 2
    # 3) [...] 单括号（内层可含 [，以括号深度闭合）
    if s[i] == "[":
        j = i + 1
        nest = 0
        while j < len(s):
            if s[j] == "[":
                nest += 1
                j += 1
            elif s[j] == "]":
                if nest == 0:
                    return j + 1
                nest -= 1
                j += 1
            else:
                j += 1
        return None
    # 4) (...)
    if s[i] == "(":
        depth = 1
        j = i + 1
        while j < len(s) and depth > 0:
            if s[j] == "(":
                depth += 1
            elif s[j] == ")":
                depth -= 1
            j += 1
        return j if depth == 0 else None
    # 5) {...}
    if s[i] == "{":
        depth = 1
        j = i + 1
        while j < len(s) and depth > 0:
            if s[j] == "{":
                depth += 1
            elif s[j] == "}":
                depth -= 1
            j += 1
        return j if depth == 0 else None
    return i


def _consume_node(s: str, start: int) -> tuple[str, int] | None:
    """从 start 起解析一个节点，返回 (id, end_index)；失败返回 None。"""
    m = NODE_ID_RE.match(s, start)
    if not m:
        return None
    nid = m.group(1)
    i = m.end()  # match.end() 已为串内绝对下标
    end_shape = _consume_node_shape(s, i)
    if end_shape is None:
        return None
    return nid, end_shape


def _should_skip_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return True
    if s.startswith("//"):
        return True
    for p in SKIP_LINE_PREFIXES:
        if s.startswith(p):
            return True
    return False


def _parse_edge_chain(line: str, source_path: Path, lineno: int) -> list[Edge]:
    """从单行解析 0..n 条边（链式 A --..--> B --..--> C）。"""
    raw = _strip_mermaid_comments(line)
    if not raw or _should_skip_line(raw):
        return []

    edges: list[Edge] = []
    pos = 0

    def fail(msg: str) -> None:
        raise ValueError(f"{source_path}:{lineno}: {msg}\n  {line.strip()}")

    n0 = _consume_node(raw, pos)
    if not n0:
        return []

    cur, pos = n0
    while pos < len(raw) and raw[pos].isspace():
        pos += 1

    while pos < len(raw):
        qm = EDGE_QUOTED.match(raw, pos)
        pm = None if qm else EDGE_PLAIN.match(raw, pos)
        if qm:
            label = qm.group(1)
            etype, sync = _label_to_type_sync(label)
            pos = qm.end()
        elif pm:
            etype, sync = "depends_on", True
            pos = pm.end()
        else:
            fail(f"无法解析边（自节点 {cur!r} 起）")

        while pos < len(raw) and raw[pos].isspace():
            pos += 1
        mn = _consume_node(raw, pos)
        if not mn:
            fail(f"边后缺少目标节点（自 {cur!r}）")
        nxt, pos = mn
        edges.append(Edge(cur, nxt, etype, sync))
        cur = nxt
        while pos < len(raw) and raw[pos].isspace():
            pos += 1

    return edges


def _iter_mermaid_blocks(text: str) -> Iterable[tuple[str, int]]:
    """产出 (block_body, start_lineno)。"""
    fence = "```mermaid"
    idx = 0
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith(fence):
            start = i + 1
            j = start
            while j < len(lines) and lines[j].strip() != "```":
                j += 1
            body = "\n".join(lines[start:j])
            yield body, start + 1
            i = j + 1
            continue
        i += 1


def _parse_file(path: Path) -> list[Edge]:
    text = path.read_text(encoding="utf-8")
    all_edges: list[Edge] = []
    for block, base_lineno in _iter_mermaid_blocks(text):
        blines = block.splitlines()
        for k, line in enumerate(blines):
            lineno = base_lineno + k
            try:
                all_edges.extend(_parse_edge_chain(line, path, lineno))
            except ValueError as e:
                raise ValueError(str(e)) from None
    return all_edges


def _collect_ai_files(graph_dir: Path) -> list[Path]:
    files = sorted(p for p in graph_dir.glob("*.ai.md") if p.is_file())
    # SPEC：可忽略 99_*
    return [p for p in files if not p.name.startswith("99_")]


def build_graph(graph_dir: Path) -> dict[str, Any]:
    files = _collect_ai_files(graph_dir)
    if not files:
        raise SystemExit(f"未找到可扫描的 *.ai.md（已忽略 99_*）: {graph_dir}")

    edges: list[Edge] = []
    for fp in files:
        edges.extend(_parse_file(fp))

    node_set: set[str] = set()
    for e in edges:
        node_set.add(e.from_)
        node_set.add(e.to)

    # 确定性排序与去重边（同 from/to/type/sync 只保留一条）
    seen: set[tuple[str, str, str, bool]] = set()
    uniq_edges: list[Edge] = []
    for e in sorted(edges, key=lambda x: (x.from_, x.to, x.type, x.sync)):
        key = (e.from_, e.to, e.type, e.sync)
        if key in seen:
            continue
        seen.add(key)
        uniq_edges.append(e)

    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return {
        "schema_version": SCHEMA_VERSION,
        "generated_at": generated_at,
        "nodes": sorted(node_set),
        "edges": [e.as_dict() for e in uniq_edges],
    }


def _normalize_for_check(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out.pop("generated_at", None)
    return out


def _write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False) + "\n"
    path.write_text(text, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="导出 docs/_tech_graph/graph.json（scheme_1）")
    ap.add_argument("--input", default="docs/_tech_graph", help="图谱目录（相对 cwd）")
    ap.add_argument("--output", default="docs/_tech_graph/graph.json", help="输出路径（相对 cwd）")
    ap.add_argument(
        "--check",
        action="store_true",
        help="再生成并与已存在 output 比较（忽略 generated_at）；不一致则非 0",
    )
    args = ap.parse_args()

    cwd = Path.cwd()
    graph_dir = (cwd / args.input).resolve()
    out_path = (cwd / args.output).resolve()

    if not graph_dir.is_dir():
        print(f"FP-1: 输入目录不存在: {graph_dir}", file=sys.stderr)
        return 1

    try:
        fresh = build_graph(graph_dir)
    except ValueError as e:
        # FP-1：解析失败
        print(f"FP-1: {e}", file=sys.stderr)
        return 1

    if args.check:
        if not out_path.is_file():
            print(f"FP-2: --check 需要已提交文件缺失: {out_path}", file=sys.stderr)
            return 1
        try:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"FP-2: 现有 graph.json 非合法 JSON: {out_path}: {e}", file=sys.stderr)
            return 1
        a = _normalize_for_check(existing)
        b = _normalize_for_check(fresh)
        if a != b:
            print("FP-2: graph.json 与解析结果不一致（忽略 generated_at 后比较）", file=sys.stderr)
            # 简要差异：节点数、边数
            an, ae = a.get("nodes", []), a.get("edges", [])
            bn, be = b.get("nodes", []), b.get("edges", [])
            print(f"  nodes: committed={len(an)} generated={len(bn)}", file=sys.stderr)
            print(f"  edges: committed={len(ae)} generated={len(be)}", file=sys.stderr)
            b_edges = {json.dumps(e, sort_keys=True) for e in be}
            a_edges = {json.dumps(e, sort_keys=True) for e in ae}
            only_b = sorted(b_edges - a_edges)[:20]
            only_a = sorted(a_edges - b_edges)[:20]
            if only_b:
                print("  仅生成侧边样例（最多 20）:", file=sys.stderr)
                for x in only_b:
                    print(f"    + {x}", file=sys.stderr)
            if only_a:
                print("  仅已提交侧边样例（最多 20）:", file=sys.stderr)
                for x in only_a:
                    print(f"    - {x}", file=sys.stderr)
            return 1
        return 0

    _write_json(out_path, fresh)
    print(f"Wrote {out_path} ({len(fresh['nodes'])} nodes, {len(fresh['edges'])} edges)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
