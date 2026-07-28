# Task · Ops Desk P2-4 · Thinking Chain v2（前端）

> **状态**：`active`  
> **SCOPE**：[`SCOPE_NOTE_thinking_chain_v2_v1_zh.md`](../../../../docs/harness/invokes/by-task/ops-desk-p2-thinking-chain-v2/SCOPE_NOTE_thinking_chain_v2_v1_zh.md)  
> **协调**：[`task_ops_desk_p2_thinking_chain_v2_v1.md`](../../../../docs/harness/tasks/active/task_ops_desk_p2_thinking_chain_v2_v1.md)  
> **依赖**：泳道 A event payload 契约 · P1-3 Chat 壳 ✅

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p2-thinking-chain-v2-frontend` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P2-THINKING-CHAIN-V2-FE` |
| **git_branch** | `task/ops-desk-p2-thinking-chain-v2-frontend` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

---

## 背景与目标

Chat 页 Deep 运行展示 **Thinking Chain v2**：结构化 reasoning / suggestion / citations / Review 卡片。

### 完成态

- [ ] `ThinkingChainTimeline`（或 OpsChatClient 扩展）解析 v2 events
- [ ] `lib/ops/chat.ts` 类型 + 渲染 helper
- [ ] fixture + 单测
- [ ] `/ops/kimi-code/chat` 集成 · fast 路径 UI 不变
- [ ] PR merged → main

---

## 范围

| 文件 | 改动 |
| --- | --- |
| `components/ops/OpsChatClient.tsx` | 时间线分区 |
| `lib/ops/chat.ts` | payload 解析 · format 扩展 |
| `tests/fixtures/` | v2 events fixture |
| `lib/ops/chat.test.ts` | 渲染/解析单测 |

## 非范围

- 新 BFF 路由 · orchestrator 逻辑 · Langfuse UI

---

## 验收标准

- [ ] Deep D4 poll 后可见 reasoning + suggestion + Review 行
- [ ] fast D1–D3 回归无 UI 回归
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿

---

## 实现备忘

（子 Agent 回填 · 后端 merge 后再 rebase）
