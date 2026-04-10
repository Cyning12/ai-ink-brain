"""
RAG 聊天服务：日期查询扩展 + SiliconFlow 向量 + Supabase match_documents + 流式对话；
管理端：/api/py/admin/sync、/api/py/admin/ingest（向量入库，与 Next 代理路径对齐）。

启动：在仓库根目录执行 `cd api && uvicorn index:app --host 0.0.0.0 --port 8000`
（与 next.config.mjs 中 PY_API_URL 默认端口一致）

调试检索：设置环境变量 `DEBUG_RAG=1` 或 `RAG_DEBUG=1`（或 `NODE_ENV=development`），
可在控制台输出 `[rag-debug]`：用户问题、日期 TitleAnchor、embedding 摘要、每条命中相似度与 Title 行、
无 threshold 对照 RPC、以及 `content ILIKE` 文本探测。
阈值：`RAG_MATCH_THRESHOLD=none` 关闭 SQL 侧相似度过滤（与部分 Next 行为一致）。
"""

from __future__ import annotations

import asyncio
import hmac
import os
import re
from typing import Any

import rag_env  # noqa: F401 — 触发 REPO_ROOT .env 加载
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Query, Request
from fastapi.responses import JSONResponse, StreamingResponse
from openai import OpenAI
from supabase import create_client

from ingest_pipeline import (
    create_sync_job,
    get_job,
    process_markdown_files,
    run_sync_job_sync,
)
from rag_env import admin_secret, pick_supabase_service_key, pick_supabase_url

app = FastAPI(title="AI-Ink-Brain RAG API")

DEFAULT_YEAR = int(os.getenv("CONTENT_DEFAULT_YEAR", "2026"))
SILICONFLOW_BASE = os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1").rstrip("/")
# 默认 Qwen3 Embedding（SiliconFlow「v3」系）；须与 PG vector(1024) 及 ingest 所用模型一致，否则请改环境变量或全量重灌
SILICONFLOW_EMBEDDING_MODEL = os.getenv(
    "SILICONFLOW_EMBEDDING_MODEL", "Qwen/Qwen3-Embedding-0.6B"
).strip()
SILICONFLOW_EMBEDDING_DIMENSIONS = int(os.getenv("SILICONFLOW_EMBEDDING_DIMENSIONS", "1024"))
SILICONFLOW_CHAT_MODEL = os.getenv("SILICONFLOW_CHAT_MODEL", "deepseek-ai/DeepSeek-V3")
MATCH_COUNT = 10
CONTEXT_MAX_CHARS = 6000


def _parse_match_threshold() -> float | None:
    """match_documents 的 threshold 为余弦相似度，须在 (0,1]；>1 无效（易与 top-k=10 混淆）。"""
    raw = os.getenv("RAG_MATCH_THRESHOLD", "").strip()
    if not raw:
        return 0.3
    if raw.lower() in ("none", "null", "off"):
        return None
    try:
        v = float(raw)
    except ValueError:
        return 0.3
    if v > 1.0:
        print(
            "[rag] RAG_MATCH_THRESHOLD="
            f"{raw!r} 大于 1（相似度仅在 0~1）。"
            "若本意是「不要阈值过滤」，请设为 none；若误把 match_count 写成 10，请删掉该变量或改为 0.3。已回退为 None。",
            flush=True,
        )
        return None
    if v < 0:
        print(f"[rag] RAG_MATCH_THRESHOLD={raw!r} 小于 0，已回退为 0.3", flush=True)
        return 0.3
    return v


def _rag_debug_enabled() -> bool:
    v = (os.getenv("DEBUG_RAG") or os.getenv("RAG_DEBUG") or "").strip().lower()
    if v in ("1", "true", "yes", "on"):
        return True
    return os.getenv("NODE_ENV", "").strip().lower() == "development"


def _rag_log(msg: str) -> None:
    if _rag_debug_enabled():
        print(f"[rag-debug] {msg}", flush=True)


