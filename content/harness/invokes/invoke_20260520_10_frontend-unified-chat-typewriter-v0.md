# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 10 + 30（同轮） |
| template | docs/harness/prompts/TEMPLATE-requirements-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_unified_chat_typewriter_v0.md |
| related_review_or_none | 无 |
| branch | feat/unified-chat-typewriter-v0 |
| impl_commit | a650a66 |
| created_utc_or_local | 2026-05-18 CST |
| notes | 需求 + v0 实现同轮完成；维护者初步验收通过 |

## 可复制 Prompt 快照（历史 · 开帽时）

```text
【目标】Unified Chat 主区打字机 v0：useTypewriterReveal + ?typewriter=0 关闭。
【状态】已实现 @ a650a66；task_frontend_unified_chat_typewriter_v0.md；下一棒：PR 合 main（40 自检已回填）。
```

## 需求摘要（落盘 task 真值）

见 [`../../tasks/active/task_frontend_unified_chat_typewriter_v0.md`](../../tasks/active/task_frontend_unified_chat_typewriter_v0.md)。
