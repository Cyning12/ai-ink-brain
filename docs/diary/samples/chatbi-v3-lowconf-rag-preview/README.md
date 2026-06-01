# 标准样本 · ChatBI V3 低置信 RAG 预览 + plan_execution_token（§5-3 · Ink FE）

> **用途**：Ink 前端 FE-5 烟测留证索引；Timeline JSON / 截图 **真值目录**在配对后端（本文件为互链索引，**非**重复拷贝二进制）。
> **采集**：2026-05-31～2026-06-01 · Ink `72f8f0c` · 后端 `b297c94` · **浏览器真机** Unified Chat
> **freeze_id**：`CHATBI-LOWCONF-RAG-PREVIEW-FE@2026-05-31`（与后端 `CHATBI-LOWCONF-RAG-PREVIEW@2026-05-31` 对齐）

## 环境要点（路线 A · 5-3）

| 项 | 值 |
|----|-----|
| 问句（成功预览） | `2026-04-28日记的大致内容` |
| session_id | `791291bd-92f8-4936-b698-28e8fb4025e9` |
| round1 run_id | `085082ae-6386-4f43-a60f-f11b4fffcd65`（14 条 SSE） |
| round2 run_id | `df8593fb-1dc1-4154-9349-6c68bd6e7b08`（浏览器全链 34 条） |
| 开关 | `CHATBI_USE_AGENT=1` · `CHATBI_V2_INTENT_LLM=1` · `CHATBI_V3_LOW_CONFIDENCE_CLARIFY=1` · `CHATBI_V3_PLAN_PREVIEW_CONFIRM=1` · **`INTENT_MIN_CONFIDENCE=1.0`（仅联调）** |

联调通过后请将 `INTENT_MIN_CONFIDENCE` 改回 **0.6** 并重启 uvicorn。

## FE 验收观测（2026-06-01 · pass）

| 验收项 | 结论 | 证据 |
|--------|------|------|
| FE-1 RAG preview 解析 | **pass** | 无 `sql_draft` 的 `rag_search` 帧正常入链 |
| FE-2 确认卡片 | **pass** | 标题「预览 RAG 方案」· `rewrite_query` / `planned_top_k` / headlines |
| FE-3 续跑 token | **pass** | 「按预览执行」→ body 含 `plan_execution_token` · 同 query/session |
| FE-4 Timeline | **pass** | `ChainEventCard` RAG 分支非 sql 围栏 |
| FE-5 烟测留证 | **pass** | 见下表 · 后端 diary 真值目录 |

## 截图（真值 · 后端仓）

| 文件 | 说明 |
|------|------|
| [`ui-confirm-rag-preview-card.png`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/screenshots/ui-confirm-rag-preview-card.png) | 确认卡「按预览执行」+ `rewrite_query` |
| [`timeline-round1-14-events-preview.png`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/screenshots/timeline-round1-14-events-preview.png) | 首轮 ~14 条：`plan.preview` + `clarify` |
| [`timeline-rag-preview-clarify-execution-path.png`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/screenshots/timeline-rag-preview-clarify-execution-path.png) | 执行链含 preview / clarify 片段 |

## 两轮 Timeline JSON（真值 · 后端仓）

| 轮次 | 文件 | 关键观测 |
|------|------|----------|
| 1 预览+澄清 | [`round1_preview_clarify_timeline.json`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/round1_preview_clarify_timeline.json) | 14 条 · `tool=rag_search` · `rewrite_query` · `plan_execution_token` · `agent.clarify` · **无** `tool.call` |
| 2 令牌放行 | [`round2_token_bypass_execute_timeline.json`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/round2_token_bypass_execute_timeline.json) | token 校验 · **无** `clarify` · `rag_search` · fallback `direct_answer` |

## 已知问题（答案质量 · 非 §5-3 缺陷）

见后端 [`NOTES-future-diary-llm-date.md`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/NOTES-future-diary-llm-date.md)：**未来日记**误判 — RAG/直接回答未注入当前日期与 KB 边界，**不** retro 否决 FE-5 / §5-3 机制。

## 关联

- 本仓 task（done）：`content/tasks/done/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md`
- 后端 task（done）：`ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v3_lowconf_rag_preview_v1.md`
- 后端 diary 索引：[`ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/README.md`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/README.md)
- 50 复检：`content/tasks/reinspect_results/reinspect_chatbi-v3-lowconf-rag-preview-frontend_20260601_v2.md`
- 对照 5-2：后端 [`chatbi-v3-lowconf-sql-preview/`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-sql-preview/)
