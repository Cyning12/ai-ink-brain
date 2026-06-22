# Task · Ops Desk P0-6 · Pulls 列表页

> **状态**：`pending`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §13 P0-6  
> **依赖**：[`task_ops_desk_p0_github_sync_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/done/task_ops_desk_p0_github_sync_v1.md) · [`task_ops_desk_p0_ops_site_mode_v1.md`](../done/task_ops_desk_p0_ops_site_mode_v1.md) · 建议复用 P0-4 共享 BFF  
> **后继**：P0 Demo 签收 · P1 链

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-pulls-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-PULLS-PAGE` |
| **git_branch** | `task/ops-desk-p0-dashboard-pages`（批链单分支 · 见 invoke） |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |
| **audit_profile** | `full` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| **HG-TASK-DRAFT** | approved | — | 链审 R1 · 2026-06-21 |
| **HG-AUDIT-R1** | approved | — | 短链 30→CLOSE · **无中间人闸** |

---

## 背景与目标

`/ops/kimi-code/pulls`：PR 列表 · state/CI/review 状态 · 分页。

### 完成态

- [ ] 字段：number · title · state · checks_conclusion · review_decision · author · updated_at
- [ ] 筛选：open/closed/merged · CI 状态
- [ ] 分页
- [ ] 外链 GitHub PR

---

## 范围

- [ ] `app/ops/kimi-code/pulls/page.tsx`
- [ ] 查 `ops_pull_requests`（复用 P0-4 共享层）

## 非范围

- PR 详情 diff 视图
- merge 操作（公理 A1 禁止）
- api-python 改动

---

## 验收标准

- [ ] 列表与 sync 数据一致
- [ ] CI/review 状态正确展示
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [ ] P0 看板三页浏览器 Demo 可演示

---

## 失败路径

| # | 触发 | 行为 |
| --- | --- | --- |
| F1 | `ops_pull_requests` 空 | 空态 + sync 状态说明 |
| F2 | BFF/Supabase 超时或 5xx | 错误 banner · 可重试 |
| F3 | 未登录 | P0-3 middleware 302 login |

---

## 给 Cursor

`ops-desk-p0-pulls-page` · Open **`ai-ink-brain/`** · P0 看板末页 · 与 P0-5 可同批 commit · 单 PR 合并。
