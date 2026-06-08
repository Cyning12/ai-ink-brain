#!/usr/bin/env python3
"""将 content/*.md 中的 GFM 表格、分隔线、引用块转为语义化 HTML（保留其余 Markdown）。"""

from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path

FENCE_RE = re.compile(r"^(`{3,}|~{3,})(.*)$")
TABLE_ROW_RE = re.compile(r"^\s*\|")
HR_RE = re.compile(r"^---\s*$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
BLOCKQUOTE_RE = re.compile(r"^>\s?(.*)$")
CODE_INLINE_RE = re.compile(r"`([^`]+)`")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
SEP_CELL_RE = re.compile(r"^:?-{3,}:?$")


def split_fenced_blocks(text: str) -> list[tuple[str, bool]]:
    """按 fenced code 切块；(chunk, is_code)。"""
    lines = text.splitlines(keepends=True)
    chunks: list[tuple[str, bool]] = []
    buf: list[str] = []
    in_fence = False
    fence_marker = ""

    for line in lines:
        m = FENCE_RE.match(line.strip())
        if m:
            marker = m.group(1)
            if not in_fence:
                if buf:
                    chunks.append(("".join(buf), False))
                    buf = []
                in_fence = True
                fence_marker = marker
                buf.append(line)
                continue
            if marker[0] == fence_marker[0] and len(marker) >= len(fence_marker):
                buf.append(line)
                chunks.append(("".join(buf), True))
                buf = []
                in_fence = False
                fence_marker = ""
                continue
        buf.append(line)

    if buf:
        chunks.append(("".join(buf), in_fence))
    return chunks


def inline_md(text: str) -> str:
    """行内 Markdown → HTML（表格单元格 / blockquote 行）。"""
    placeholders: dict[str, str] = {}
    idx = 0

    def stash(html_frag: str) -> str:
        nonlocal idx
        key = f"@@PH{idx}@@"
        placeholders[key] = html_frag
        idx += 1
        return key

    def repl_code(m: re.Match[str]) -> str:
        return stash(f"<code>{html.escape(m.group(1))}</code>")

    def repl_link(m: re.Match[str]) -> str:
        label = inline_md_simple(m.group(1))
        href = html.escape(m.group(2), quote=True)
        return stash(f'<a href="{href}">{label}</a>')

    def repl_bold(m: re.Match[str]) -> str:
        return stash(f"<strong>{inline_md_simple(m.group(1))}</strong>")

    s = text
    s = CODE_INLINE_RE.sub(repl_code, s)
    s = LINK_RE.sub(repl_link, s)
    s = BOLD_RE.sub(repl_bold, s)
    s = html.escape(s)
    for key, frag in placeholders.items():
        s = s.replace(html.escape(key), frag)
    return s


def inline_md_simple(text: str) -> str:
    s = BOLD_RE.sub(r"<strong>\1</strong>", text)
    return html.escape(s, quote=False).replace("&lt;strong&gt;", "<strong>").replace(
        "&lt;/strong&gt;", "</strong>"
    )


def parse_table_row(line: str) -> list[str] | None:
    if not TABLE_ROW_RE.match(line):
        return None
    stripped = line.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|"):
        stripped = stripped[:-1]
    return [cell.strip() for cell in stripped.split("|")]


def is_separator_row(cells: list[str]) -> bool:
    if not cells:
        return False
    return all(SEP_CELL_RE.match(c.strip()) for c in cells)


def table_to_html(lines: list[str]) -> str:
    rows: list[list[str]] = []
    for line in lines:
        cells = parse_table_row(line)
        if cells is None:
            break
        if is_separator_row(cells):
            continue
        rows.append(cells)

    if not rows:
        return "".join(lines)

    header = rows[0]
    body = rows[1:]
    parts = ['<div class="md-table-wrap">', "<table>", "<thead><tr>"]
    for cell in header:
        parts.append(f"<th>{inline_md(cell)}</th>")
    parts.append("</tr></thead>")
    if body:
        parts.append("<tbody>")
        for row in body:
            parts.append("<tr>")
            for cell in row:
                parts.append(f"<td>{inline_md(cell)}</td>")
            parts.append("</tr>")
        parts.append("</tbody>")
    parts.append("</table></div>")
    return "\n".join(parts) + "\n"


def blockquote_line_to_html(inner: str) -> str:
    hm = HEADING_RE.match(inner)
    if hm:
        level = len(hm.group(1))
        content = inline_md(hm.group(2).strip())
        return f"<h{level}>{content}</h{level}>"
    if not inner.strip():
        return ""
    return f"<p>{inline_md(inner.strip())}</p>"


def blockquote_to_html(lines: list[str]) -> str:
    inner_lines: list[str] = []
    for line in lines:
        m = BLOCKQUOTE_RE.match(line)
        if m:
            inner_lines.append(m.group(1))
        elif not line.strip():
            inner_lines.append("")
        else:
            break

    parts = ["<blockquote>"]
    para_buf: list[str] = []
    for inner in inner_lines:
        if not inner.strip():
            if para_buf:
                parts.append(f"<p>{inline_md(' '.join(para_buf))}</p>")
                para_buf = []
            continue
        hm = HEADING_RE.match(inner)
        if hm:
            if para_buf:
                parts.append(f"<p>{inline_md(' '.join(para_buf))}</p>")
                para_buf = []
            parts.append(blockquote_line_to_html(inner))
        else:
            para_buf.append(inner.strip())
    if para_buf:
        parts.append(f"<p>{inline_md(' '.join(para_buf))}</p>")
    parts.append("</blockquote>")
    return "\n".join(parts) + "\n"


def optimize_markdown(text: str) -> str:
    out: list[str] = []
    for chunk, is_code in split_fenced_blocks(text):
        if is_code:
            out.append(chunk)
            continue
        out.append(optimize_markdown_chunk(chunk))
    return "".join(out)


def optimize_markdown_chunk(text: str) -> str:
    lines = text.splitlines(keepends=True)
    i = 0
    parts: list[str] = []

    while i < len(lines):
        line = lines[i]
        stripped = line.rstrip("\n")

        # 表格块
        if parse_table_row(stripped) is not None:
            tbl_lines = [stripped]
            i += 1
            while i < len(lines):
                nxt = lines[i].rstrip("\n")
                if parse_table_row(nxt) is not None:
                    tbl_lines.append(nxt)
                    i += 1
                    continue
                if not nxt.strip():
                    # 跳过表格后多余空行
                    i += 1
                    continue
                break
            parts.append(table_to_html(tbl_lines))
            continue

        # 引用块（连续 > 行）
        if BLOCKQUOTE_RE.match(stripped):
            bq_lines = [stripped]
            i += 1
            while i < len(lines):
                nxt = lines[i].rstrip("\n")
                if BLOCKQUOTE_RE.match(nxt) or not nxt.strip():
                    bq_lines.append(nxt)
                    i += 1
                    continue
                break
            parts.append(blockquote_to_html(bq_lines))
            while i < len(lines) and not lines[i].strip():
                i += 1
            continue

        # 分隔线
        if HR_RE.match(stripped):
            parts.append("<hr />\n")
            i += 1
            continue

        parts.append(line)
        i += 1

    return "".join(parts)


def process_file(path: Path, write: bool) -> bool:
    original = path.read_text(encoding="utf-8")
    optimized = optimize_markdown(original)
    changed = optimized != original
    if write and changed:
        path.write_text(optimized, encoding="utf-8")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description="content/*.md HTML 格式优化")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "content",
    )
    parser.add_argument("--write", action="store_true", help="写回文件")
    parser.add_argument("--dry-run", action="store_true", help="仅统计变更")
    args = parser.parse_args()

    root: Path = args.root
    if not root.is_dir():
        print(f"目录不存在: {root}", file=sys.stderr)
        return 1

    files = sorted(root.rglob("*.md"))
    changed_files: list[Path] = []
    for f in files:
        if process_file(f, write=args.write and not args.dry_run):
            changed_files.append(f)

    mode = "已写入" if args.write and not args.dry_run else "待变更"
    print(f"{mode}: {len(changed_files)}/{len(files)} 个文件")
    for f in changed_files:
        print(f"  - {f.relative_to(root.parent)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
