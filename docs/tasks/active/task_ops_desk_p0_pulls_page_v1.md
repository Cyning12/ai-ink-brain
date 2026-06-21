# Task · Ops Desk P0-6 · Pulls 列表页

> **状态**：`pending`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §13 P0-6  
> **依赖**：P0-2 sync · P0-3 site_mode  
> **后继**：P0 Demo 签收 · P1 链

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-pulls-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-PULLS-PAGE` |
| **git_branch** | `task/ops-desk-p0-pulls-page` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

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
- [ ] 查 `ops_pull_requests`

## 非范围

- PR 详情 diff 视图
- merge 操作（公理 A1 禁止）

---

## 验收标准

- [ ] 列表与 sync 数据一致
- [ ] CI/review 状态正确展示
- [ ] P0 六页链浏览器 Demo 可演示

---

## 给 Cursor

`ops-desk-p0-pulls-page` · P0 链末棒 · 与 overview/issues 可同 PR 分批合并。
