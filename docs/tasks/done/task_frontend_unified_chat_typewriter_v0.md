> **状态**：done（P1 task 卫生归档 · 2026-06-09 · 功能已在 main；追溯见各 PR / Epic M01–M06）

# Task：Unified Chat 主区打字机揭开（v0）

> **状态**：`active`（**v0 已验收 · 待 PR 合 `main`**）  
> **母单**：[`task_frontend_vercel_ai_sdk_main_stream_v1.md`](task_frontend_vercel_ai_sdk_main_stream_v1.md)（PR2 `useUnifiedChat` 已合 `main`）  
> **分支**：`feat/unified-chat-typewriter-v0`  
> **10 帽 invoke**：[`../harness/docs/harness/invokes/by-task/frontend-unified-chat-typewriter-v0/invoke_20260520_10_frontend-unified-chat-typewriter-v0.mdby-task/frontend-unified-chat-typewriter-v0/invoke_20260520_10_frontend-unified-chat-typewriter-v0.md`](../harness/docs/harness/invokes/by-task/frontend-unified-chat-typewriter-v0/invoke_20260520_10_frontend-unified-chat-typewriter-v0.mdby-task/frontend-unified-chat-typewriter-v0/invoke_20260520_10_frontend-unified-chat-typewriter-v0.md)  
> **40 自检 invoke**：[`../harness/docs/harness/invokes/by-task/frontend-unified-chat-typewriter-v0/invoke_20260520_40_frontend-unified-chat-typewriter-v0-self-check.mdby-task/frontend-unified-chat-typewriter-v0/invoke_20260520_40_frontend-unified-chat-typewriter-v0-self-check.md`](../harness/docs/harness/invokes/by-task/frontend-unified-chat-typewriter-v0/invoke_20260520_40_frontend-unified-chat-typewriter-v0-self-check.mdby-task/frontend-unified-chat-typewriter-v0/invoke_20260520_40_frontend-unified-chat-typewriter-v0-self-check.md)

---

## Harness 元信息（2.18 迁移补录）

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 1. 背景与目标

PR2 后主区答案来自 `unifiedChat.streamingText`，UI 随 SSE 块更新，观感偏「一段段顶字」。v0 在**不改 Python/BFF/Timeline** 前提下，用客户端 `useTypewriterReveal` 在流式过程中匀速揭开全文，结束后与 `streamingText` / `finalAnswer` 对齐。

---

## 2. 范围

- [x] `lib/unified-chat/hooks/useTypewriterReveal.ts` + 单测  
- [x] `UnifiedChatPageClient` 主区「最终答案」接入；流式光标 `▍`  
- [x] URL：`?typewriter=0` / `false` 关闭（默认开启）  
- [x] 保留 `loading` 时发送 disabled（防连点）

## 3. 非范围

- 不改 SSE 契约、Timeline adapter、后端推流粒度  
- 不做设置页持久化开关（仅 URL）  
- 不替代 PR3 组件瘦身 / Timeline hook 化

---

## 4. 验收标准

- [x] 默认：`/unified-chat` 流式时主区可见匀速揭开（维护者 **初步验收通过**）  
- [x] `?typewriter=0`：块级直出，可对比  
- [x] 流结束：全文展示，可再次发送  
- [x] `pnpm test` 含 `useTypewriterReveal.test.ts`

---

## 5. Harness

| 字段 | 值 |
| --- | --- |
| `test_strategy` | `recommended` |
| `test_strategy_note` | 纯 UI 揭开；已有 hook 单测；人测为主 |

---

## 6. 实现备忘

| 项 | 值 |
| --- | --- |
| 实现 commit | `a650a66`（`feat/unified-chat-typewriter-v0`） |
| 参数默认 | `charsPerTick: 2`，`tickMs: 20` |
| 展示逻辑 | `loading` → `revealedAnswer`；否则 `finalAnswer \|\| streamingText` |

### 自检结论（执行者 · v0 · 2026-05-18）

| 命令 | 退出码 |
| --- | ---: |
| `pnpm test` | **0**（含 `useTypewriterReveal`） |
| 人测 | **初步通过**（默认打字机；`?typewriter=0` 对比） |

---

## 给 Cursor

`typewriter`、`useTypewriterReveal`、`streamingText`、`?typewriter=0`、Unified Chat、PR2
