# Task · Ops Desk P0-5 · Issues 列表页

> **状态**：`pending`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §6.1 · §13 P0-5  
> **依赖**：P0-2 sync · P0-3 site_mode  
> **ISSUE_SCAN**：[`ISSUE_SCAN_kimi_code_open_c2_v1_zh.md`](../../../docs/harness/guides/ISSUE_SCAN_kimi_code_open_c2_v1_zh.md) · P0 可硬编码 C2/C3 标签

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-issues-page` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-ISSUES-PAGE` |
| **git_branch** | `task/ops-desk-p0-issues-page` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

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
- [ ] BFF 或 Server Component 查 `ops_issues`

## 非范围

- scan ingest 自动化（P2）
- Issue 详情页（MVP 外链 GitHub）

---

## 验收标准

- [ ] 列表与 Supabase 数据一致
- [ ] 筛选/分页可用
- [ ] 浏览器验收通过

---

## 给 Cursor

`ops-desk-p0-issues-page` · 只读 · 链接 `html_url` 新开 GitHub。
