# 独立复检：主流程 Vercel AI SDK 流式 · PR2 Phase 1（R1）

## 元信息

| 项 | 内容 |
|----|------|
| **关联 task** | [`../../tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md`](../../tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md) |
| **轮次** | 复检 R1（50 帽） |
| **复检日期** | 2026-05-18 |
| **invoke_snapshot（50 帽）** | [`../invokes/invoke_20260520_50_frontend-vercel-ai-sdk-main-stream-reinspect-pr2.md`](../invokes/invoke_20260520_50_frontend-vercel-ai-sdk-main-stream-reinspect-pr2.md) |
| **任务审核 R1** | [`task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md`](task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md) |
| **自检 invoke（40 · R3）** | [`../invokes/invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.md`](../invokes/invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.md) |
| **diff 范围** | `git diff 393f877..906a062`（transport `normalizeRequestHeaders` + task/invoke 文档）；实现修复 `23a053b` |
| **复检 cwd / 分支** | `ai-ink-brain` · `feat/unified-chat-ai-sdk-stream-v1` · 复检时 tip `0ca3ef8` |

---

## 复检结论摘要

对照 task **§9 PR2 子集**、执行者 **R3 自检** 与 `393f877..906a062` diff：**CI 可观测项全部 pass**（复检帽独立重跑 `pnpm lint` / `pnpm test` / `pnpm build` 与 `vitest run lib/unified-chat/sse lib/unified-chat/transport` 均为 exit 0）。`normalizeRequestHeaders` 已覆盖 `Headers` / `[string,string][]` / `Record` 三分支；契约头合并顺序与 task §13 一致；adapter 双写（SDK 正文 + `setEvents` Timeline）为 Phase 1 明示设计，**未发现并行遗留 read loop**，ghost 风险为 **低—中**（缺流式中专用「停止」按钮，V-ABORT 人测仍缺）。

**V-NET / V-RAG / V-ABORT 不阻塞 PR2 合入特性分支或进入 PR 评审**；**不替代** 合并 `main` / 母单签收前的人测证据（见 §人测缺口清单）。

**建议**：**同意 PR2 进入 PR 描述并合入 `feat/unified-chat-ai-sdk-stream-v1`**；**合并 `main` 前** PR 描述须标注待人测项并完成 §人测缺口清单；母单 §8 / T3–T5 仍 open，**不得** 以 PR2  alone 关闭 task。

---

## 重点核对（代码）

### normalizeRequestHeaders 三分支

| 分支 | 结论 | 证据 |
|------|------|------|
| `Headers` | pass | `chatbiSseTransport.ts:30-35` `instanceof Headers` + `forEach` |
| `[string,string][]` | pass | `chatbiSseTransport.ts:37-46`（`23a053b` 自 `393f877` 修复 spread 致 V-BUILD fail） |
| `Record` / 普通对象 | pass | `chatbiSseTransport.ts:48-54` `Object.entries` 且仅保留 `string` 值 |

### 契约头合并顺序

合并链（后者覆盖前者）：`Content-Type` → `X-ChatBI-Sse-Contract: 2`（`constants.ts`）→ `transport.headers` → `getHeaders()` → `normalizeRequestHeaders(options.headers)`。

| 结论 | 证据 |
|------|------|
| pass | `chatbiSseTransport.ts:125-131`；常量 `lib/unified-chat/transport/constants.ts:2-3` |

单测捕获契约头 + Authorization：`ChatbiSseTransport` · `sends X-ChatBI-Sse-Contract: 2 and ChatBI JSON body`（`chatbiSseTransport.test.ts:89-128`）。

### adapter 双写与 ghost

| 项 | 结论 | 说明 |
|----|------|------|
| 双写路径 | pass（设计内） | `useUnifiedChat.ts:35-36` 注释 Phase 1；`UnifiedChatPageClient.tsx:696-735` callbacks → `setEvents`；`745-749` `streamingText` → `setFinalAnswer` |
| 并行旧 SSE read loop | pass | 页面内无 `fetch`/`parseSseBlocks` 内联读流；SSE 仅在 `chatbiSseStream.ts` + Transport |
| `agent.llm.delta` 双通道 | 备注 | `chatbiSseStream.ts:127-130` 同时 `text-delta` 与 `onChainEvent`；Timeline 与主区可能重复展示 delta，属 Phase 1 adapter，**非 abort 后 ghost** |
| 新发送前 abort | pass | `UnifiedChatPageClient.tsx:894` `unifiedChat.stop()`；`useUnifiedChat.ts:87` loading 门闩 |
| 流式中专用停止 UI | fail（人测） | 无「停止」按钮；`unifiedChat.stop()` 仅见于新发送/调试重连/新会话（`894`、`1569`、`1606`、`1878`） |
| Transport abort | pass | `chatbiSseTransport.test.ts:50-85`；`chatbiSseStream.ts:179-194` `abortSignal` |

