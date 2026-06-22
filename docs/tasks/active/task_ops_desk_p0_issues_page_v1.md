# Task · Ops Desk P0-5 · Issues 列表页

> **状态**：`pending`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §13 P0-5  
> **依赖**：[`task_ops_desk_p0_github_sync_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/done/task_ops_desk_p0_github_sync_v1.md) · [`task_ops_desk_p0_ops_site_mode_v1.md`](../done/task_ops_desk_p0_ops_site_mode_v1.md) · 建议复用 P0-4 共享 BFF  
> **ISSUE_SCAN**：[`ISSUE_SCAN_kimi_code_open_c2_v1_zh.md`](../../../docs/harness/guides/ISSUE_SCAN_kimi_code_open_c2_v1_zh.md) · P0 可硬编码 C2/C3 标签

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-issues-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-ISSUES-PAGE` |
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

`/ops/kimi-code/issues`：Issue 列表 · state/label 筛选 · 分页 · ISSUE_SCAN 策略标签。

### 完成态

- [ ] 表格/列表：number · title · state · labels · updated_at · html_url
- [ ] 筛选：open/closed · label 多选
- [ ] 分页（cursor 或 offset）
- [ ] scan 标签列或 badge（C2/C3/OBSERVE 等 · 硬编码映射或 `scan_tags` 列）

---

## 范围

- [ ] `app/ops/kimi-code/issues/page.tsx`
- [ ] BFF 或 Server Component 查 `ops_issues`（复用 P0-4 共享层）

## 非范围

- scan ingest 自动化（P2）
- Issue 详情页（MVP 外链 GitHub）
- api-python 改动

---

## 验收标准

- [ ] 列表与 Supabase 数据一致
- [ ] 筛选/分页可用
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [ ] 浏览器验收通过

---

## 失败路径

| # | 触发 | 行为 |
| --- | --- | --- |
| F1 | `ops_issues` 空 | 空态 + 链至 sync 状态说明 |
| F2 | BFF/Supabase 超时或 5xx | 错误 banner · 可重试 · 不 crash layout |
| F3 | 未登录 | P0-3 middleware 302 login |

---

## 给 Cursor

`ops-desk-p0-issues-page` · Open **`ai-ink-brain/`** · 只读 · 链接 `html_url` 新开 GitHub · 与 P0-6 可同批 commit。
