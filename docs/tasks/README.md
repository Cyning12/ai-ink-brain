# docs/tasks/ 使用规则（v1）

> 目标：与后端 `ai-ink-brain-api-python/docs/tasks/` **同一分类**：`active/`（进行中）、`done/`（归档）、索引视图 `_views/`，避免根目录长期堆积与状态误判。

---

## 工作区 Harness 任务（不在本目录）

与 **跨子仓流程 / CI 门禁对齐 / 帽子 prompts / 根级验收** 相关的任务单已统一放在工作区：

- **`docs/harness/tasks/active/`**、**`docs/harness/tasks/done/`**  
- 规则与索引：工作区根下 **`docs/harness/tasks/README.md`**（与 `ai-ink-brain/` 同级的 **`Projects/`** 聚合仓；仅克隆本仓时无此路径，请以团队入口或根 `AGENTS.md` §8 为准）

本目录 **`docs/tasks/`** 仅承载 **前端业务** 任务；勿再将 Harness 类任务长期放在此处，以免与 `AGENTS.md` §2.2 漂移。

---

## Harness / KPI v1.2（2026-05-31 · P0）

| 项 | 路径 |
|----|------|
| 模板 | [`templates/TASK_TEMPLATE.md`](templates/TASK_TEMPLATE.md) |
| Harness 索引 | [`../harness/README.md`](../harness/README.md) |
| KPI 细则 | 工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md) |
| 字段政策 | 工作区 [`docs/harness/HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.8 |
| 迁移方案 | 工作区 [`docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md`](../../../docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md) |
| 链式常模 | 工作区 [`GUIDANCE_epic_orchestration_task_chain_v1_zh.md`](../../../docs/harness/guides/GUIDANCE_epic_orchestration_task_chain_v1_zh.md) · [`PROMPT_cursor_task_chain_serial_v1.md`](../../../docs/harness/prompts/PROMPT_cursor_task_chain_serial_v1.md)（`semi_auto` deprecated） |
| **编码规范 L2** | [`../standards/CODING_FRONTEND_L2_v1_zh.md`](../standards/CODING_FRONTEND_L2_v1_zh.md) · L1 工作区 [`CODING_BASELINE_L1`](../../../docs/standards/CODING_BASELINE_L1_v1_zh.md) |
| **写 task · 编码读序** | 通用 [`GUIDANCE_task_coding_standards_v1_zh.md`](../../../docs/harness/guides/GUIDANCE_task_coding_standards_v1_zh.md) · 前端切片 [`GUIDANCE_frontend_task_coding_l2_v1_zh.md`](../../../docs/harness/guides/GUIDANCE_frontend_task_coding_l2_v1_zh.md) · 模板 [`TASK_TEMPLATE.md`](templates/TASK_TEMPLATE.md) |
| **M1 编排试点（done）** | 工作区 [`task_harness_m1_epic_orchestration_frontend_pilot_v1.md`](../../../docs/harness/tasks/done/task_harness_m1_epic_orchestration_frontend_pilot_v1.md) · Epic [`done/task_tech_debt_code_quality_frontend_epic_v1.md`](done/task_tech_debt_code_quality_frontend_epic_v1.md)（M01～M06 · PR #64/#65） |
| **P1 进行中** | [`active/task_p1_tech_graph_api_flow_and_task_hygiene_v1.md`](active/task_p1_tech_graph_api_flow_and_task_hygiene_v1.md) · 分支 `task/p1-tech-graph-flow-and-task-hygiene-v1` |

- **新建** `task_*.md`：文首 **Harness 元信息** + 关账前 **`### KPI（00）`**；默认 **`kpi_aggregator: CLOSE`**。  
- **前端交互验收**（Preview/浏览器/录屏/五问等）：`acceptance_interaction: required` → 关账前 **必有** [`CHECKLIST_*_acceptance_zh.md`](reinspect_results/)（规约 [`specs/SPEC-harness_acceptance_checklist_v1_zh.md`](specs/SPEC-harness_acceptance_checklist_v1_zh.md)）。  
- **50**：`reinspect_results/reinspect_<slug>_YYYYMMDD_vN.md`（Fresh Context）。  
- **5-3 试点（done）**：[`done/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md`](done/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md) — 2026-06-01 关账。

---

## 目录结构

```
docs/tasks/
  README.md                # 本文件：落盘与归档规则
  _views/                  # 状态视图索引（聚合链接）
  active/                  # 设计中 / 待开始 / 进行中（task_*.md）
  done/                    # 已完成（归档目录）
  specs/                   # 规格文档（SPEC-*.md）；可被多个 task 引用
  templates/               # 任务模板（TASK_TEMPLATE.md）
  legacy/                  # 历史命名 / 缺少状态 / 待补齐字段
  review_results/          # 审查帽输出归档（见该目录 README）；可交需求帽回填 SPEC/task
  reinspect_results/       # 独立复检帽输出归档（见该目录 README）；必要时交需求帽回填
```

### 审查与复检产出（非 task 单）

- **`review_results/`**：规格/任务 **审查帽** 结论归档；详见 [`review_results/README.md`](review_results/README.md)。  
- **`reinspect_results/`**：**独立复检帽** 结论归档；详见 [`reinspect_results/README.md`](reinspect_results/README.md)。  

二者均可将「回填清单」交给工作区 **需求帽**（工作区根 **`docs/harness/prompts/10-requirements.md`**；同上，仅 `Projects/` 聚合布局下存在）以更新本仓或后端仓的 task / SPEC（按清单内路径执行）。

### `specs/` 与 `legacy/` 的边界

与后端 `ai-ink-brain-api-python/docs/tasks/README.md` **对齐**：

- **`specs/`**：只放规格（`SPEC-*.md`），可被多个 task 引用。
- **`legacy/`**：只放历史遗留（命名不规范 / 缺少状态 / 待补齐字段）；整理应通过独立 task 执行，避免一次性大改造成漂移。

---

## 新增任务如何落盘（必须遵守）

- **新建位置**：一律放在 `docs/tasks/active/`
- **命名规则**：`task_<domain>_<topic>_vN.md`（与历史任务风格一致）
- **必须字段**：任务头部必须包含 `> **状态**：...`（或等价一行状态说明）
- **Harness（2026-05-31 起）**：新建 `task_*.md` 须含 **Harness 元信息** 表（`test_strategy`、`kpi_rubric`、`kpi_aggregator` 等）与关账前 **`### KPI（00）`**；模板见 [`templates/TASK_TEMPLATE.md`](templates/TASK_TEMPLATE.md)。真值：工作区 [`docs/harness/HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.8、[`KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md)。
- **wiki_delta（2026-07-28 · `@cyning/harness@2.19.0`）**：元信息必填 `wiki_delta` / `wiki_delta_note`；**缺字段 close BLOCK**。本仓 preset `harness-only`、未启用 `docs/coding_wiki` → 默认 `wiki_delta: n/a` + note。钉见仓根 [`harness.pin.json`](../../harness.pin.json)。勿默认 `--allow-wiki-gap`。

允许状态集合：

- `draft` / `design`
- `pending`
- `in_progress`
- `implemented`（代码已合并，**验收勾选**仍可能未完成）
- `done` 或 `done（YYYY-MM-DD 验收通过）`

---

## 任务归档流程（验收后必做）

当任务验收通过（正文「验收标准」已勾选完成或已书面签核）：

1. 将头部 `状态` 改为 `done（YYYY-MM-DD 验收通过）`。
2. 在仓库根执行：  
   `git mv docs/tasks/active/<文件名>.md docs/tasks/done/`
3. 在 `docs/tasks/_views/done.md` 追加指向 `../done/<文件名>.md` 的条目。
4. 若该任务出现在 `docs/tasks/_views/in_progress.md`，同步移除或更新。
5. **配对后端任务**（若正文引用 `ai-ink-brain-api-python/docs/tasks/...`）：在后端仓按该仓 `docs/tasks/README.md` 将对应任务归档至 `docs/tasks/done/` 并更新其 `_views/done.md`。

> **`docs/spec/`、`docs/_tech_graph/`** 等规格与图谱**不因任务归档而搬迁**，持续在各自目录维护。

---

## 视图索引维护规则（最小集）

- `docs/tasks/_views/design.md`：`draft` / 缺状态字段清单
- `docs/tasks/_views/in_progress.md`：`in_progress` / 关键 `implemented` 待验收项（按需）
- `docs/tasks/_views/done.md`：已完成任务链接

---

## 常见坑（避免）

- 不要把已完成任务留在 `active/`（会误导 Agent 判断「仍在进行」）
- 不要把 `README.md`、`templates/`、`_views/`、`review_results/`、`reinspect_results/` 下的说明当作可发布博客正文（站点扫描已排除这些路径/文件名，见 `lib/content/mdx-posts.ts`）
