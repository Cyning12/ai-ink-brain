# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| template | docs/harness/prompts/TEMPLATE-requirements-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md（母单）；初版实现不阻塞母单关闭 |
| related_review_or_none | 无 |
| created_utc_or_local | 2026-05-18 CST |
| notes | Unified Chat 主区打字机 v0；依赖 PR2 useUnifiedChat + streamingText |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5

【目标与上下文】
在 ai-ink-brain `/unified-chat` 主区「最终答案」增加客户端打字机揭开效果（v0 初版可验收）。
背景：PR2 已接入 Vercel AI SDK `useUnifiedChat`，`streamingText` 随 `text-delta` 单调增长；当前 UI 直接渲染全文，观感为 SSE 块级顶字。目标：流式过程中匀速逐字/逐批揭开，流结束立即对齐全文；不改变 Python SSE 契约与 Timeline adapter。
约束：保留 loading 时发送 disabled（防连点）；中止/新会话行为与现网一致；默认开启，可用 `?typewriter=0` 关闭对比。
读者：维护者 + 面试演示。

【已有材料路径或粘贴说明】
ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
ai-ink-brain/lib/unified-chat/hooks/useUnifiedChat.ts
ai-ink-brain/components/unified-chat/UnifiedChatPageClient.tsx

【是否按任务审核文档回填】
无

你必须完成：
0. Invoke 快照落盘（本文件）。
1. 输出结构化需求草案：背景/范围/非范围/验收/failure_paths/test_strategy。
2. v0 验收：主区流式可见打字机；`?typewriter=0` 回退块级直出；结束后全文与 `streamingText` 一致。
3. 下一棒：30 执行帽实现（本对话已落初版代码时可由 40 自检 + 可选 22 轻审）。
```
