# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3 |
| task_paths | ai-ink-brain/docs/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | ai-ink-brain/docs/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| branch | feat/unified-chat-ai-sdk-stream-v1 |
| created_utc_or_local | 2026-05-20 CST |
| notes | PR2（T2 Phase 1）；chatbiSseTransport + useUnifiedChat |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md
- docs/harness/prompts/40-self-check.md
- docs/harness/HARNESS_V2_PLAN.md §5
- ai-ink-brain/AGENTS.md、task「给执行帽必读」、根 AGENTS.md §8

输入：
- 主 task：ai-ink-brain/docs/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 子仓根：ai-ink-brain
- 分支（已存在）：feat/unified-chat-ai-sdk-stream-v1
- 验证：pnpm lint && pnpm test && pnpm build
- 审核：ai-ink-brain/docs/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md
- 上一节 invoke：docs/harness/invokes/by-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute.mdby-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute.md
- SPEC（只读）：ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md、SPEC-ChatBI-V2-Events.md

本轮范围（PR2 / T2 Phase 1）：
1. 在既有 lib/unified-chat/sse/ 之上新增 chatbiSseTransport.ts + useUnifiedChat.ts（或薄封装 useChat）。
2. 请求须带 X-ChatBI-Sse-Contract: 2；BFF 仍透传；正文走 SDK text-delta；Timeline Phase 1 允许 adapter 双写（PR 描述须写明）。
3. 新增 lib/unified-chat/transport/*.test.ts（mock fetch + ReadableStream；含 stop() 后无 delta）。
4. 禁止改 Python；禁止 BFF 缓冲全 body；与 task_chatbi_v2_incremental_sse_timeline_frontend_v1 分 PR。
5. 跑通验证命令；回填 task §15 与「### 自检结论（执行者）」；输出下一棒 Prompt；按 HANDOFF_AUTO_COMMIT.md 仅提交本轮路径。

PR1 已完成 @ 4e0789e；勿重复抽取 parser。
```
