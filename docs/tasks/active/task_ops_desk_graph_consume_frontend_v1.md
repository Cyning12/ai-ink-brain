# Task · Ops Desk · Graph Tab 矩阵 BFF 对齐 · 前端 · v1

> **状态**：`pending`  
> **Harness 母单**：[`Projects/docs/harness/tasks/active/task_ops_desk_graph_consume_v1.md`](../../../../docs/harness/tasks/active/task_ops_desk_graph_consume_v1.md)  
> **Open Folder**：**本仓根** `ai-ink-brain/`  
> **阻塞**：后端 `task_ops_desk_graph_consume_backend_v1` merge 后

| 字段 | 值 |
|------|-----|
| **test_strategy** | `recommended` |
| **git_branch** | `task/ops-desk-graph-consume-frontend` |
| **freeze_id** | `OPS-DESK-GRAPH-CONSUME-V1` |

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（profile.wiki=false）；本 task 未改 wiki |


## 背景与目标

Graph Tab 在 `lib/ops/data.ts` 直连 Supabase 且 join 键错误，导致 Issues 全 0。改为 **BFF/API 单源**，只展示 module 级行。

---

## 范围

- [ ] Graph Tab 改读 `/api/ops/graph/module-issues`（经 BFF 转发 Python API）
- [ ] 移除或薄封装 `getGraphModuleIssues` 错误 join
- [ ] vitest / fixture 更新

## 非范围

- graph_analyst 实现（后端）
- Chat UI 变更

---

## 验收标准

- [ ] `/ops/kimi-code/graph` 矩阵 **module 行**（非 100 flow 行）· 有 scan 数据时至少 1 行 Issues>0
- [ ] `pnpm test` 绿

---

## 依赖

- [`app/ops/kimi-code/graph/page.tsx`](../../app/ops/kimi-code/graph/page.tsx)
- [`lib/ops/data.ts`](../../lib/ops/data.ts)
