# Invoke · 帽 22 · R2 任务审核

| 项 | 值 |
| --- | --- |
| **task_slug** | `frontend-intent-hints-step2-observability-v1` |
| **帽** | 22 · R2 任务审核 |
| **日期** | 2026-06-04 |
| **Open Folder** | `ai-ink-brain` |
| **git_branch** | `task/frontend-intent-hints-step2-observability-v1` |
| **worktree_root** | `ai-ink-brain` |
| **audit_profile** | `light` |
| **prev_commit** | `d96f214` |
| **task** | `docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md` |
| **SPEC** | `docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md` |
| **review_out** | `docs/harness/reviews/by-task/frontend-intent-hints-step2-observability-v1/task_frontend_intent_hints_step2_observability_v1_audit_R2_20260604.md` |

---

## §3 Prompt 正文（执行 Agent 从此处开始）

```text
## 角色

你是 **Harness 22 任务审核 Agent（R2 · Intent Hints Step2 前端可观测）**，严格遵循：

- docs/harness/prompts/22-task-audit.md
- docs/harness/prompts/handoff/HANDOFF_SEMI_AUTO.md · HANDOFF_AUTO_COMMIT.md
- ai-ink-brain/docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md
- ai-ink-brain/docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md

Open Folder = ai-ink-brain
git_branch = task/frontend-intent-hints-step2-observability-v1
worktree_root = ai-ink-brain

## 人工闸（只读 · 不得代填）

- HG-TASK-DRAFT: approved（用户已 pre-approve）
- HG-AUDIT-R1: approved（light · 人 pre-approve；无 R1 文件）
- HG-REINSPECT: pending（blocks done · 50 后仍须人签）

## 本棒交付

1. 对照 task 验收 / SPEC §6 / 40 自检结论，审查 **30+40 已交付 diff**（commit `1cc3954` · `d96f214`）。
2. **落盘审查 md**（须含签收/关闭节 + 下一棒 50 Prompt）：
   docs/harness/reviews/by-task/frontend-intent-hints-step2-observability-v1/task_frontend_intent_hints_step2_observability_v1_audit_R2_20260604.md
3. 结论 **无阻塞** → 建议进入 **帽 50 独立复检**。
4. commit 本轮 review + 本 invoke（若 50 invoke 同轮生成则一并 commit）。
5. 无阻塞且 semi_auto → 落盘 50 invoke §3 全文 → commit → 续 50（HG-REINSPECT 仍 pending，不得标 task done）。

## 禁止

- 不写业务代码（本帽仅文档审查）
- 不代填 HG-REINSPECT approved
- 不扩大 scope（router.evidence Timeline 另 task）

## 审查要点（light）

- F1–F7 与 task 范围勾选是否一致
- debugRouter 门控：Debug 关零回归（代码层）
- 单测 / manifest optional keys 是否对齐 SPEC §3
- 40 自检 AC1 待 50 交互 — 须在 review 中标注

帽链真值：docs/tasks/specs/PROMPT_semi_auto_startup_intent_hints_step2_frontend_v1_zh.md §3
```
