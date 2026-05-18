# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md |
| related_review_or_none | ai-ink-brain/content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md |
| branch | feat/unified-chat-ai-sdk-stream-v1 |
| created_utc_or_local | 2026-05-20 CST |
| notes | PR1（T0+T1）；禁止 PR2 前接入 useChat |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽的必读列表」、根 AGENTS.md §8（合并前必绿命令真值，若与本条 VERIFY 冲突以 task + 子仓 workflow 为准）

输入（已由人工替换占位符；若你仍看到 {{…}} 或「待填」，须先追问用户，不得开工写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/content/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 子仓根（相对 Projects/；所有 git/pytest/pnpm 默认 cwd）：
ai-ink-brain
- 合并前须跑通的验证命令（与 CI / task 一致）：
pnpm lint && pnpm test && pnpm build
- 关联任务审核书面结论路径（无则「无」）：
ai-ink-brain/content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md
- 关联 SPEC / 总规（无则「无」）：
ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md
ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md

你必须完成：
0. **Invoke 快照（开帽起点）**：在输出下列第 1 条起的实质性结果之前，先将 **本用户消息全文** 落盘至 `ai-ink-brain/content/harness/invokes/invoke_YYYYMMDD_30_frontend-vercel-ai-sdk-main-stream-execute.md`（元数据表 + fenced 快照；规则见 `docs/harness/invokes/README.md`）。同一会话内追问 **不** 再新增快照文件。
0b. **人工闸**：扫描 task / 关联 reviews 的 `human_gate`（见 `docs/harness/prompts/HANDOFF_SEMI_AUTO.md`）。若任一对 **本帽（30）** 为 `pending` → 仅输出须人改的 `gate_id` 与路径，**拒开工**。
1. 从 `main` 切分支 **`feat/unified-chat-ai-sdk-stream-v1`**（勿在纯 docs 分支上叠业务 PR）。
2. 通读 task §11–§13、done `task_frontend_unified_chat_streaming_sse_v1.md`；vNext SPEC **只读不实现** `single_panel`。
3. **PR1（T0+T1）**：先 `lib/unified-chat/sse/` + vitest（含 `chain` 白名单/`run_id` 逻辑一并迁出）；**禁止** PR2 前接入 `useChat`。
4. **PR2→PR4** 按 task §6；不改 Python；BFF 仅透传；与 `task_chatbi_v2_incremental_sse_timeline_frontend_v1` **分 PR**。
5. 子仓根执行 `pnpm lint && pnpm test && pnpm build`，修复至绿或记录环境阻塞。
6. 回填 task **`### 自检结论（执行者）`** 与 §15 实现备忘。
7. 对话输出下一棒 Prompt（执行打回 → 30；验收 → 22 R2 或 40）。
8. **自动 commit**：按 `HANDOFF_AUTO_COMMIT.md` 仅提交本轮路径；用户写明「不要 commit」则跳过。

禁止：未读完 failure_paths 就改契约；PR2 前无 `lib/unified-chat/sse/*.test.ts`；BFF 缓冲全 body；去掉 `X-ChatBI-Sse-Contract: 2`。
```
