> **状态**：`obsolete`（M1 已关账 · 2026-06-09）— 勿再派发执行

# PROMPT · 前端 M1 试点执行（tech-debt Epic · M01 首棒）

> **用途**：新 Agent **单独会话**粘贴 §3 全文；勿与后端 `api-modularization` 混跑。  
> **前提**：`HG-EPIC-SPEC` **approved**（2026-06-09 人签）；`HG-M1-SIGNOFF` **approved**（M03 完成后人签）。

---

## 1. Open Folder 与分支

| 项 | 值 |
|----|-----|
| Open Folder | `Projects/`（推荐）或 `ai-ink-brain/` |
| git_branch | `task/tech-debt-code-quality-frontend` |
| PR 目标（Epic 关账） | **`production`**（禁止 merge `main`） |

```bash
cd ai-ink-brain
git fetch origin
git checkout task/tech-debt-code-quality-frontend
```

---

## 2. 必读 `@` 列表

```text
@docs/harness/tasks/done/task_harness_m1_epic_orchestration_frontend_pilot_v1.md
@docs/tasks/done/task_tech_debt_code_quality_frontend_epic_v1.md
@docs/tasks/done/task_tech_debt_cq_frontend_m01_py_proxy_v1.md
@docs/tasks/specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md
@docs/harness/prompts/PROMPT_cursor_task_chain_serial_v1.md
@docs/standards/CODING_FRONTEND_L2_v1_zh.md
```

（路径：`Projects/` 为工作区 task；`ai-ink-brain/docs/...` 为前端 task。）

---

## 3. 可复制 Prompt 正文

```text
你是前端 Harness 执行 Agent（M1 试点 · 串行 Task 链）。

约束：
- 分支 task/tech-debt-code-quality-frontend；禁止在 main 上连续提交
- HG-EPIC-SPEC 已 approved；勿代签 HG-M1-SIGNOFF / HG-PRODUCTION-MERGE
- 链式常模：docs/harness/prompts/PROMPT_cursor_task_chain_serial_v1.md
- 编码读序：docs/harness/guides/GUIDANCE_frontend_task_coding_l2_v1_zh.md

目标（M1 签收子集）：
M01 → M02 → M03 串行；每棒 30→40→commit→invoke；40 pass 后自动派发下一 module task。

首棒 M01（task_tech_debt_cq_frontend_m01_py_proxy_v1.md）：
- 范围：lib/py-service-proxy.ts、lib/server/**、lib/py-service-proxy.test.ts
- 若 main 已有 F-03 实现：以 task 验收 grep + 单测 + 三门禁为准；缺口补代码
- VERIFY：pnpm lint → pnpm test → pnpm build 全绿后 commit

M02、M03：按各 task chain_next 续跑；M03 完成后回填工作区 M1 跟踪单，等人签 HG-M1-SIGNOFF。

禁止：扩 scope 到 M04～M06（M1 外）；改 ai-ink-brain-api-python；merge main。
```

---

## 4. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-09 | 人签后分支就绪；供新 Agent 单独执行 |
