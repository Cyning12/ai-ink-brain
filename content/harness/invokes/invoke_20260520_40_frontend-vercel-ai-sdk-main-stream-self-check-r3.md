# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| template | docs/harness/prompts/TEMPLATE-self-check-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | ai-ink-brain/content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| branch | feat/unified-chat-ai-sdk-stream-v1 |
| impl_commit | 23a053b（V-BUILD fix）；分支 tip 906a062 |
| created_utc_or_local | 2026-05-18 CST |
| notes | PR2 R3 自检；变更范围 git diff 393f877..HEAD；上一棒 30 vbuild-fix |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「自检帽（执行者）」，严格遵循：
- docs/harness/prompts/40-self-check.md
- docs/harness/prompts/TEMPLATE-self-check-invoke.md §3
- docs/harness/HARNESS_V2_PLAN.md §5

输入：
- 主 task：ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 子仓根：ai-ink-brain
- 分支：feat/unified-chat-ai-sdk-stream-v1
- 实现 commit：23a053b（V-BUILD fix）；分支 tip 906a062
- 验证命令：pnpm lint && pnpm test && pnpm build
- 变更范围：git diff 393f877..HEAD（normalizeRequestHeaders + task 自检回填）
- 上一棒 invoke：content/harness/invokes/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-vbuild-fix.md

你必须完成：
1. 对照 task §9，对 PR2 子集做 R3 核对（执行帽已报 V-LINT/V-TEST/V-BUILD/V-PARSER/V-TRANSPORT pass；V-NET/V-RAG/V-ABORT 标未测或补 DevTools 证据）。
2. 在子仓根重跑 `pnpm lint && pnpm test && pnpm build` 与 `pnpm exec vitest run lib/unified-chat/sse lib/unified-chat/transport`，摘录退出码。
3. 更新 task **`### 自检结论（执行者）`**（R3：确认 V-BUILD 非 flaky；HEAD 对齐分支 tip）。
4. 结论：PR2 可否进 PR 描述 / 是否建议开 50 独立复检。
5. 按 HANDOFF_AUTO_COMMIT.md 仅提交本轮自检相关路径（用户写明「不要 commit」则跳过）。

人测建议（非阻塞）：DevTools 确认 stream 请求头含 `X-ChatBI-Sse-Contract: 2`；RAG 一问见 Timeline + 主区流式增长。
```
