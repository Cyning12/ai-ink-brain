# Harness invoke · 22 R1 → 30

| 字段 | 值 |
|------|-----|
| **hat_id** | 22 R1 |
| **next_hat** | 30 |
| **task_slug** | `portfolio-unified-chat-ui-v1` |
| **task_paths** | `docs/tasks/active/task_portfolio_unified_chat_ui_v1.md` |
| **review** | `docs/harness/reviews/task_portfolio_unified_chat_ui_v1_audit_R1_20260602.md` |
| **git_branch** | `task/portfolio-visitor-auth-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **human_gate** | **HG-AUDIT-R1** = `pending` → **blocks 30** |
| **worktree_root** | `ai-ink-brain` |
| **created** | 2026-06-02 |

## §3 可复制 Prompt（下一棒 · 帽 30）

```text
## 角色

你是 **Harness 帽 30（实现）· Portfolio W4 unified-chat-ui**。

前置：**HG-AUDIT-R1 须为 `approved`**（否则 STOP 报 gate_id）。

Open Folder = ai-ink-brain
git_branch = task/portfolio-visitor-auth-v1
task_slug = portfolio-unified-chat-ui-v1

## 本棒交付（最小闭环）

1. `lib/chatbi-client.ts`：read/write/clearChatbiAccessLevel（sessionStorage）
2. `lib/unified-chat/portfolio-chat-tier.ts` + `portfolio-demo-chips.ts`
3. `UnifiedChatPageClient.tsx`：
   - unlock 写 level；mount re-verify
   - portfolio 条件渲染 Router Debug / Timeline / Trace / debug URL
   - portfolio 五问 chip（locked + unlocked）；development 3 通用 chip 回归
4. `docs/_tech_graph/13_flow_components.md` + `.ai.md` 增量
5. 验证：pnpm lint · pnpm test · pnpm build · NEXT_PUBLIC_SITE_MODE=portfolio pnpm build
6. 回填 task 实现备忘；落盘 invoke → 40；**单独 commit 实现**

## 禁止

Python 改动 · 改 W3 unlock 主路径 · 开 PR
```

## R1 摘要

PASS · 无退回项 · 见 review 全文。
