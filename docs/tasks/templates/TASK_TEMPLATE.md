# 前端 Task：<动词 + 范围>

> **落盘**：新建任务文件请放在 `docs/tasks/active/`（验收通过后 `git mv` 至 `docs/tasks/done/`，见同目录 `README.md`）。  
> **状态**：draft / pending / in_progress / done  
> **关联图谱**：`docs/_tech_graph/xx_flow_xxx.md`  
> **关联 Issue/PR**：#xxx  
> **后端依赖**：`<后端任务文件名>`（如需要后端 API 支持，否则填 "无"）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `<kebab-case>` |
| **test_strategy** | `required` \| `recommended` \| `not_applicable`（`not_applicable` 须一行理由） |
| **freeze_id** | `<SCOPE>@YYYY-MM-DD` 或 commit |
| **orchestration** | `Cursor Task 链`（前端默认）/ `MANIFEST 仅` |
| **chain_prompt** | 工作区 `docs/harness/prompts/PROMPT_cursor_task_chain_serial_v1.md`（或已填占位符实例） |
| **semi_auto** | **`deprecated`** — 新 task 填 `false`；禁止 `true` 作总闸 |
| **audit_profile** | `full` \| `light` \| `post_close` |
| **experience_capture** | `required` \| `recommended` \| `not_applicable` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE`（默认）\| `00` \| `50` \| `human` |
| **git_branch** | `task/<slug>`（可选） |
| **acceptance_interaction** | `required`（须人在浏览器/Preview 验收）\| `not_applicable`（须一行 `acceptance_interaction_note`） |
| **验收清单** | `docs/tasks/reinspect_results/CHECKLIST_<task_basename>_acceptance_zh.md`（`required` 时 **关账前必有**；模板见 [`CHECKLIST_TEMPLATE_acceptance_zh.md`](CHECKLIST_TEMPLATE_acceptance_zh.md)） |

- **KPI 真值**：工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md) · [`HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.8  
- **交互验收清单规约**：[`specs/SPEC-harness_acceptance_checklist_v1_zh.md`](../specs/SPEC-harness_acceptance_checklist_v1_zh.md) · Skill `.cursor/skills/harness-close-acceptance-checklist/SKILL.md`  
- **prompts**：`@` 工作区 `Projects/docs/harness/prompts/`（**勿**复制到本仓）  
- **关账前**：正文须有 **`### KPI（00）`**（节名保留；由 `kpi_aggregator` 填写）  
- **前端迁移说明**：[`PLAN_frontend_harness_kpi_migration_v1_zh.md`](../../../docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md)

### 人工闸 `human_gate`（涉契约 / 跨仓时建议）

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | pending | 22-R1,30 | 草案人扫 |
| HG-AUDIT-R1 | pending | 30 | 22 R1 后 |
| HG-REINSPECT | pending | done | 50 后 merge 前 |

---

## 背景与目标

<短段落，描述完成态行为。>

---

## 范围

- [ ] <具体事项 1>
- [ ] <具体事项 2>

## 非范围

- <明确排除的事项，减少越界>

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| BFF API | `app/api/py/xxx/route.ts` |
| Python API | `POST /api/py/xxx`（后端提供）|
| 图谱文件 | `docs/_tech_graph/xx_xxx.md` |

---

## 验收标准

- [ ] <验收项 1>
- [ ] <验收项 2>
- [ ] <验收项 3>

---

## 失败路径（建议）

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | | | | |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `<文件列表>` |
| 新增路由 | `app/xxx/page.tsx` |
| 新增组件 | `components/xxx/Xxx.tsx` |
| 图谱变更点 | `<_tech_graph/ 中更新的文件>` |

---

## ### KPI（00）

> **由 `kpi_aggregator` 填写**（默认 CLOSE）；格式见工作区 `KPI_RUBRIC_v1_2.md`。

（占位 · 关账后删除）

---

## ### 自检结论（执行者）

（40 帽回填）
