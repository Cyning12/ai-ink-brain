# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| template | docs/harness/prompts/TEMPLATE-self-check-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | ai-ink-brain/content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| branch | feat/unified-chat-ai-sdk-stream-v1 |
| impl_commit | 4ea7cef（PR2 Phase 1）；HEAD 自检时 393f877 |
| created_utc_or_local | 2026-05-18 CST |
| notes | PR2 执行者自检 R2；上一棒 30 invoke pr2 |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「执行者自检帽」，严格遵循：
- docs/harness/prompts/40-self-check.md
- docs/harness/prompts/TEMPLATE-self-check-invoke.md §3
- docs/harness/HARNESS_V2_PLAN.md §5

输入：
- 主 task：ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 子仓根：ai-ink-brain
- 分支：feat/unified-chat-ai-sdk-stream-v1
- 实现 commit：4ea7cef（PR2 Phase 1）
- 验证命令：pnpm lint && pnpm test && pnpm build
- 上一棒 invoke：content/harness/invokes/by-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute-pr2.mdby-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute-pr2.md

你必须完成：
1. 对照 task §9 验收表，逐条核对 PR2 范围（V-TRANSPORT 已有 vitest；V-NET / V-RAG / V-ABORT 等人测标「未测」或补 DevTools 证据）。
2. 在子仓根重跑 `pnpm lint && pnpm test && pnpm build`，摘录退出码与关键行。
3. 复核或更新 task **`### 自检结论（执行者）`**（若执行帽已填，做 R2 式核对并注明人测缺口）。
4. 输出结论：PR2 可否进入 PR 描述 / R2 审查；PR3（Timeline hook 化）下一棒建议。
5. 按 HANDOFF_AUTO_COMMIT.md 仅提交本轮自检相关路径（用户写明「不要 commit」则跳过）。

PR2 人测建议（非阻塞）：DevTools 确认 stream 请求头含 `X-ChatBI-Sse-Contract: 2`；RAG 一问见 Timeline + 最终答案区流式增长。
```
