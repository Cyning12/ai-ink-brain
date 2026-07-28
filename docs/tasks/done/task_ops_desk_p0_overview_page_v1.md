# Task · Ops Desk P0-4 · 总览页

> **状态**：`done（2026-06-22 验收通过）`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §6.2 · §13 P0-4  
> **依赖**：[`task_ops_desk_p0_github_sync_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/done/task_ops_desk_p0_github_sync_v1.md) · [`task_ops_desk_p0_ops_site_mode_v1.md`](../done/task_ops_desk_p0_ops_site_mode_v1.md)  
> **后继**：P0-4 **merge 后** P0-5 ∥ P0-6 双 worktree 并行（见 §派工模式）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-overview-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-OVERVIEW-PAGE` |
| **git_branch** | `task/ops-desk-p0-overview-page` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |
| **dispatch_phase** | **Phase 1**（必须先 merge · 阻塞 Phase 2） |
| **audit_profile** | `full` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| **HG-TASK-DRAFT** | approved | — | 链审 R1 · 2026-06-21 |
| **HG-AUDIT-R1** | approved | — | 短链 30→CLOSE · **无中间人闸** |

---

## 背景与目标

`/ops/kimi-code` 总览：3 核心指标 + 30 天趋势 + **数据截至** + sync 状态。

### 完成态

- [x] PR Cycle Time · PR Review Time · Issue Throughput 展示
- [x] 30 天趋势图（图表库与现有 Ink 栈一致）
- [x] 最近一次 `ops_sync_runs` 时间与 status
- [x] P0 可先 BFF 直查 Supabase 或临时 SQL；P1-1 再抽 metrics API

---

## 范围

- [x] `app/ops/kimi-code/page.tsx`
- [x] 共享数据层（建议 `lib/ops/` 或 BFF route · 供 P0-5/6 复用）
- [x] 加载/空态/sync 失败态
- [x] 响应式布局 · Ops layout 内

## 非范围

- ISSUE_SCAN 版本 badge（P2 · 可先占位）
- Chat · graph Tab
- api-python 新路由（P1 metrics API）

---

## 验收标准

- [x] sync 有数据时 3 指标非空（当前基线：issue≈310 · pr≈642）
- [x] 显示数据截至时间（`ops_sync_runs.cursor` 或 `finished_at`）
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [x] 浏览器人工验收通过

---

## 失败路径

| # | 触发 | 行为 |
| --- | --- | --- |
| F1 | Supabase 无数据 / sync 未跑 | 空态 UI + 提示「等待同步」· 非 500 白屏 |
| F2 | sync_run `failed` / BFF 超时 | 展示 sync 状态 badge + 错误摘要 · 指标区降级占位 |
| F3 | 未登录 / 无 ops cookie | 沿用 P0-3 middleware · 302 login |

---

## 派工模式（00 · Phase 1）

| 项 | 值 |
| --- | --- |
| **invoke** | [`PROMPT_CHAIN_30_40_50_CLOSE_batch_v1.md`](../../../docs/harness/invokes/by-task/ops-desk-p0-dashboard-pages/PROMPT_CHAIN_30_40_50_CLOSE_batch_v1.md) §Phase 1 |
| **并行** | **否** · 单 Agent · 本 task 单独 PR merge 后 Phase 2 才启动 |
| **共享层** | 须落 `lib/ops/*` 或 BFF · 供 P0-5/6 只读复用 |
| **终态 checklist** | 三 PR 全 merge 后 [`CHECKLIST_ops_desk_p0_dashboard_pages_human_v1_zh.md`](../../../docs/harness/reviews/CHECKLIST_ops_desk_p0_dashboard_pages_human_v1_zh.md) |

---

## 给 Cursor

`ops-desk-p0-overview-page` · Open **`ai-ink-brain/`** · 指标定义见 SPEC §6.2 · **Phase 1 必须先 merge**。

---

## CLOSE 记录

- **PR**：https://github.com/Cyning12/ai-ink-brain/pull/79
- **merge SHA**：`fb9fc379df40370a78491579377a0abac8cdb97c`
- **50 review**：[`docs/harness/reviews/task_ops_desk_p0_overview_page_v1_reinspect_R1_20260622.md`](../../harness/reviews/task_ops_desk_p0_overview_page_v1_reinspect_R1_20260622.md)
- **下一棒**：Phase 2 · P0-5 ∥ P0-6 worktree 并行
