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
| V-NET | **pass** | 维护者人测 DevTools | `X-ChatBI-Sse-Contract: 2` + SSE 流 |
| V-RAG | **pass** | 维护者人测 UI 流式 + SSE | `rag.sources` / 多段 delta |
| V-SQL | **pass** | 维护者人测 SSE | `sql.result` · `agent_info` count=13 |
| V-DONE-FAIL | **pass** | 维护者人测 | 错误条可读；结束后可再发 |
| V-ABORT | **pass** | 维护者人测 **新会话** | 无 ghost；结束后可再发；无专用停止按钮 |
| 母单 §8 演示 | **fail**（范围外） | T4 open | PR4 |
| T3 行数 ≤1200 | **fail** | `UnifiedChatPageClient.tsx` **1908** 行 | PR3 |

---

## 阻塞合并项

| 类型 | 项 |
|------|-----|
| **阻塞 PR2 / CI** | **无** |
| **阻塞合并 `main`（母单签收）** | **有（非 PR2）**：母单 §8 未全勾；T3/T4/T5 open |

---

## 是否建议合并

| 目标 | 建议 |
|------|------|
| **PR2 → `main`** | **建议合并**（2026-05-18 维护者人测签收；§9 PR2 子集全 pass） |
| **母单 task 关闭** | **未满足**；PR3+ / R2 母单签收仍待 |

---

## 人测签收（维护者 · 2026-05-18）

§9 PR2 人测 **全部 pass**（V-NET / V-RAG / V-SQL / V-DONE-FAIL / V-ABORT）。V-ABORT 采用 **新会话**；流式中发送 **disabled**（防连点，保留）。详见 task **`### 自检结论（执行者）`** · **人测签收** 小节。

---

## 全局验收 checklist（P0 合并前必绿 · ai-ink-brain）

| 项 | 状态 | 签注 |
|----|------|------|
| `pnpm lint` | pass（复检） | CI 以 PR 为准 |
| `pnpm test` | pass（复检） | CI 以 PR 为准 |
| `pnpm build` | pass（复检） | CI 以 PR 为准 |
| `freeze_id` | 未声明 | — |
| 维护者 sign-off（PR2） | **approved** | 2026-05-18 |

---

## 签收 / 关闭

| 项 | 结论 |
|----|------|
| **本轮 PR2 复检 + 人测** | **通过**；**已合并 `main`** @ `4752f17`（[PR #32](https://github.com/Cyning12/ai-ink-brain/pull/32) · 2026-05-18） |
| **母单 task 正式关闭** | **未满足**（PR3 Timeline hook、行数目标、T4/T5） |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-05-18 | 50 帽 PR2 独立复检 R1：CI pass；人测缺口不阻塞 PR2 |
| 2026-05-18 | 维护者人测签收；PR2 建议合并 main |
