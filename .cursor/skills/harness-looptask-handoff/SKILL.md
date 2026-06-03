---
name: harness-looptask-handoff
description: >-
  Ink Harness LoopTask 止于 50 后，向维护者交付可复制的 50 Prompt、签收文档路径清单，
  以及须人工修改的「文件 + 表格/字段 + 改前值→改后值」。在 LoopTask stop_after_hat:50、
  CLOSE、HG-REINSPECT、索要 50 Prompt/签收文档、或 Portfolio W5–W6 关账交接时使用。
  若须前端交互验收，关账前须有 CHECKLIST（见 harness-close-acceptance-checklist Skill）。
  配对后端便携真值：ai-ink-brain-api-python/docs/tasks/skills/SKILL-harness-looptask-handoff.md
---

# Harness LoopTask 交接（Ink · 止于 50）

## 何时启用

- task 文首 `harness_mode: looptask` 且 `stop_after_hat: 50`
- 50 已落盘 `content/tasks/reinspect_results/` 或维护者索要 **50 Prompt / 签收文档**
- **CLOSE** 关账前（`kpi_aggregator: CLOSE`）

## Agent 必须交付的三件事

### 1. 50 Prompt（占位符须全部替换）

- **规范真值**：`content/tasks/specs/PROMPT_50_invoke_<task>_<variant>_zh.md`（若已链出）
- **快照**：`content/harness/invokes/by-task/<task_slug>/invoke_YYYYMMDD_50_<task_slug>.md`
- 对话中给出 **§4 Handoff + §5 子 Agent 正文** 合并后的 **单一 `text` 围栏**，可直接新开对话或 `Task` 工具粘贴
- **禁止**只写「见 PROMPT_50」而不贴全文（除非用户只要路径）

### 2. 签收文档路径清单（按帽序）

| 帽 | 典型路径（相对 `ai-ink-brain/`） |
|----|----------------------------------|
| 22 R1 | `content/harness/reviews/task_<slug>_audit_R1_YYYYMMDD.md` |
| 22 R2 | `content/harness/reviews/task_<slug>_audit_R2_YYYYMMDD.md` |
| 40 | task 内 **`### 自检结论（执行者）`** |
| 50 | `content/tasks/reinspect_results/task_<slug>_reinspect_YYYYMMDD.md` |
| invoke 链 | `content/harness/invokes/by-task/<task_slug>/invoke_*` |

每条须 **可点击的仓库相对路径**；若文件不存在，写 **「未落盘 · 阻塞」** 而非省略。

### 3. 人工改动：文件 + 位置 + 改什么（禁止笼统）

**禁止**只说「需要人签闸」「请改 gate」。

**必须**用下表格式（可复制）：

| 步骤 | 文件（相对 `ai-ink-brain/`） | 位置 | 改什么 |
|------|------------------------------|------|--------|
| … | … | … | … |

**禁止 Agent**：将 `human_gate` 的 `pending` 改为 `approved`；代填 `### KPI（00）`；执行 `git mv` 至 `done/`（除非用户 **明示** 授权代关账）。

## 前端交互验收清单（关账前 · 强制）

当 task **`acceptance_interaction: required`**（判定见 Skill [**harness-close-acceptance-checklist**](../harness-close-acceptance-checklist/SKILL.md)）：

| 项 | 路径 |
|----|------|
| 清单真值 | `content/tasks/reinspect_results/CHECKLIST_<task_basename>_acceptance_zh.md` |
| 模板 | `content/tasks/templates/CHECKLIST_TEMPLATE_acceptance_zh.md` |
| SPEC | `content/tasks/specs/SPEC-harness_acceptance_checklist_v1_zh.md` |

**CLOSE 硬停**：清单不存在，或 §H 未签收且仍有交互项待人勾 → **不得**关账。50/reinspect 文首须链同一 CHECKLIST。

## CLOSE 关账标准步骤（人 / 新会话 CLOSE 帽）

1. **验收清单 §H**（若 `acceptance_interaction: required`）→ 维护者勾选 §A–§E 等  
2. **HG-REINSPECT** → 见下表「Portfolio W5 示例」  
3. **KPI** → 同一 task 文件 **`### KPI（00）`**，按 `Projects/docs/harness/guides/KPI_RUBRIC_v1_2.md` 填写  
4. **归档** → `content/tasks/README.md`：`git mv content/tasks/active/<task>.md content/tasks/done/`，更新 `content/tasks/_views/done.md`（若项目要求）  
5. **回溯** → 输出 `HANDOFF_CLOSE_TRACE`（工作区 `Projects/docs/harness/prompts/HANDOFF_CLOSE_TRACE.md`）

## Portfolio W5 `portfolio-content-sync-v1` 真值（2026-06-01）

### 50 Prompt 与签收文档

- Prompt 规范：`content/tasks/specs/PROMPT_50_invoke_portfolio_content_sync_w5_v1_zh.md`
- 50 invoke：`content/harness/invokes/by-task/portfolio-content-sync-v1/invoke_20260601_50_portfolio-content-sync-v1.md`
- R1：`content/harness/reviews/task_portfolio_content_sync_v1_audit_R1_20260601.md`
- R2：`content/harness/reviews/task_portfolio_content_sync_v1_audit_R2_20260601.md`
- 50 结论：`content/tasks/reinspect_results/task_portfolio_content_sync_v1_reinspect_20260601.md`
- task：`content/tasks/active/task_portfolio_content_sync_script_v1.md`

### 须人手动改动

| 步骤 | 文件 | 位置 | 改什么 |
|------|------|------|--------|
| 1 | `content/tasks/active/task_portfolio_content_sync_script_v1.md` | 文首表 **`### 人工闸 human_gate`** · 行 **`HG-REINSPECT`** · 列 **`status`** | `pending` → **`approved`** |
| 2 | 同上 | **`### KPI（00）`** 整节 | 删除占位「（占位 · CLOSE 后删除）」；按 KPI_RUBRIC_v1_2 填写（CLOSE 帽） |
| 3 | 同上 | 元信息 **`> 状态`** 行 | 关账后改为 **`done`**（可选，与 `git mv` 同步） |
| 4 | — | Git | `git mv content/tasks/active/task_portfolio_content_sync_script_v1.md content/tasks/done/task_portfolio_content_sync_script_v1.md`（见 `content/tasks/README.md`） |

### 可选（非关账阻塞 · 仍须写明文件）

| 目的 | 文件 | 说明 |
|------|------|------|
| ingest 烟测 | 配对仓 `ai-ink-brain-api-python/.env`（**不提交 Git**） | 设 `CONTENT_ROOT=<本机绝对路径>/ai-ink-brain/content` |
| 本地 curl | 本机 shell | `Authorization: Bearer $SYNC_ADMIN_SECRET`（BFF）或 `$ADMIN_TOKEN`（直连 Python）；步骤见 `tools/README-portfolio-content-sync.md` |
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` | **常被 .gitignore**；若需团队可见，改 ignore 或只在 `tools/README-portfolio-content-sync.md` 维护（50 已接受） |

## 新 task 从模板复制时

1. 30–40 完成后由 22 R2 链出 `content/tasks/specs/PROMPT_50_invoke_<slug>_v1_zh.md`
2. R2 审查 md **必须**含「下一棒 50 Prompt」或指向上述 PROMPT 文件
3. LoopTask 停止回复须含 `reinspect:` **完整相对路径**
