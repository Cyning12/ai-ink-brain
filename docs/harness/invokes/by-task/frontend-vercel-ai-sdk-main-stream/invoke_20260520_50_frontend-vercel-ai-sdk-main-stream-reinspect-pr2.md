# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 50 |
| template | docs/harness/prompts/TEMPLATE-independent-reinspect-invoke.md §3 |
| task_paths | ai-ink-brain/docs/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | ai-ink-brain/docs/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| branch | feat/unified-chat-ai-sdk-stream-v1 |
| diff_range | git diff 393f877..906a062（PR2 normalizeRequestHeaders + 自检文档）；实现尖 23a053b |
| reinspect_tip | 复检时分支 tip 0ca3ef8（含 R3 自检 invoke） |
| created_utc_or_local | 2026-05-18 CST |
| notes | 独立复检 PR2；上一棒 40 invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.md |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「独立复检 + 全局验收帽」，严格遵循：
- docs/harness/prompts/50-independent-reinspect.md
- docs/harness/HARNESS_V2_PLAN.md §5
- 根目录 AGENTS.md §8（合并前：pnpm lint → pnpm test → pnpm build）

输入：
- 主 task 路径：
ai-ink-brain/docs/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 子仓根：
ai-ink-brain
- 模式：
独立复检
- diff 或变更范围说明：
git diff 393f877..906a062（PR2：chatbiSseTransport normalizeRequestHeaders + 自检文档）；实现尖 23a053b
- 任务审核书面结论路径：
ai-ink-brain/docs/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md

你必须完成：
0. Invoke 快照落盘（docs/harness/invokes/ 或子仓 docs/harness/invokes/，与 task 仓对齐）。
1. 读取 task「### 自检结论（执行者）」R3；对照 §9 PR2 子集与 diff。
2. 重点核对：normalizeRequestHeaders 三分支；契约头合并顺序；adapter 双写是否引入 ghost；V-NET/V-RAG/V-ABORT 缺口是否阻塞合并 main。
3. 输出验收表（pass/fail + 文件:行 / 测试名）；汇总阻塞项与是否建议合并。
4. 人测缺口清单（非阻塞但须在 PR/签收前补）：DevTools `X-ChatBI-Sse-Contract: 2`；RAG 一问 Timeline + 主区流式。
5. 按 HANDOFF_AUTO_COMMIT.md 提交本轮复检工件。

上一棒 invoke：
docs/harness/invokes/by-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.mdby-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.md
```
