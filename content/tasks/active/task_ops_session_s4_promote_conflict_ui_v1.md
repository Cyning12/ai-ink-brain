# Task · Ops Session S4.2 Promote Conflict UI（overwrite/merge 预览 · 二次确认）

> **状态**：`draft` · 00 统筹起草 · 2026-07-03  
> **epic**：Session Orchestrator · S4.2 `ops-session-s4-promote-conflict`  
> **schedule_ref**：SPEC §5.3 · §9.3 · BLOCKERS B4 · PLAN §9 D2  
> **关联 SPEC**：[`SPEC_ops_session_orchestrator_v1_zh.md`](../../docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md) §5.3 · §9.3  
> **配对后端**：[`task_ops_session_s4_promote_conflict_api_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/active/task_ops_session_s4_promote_conflict_api_v1.md)  
> **前置**：后端 S4.2 task 或 API 契约冻结  
> **人拍板**：D2 = **都做** · block + overwrite + merge/diff 预览（PLAN §9）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-session-s4-promote-conflict-ui` |
| **module_id** | `OPS-SESSION-ORCH` |
| **freeze_id** | `OPS-SESSION-ORCH-SPEC-V1` |
| **test_strategy** | `recommended` |
| **worktree_root** | `ai-ink-brain/` |
| **git_branch** | `task/ops-session-s4-promote-conflict-ui` |
| **blocked_by** | 后端 `ops-session-s4-promote-conflict-api` |
| **blocks** | S5 promote 运营闭环 |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | `approved` | 20-task-audit, 30 | 人签 · 2026-07-03 · 派工执行 |
| HG-AUDIT-R1 | `approved` | 30 | 人签 · 2026-07-03 · 20-task-audit 关注点由 30/50 复核 |

---

## 背景与目标

S4 UI 已实现 promote 向导与 verify 报告展示。S4.2 在后端增加 overwrite/merge 冲突处理，UI 需同步提供：diff 预览、冲突策略选择（block/overwrite/merge）、overwrite 二次确认、merge 草稿预览与人签 `HG-PROMOTE-OVERWRITE`。

**完成态一句话**：promote 冲突时 UI 展示 diff 与策略选择，overwrite/merge 均须 maintainer 显式二次确认，merge 须预览合并版并人签。

---

## 范围

- [x] Promote 面板增加冲突策略选择：`block`（默认）· `overwrite` · `merge`
- [x] diff 摘要展示（源/目标字段/行级差异）
- [x] overwrite 二次确认对话框
- [x] merge 草稿预览区 +「确认合并版」按钮 + `HG-PROMOTE-OVERWRITE` 闸展示
- [x] BFF 转发 `conflict_action` 参数
- [x] `HG-PROMOTE-OVERWRITE` pending 且选择 overwrite/merge 时显示「授权 overwrite/merge」按钮，调用 `POST /api/ops/sessions/{id}/auth`
- [x] Vitest：冲突策略切换、二次确认、merge 预览 mock
- [x] S4 UI 路径不退化

---

## 非范围

- 不处理 graph_delta merge UI（S5.2）
- 不新增 auto-commit / auto-PR
- 不修改后端 conflict 逻辑

---

## 失败路径

| # | Scenario ID | 触发 | 行为 | 可重试 |
| --- | --- | --- | --- | --- |
| F1 | fp-ui-overwrite-unconfirmed | 用户未二次确认 overwrite | 禁用确认按钮 | 是 |
| F2 | fp-ui-merge-preview-failed | 后端 merge 草稿生成失败 | inline 错误 | 否 |
| F3 | fp-ui-gate-pending | `HG-PROMOTE-OVERWRITE` 未签 | 提示人签路径 | 是（人签后） |

---

## 验收标准

- [x] 冲突时展示 diff 摘要
- [x] 策略切换后请求体正确
- [x] overwrite 二次确认生效
- [x] merge 预览可展示并可确认
- [x] overwrite/merge 策略下 `HG-PROMOTE-OVERWRITE` 授权按钮可见并可调用
- [x] S4 UI 不退化
- [x] `pnpm lint` / `test` / `build` 绿

---

### 自检结论（执行者，30 回填）

| 项 | 结果 |
| --- | --- |
| **日期** | 2026-07-03 |
| **分支** | `task/ops-session-s4-promote-conflict-ui` |

```text
pnpm lint  → 0 errors, 4 pre-existing warnings
pnpm test  → 173 passed (37 files)
pnpm build → success
pnpm tech-graph:check → success
```

---

## 给 Cursor

`ops-session-s4-promote-conflict-ui` · **HG-AUDIT-R1 pending** · 30 不可开工直至人签。
