# 前端：Unified Chat Streaming（v1 / SSE）

**状态**：**已验收归档**（2026-05-11；回归 / 联调人测通过）  
**归档自**：`docs/tasks/active/task_frontend_unified_chat_streaming_sse_v1.md`  
**依赖**：后端 `POST /api/py/unified/chat/stream`（SSE）；Agent 链路与 `agent.llm.*` 见后端排期 / 环境变量。  
**设计真值（优先序）**：`docs/tasks/active/task_chatbi_v2_incremental_sse_timeline_frontend_v1.md`（vNext 前端）→ 后端 `SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md` **§6 / §6.1**；历史设计稿 `UI-03-unified-chat-streaming-sse.md` **仓库内未检出**，以代码与 vNext SPEC 为准。

**配对后端**：`ai-ink-brain-api-python/docs/tasks/done/done_unified_chat_streaming_backend_sse_v1.md`（及现行 `unified_chat.py`、**增量契约** `ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v2_incremental_sse_backend_v1.md`）。

---

## Harness 元信息（2.18 迁移补录）

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 目标（v1 最小集 — 与现实现对齐）

- Timeline **随 SSE `event: chain` 追加**（到达序；坏帧跳过不白屏）。
- **`event: done`**：结束 loading、解锁输入；`ok=false` 有可读提示路径。
- **BFF**：`POST /api/py/unified/chat/stream` **流式透传**上游 body，**不** `await upstream.text()` 吞流。
- **Unified Agent 增量契约**：stream 请求携带 **`X-ChatBI-Sse-Contract: 2`**，BFF **原样透传**（与 vNext §9 / 后端矩阵一致）。
- **`event: token`**：顶层收到则 **忽略**（不崩）；子步 LLM 以 **`chain` + `agent.llm.*`** 为准（见 vNext 任务单 Events **§8.1**）。

---

## 代码真值（已实现 — 新 Agent 先读再改）

| 区域 | 路径 | 要点 |
|------|------|------|
| BFF | `app/api/py/unified/chat/stream/route.ts` | `requireAdminApiSecret`；转发 `POST ${PY_API_URL}/api/py/unified/chat/stream`；透传 **`Authorization`**、**`x-blog-admin-token`**、**`Content-Type`**、**`X-ChatBI-Sse-Contract`**；`return new Response(upstream.body, …)` |
| 页面 | `components/unified-chat/UnifiedChatPageClient.tsx` | `fetch("/api/py/unified/chat/stream", …)` + `ReadableStream` + `\n\n` 分帧；**已发** `X-ChatBI-Sse-Contract: 2`；处理 **`chain` / `done`**；**`token` 忽略**；右栏 **`buildExecutionTraceSections`**、`agent.llm.*` 分段等；**标题栏「复制」**：Timeline 侧复制当前 `timelineEvents`（JSON）；执行链路侧复制与右栏摘要一致的纯文本（`buildExecutionTraceCopyText` + `copyPlainToClipboard`）。与 **vNext 前端任务** 重叠部分以该任务单验收为准 |

若上述文件行为与本文「验收」不一致，**以仓库代码为真值**并回填本任务「实现备忘」。

---

## 范围（本单剩余 / 非重复造轮子）

### 仍属 v1 单（收口）

- [x] **回归验收**：静态（`pnpm exec tsc --noEmit`、`pnpm lint`）+ 联调 / Network / Agent 路径等「验收」章节已由人测通过（2026-05-11）。
- [ ] **文档**：本任务顶部「设计」链接已与仓库一致；若恢复 `UI-03` 文稿，可再链回。
- [x] **BFF 与后端头名大小写**：已核对 `route.ts` 使用 `x-chatbi-sse-contract` 读取并向上游写入 `X-ChatBI-Sse-Contract`；联调异常时用 Network 核对实际头。

### 划给 vNext 前端任务（勿在本单重复开需求）

- 左右双栏、**`agent.llm.*` 右栏叙事**、坏帧计数策略、`single_panel` + `localStorage` 等 → **`docs/tasks/active/task_chatbi_v2_incremental_sse_timeline_frontend_v1.md`**。

---

## 非范围

- 不要求在本单实现 vNext 双栏 / `agent.llm.delta` UI 细则（见 vNext 任务单）。
- v1 **不要求**顶层 `token` 驱动回答正文（忽略即可）。

---

## 实现要求（核对清单 — 非从零指令）

