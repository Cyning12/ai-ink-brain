# 前端：增强 Chat 调试信息并转发 `x-sources` Header

状态：pending  
关联：后端 `/api/py/chat` Task04 sources（`x-sources` + `---RAG_SOURCES_JSON---`）  

## 背景与目标

当前前端页面出现的日志：

- `[chat] session_id=...`
- `[chat] messages=...`
- `[chat] chunks=... bytes=... elapsedMs=...`
- `[chat] sources_json=... marker=---RAG_SOURCES_JSON---`

这些来自前端 `streamChat()` 的 debug 输出（不是后端 `[rag-debug]`）。当检索“疑似未命中”时，缺少足够信息判断是：

- 后端未返回 sources（确实没命中 / 没入库）
- BFF 丢失了 `x-sources` header（前端只能靠流末尾 marker）
- marker 未出现或解析失败

目标：

- 在不改变现有 Chat 功能的前提下，**让前端页面能直接看到更完整的调试信息**，减少每次都去查 Supabase 的成本。
- 在安全可控的前提下，**让前端优先读取 `x-sources` header**（若存在且长度安全），marker 仍作为兜底。

## 范围

- 修改 `ai-ink-brain` 前端仓的 BFF 与 chat client 解析/日志。
- 不改后端 Python 逻辑（后端已做 `x-sources` 长度保护）。

## 非范围

- 不做 UI 大改（仅新增“调试信息面板/折叠区”或 console log 增强即可）。
- 不调整 RRF/检索策略、不改 Supabase SQL。

## 现状定位（代码真值）

- 前端流式解析与 debug 日志：`lib/chat/chatApi.ts`（`streamChat()`）
  - 会尝试 `res.headers.get("x-sources")`，并解析 marker `---RAG_SOURCES_JSON---`
- BFF 代理转发：`app/api/py/chat/route.ts`
  - 当前返回 `new Response(upstream.body, { headers: { Content-Type: ... } })`
  - **不会转发 `x-sources`**，导致浏览器侧永远拿不到 header（只能靠 marker）

## 需求与验收标准

### 1) BFF 转发 `x-sources`（若存在）

**要求**

- 在 `app/api/py/chat/route.ts` 的成功返回中：
  - 保留现有 `Content-Type`
  - 若 upstream 存在 `x-sources`，则将其转发到响应 header（`x-sources`）
- 注意：后端已对 `x-sources` 做长度保护；前端仍应保持对 `UND_ERR_HEADERS_OVERFLOW` 的兜底提示不变。

**验收**

- 后端返回 `x-sources` 时，浏览器 `fetch("/api/py/chat")` 能读到 `res.headers.get("x-sources")` 非空。
- 不影响流式输出与 sources 卡片展示。

### 2) 前端 debug 输出更“可定位”

**要求**

在 `lib/chat/chatApi.ts` 的 `streamChat()` 中，当 `debug=true` 时，额外输出/上报以下信息（`onDebugLog` 或 console）：

- `x_sources_present`: boolean
- `x_sources_len`: number（字符串长度；无则 0）
- `header_sources_count`: number（从 header 解析到的 sources 条数）
- `marker_found`: boolean
- `tail_sources_count`: number（从流末尾 JSON 解析到的 sources 条数）
- `sources_used`: `"header" | "tail" | "none"`（最终 sources 采用来源）
- `sources_parse_error`: 若 JSON 解析失败，给出简短错误（截断到 200 字）

**验收**

- 用任意一次命中问题提问，debug 面板/console 能看到上述字段；
- 若后端禁用 `x-sources`（超长被省略），前端能明确显示 `x_sources_present=false` 且仍能从 tail marker 解析到 sources（若有命中）；
- 若 sources 解析失败，debug 能给出原因，不需要查库即可定位到“解析问题 vs 无命中”。

## 实现备忘（给前端 Agent）

- 修改文件建议：
  - `app/api/py/chat/route.ts`：转发 `x-sources`
  - `lib/chat/chatApi.ts`：补充 debug 输出字段（必要时扩展 `StreamChatResult` 或仅 debug log）
  - 若需要 UI 展示：`components/ChatPanel` 或相关组件新增折叠调试面板（可选）

## 测试建议

- Case A：后端 header 正常（`x-sources` 存在）→ 前端应优先用 header，marker 作为兜底
- Case B：后端省略 header（超长保护触发）→ 前端应显示 header 不存在，但 marker 解析正常
- Case C：无命中 → 前端应显示 `sources_used=none`，并提示“无 sources”（不报错）

