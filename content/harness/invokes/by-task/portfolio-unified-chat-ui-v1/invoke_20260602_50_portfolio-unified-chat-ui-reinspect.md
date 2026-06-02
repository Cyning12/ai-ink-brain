# Harness invoke · 22 R2 → Task 50

| 字段 | 值 |
|------|-----|
| **hat_id** | 22 R2 |
| **next_hat** | Task 50 |
| **task_slug** | `portfolio-unified-chat-ui-v1` |
| **human_gate** | **HG-REINSPECT** = `pending` → blocks CLOSE |
| **created** | 2026-06-02 |

## §3 可复制 Prompt（下一棒 · Task 50 · Fresh Context）

```text
角色：Harness Task 50 复检 · portfolio-unified-chat-ui-v1

Open Folder = ai-ink-brain
git_branch = task/portfolio-visitor-auth-v1

交付：
1. 落盘 content/tasks/reinspect_results/task_portfolio_unified_chat_ui_v1_reinspect_20260602.md
2. 对照 task 验收 + §6.4 chip 逐字 + §6.6 裁剪表
3. 跑 pnpm lint · test · build（双 mode）
4. 结论 pass / warn / fail

前置 CLOSE：HG-REINSPECT approved
```
