# Epic · 前端编码规范 tech-debt（L2 对齐 · 分模块链式执行）

> **状态**：`in_progress`（**M1 试点** · M01～M03 签收子集）  
> **epic**：`tech-debt-code-quality-frontend`  
> **M1 跟踪**：工作区 [`task_harness_m1_epic_orchestration_frontend_pilot_v1.md`](../../../docs/harness/tasks/active/task_harness_m1_epic_orchestration_frontend_pilot_v1.md) · `freeze_epic_orchestration_pilot_v1`  
> **关联 SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)（**00 帽修订真值**）  
> **关联图谱**：`docs/_tech_graph/11_flow_api.md` · `13_flow_components.md`（按需增量）  
> **后端依赖**：无  
> **规范**：[`docs/standards/CODING_FRONTEND_L2_v1_zh.md`](../../standards/CODING_FRONTEND_L2_v1_zh.md)（**active**）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-code-quality-frontend` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **freeze_id** | `CODING_FRONTEND_L2@2026-06-09` · M1：`freeze_epic_orchestration_pilot_v1` |
| **m1_pilot_scope** | **M01～M03** 串行签收 M1；M04～M06 Epic 延续 |
| **worktree** | **未使用** — 单分支 `task/tech-debt-code-quality-frontend` 串行；与后端 **不同仓** 可并行 |
| **orchestration** | `Cursor Task 链` |
| **chain_prompt** | 工作区 [`PROMPT_cursor_task_chain_serial_v1.md`](../../../docs/harness/prompts/PROMPT_cursor_task_chain_serial_v1.md) |
| **semi_auto** | `false` |
| **audit_profile** | `post_close` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | **`production`**（**禁止** merge `main`） |
| **acceptance_interaction** | `not_applicable` |
| **acceptance_interaction_note** | 工程 refactor；无新 UI 交互验收 |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-EPIC-SPEC | approved | 30-M01 | **00 帽** SPEC 已确认（2026-06-09 **人签开工**） |
| HG-M1-SIGNOFF | pending | — | M01～M03 + invoke 链完成（见工作区 M1 task） |
| HG-PRODUCTION-MERGE | pending | done | **全 Epic** M06 后 PR merge **production** 前人签 |

---

## 背景与目标

前端 L2 已 **active**（P2～P4 · R1 签收）。本 Epic 将 **历史代码** 按模块对齐 F-01～F-14 / AF-01～AF-06，**串行**执行：每模块一 task → 40 自检 + CI 门禁 → commit → 自动下一模块。

**PR 策略**：累积于 `task/tech-debt-code-quality-frontend`；关账开 PR → **`production`**（不 merge `main`）。

---

## 任务编排（Epic 主表）

| slug | module | depends_on | 开工闸门 | task 路径 |
|------|--------|------------|----------|-----------|
| M01 | py-proxy | Epic SPEC ✅ | HG-EPIC-SPEC | [`task_tech_debt_cq_frontend_m01_py_proxy_v1.md`](task_tech_debt_cq_frontend_m01_py_proxy_v1.md) |
| M02 | bff-routes | M01 | 上一模块 40 pass | [`task_tech_debt_cq_frontend_m02_bff_routes_v1.md`](task_tech_debt_cq_frontend_m02_bff_routes_v1.md) |
| M03 | unified-chat | M02 | 上一模块 40 pass | [`task_tech_debt_cq_frontend_m03_unified_chat_v1.md`](task_tech_debt_cq_frontend_m03_unified_chat_v1.md) |
| M04 | chat-rag | M03 | 上一模块 40 pass | [`task_tech_debt_cq_frontend_m04_chat_rag_v1.md`](task_tech_debt_cq_frontend_m04_chat_rag_v1.md) |
| M05 | auth-env | M04 | 上一模块 40 pass | [`task_tech_debt_cq_frontend_m05_auth_env_v1.md`](task_tech_debt_cq_frontend_m05_auth_env_v1.md) |
| M06 | components-misc | M05 | 上一模块 40 pass | [`task_tech_debt_cq_frontend_m06_components_misc_v1.md`](task_tech_debt_cq_frontend_m06_components_misc_v1.md) |

### 编排入口（00）

- **entry_invoke**：`docs/harness/invokes/by-task/tech-debt-code-quality-frontend/invoke_*_00_orchestrator.md`
- **hat_truth**：工作区 `docs/harness/prompts/TEMPLATE-orchestrator-invoke.md` §3
- **orchestrator**：工作区 `docs/harness/prompts/00-orchestrator.md`
- **SPEC 真值**：[`SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)

