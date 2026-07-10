# 40-self-check Invoke Prompt · ops-chat-session-sink-p0-p1-fe

| 项 | 内容 |
| --- | --- |
| **hat** | 40-self-check |
| **task** | docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md |
| **subproject** | ai-ink-brain |
| **branch** | task/ops-chat-session-sink-p0-p1-fe |
| **timestamp** | 2026-07-10 11:01 |
| **upstream 30 invoke** | `ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_20260710_1101_30_ops_chat_session_sink_p0_p1_fe_v1.md` |
| **human_gate** | HG-TASK-DRAFT approved · HG-AUDIT-R1 approved |

## 你现在的角色

工作区 Harness **40-self-check · 执行者自检帽**。严格遵循 `docs/harness/prompts/40-self-check.md`。

## 任务

独立复核 30 执行帽对 **前端 P0+P1** 的实现结论，验证是否满足 task 与 PLAN 要求。

## 复核范围（禁止改实现，只验证）

1. 阅读 task 正文中 **### 自检结论（执行者）** 与上游 30 invoke 快照。
2. 独立阅读本轮改动代码：
   - `lib/ops/chat-session.ts` + `lib/ops/chat-session.test.ts`
   - `lib/ops/chat.ts` + `lib/ops/chat.test.ts`
   - `components/ops/OpsChatClient.tsx`
   - `components/ops/ThinkingChainTimeline.tsx`
   - `components/ops/OpsRunArtifacts.tsx`
   - `app/api/ops/runs/[runId]/artifacts/route.ts` + `route.test.ts`
   - `tests/components/ops/ops-chat-client.test.tsx`
   - `tests/components/ops/ops-run-artifacts.test.tsx`
   - `tests/components/ops/thinking-chain-timeline.test.tsx`
   - `app/ops/kimi-code/chat/page.tsx`
3. 通过 `git diff --name-status origin/main...HEAD` 核对全量变更路径，确认未扩 scope 到后端、Session 生产图、P2 UI。
4. 在 `ai-ink-brain/` 内完整执行：
   ```bash
   pnpm lint && pnpm test && pnpm build
   ```
5. 核对 30 声称的验收项：F0-1/F0-2/F0-3/F1-1/F1-2/F1-3、最终验证命令绿、未扩 scope。

## 必须输出

1. 在 task 正文追加 **### 自检结论（40 复核）**，包含：
   - 复核方法
   - 命令输出（原始关键片段）
   - 与 30 结论差异核对表
   - 验收项复核表（pass/fail）
   - 阻塞项清单
   - 合并建议
   - `Judgment`：`experience_capture` / `gate/risk` / `hat_self`
2. 生成下一棒 50 Prompt（如需要）或注明 40 认为可直接合并。
3. 自动 commit 本轮文档变更（仅 task / invoke / review 文件；禁止 `git add -A`），报 short-hash。
4. 禁止 push。

## 约束

- 不改前端实现代码。
- 若发现测试/构建失败，回退给 30 或标记阻塞项；不得静默绕过。
- 人工闸若仍为 `pending` 则仅输出 `gate_id` + 路径，拒开工。
