# 前端：Unified Chat Streaming（v1 / SSE）

状态：pending  
依赖：后端 `POST /api/py/unified/chat/stream`（SSE）  
设计：`ai-ink-brain-api-python/docs/UI/v1/UI-03-unified-chat-streaming-sse.md`

## 目标

让 Unified Chat 页面支持 SSE 流式展示：

- Timeline 实时出现 chain events
- 回答文本至少在结束时出现（v1），可选 token 级增量（v2）

## 范围

- **新增 BFF（必须）**：`/api/py/unified/chat/stream`（Next route 透传 SSE body）
- **改造页面请求（必须）**：`components/unified-chat/UnifiedChatPageClient.tsx`
  - 把当前一次性 `send()` 改为 `streamUnifiedChat()`（SSE）
  - 解析 SSE（`event: chain|done|token`）
  - `chain` → append 到 timeline state（`setEvents(prev => [...prev, e])`）
  - `done` → 标记完成状态（解除 loading、可再次输入）
  - `token`（v1 可不实现 UI 渲染，但必须容错：收到就忽略也算通过）

## 非范围

- v1 不要求 token 级文本流（后端若暂不发 token，前端兼容即可）

## 现状（代码真值）

- 目前 `UnifiedChatPageClient` 调用的是 **一次性 JSON**：
  - `fetch("/api/py/unified/chat")` → `await res.text()` → `JSON.parse()` → `setEvents(data.events)`
- 已存在 BFF：`app/api/py/unified/chat/route.ts`（转发到 Python `/api/py/unified/chat`）

## 实现要求（必须做清单）

### 1) 新增 BFF：`/api/py/unified/chat/stream`

新增文件：

- `app/api/py/unified/chat/stream/route.ts`

行为：

- 与 `app/api/py/unified/chat/route.ts` 相同的鉴权：`requireAdminApiSecret(request)`
- 上游转发到 Python：
  - `POST ${PY_API_URL}/api/py/unified/chat/stream`
- **透传流**：
  - `return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" } })`
  - 不要 `await upstream.text()`（否则会把流读完，前端收不到实时事件）
- 透传 headers：
  - `Authorization`（若存在）
  - `x-blog-admin-token`（若存在）
  - `Content-Type: application/json`

### 2) 前端 SSE 解析与状态更新

修改文件：

- `components/unified-chat/UnifiedChatPageClient.tsx`

改造点：

- 把 `send()` 拆成：
  - `send()`：负责入参校验与 UI 状态 reset，并调用 `streamUnifiedChat()`
  - `streamUnifiedChat()`：真正发起 SSE 请求并逐条解析

SSE 解析建议（实现细节）：

- 使用 `fetch("/api/py/unified/chat/stream", ...)` 获取 `res.body`
- `const reader = res.body.getReader()` + `TextDecoder("utf-8")`
- 以 `\n\n` 作为 SSE message 分隔；每条 message 内解析：
  - `event: xxx`
  - `data: {...json...}`
- 事件处理：
  - `event=chain`：`JSON.parse(data)` 得到 `ChainEvent`，append 到 `events`
    - **排序策略**：v1 可直接 append（后端 ts 单调递增），必要时 `ChainTimeline` 内部按 ts 排序
  - `event=done`：读取 `{ ok, mode, run_id }`，结束 loading；如 `ok=false` 可在 UI 显示提示
  - `event=token`：v1 可先忽略（或 append 到一个“当前回答草稿”），但不可导致异常

异常/中断处理：

- `res.ok=false`：读 `await res.text()` 后用现有 `pickErrorMessage()` 显示错误
- `reader` 读取过程中抛错：设置 `errorText`，并 `setLoading(false)`
- 用户重复点击发送时：应禁用按钮或在 `loading` 时 return

## 验收

- [ ] 发起请求后，Timeline 立即出现 `tool.call.start/end`
- [ ] RAG 路看到 `rag.sources`；Text2SQL 路看到 `sql.result`
- [ ] 最终收到 `done`，UI 解锁输入框
- [ ] 错误路径：展示 `error` 事件并仍能 `done`

## 联调用例（建议）

- Case A（RAG）：`prefer=rag`，问一个知识问题（任意）→ 事件流中出现 `rag.sources`、最终 `assistant.message`
- Case B（Text2SQL）：`prefer=text2sql`，问“统计 agent_info 表里有多少条数据”→ 出现 `sql.result`
- Case C（Unauthorized）：不带 token 调用 stream → 401，前端显示错误