---

## 范围

- [ ] 00 确认/修订 SPEC 模块表并 commit
- [x] **M1**：M01～M03 串行 + invoke 链（见工作区 M1 task）
- [ ] **Epic 全量**：M04～M06（可在 M1 签收后继续）
- [ ] 每模块：L2 对齐 + 自检 + CI 三门禁
- [ ] Epic 关账 PR → `production` + Required checks 绿

## 非范围

- 后端 `api-python` 代码
- 全仓一次性无边界美化
- merge 至 `main`
- 新业务能力 / API 契约变更（须另开业务 task）

---

## 依赖与引用

| 依赖项 | 路径 |
|--------|------|
| L2 | [`docs/standards/CODING_FRONTEND_L2_v1_zh.md`](../../standards/CODING_FRONTEND_L2_v1_zh.md) |
| L1 | 工作区 [`CODING_BASELINE_L1`](../../../docs/standards/CODING_BASELINE_L1_v1_zh.md) |
| Harness §5.9 | 工作区 [`HARNESS_V2_PLAN`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.9 |
| CI | `.github/workflows/quality.yml` |
| PROJECT_CONFIG | [`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`](../../meta/PROJECT_CONFIG_AI_INK_BRAIN.md) |

---

## 验收标准（Epic）

- [ ] SPEC 状态 `active` 或 Epic 关账时注明修订版本
- [ ] M01～M06（或修订后全集）均为 `done` 且已 `git mv` 至 `docs/tasks/done/`
- [ ] PR **`production` ← `task/tech-debt-code-quality-frontend`** 已开；`lint-and-build` 绿
- [ ] **未** merge 至 `main`
- [ ] `HG-PRODUCTION-MERGE` 人签

---

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | 某模块 lint/test/build 失败 | 停链；仅输出失败命令与文件 | 是 | — |
| F2 | 模块 scope 蔓延 | 30 拒扩 scope；建议 discovery 子 task | 否 | — |

---

## 链式续跑（给执行 Agent）

1. **00**：读 Epic + SPEC → 修订 SPEC（若需）→ `HG-EPIC-SPEC` 人签 → 派发 **M01** Task 链。
2. **每模块结束**：40 填 `### 自检结论` → commit → invoke 落盘 → **同链**派发下一 module task（勿等用户重贴模板）。
3. **全模块完成**：开 PR to `production` → 等人签 `HG-PRODUCTION-MERGE` → merge。

---

## ### KPI（00）

（关账由 `kpi_aggregator` 填写）

---

## 给 Cursor / 前端 Agent

- Open Folder：`Projects/`（或 `ai-ink-brain/` + `@` 工作区 harness）
- **分支**：`task/tech-debt-code-quality-frontend`（已从 `main` 检出；单 checkout 串行，无 worktree）
- **派发入口**：[`PROMPT_AGENT_START_M1_v1_zh.md`](PROMPT_AGENT_START_M1_v1_zh.md)
- M1 试点：M01→M02→M03 链式；`main` 上或已有部分实现 → **40 自检 + invoke 落盘** 优先，缺口再补代码
- 关键词：`tech-debt`、`code_quality_bar: strict`、`production`、`M01`、`SPEC-tech_debt`、`F-03`、`pnpm lint`

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-09 | M1 试点 scope；`HG-EPIC-SPEC` 人签开工；任务分支就绪 |
