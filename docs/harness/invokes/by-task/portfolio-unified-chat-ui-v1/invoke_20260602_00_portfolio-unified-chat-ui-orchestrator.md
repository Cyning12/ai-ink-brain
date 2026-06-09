# Harness invoke · 00 → 10

| 字段 | 值 |
|------|-----|
| **hat_id** | 00 |
| **next_hat** | 10 |
| **task_slug** | `portfolio-unified-chat-ui-v1` |
| **task_paths** | `docs/tasks/active/task_portfolio_unified_chat_ui_v1.md` |
| **git_branch** | `task/portfolio-visitor-auth-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **stop_after_hat** | `CLOSE` |
| **worktree_root** | `ai-ink-brain` |
| **created** | 2026-06-02 |

## §3 可复制 Prompt（下一棒 · 帽 10）

```text
## 角色

你是 **Harness 帽 10（需求定稿）· Portfolio W4 unified-chat-ui**，遵循：
- docs/tasks/active/task_portfolio_unified_chat_ui_v1.md
- docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md §4.4 · §6.4 · §6.6
- docs/tasks/specs/投递冲刺_20260609_v1_zh.md §2
- W3 done：ChatBI token unlock 主路径不可推翻

Open Folder = ai-ink-brain
git_branch = task/portfolio-visitor-auth-v1
task_slug = portfolio-unified-chat-ui-v1

## 本棒交付

1. 审阅 00 输出的 access_level 持久化方案；若有缺口写入 task「10 帽定稿」。
2. 冻结：development 3 条通用 chip；/evidence 本 task 不做；failure_paths F1–F6。
3. 更新 task 验收项与实现备忘至可审计状态。
4. 落盘 invoke §3 → 派 **22 R1**；**不要** 进 30（HG-TASK-DRAFT 未 approved）。
5. commit 本棒路径。

## 00 已冻结要点（勿弱化）

- access_level：2=visitor · 0|1=visitor-admin · sessionStorage + mount re-verify
- portfolio：隐藏 Router Debug（两档）；visitor 隐藏 Timeline/Trace + 忽略 ?debug=1
- portfolio chip：Q1–Q5 逐字；locked 可 setDraft · send blocked
- development：全量 debug UI + 3 通用 chip 回归
```

## 00 Judgment 摘要

- **可开工**：task 草案完整；W3 基线 `3d74537` 已含 ChatBI unlock；缺口均为展示层（无后端依赖）。
- **阻塞**：无技术阻塞；**HG-TASK-DRAFT** 待人批后方能 22 R1 / 30。