def _short(text: str, max_len: int) -> str:
    t = text.replace("\n", "\\n")
    if len(t) <= max_len:
        return t
    return t[: max_len - 3] + "..."


def _extract_title_from_context(content: str) -> str | None:
    m = re.search(r"Title:\s*(\S+)", content)
    return m.group(1).strip() if m else None


def _require_auth(
    authorization: str | None,
    x_blog_admin_token: str | None,
    x_admin_token: str | None = None,
) -> None:
    expected = admin_secret()
    if not expected:
        raise HTTPException(status_code=500, detail="未配置 NEXT_PUBLIC_ADMIN_SECRET 或 CHAT_API_SECRET")
    token = ""
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    elif x_blog_admin_token:
        token = x_blog_admin_token.strip()
    elif x_admin_token:
        token = x_admin_token.strip()
    if len(token) != len(expected) or not hmac.compare_digest(
        token.encode("utf-8"), expected.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _filename_title_hints(year: int, month: int, day: int) -> list[str]:
    """与 content/diary 常见命名（月日不补零 / 补零）对齐，供向量检索拼接。"""
    return list(
        {
            f"{year}-{month}-{day}.md",
            f"{year}-{month:02d}-{day:02d}.md",
            f"{year}-{month}-{day:02d}.md",
            f"{year}-{month:02d}-{day}.md",
        }
    )


def _collect_date_hints(text: str) -> list[str]:
    hints: set[str] = set()

    # 完整日期：2026-4-9、2026/04/09
    for m in re.finditer(
        r"\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b",
        text,
    ):
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        for h in _filename_title_hints(y, mo, d):
            hints.add(h)

    # 两位年：24-4-9
    for m in re.finditer(
        r"(?<![\d])(\d{2})[-/](\d{1,2})[-/](\d{1,2})(?![\d])",
        text,
    ):
        yy, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        y = 2000 + yy
        for h in _filename_title_hints(y, mo, d):
            hints.add(h)

    # 无年份：4-9、04-09（默认 DEFAULT_YEAR，通常为日记当前年）
    for m in re.finditer(
        r"(?<![\d])(\d{1,2})[-/](\d{1,2})(?![\d])",
        text,
    ):
        mo, d = int(m.group(1)), int(m.group(2))
        for h in _filename_title_hints(DEFAULT_YEAR, mo, d):
            hints.add(h)

    return sorted(hints)


def augment_query_for_embedding(user_query: str) -> str:
    hints = _collect_date_hints(user_query)
    if not hints:
        return user_query
    anchor_block = "\n".join(f"TitleAnchor: {h}" for h in hints)
    return f"{user_query}\n\n{anchor_block}"


def _hint_to_slug(hint: str) -> str:
    h = hint.strip()
    lower = h.lower()
    if lower.endswith(".md"):
        return h[:-3]
    if lower.endswith(".mdx"):
        return h[:-4]
    return h


def _row_chunk_index(row: dict[str, Any]) -> int:
    m = row.get("metadata")
    if isinstance(m, dict):
        ci = m.get("chunk_index")
        if isinstance(ci, int):
            return ci
        try:
            return int(ci)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            pass
    return 0


def fetch_date_anchor_hits(sb: Any, date_hints: list[str]) -> list[dict[str, Any]]:
    """
    按 metadata.slug 与正文中的 Title: xxx.md 精确拉取分块，排在向量结果前，
    减轻「语义相近但日期不同」的噪声顶掉目标日记的问题。
    """
    if not date_hints:
        return []
    seen_ids: set[Any] = set()
    collected: list[dict[str, Any]] = []

    for hint in sorted(set(date_hints))[:8]:
        slug = _hint_to_slug(hint)
        rows: list[dict[str, Any]] = []
        if slug:
            try:
                res = (
                    sb.table("documents")
                    .select("id, content, metadata")
                    .eq("metadata->>slug", slug)
                    .limit(48)
                    .execute()
                )
                data = res.data if isinstance(res.data, list) else []
                rows.extend([r for r in data if isinstance(r, dict)])
            except Exception as exc:  # noqa: BLE001
                _rag_log(f"anchor eq slug={slug!r}: {exc!s}")

        if not rows and hint:
            try:
                res = (
                    sb.table("documents")
                    .select("id, content, metadata")
                    .ilike("content", f"%Title: {hint}%")
                    .limit(24)
                    .execute()
                )
                data = res.data if isinstance(res.data, list) else []
                rows.extend([r for r in data if isinstance(r, dict)])
            except Exception as exc:  # noqa: BLE001
                _rag_log(f"anchor ilike Title hint={hint!r}: {exc!s}")

        rows.sort(key=_row_chunk_index)
        for r in rows:
            rid = r.get("id")
            if rid is None or rid in seen_ids:
                continue
            seen_ids.add(rid)
            collected.append(
                {
                    "id": rid,
                    "content": r.get("content") if isinstance(r.get("content"), str) else "",
                    "metadata": r.get("metadata") if isinstance(r.get("metadata"), dict) else {},
                    "similarity": 1.0,
                }
            )

    return collected


def merge_hits_anchors_first(
    anchor_hits: list[dict[str, Any]],
    vector_hits: list[dict[str, Any]],
    max_total: int = 22,
) -> list[dict[str, Any]]:
    seen: set[Any] = set()
    out: list[dict[str, Any]] = []
    for h in anchor_hits:
        hid = h.get("id")
        if hid is not None:
            if hid in seen:
                continue
            seen.add(hid)
        out.append(h)
        if len(out) >= max_total:
            return out
    for h in vector_hits:
        hid = h.get("id")
        if hid is not None:
            if hid in seen:
                continue
            seen.add(hid)
        out.append(h)
        if len(out) >= max_total:
            break
    return out


def message_to_text(message: dict[str, Any]) -> str:
    if not isinstance(message, dict):
        return ""
    c = message.get("content")
    if isinstance(c, str):
        return c
    parts = message.get("parts")
    if isinstance(parts, list):
        chunks: list[str] = []
        for p in parts:
            if not isinstance(p, dict):
                continue
            if p.get("type") == "text" and isinstance(p.get("text"), str):
                chunks.append(p["text"])
        return "".join(chunks)
    return ""


def last_user_text(messages: list[dict[str, Any]]) -> str | None:
    for m in reversed(messages):
        if not isinstance(m, dict) or m.get("role") != "user":
            continue
        t = message_to_text(m).strip()
        if t:
            return t
    return None


def build_system_prompt(context: str) -> str:
    rules = (
        "你必须优先查找并依据以「[Document Context]」标记的片段作答。\n"
        "若某段以「Title: 某文件名.md」形式出现，例如「Title: 2026-4-09.md」，"
        "即表示这是该日期的笔记正文摘要（文件名中年-月-日对应公历日期）。\n"
        "当上下文中存在与用户提到日期相符的 Title 时，你必须在回答开头明确说明“已找到该日记/文档”，并优先引用其内容；\n"
        "不要被后续语义检索到的其他日期内容干扰。\n"
        "请综合多个片段回答；若上下文仍不足，请明确说明。\n"
    )
    body = context.strip() or "（无检索命中）"
    return f"{rules}\n【检索到的文档片段】\n{body}"


@app.get("/api/py/health")
def health() -> dict[str, str]:
    return {"ok": "true", "service": "ai-ink-brain-rag"}


@app.post("/api/py/chat")
async def chat(
    request: Request,
    authorization: str | None = Header(default=None),
    x_blog_admin_token: str | None = Header(default=None, alias="x-blog-admin-token"),
    x_admin_token: str | None = Header(default=None, alias="x-admin-token"),
) -> StreamingResponse:
    _require_auth(authorization, x_blog_admin_token, x_admin_token)

    try:
        body = await request.json()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid JSON") from exc

    messages_raw = body.get("messages")
    if not isinstance(messages_raw, list):
        raise HTTPException(status_code=400, detail="Missing messages array")
    messages: list[dict[str, Any]] = [m for m in messages_raw if isinstance(m, dict)]

    query = last_user_text(messages)
    if not query:
        raise HTTPException(status_code=400, detail="Missing user message")

    api_key = os.getenv("SILICONFLOW_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing SILICONFLOW_API_KEY")

    supabase_url = pick_supabase_url()
    supabase_key = pick_supabase_service_key()
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500,
            detail=(
                "缺少 Supabase 配置：请在 .env / .env.local 中设置 "
                "NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_URL，以及 "
                "SUPABASE_SERVICE_ROLE_KEY 或 SUPABASE_SERVICE_KEY（与 Next 服务端相同）。"
            ),
        )

    date_hints = _collect_date_hints(query)
    embed_input = augment_query_for_embedding(query)
    match_threshold = _parse_match_threshold()

    _rag_log(
        f"last_user_query(len={len(query)})={_short(query, 500)!r} "
        f"| date_hints={date_hints} | DEFAULT_YEAR={DEFAULT_YEAR}"
    )
    _rag_log(
        f"embed_input(len={len(embed_input)}): {_short(embed_input, 1800)!r}"
    )

    oai = OpenAI(api_key=api_key, base_url=SILICONFLOW_BASE)
    try:
        emb_kw: dict[str, Any] = {
            "model": SILICONFLOW_EMBEDDING_MODEL,
            "input": [embed_input],
        }
        # Qwen3 系列需显式 dimensions 才能稳定对齐 vector(1024)；BGE-M3 等勿传该字段
        if "Qwen3-Embedding" in SILICONFLOW_EMBEDDING_MODEL:
            emb_kw["dimensions"] = SILICONFLOW_EMBEDDING_DIMENSIONS
        emb_res = oai.embeddings.create(**emb_kw)
        vec = list(emb_res.data[0].embedding)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Embedding failed: {exc!s}") from exc

    _rag_log(
        f"embedding model={SILICONFLOW_EMBEDDING_MODEL!r} dim={len(vec)} "
        f"first4={vec[:4]!r} has_qwen3_dims={'Qwen3-Embedding' in SILICONFLOW_EMBEDDING_MODEL}"
    )

    hits: list[dict[str, Any]] = []
    sb: Any = None
    date_anchor_count = 0
    try:
        sb = create_client(supabase_url, supabase_key)
        rpc = sb.rpc(
            "match_documents",
            {
                "query_embedding": vec,
                "match_count": MATCH_COUNT,
                "match_threshold": match_threshold,
            },
        )
        data = rpc.execute()
        raw = data.data
        if isinstance(raw, list):
            hits = [h for h in raw if isinstance(h, dict)]

        # 解析到日期时：用 slug / Title 行把该日文件分块置顶，再拼接向量 Top-K（去重）
        if date_hints:
            try:
                ah = fetch_date_anchor_hits(sb, date_hints)
                if ah:
                    date_anchor_count = len(ah)
                    print(
                        f"[rag] date_anchor_injected={date_anchor_count} "
                        f"vector_only={len(hits)} → merged",
                        flush=True,
                    )
                    hits = merge_hits_anchors_first(ah, hits, max_total=22)
                    _rag_log(
                        f"合并后 hits={len(hits)}（先 slug/Title 锚点，后向量；max_total=22）"
                    )
            except Exception as exc_anchor:  # noqa: BLE001
                _rag_log(f"date anchor 合并跳过: {exc_anchor!s}")

        scores = [round(float(h.get("similarity", 0)), 4) for h in hits]
        print(
            f"[rag] match_count={MATCH_COUNT} threshold={match_threshold!s} scores={scores}",
            flush=True,
        )

        _rag_log(
            f"match_documents 命中={len(hits)} threshold={match_threshold!s} match_count={MATCH_COUNT}"
        )
        if _rag_debug_enabled():
            titles = []
            for h in hits:
                c = h.get("content") if isinstance(h.get("content"), str) else ""
                t = _extract_title_from_context(c)
                if t:
                    titles.append(t)
            if titles:
                _rag_log(f"hits Title 列表（去重前，最多24）：{titles[:24]!r}")
        for i, h in enumerate(hits):
            content = h.get("content") if isinstance(h.get("content"), str) else ""
            meta = h.get("metadata") if isinstance(h.get("metadata"), dict) else {}
            title = _extract_title_from_context(content)
            slug = meta.get("slug")
            rel = meta.get("relativePath")
            ck = meta.get("chunk_index")
            sim = h.get("similarity")
            _rag_log(
                f"  #{i + 1} similarity={sim} title={title!r} slug={slug!r} "
                f"relativePath={rel!r} chunk_index={ck}"
            )

        # 对比：同向量不设 threshold，看是否被阈值挡掉
        if _rag_debug_enabled():
            try:
                rpc_nt = sb.rpc(
                    "match_documents",
                    {
                        "query_embedding": vec,
                        "match_count": MATCH_COUNT,
                        "match_threshold": None,
                    },
                )
                raw_nt = rpc_nt.execute().data
                hits_nt = [h for h in (raw_nt or []) if isinstance(h, dict)]
                scores_nt = [round(float(h.get("similarity", 0)), 4) for h in hits_nt]
                _rag_log(
                    f"对照(无 threshold): 命中={len(hits_nt)} scores={scores_nt}"
                )
                for i, h in enumerate(hits_nt[:5]):
                    c = h.get("content") if isinstance(h.get("content"), str) else ""
                    _rag_log(
                        f"  nt#{i + 1} sim={h.get('similarity')} title={_extract_title_from_context(c)!r}"
                    )
            except Exception as exc_nt:  # noqa: BLE001
                _rag_log(f"对照 RPC(match_threshold=None) 失败: {exc_nt!s}")

        # 文本探测：库中是否有含目标日期的正文（与向量无关）
        if _rag_debug_enabled():
            for needle in ("2026-4-09", "2026-4-09.md"):
                try:
                    probe = (
                        sb.table("documents")
                        .select("id, metadata")
                        .ilike("content", f"%{needle}%")
                        .limit(5)
                        .execute()
                    )
                    rows = probe.data if isinstance(probe.data, list) else []
                    _rag_log(
                        f"DB ilike content %{needle!s}% → {len(rows)} 行 "
                        f"ids={[r.get('id') for r in rows if isinstance(r, dict)]}"
                    )
                except Exception as exc_p:  # noqa: BLE001
                    _rag_log(f"DB ilike 探测 {needle!r} 失败: {exc_p!s}")

    except Exception as exc:  # noqa: BLE001
        # 与 Next 侧一致：检索失败时降级为空上下文
        print(f"[rag] match_documents error: {exc!s}", flush=True)
        _rag_log(f"match_documents 异常: {exc!s}")
        hits = []

    context_parts: list[str] = []
    for i, h in enumerate(hits):
        content = h.get("content")
        if not isinstance(content, str):
            continue
        meta = h.get("metadata") if isinstance(h.get("metadata"), dict) else {}
        slug = meta.get("slug") if isinstance(meta.get("slug"), str) else ""
        category = meta.get("category") if isinstance(meta.get("category"), str) else ""
        head_bits = [f"slug={slug}" if slug else "", f"category={category}" if category else ""]
        head = " ".join(b for b in head_bits if b)
        prefix = f"[#{i + 1}"
        if head:
            prefix += f" {head}"
        prefix += "]\n"
        context_parts.append(prefix + content)
    context_body = "\n\n---\n\n".join(context_parts)
    if date_anchor_count:
        context_body = (
            "【以下前列片段已按用户问题中的日期与库中 slug/Title 对齐，请优先据此回答；"
            "其后为语义检索补充，可能含主题相近但日期不同的内容。】\n\n---\n\n"
            + context_body
        )
    context = context_body[:CONTEXT_MAX_CHARS]
    _rag_log(
        f"送入 LLM 的 context 长度={len(context)} "
        f"date_anchor_blocks={date_anchor_count} "
        f"含子串2026-4-09={('2026-4-09' in context)} "
        f"含2026-4-09.md={('2026-4-09.md' in context)}"
    )

    system_content = build_system_prompt(context)

    chat_messages: list[dict[str, str]] = [{"role": "system", "content": system_content}]
    for m in messages:
        role = m.get("role")
        if role not in ("user", "assistant", "system"):
            continue
        text = message_to_text(m).strip()
        if not text:
            continue
        chat_messages.append({"role": str(role), "content": text})

    def token_stream():
        try:
            stream = oai.chat.completions.create(
                model=SILICONFLOW_CHAT_MODEL,
                messages=chat_messages,
                temperature=0.2,
                stream=True,
            )
            for chunk in stream:
                choice = chunk.choices[0] if chunk.choices else None
                if not choice or not choice.delta or not choice.delta.content:
                    continue
                yield choice.delta.content.encode("utf-8")
        except Exception as exc:  # noqa: BLE001
            yield f"\n[错误] 对话生成失败: {exc!s}".encode("utf-8")

    return StreamingResponse(
        token_stream(),
        media_type="text/plain; charset=utf-8",
    )


