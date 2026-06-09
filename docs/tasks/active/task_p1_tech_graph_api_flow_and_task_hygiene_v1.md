# P1：11_flow_api 图谱对齐 + task 文档卫生

> **状态**：in_progress  
> **关联图谱**：`docs/_tech_graph/11_flow_api.md` · `11_flow_api.ai.md`  
> **关联 Issue/PR**：（本分支 `task/p1-tech-graph-flow-and-task-hygiene-v1`）  
> **后端依赖**：无

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `p1-tech-graph-api-flow-and-task-hygiene-v1` |
| **test_strategy** | `not_applicable` |
| **test_strategy_note** | 文档与图谱增量；无业务逻辑变更 |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **audit_profile** | `light` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/p1-tech-graph-flow-and-task-hygiene-v1` |
| **acceptance_interaction** | `not_applicable` |
| **acceptance_interaction_note** | 纯文档/图谱 |

---

## 背景与目标

tech-debt M01–M06 已将 BFF 转发收敛至 `lib/py-service-proxy` 与 `forward-py-rag-chat`，但 **11_flow_api 双轨未增量**，且 `docs/tasks/active/` 积压 17 份已落地 task。本 task 完成 P1：**图谱与文档卫生**，为后续业务 task 清场。

---

## 范围

- [x] `11_flow_api` / `.ai.md` 增加 **PROXY** 子图（PSP · FRAG）与边标记
- [x] `02_version.md` 记录 P1 增量
- [x] `pnpm tech-graph:graph-export` + `equivalence-check` 绿
- [x] `active/` 积压 task → `done/` 或 `legacy/`（契约类）
- [x] 复盘文稿迁入 `docs/tasks/specs/RETRO-tech_debt_frontend_before_after_v1_zh.md`
- [x] 更新 `_views/done.md` / `in_progress.md` 索引
- [ ] PR 合并后确认 `production` 已与 `main` 同步（2026-06-09 已 push production=main）

## 非范围

- M2 Harness Starter（工作区 P0 · 项目 Agent）
- 新业务功能 / BFF 路由变更
- `content/tasks/`

---

## 依赖与引用

| 依赖项 | 路径 |
|--------|------|
| 编码规范 L1 | 工作区 `docs/standards/CODING_BASELINE_L1_v1_zh.md` |
| 编码规范 L2 | `docs/standards/CODING_FRONTEND_L2_v1_zh.md` |
| 写 task 读序 | 工作区 `GUIDANCE_task_coding_standards_v1_zh.md` |
| Epic 关账 | `docs/tasks/done/task_tech_debt_code_quality_frontend_epic_v1.md` |
| MVP P1 缺口 | 工作区 `MVP_PROGRESS_AND_ROADMAP_v1_zh.md` §5 |

---

## 给执行帽的必读列表

- `AGENTS.md`
- `docs/_tech_graph/11_flow_api.ai.md`
- `docs/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`

---

## 验收标准

- [x] PROXY 节点与 tech-debt 实现一致（Route → PSP/FRAG → Python）
- [x] `graph.json` 已导出且 equivalence-check 通过
- [x] `docs/tasks/active/` 仅余本 task
- [ ] `_views` 索引与目录一致

---

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | equivalence-check 失败 | 拒 merge；修 `.ai.md` / `.md` | 是 | CI 红 |

---

### 自检结论（执行者）

- `pnpm tech-graph:graph-export` · `pnpm tech-graph:equivalence-check`：通过（2026-06-09）
- `active/` 归档 15 → `done/` · 2 → `legacy/`

---

### KPI（00）

（关账前由 CLOSE 填写）
