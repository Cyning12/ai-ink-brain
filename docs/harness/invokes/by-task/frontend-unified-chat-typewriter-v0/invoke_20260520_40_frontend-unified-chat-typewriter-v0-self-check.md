# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| template | docs/harness/prompts/TEMPLATE-self-check-invoke.md §3 |
| task_paths | ai-ink-brain/docs/tasks/active/task_frontend_unified_chat_typewriter_v0.md |
| related_review_or_none | 无 |
| branch | feat/unified-chat-typewriter-v0 |
| impl_commit | a650a66 |
| created_utc_or_local | 2026-05-18 CST |
| notes | v0 维护者初步验收通过；上一棒 10+30 同轮落地 |

## 可复制 Prompt 快照

```text
自检帽：task_frontend_unified_chat_typewriter_v0.md
分支 feat/unified-chat-typewriter-v0
验证：pnpm test；人测 /unified-chat 与 ?typewriter=0
回填 task「### 自检结论」；建议开 PR 合 main。
```