@app.post("/api/py/admin/sync")
async def py_admin_sync_post(
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
    x_blog_admin_token: str | None = Header(default=None, alias="x-blog-admin-token"),
    x_admin_token: str | None = Header(default=None, alias="x-admin-token"),
) -> JSONResponse:
    """异步同步向量库（与 POST /api/admin/sync 语义一致）。"""
    _require_auth(authorization, x_blog_admin_token, x_admin_token)
    job_inner = create_sync_job()
    jid = job_inner["id"]

    async def runner() -> None:
        await asyncio.to_thread(run_sync_job_sync, jid)

    background_tasks.add_task(runner)
    job_view = get_job(jid)
    return JSONResponse(
        status_code=202,
        content={
            "ok": True,
            "job": job_view,
            "statusUrl": f"/api/admin/sync?jobId={jid}",
        },
    )


@app.get("/api/py/admin/sync")
async def py_admin_sync_get(
    job_id: str = Query(..., alias="jobId"),
    authorization: str | None = Header(default=None),
    x_blog_admin_token: str | None = Header(default=None, alias="x-blog-admin-token"),
    x_admin_token: str | None = Header(default=None, alias="x-admin-token"),
) -> dict[str, Any]:
    _require_auth(authorization, x_blog_admin_token, x_admin_token)
    jid = job_id.strip()
    if not jid:
        raise HTTPException(status_code=400, detail="Missing required query param: jobId")
    job = get_job(jid)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"ok": True, "job": job}


@app.post("/api/py/admin/ingest")
async def py_admin_ingest(
    authorization: str | None = Header(default=None),
    x_blog_admin_token: str | None = Header(default=None, alias="x-blog-admin-token"),
    x_admin_token: str | None = Header(default=None, alias="x-admin-token"),
) -> JSONResponse:
    """全量 ingest content/（与 POST /api/admin/ingest 语义一致）。"""
    _require_auth(authorization, x_blog_admin_token, x_admin_token)
    try:
        result = await asyncio.to_thread(process_markdown_files)
        return JSONResponse(content={"ok": True, **result})
    except Exception as exc:  # noqa: BLE001
        msg = str(exc)
        status = 500
        if "维度" in msg or "Unsupported" in msg:
            status = 400
        if msg.startswith("Missing") and "SILICONFLOW" in msg:
            status = 500
        return JSONResponse({"ok": False, "error": msg}, status_code=status)
