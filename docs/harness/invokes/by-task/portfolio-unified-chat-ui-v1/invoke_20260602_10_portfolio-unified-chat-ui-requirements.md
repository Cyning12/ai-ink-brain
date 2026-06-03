# Harness invoke · 10 → 22 R1

| 字段 | 值 |
|------|-----|
| **hat_id** | 10 |
| **next_hat** | 22 R1 |
| **task_slug** | `portfolio-unified-chat-ui-v1` |
| **task_paths** | `docs/tasks/active/task_portfolio_unified_chat_ui_v1.md` |
| **git_branch** | `task/portfolio-visitor-auth-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **human_gate** | **HG-TASK-DRAFT** = `pending` → **blocks 22-R1, 30** |
| **worktree_root** | `ai-ink-brain` |
| **created** | 2026-06-02 |

## §3 可复制 Prompt（下一棒 · 帽 22 R1）

```text
## 角色

你是 **Harness 帽 22 R1（审计）· Portfolio W4 unified-chat-ui**。

前置：**HG-TASK-DRAFT 须为 `approved`**（否则 STOP 报 gate_id）。

Open Folder = ai-ink-brain
git_branch = task/portfolio-visitor-auth-v1
task_slug = portfolio-unified-chat-ui-v1

## 本棒交付

1. 对照 task + SPEC §4.4 · §6.4 · §6.6 + 投递计划 §2 chip 逐字。
2. 落盘 `docs/harness/reviews/task_portfolio_unified_chat_ui_v1_audit_R1_20260602.md`。
3. 结论：放行 30 / 退回 10（列缺口）。
4. 若放行：维护者改 **HG-AUDIT-R1**；落盘 invoke → 派 30。
5. commit 本棒路径。

## 审计焦点

- access_level 持久化方案是否可实施、与 W3 unlock 不冲突
- 档位 → UI 裁剪表是否与 SPEC §4.4 逐行一致
- 五问 chip 文案是否与 §6.4 表逐字一致
- failure_paths F1–F6 是否覆盖 visitor 误开 debug URL
- development 回归范围是否写清
```

## 10 帽完成摘要

- task 已增 **「10 帽定稿（2026-06-02）」**：access_level · chip · /evidence · locked 行为
- failure_paths 扩展 F5–F6
- 实现备忘指向 4 个 TS 模块 + 图谱增量