---

## 验收表（§9 · PR2 子集）

| 验收项 | pass/fail | 证据 | 备注 |
|--------|-----------|------|------|
| V-LINT | **pass** | 复检 `pnpm lint` exit 0 | Node v25.9.0 vs engines 24.x 告警，非阻塞 |
| V-TEST | **pass** | 复检 `pnpm test`：6 files / 20 tests | 与 R3 一致 |
| V-BUILD | **pass** | 复检 `pnpm build` exit 0 | `normalizeRequestHeaders` TS 已修 |
| V-PARSER | **pass** | `vitest run lib/unified-chat/sse`：12 tests 之子集 | 3 files 共 12 tests 含 sse+transport |
| V-TRANSPORT | **pass** | `vitest run lib/unified-chat/transport`；`ChatbiSseTransport` 契约头 + ≥2 `text-delta`；abort 用例 | `chatbiSseTransport.test.ts` |
| V-NET | **fail**（证据不足） | 无 DevTools 抓包 | 单测 **不等价** 实网 Network |
| V-RAG | **fail**（证据不足） | 无人测记录 | PR/签收前须补 |
| V-SQL | **fail**（证据不足） | 未测 | PR2 可选 |
| V-DONE-FAIL | **fail**（证据不足） | 未测 | PR2 可选 |
| V-ABORT | **fail**（证据不足） | Transport abort pass；**页面**流式中停止无人测 | 无专用停止按钮 |
| 母单 §8 演示 | **fail**（范围外） | T4 open | PR4 |
| T3 行数 ≤1200 | **fail** | `UnifiedChatPageClient.tsx` **1908** 行 | PR3 |

---

## 阻塞合并项

| 类型 | 项 |
|------|-----|
| **阻塞 PR2 / CI** | **无** |
| **阻塞合并 `main`（母单签收）** | **有（非 PR2 独有）**：母单 §8 未全勾；T3/T4/T5 open；§人测缺口未补 |

---

## 是否建议合并

| 目标 | 建议 |
|------|------|
| **PR2 → `feat/unified-chat-ai-sdk-stream-v1`** | **建议合并**（CI 子集全绿，diff 与 R3 自检一致） |
| **PR2 → `main`（母单关闭）** | **不建议**；须 PR3+ 与人测签收 |
| **复检帽对维护者** | PR 描述写明 **待人测**：V-NET、V-RAG、V-ABORT |

---

## 人测缺口清单（非阻塞复检 · PR/签收前须补）

1. **V-NET**：DevTools → `POST /api/py/unified/chat/stream` 请求头含 **`X-ChatBI-Sse-Contract: 2`**；`Content-Type: application/json`；响应 `text/event-stream` 且 body 为流。
2. **V-RAG**：`/unified-chat`，`prefer=rag`，知识类一问 → Timeline 陆续出现 `rag.sources`（环境允许时）；主区 **逐段/逐字** 增长（非整段卡顿后一次性显示）。
3. **V-ABORT**：流式过程中触发停止（若产品补「停止」按钮则点停；否则记录 **新发送前 stop** 行为）→ 无继续出字、输入可再次发送、无旧 run 的 chain ghost。
4. **（可选）** V-SQL / V-DONE-FAIL：演示环境需要时补。

---

## 全局验收 checklist（P0 合并前必绿 · ai-ink-brain）

| 项 | 状态 | 签注 |
|----|------|------|
| `pnpm lint` | pass（复检） | 待人工 CI 绿 |
| `pnpm test` | pass（复检） | 待人工 CI 绿 |
| `pnpm build` | pass（复检） | 待人工 CI 绿 |
| `freeze_id` | 未声明 | — |
| 维护者 sign-off | — | **待人工** |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-05-18 | 50 帽 PR2 独立复检 R1：CI pass；人测缺口不阻塞 PR2 |
