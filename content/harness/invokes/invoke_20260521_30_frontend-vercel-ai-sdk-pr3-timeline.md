# Harness invoke snapshot — 30 帽 · INK-P2 PR3 Timeline hook

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | docs/harness/reviews/pointer_task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| git_branch | feat/unified-chat-ai-sdk-stream-v1 |
| worktree_root | **ai-ink-brain** |
| verify_command | pnpm lint && pnpm test && pnpm exec vitest run lib/unified-chat/sse lib/unified-chat/transport && pnpm build |
| created | 2026-05-21 CST |
| prev_invoke | content/harness/invokes/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute.md |

## 背景

- PR1+PR2 已合 `main`（#32）；INK-P1 已关（#35–#38）。
- 本棒：**PR3** = task §6 · T3 Timeline hook 化 + `UnifiedChatPageClient` 瘦身（≤1200 行或 SSE 逻辑 100% 在 `lib/unified-chat/`）。
