# Task · Ops Session S5.2 Graph Delta Promote UI（图谱 promote 预览 · 人签 HG-PROMOTE-GRAPH）

> **状态**：`draft` · 00 统筹起草 · 2026-07-03  
> **epic**：Session Orchestrator · S5.2 `ops-session-s5-graph-promote`  
> **schedule_ref**：SPEC §10.3 · §9.3 · BLOCKERS B6 · PLAN §9 D1  
> **关联 SPEC**：[`SPEC_ops_session_orchestrator_v1_zh.md`](../../docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md) §10.3 · §9.3  
> **配对后端**：[`task_ops_session_s5_graph_promote_api_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/active/task_ops_session_s5_graph_promote_api_v1.md)  
> **前置**：后端 S5.2 task 或 API 契约冻结  
> **人拍板**：D1 = **UI 要做**（PLAN §9）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-session-s5-graph-promote-ui` |
| **module_id** | `OPS-SESSION-ORCH` |
| **freeze_id** | `OPS-SESSION-ORCH-SPEC-V1` |
| **test_strategy** | `recommended` |
| **worktree_root** | `ai-ink-brain/` |
| **git_branch** | `task/ops-session-s5-graph-promote-ui` |
| **blocked_by** | 后端 `ops-session-s5-graph-promote-api` |
| **blocks** | Epic §12.3 勾选项 · MVP+ 验收 |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | `approved` | 20-task-audit, 30 | 人签 · 2026-07-03 · 派工执行 |
| HG-AUDIT-R1 | `approved` | 30 | 人签 · 2026-07-03 · 20-task-audit 关注点由 30/50 复核 |

---

## 背景与目标

S5.2 API 提供 graph_delta promote 能力，UI 需提供：graph_delta 文件清单预览、目标 `_tech_graph/` 路径展示、diff 摘要、`HG-PROMOTE-GRAPH` 人签状态、确认 promote 按钮（解耦于 task promote）。

**完成态一句话**：Session 详情页新增「图谱 Promote」区，maintainer 预览 graph_delta → 签 `HG-PROMOTE-GRAPH` → 确认 → 查看 promote 结果。

---

## 范围

- [x] Session 详情页新增 `OpsSessionGraphPromotePanel`
- [x] 展示 `deliverables/{run_id}/graph_delta/` 文件清单
- [x] 展示目标 `_tech_graph/` 路径与 diff 摘要
- [x] 展示 `HG-PROMOTE-GRAPH` pending/approved 状态
- [x] 提供目标仓/分支选择、冲突策略选择（同 S4.2 UI）
- [x] BFF：`GET/POST /api/ops/sessions/[id]/promote/graph`
- [x] Vitest mock BFF 与状态切换
- [x] S4/S5 UI 路径不退化

---

## 非范围

- 不修改 graph_delta 生成逻辑
- 不替代 task promote UI
- 不自动 commit/PR
- 不处理非 `_tech_graph/` 目标

---

## 失败路径

| # | Scenario ID | 触发 | 行为 | 可重试 |
| --- | --- | --- | --- | --- |
| F1 | fp-ui-graph-empty | session 无 graph_delta | 隐藏入口或提示空 | — |
| F2 | fp-ui-graph-gate-pending | `HG-PROMOTE-GRAPH` 未签 | 禁用确认按钮，提示人签路径 | 是（人签后） |
| F3 | fp-ui-graph-conflict | 目标文件已存在 | 展示 diff 与策略选择 | 是 |

---

## 验收标准

- [x] graph_delta 文件清单可预览
- [x] 目标路径与 diff 可展示
- [x] 人签状态与按钮禁用联动
- [x] promote 后结果横幅/错误展示
- [x] S4/S5 UI 不退化
- [x] `pnpm lint` / `test` / `build` 绿

---

### 自检结论（执行者，30 回填）

| 项 | 结果 |
| --- | --- |
| **日期** | 2026-07-03 |
| **分支** | `task/ops-session-s5-graph-promote-ui` |

```text
pnpm lint  → 0 errors, 4 pre-existing warnings
pnpm test  → 173 passed (37 files)
pnpm build → success
```

---

## 给 Cursor

`ops-session-s5-graph-promote-ui` · **HG-AUDIT-R1 pending** · 30 不可开工直至人签。
