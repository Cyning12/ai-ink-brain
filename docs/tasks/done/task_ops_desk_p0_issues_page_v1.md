# Task · Ops Desk P0-5 · Issues 列表页

> **状态**：`done（2026-06-22 验收通过）`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §13 P0-5  
> **依赖**：P0-2 sync · P0-3 site_mode · **[`task_ops_desk_p0_overview_page_v1.md`](task_ops_desk_p0_overview_page_v1.md) 已 merge main**（Phase 2 卡点）  
> **ISSUE_SCAN**：[`ISSUE_SCAN_kimi_code_open_c2_v1_zh.md`](../../../docs/harness/guides/ISSUE_SCAN_kimi_code_open_c2_v1_zh.md) · P0 可硬编码 C2/C3 标签

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-issues-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-ISSUES-PAGE` |
| **git_branch** | `task/ops-desk-p0-issues-page` |
| **worktree_root** | `ai-ink-brain-wt-issues-page/` |
| **Open Folder** | `ai-ink-brain-wt-issues-page/` |
| **dispatch_phase** | **Phase 2A** · 与 P0-6 **并行** · **P0-4 merge 后** |
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

`/ops/kimi-code/issues`：Issue 列表 · state/label 筛选 · 分页 · ISSUE_SCAN 策略标签。

### 完成态

- [x] 表格/列表：number · title · state · labels · updated_at · html_url
- [x] 筛选：open/closed · label 多选
- [x] 分页（cursor 或 offset）
- [x] scan 标签列或 badge（C2/C3/OBSERVE 等 · 硬编码映射或 `scan_tags` 列）

---

## 范围

- [x] `app/ops/kimi-code/issues/page.tsx`
- [x] BFF 或 Server Component 查 `ops_issues`（复用 P0-4 共享层）

## 非范围

- scan ingest 自动化（P2）
- Issue 详情页（MVP 外链 GitHub）
- api-python 改动

---

## 验收标准

- [x] 列表与 Supabase 数据一致
- [x] 筛选/分页可用
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [x] 浏览器验收通过

---

## 失败路径

| # | 触发 | 行为 |
| --- | --- | --- |
| F1 | `ops_issues` 空 | 空态 + 链至 sync 状态说明 |
| F2 | BFF/Supabase 超时或 5xx | 错误 banner · 可重试 · 不 crash layout |
| F3 | 未登录 | P0-3 middleware 302 login |

---

## 派工模式（00 · Phase 2A）

| 项 | 值 |
| --- | --- |
| **invoke** | [`PROMPT_PHASE2_PARALLEL_v1.md`](../../../docs/harness/invokes/by-task/ops-desk-p0-dashboard-pages/PROMPT_PHASE2_PARALLEL_v1.md) §调用体 A |
| **worktree** | `git worktree add ../ai-ink-brain-wt-issues-page -b task/ops-desk-p0-issues-page origin/main` |
| **并行** | 与 P0-6 **同时** · 各独立 Agent / 会话 |
| **merge 顺序** | 建议先于 P0-6（若 layout 冲突） |
| **checklist** | 勿单页签收 · 等 P0-4+5+6 全 merge 后填人类 checklist |

---

## 给 Cursor

`ops-desk-p0-issues-page` · Open **`ai-ink-brain-wt-issues-page/`** · 只读 · 链接 `html_url` 新开 GitHub。

---

## CLOSE 记录

- **PR**：待创建
- **merge SHA**：待创建
- **50 review**：[`docs/harness/reviews/task_ops_desk_p0_issues_page_v1_reinspect_R1_20260622.md`](../../harness/reviews/task_ops_desk_p0_issues_page_v1_reinspect_R1_20260622.md)
- **下一棒**：P0-6 Pulls 页 merge 后统一填人类 checklist
