# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | ai-ink-brain/content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| branch | feat/unified-chat-ai-sdk-stream-v1 |
| impl_commit | V-BUILD 修复（normalizeRequestHeaders） |
| created_utc_or_local | 2026-05-18 CST |
| notes | R2 阻塞修复；上一棒 40 R2 self-check-pr2 |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「执行编码帽」，遵循 docs/harness/prompts/30-execute-code.md。

输入：
- task：ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 分支：feat/unified-chat-ai-sdk-stream-v1
- 阻塞：40 R2 记录 V-BUILD fail — chatbiSseTransport.ts normalizeRequestHeaders TS
- 上一棒：content/harness/invokes/invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-pr2.md

须：修复 TS → pnpm lint && pnpm test && pnpm build 全绿 → 更新 task「### 自检结论」V-BUILD → 输出下一棒 40 或 50 Prompt。
```
