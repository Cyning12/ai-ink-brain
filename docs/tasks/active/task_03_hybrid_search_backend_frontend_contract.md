Task 03：Hybrid Search（Supabase FTS + Vector + RRF）对接说明

## 目标
- 后端将检索从“纯向量”升级为“向量（Vector）+ 全文检索（FTS Keyword）”双路召回，并用 **RRF**（Reciprocal Rank Fusion）融合排序。
- 对前端 **接口保持透明**：`POST /api/py/chat` 入参/出参不变（仍是流式文本），但回答质量与可解释性提升；调试信息会写入 Supabase 的 `rag_conversation_logs`，便于排障与调参。

## 后端接口（前端无需改动）
### `POST /api/py/chat`
- **请求**：保持现有前端实现（`messages[]` + `session_id` + admin token）。
- **响应**：`text/plain; charset=utf-8` 的流式文本（StreamingResponse），前端继续按“打字机/墨迹”方式渲染即可。

### `GET /api/py/chat/history`
- 保持不变，用于前端刷新后恢复对话。

## Supabase 侧需要执行的 SQL（一次性）
在 Supabase Dashboard → SQL Editor 执行：
- `supabase/sql/init.sql`（若你是新库）
- `supabase/sql/create_rag_conversation_logs.sql`（日志表）
- `supabase/sql/hybrid_search.sql`（本任务新增：fts_tokens + 索引 + RPC）

执行完成后，`public.documents` 将新增：
- `fts_tokens tsvector`：用于全文检索加速
- `documents_fts_tokens_gin`：GIN 索引

并新增 RPC：
- `keyword_documents(query_text, match_count)`：Keyword 路召回
- `refresh_documents_fts_tokens_for_paths(relative_paths[])`：入库后兜底刷新 fts_tokens

## 检索融合策略（供理解/排障）
后端在一次 `/chat` 请求内执行：
- **路 A（Vector）**：`match_documents(query_embedding, match_count, match_threshold)`
- **路 B（Keyword）**：`keyword_documents(rewritten_query, match_count)`
- **融合（RRF）**：对两路结果分别按排名 \(rank=1..n\) 计算

\[
score = \frac{1}{60 + rank}
\]

同一 `id` 的文档分块会累加两路得分得到 `fused_score`，再按 `fused_score` 降序取 TopN（默认最多 22 条上下文片段）。

> 说明：如果用户问题里出现日期（如 `2026-04-09`），后端还会做“日期锚点命中”优先注入（slug/Title 对齐），以避免语义相近但日期不符的内容干扰。

## 可观测性（前端不用展示，但用于排障）
每次对话结束后，后端会异步写入 Supabase `rag_conversation_logs`：
- `retrieved_context`：包含每条命中片段的 `metadata`、截断后的 `content`、以及 `fused_score/rrf` 等
- `metadata.latency_ms`：history/rewrite/embedding/retrieve/generate 延迟
- `metadata.match.hybrid`：`rrf_k`、两路命中数量（vector_hits/keyword_hits）

建议前端排障流程：
- 用户反馈“没检索到/答非所问”时，带上 `session_id`，从 `/api/py/chat/history` 找到对应轮次，再到 Supabase `rag_conversation_logs` 里查该轮的 `retrieved_context` 与 `metadata.match`。

## 兼容性与注意事项
- **Embedding 维度必须一致**：`documents.embedding vector(1024)` ↔ `SILICONFLOW_EMBEDDING_DIMENSIONS=1024`。
- **FTS 配置**：当前 SQL 使用 `to_tsvector('simple', content)` 与 `websearch_to_tsquery('simple', query_text)`，适配中英文混合；若你后续引入更强中文分词，可在 SQL 侧替换配置。

## 开发任务完成情况（前端）
- **结论**：本任务对前端 **无需开发改动**。
- **原因**：后端实现为“透明升级”，已明确保持接口契约不变：
  - `POST /api/py/chat` 入参/出参不变（仍为 `text/plain; charset=utf-8` 流式文本）
  - `GET /api/py/chat/history` 不变（用于刷新后恢复对话）
- **验证建议（人工/自测）**：
  - 使用现有聊天 UI 发起一次对话，确认仍按既有“打字机/墨迹”方式流式渲染；
  - 如需排障：让用户提供 `session_id` → 通过 `/api/py/chat/history` 定位轮次 → 在 Supabase `rag_conversation_logs` 中查看该轮的 `retrieved_context` 与 `metadata.match.hybrid` / `metadata.latency_ms`。

