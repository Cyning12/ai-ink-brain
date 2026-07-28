> **状态**：done（P1 task 卫生归档 · 2026-06-09 · 功能已在 main；追溯见各 PR / Epic M01–M06）

# 前端任务：Unified Chat — V2 RAG 改写链路与 LLM Prompt 调试展示

> **状态**：`implemented`（合并前人工勾选验收）  
> **关联图谱**：`docs/_tech_graph/13_flow_components.md`（Unified Chat / Timeline）  
> **配对后端任务**：`ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v2_rewrite_timeline_llm_prompt_capture_v1.md`  
> **依赖**：后端 V2 Agent 已 emit `rag.rewrite` 与 `agent.debug.llm_prompts`（见上任务单）

---

## Harness 元信息（2.18 迁移补录）

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 背景与目标

1. **类型与渲染**：`ChainEventType` 增加 **`agent.debug.llm_prompts`**，`ChainEventCard` 可折叠展示 `payload.items[]`（每段含 `phase` / `model` / `messages` 等），支持复制整段 JSON。  
2. **Rewrite 可见性**：`tool.call.*` 且 `payload.tool === "rag.rewrite"` 沿用现有工具卡片样式即可在 Timeline 展示。  
3. **请求开关**：在 **`?debug=1`**（`debugEnabled`）下提供 **LLM Prompt 调试** 开关；开启时 `POST /api/py/unified/chat/stream` 的 body 附带 **`debug_llm_prompts: true`**；关闭时从 `events` 中移除 `agent.debug.llm_prompts`，与 Router Debug 行为一致。

---

## 范围

- [x] `components/chain-chat/types.ts`：`agent.debug.llm_prompts`  
- [x] `components/chain-chat/ChainEventCard.tsx`：标题、正文、复制  
- [x] `components/chain-chat/ChainTimeline.tsx`：`stableTimelineKey` 去重键  
- [x] `components/unified-chat/UnifiedChatPageClient.tsx`：state、`timelineEvents` 过滤、`fetch` body、`buildExecutionTraceSections` 跳过 debug 事件、卸载 URL debug 时重置开关

## 非范围

- BFF `app/api/py/unified/chat/stream/route.ts`（已透传 JSON body，一般无需改）。  
- 非 debug 模式下默认开启 prompt 采集（**禁止**：体积与敏感信息风险）。

---

## 验收标准

- [ ] URL 无 `debug`：不出现「LLM Prompt 调试」面板；不发送 `debug_llm_prompts`。  
- [ ] `?debug=1` 且打开 LLM Prompt 开关：Network 可见 **`debug_llm_prompts": true`**；Timeline 出现 **`agent.debug.llm_prompts`** 卡片且可展开 messages。  
- [ ] RAG 路径可见 **`rag.rewrite`** 的 `tool.call.start/end`（在 `rag_search` 主调用之前）。  
- [ ] 关闭开关后当前页事件列表不再含 `agent.debug.llm_prompts`。

---

## 涉及文件

| 路径 | 说明 |
|------|------|
| `components/chain-chat/types.ts` | 事件联合类型 |
| `components/chain-chat/ChainEventCard.tsx` | UI |
| `components/chain-chat/ChainTimeline.tsx` | 列表 key |
| `components/unified-chat/UnifiedChatPageClient.tsx` | 请求体与过滤 |

---

## 给 Cursor

验收、非范围、依赖、图谱、`_tech_graph`、`rag.rewrite`、`agent.debug.llm_prompts`、`debug_llm_prompts`、`debugEnabled`
