# Task · Ops Desk P0-4 · 总览页

> **状态**：`pending`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §6.2 · §13 P0-4  
> **依赖**：[`task_ops_desk_p0_github_sync_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/active/task_ops_desk_p0_github_sync_v1.md) · [`task_ops_desk_p0_ops_site_mode_v1.md`](task_ops_desk_p0_ops_site_mode_v1.md)  
> **后继**：issues/pulls 页可并行

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-overview-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-OVERVIEW-PAGE` |
| **git_branch** | `task/ops-desk-p0-overview-page` |
| **worktree_root** | `ai-ink-brain/` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

---

## 背景与目标

`/ops/kimi-code` 总览：3 核心指标 + 30 天趋势 + **数据截至** + sync 状态。

### 完成态

- [ ] PR Cycle Time · PR Review Time · Issue Throughput 展示
- [ ] 30 天趋势图（图表库与现有 Ink 栈一致）
- [ ] 最近一次 `ops_sync_runs` 时间与 status
- [ ] P0 可先 BFF 直查 Supabase 或临时 SQL；P1-1 再抽 metrics API

---

## 范围

- [ ] `app/ops/kimi-code/page.tsx`
- [ ] 加载/空态/sync 失败态
- [ ] 响应式布局 · Ops layout 内

## 非范围

- ISSUE_SCAN 版本 badge（P2 · 可先占位）
- Chat · graph Tab

---

## 验收标准

- [ ] sync 有数据时 3 指标非空
- [ ] 显示数据截至时间
- [ ] 浏览器人工验收通过

---

## 给 Cursor

`ops-desk-p0-overview-page` · 指标定义见 SPEC §6.2。