1. **BFF** `app/api/py/unified/chat/stream/route.ts`  
   - 与 `app/api/py/unified/chat/route.ts` 同级鉴权；上游失败 503 JSON 可接受；**禁止**缓冲整个 SSE body 再返回。

2. **`UnifiedChatPageClient.tsx`**  
   - 主路径为 **SSE stream**（非 `fetch("/api/py/unified/chat")` 一次性 `events[]`）。  
   - 解析：`event: chain` → 解析 `data` JSON → append；`event: done` → 收尾；`event: token` → 忽略。  
   - 重复发送 / loading：按钮或逻辑防抖（以当前实现为准做回归）。

---

## 验收（回归 — 新 Agent 可勾选）

- [x] **CHATBI_USE_AGENT=true**（及后端可联调）时，发流式请求后 Timeline **陆续出现** `tool.call.start` / `tool.call.end`（或 Agent 路径等价 `chain`）。（2026-05-11 人测通过）
- [x] RAG 路径可见 **`rag.sources`**；Text2SQL 路径可见 **`sql.result`**（与 `prefer` / 后端路由一致）。
- [x] 收到 **`done`** 后输入框解锁；**`ok=false`** 时有错误提示或 `error` chain 可读展示。
- [x] **错误路径**：流中出现 **`error`** `chain` 时 UI 不白屏，且仍能收到 **`done`**（与后端 §8.3 一致）。
- [x] **Network**：对 `/api/py/unified/chat/stream` 请求存在 **`X-ChatBI-Sse-Contract: 2`**，且 BFF 到 Python 透传（见 BFF 源码）。

---

## 联调前置（后端 / 环境）

| 变量或配置 | 说明 |
|------------|------|
| `PY_API_URL` | 前端 BFF 指向可运行的 Python 服务 |
| `CHATBI_USE_AGENT=true` | 走 Agent SSE `chain` 丰富事件（否则多为 V1 路由、事件形态不同） |
| `CHATBI_SSE_INCREMENTAL` + 协商头 `2` | 与后端 **§9.2** 一致时，为增量 emit（前端仍只解析 `chain`/`done` 即可） |
| 鉴权 | 与现网一致：`Authorization: Bearer …` 或 cookie/Admin 约定（见 `requireAdminApiSecret`） |

**Case C（401）**：不带合法鉴权调 stream → 401，前端 `pickErrorMessage` 类路径可读（以现实现为准）。

---

## 联调用例（建议）

- **Case A（RAG）**：`prefer=rag`，知识类问题 → 流中出现 `rag.sources`、`assistant.message`（或最终答案自 `events` 推断逻辑与现实现一致）。
- **Case B（Text2SQL）**：`prefer=text2sql`，表统计类问题 → 出现 `sql.result`。
- **Case C（Unauthorized）**：无 token → 401。

---

## 后续（vNext）

执行期增量、`agent.llm.*` 右栏细化、与 SPEC §6.1 差异收口：**`docs/tasks/active/task_chatbi_v2_incremental_sse_timeline_frontend_v1.md`**（配对后端：`ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v2_incremental_sse_backend_v1.md`）。

---

## 实现备忘（子 Agent 回填）

- 最近核对提交 / PR：工作区核对 2026-05-11；未绑定新 PR 号。  
- 若修改了 BFF 透传头清单：未改；仍为 `Authorization`、`x-blog-admin-token`、`Content-Type`、`X-ChatBI-Sse-Contract`。  
- 增量：`ChainTimeline`/`ChainEventCard` 用 key 含 `batchNonce`+`batchOpen` 驱动批量展开 remount，消除 `react-hooks/set-state-in-effect`；`UnifiedChatPageClient` 增加 `done.ok===false` 可读提示条（与 persist 失败区分）。  
- **验收回填（2026-05-11）**：联调 / 「验收」章节人测通过；另增 **Timeline / 执行链路** 标题栏各自 **「复制」**（左侧复制当前 `timelineEvents` 的 JSON；右侧复制与执行链路摘要一致的纯文本），便于粘贴排障与留档。  

---

## 给 Cursor

`UnifiedChatPageClient`、`/api/py/unified/chat/stream`、`SSE`、`chain`、`done`、`X-ChatBI-Sse-Contract`、`token` 容错、回归验收、PY_API_URL、CHATBI_USE_AGENT、Timeline 复制、执行链路复制、剪贴板
