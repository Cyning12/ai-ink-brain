# Invoke Snapshot · 30-execute-code · ops-chat-session-sink-p0-p1-fe · P0+P1

| 字段 | 值 |
| --- | --- |
| **hat** | 30-execute-code |
| **task** | docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md |
| **subproject** | ai-ink-brain |
| **branch** | task/ops-chat-session-sink-p0-p1-fe |
| **scope** | 前端 P0+P1：F0-1 session_id · F0-2 events schema v1 · F0-3 多轮线程 UI · F1-1 Clarify · F1-2 Artifacts BFF/展示 · F1-3 Checkpoint 提示 |
| **timestamp** | 2026-07-10 10:15 |
| **verify_command** | `pnpm lint && pnpm test && pnpm build` |

## 用户消息快照

```text
你正在扮演工作区 Harness「30-execute-code · 执行编码帽」，严格遵循 docs/harness/prompts/30-execute-code.md。

**输入（已替换占位符）**
- 主 task 路径（相对 Projects/）：`docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md`
- 逻辑子仓（相对 Projects/）：`ai-ink-brain`
- Worktree 研发目录（所有 git/pnpm 默认 cwd）：`ai-ink-brain`
- 当前分支：`task/ops-chat-session-sink-p0-p1-fe`（已基于 main up-to-date）
- 合并前须跑通的验证命令：
  ```bash
  pnpm lint && pnpm test && pnpm build
  ```
- 关联任务审核书面结论路径：`ai-ink-brain-api-python/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_v1_audit_R2_20260708.md`
- 关联 PLAN / 总规：`docs/harness/guides/PLAN_ops_chat_session_sink_p0_p1_v1_zh.md`
- 配对后端 task：`docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_v1.md`

**本棒目标：前端 P0+P1 全量实现**

P0 前端（F0）具体要求（来自 task §范围、§实现备忘、§验收标准）：
- **F0-1** `lib/ops/chat-session.ts`：新建 `getOrCreateOpsChatSessionId()`，使用 localStorage 持久化 `ops_chat_session_id`；传给 `sendOpsChatMessage`。
- **F0-2** `lib/ops/chat.ts`：更新 `OpsRunEvent` payload 类型，支持 `schema_version: 1`；扩展 `formatOpsEventSummary` / `ThinkingChainTimeline` 展示新 event 类型。
- **F0-3** `components/ops/OpsChatClient.tsx`：同 session 多轮消息列表（不只最后一次 run），保留 events 时间线。

P1 前端（F1）具体要求：
- **F1-1** Clarify：`components/ops/OpsChatClient.tsx` 处理后端 `needs_clarification` + `clarify_question`，展示澄清卡片并允许用户二次发送。
- **F1-2** Artifacts BFF：`app/api/ops/runs/[runId]/artifacts/route.ts` 新建 BFF 路由；`components/ops/OpsRunArtifacts.tsx`（或集成到 `OpsChatClient`）折叠区展示 JSON 摘要。
- **F1-3** Checkpoint：`components/ops/OpsChatClient.tsx` 对 `checkpoint.resume` / `react.max_steps` 事件展示友好提示。

**范围限制**
- 只做 task §范围内前端 P0+P1
- 不改 Session Orchestrator 页 / promote 向导
- 不改 P2 gate/probe UI
- 不新增 Ops Tab（仍在 `/ops/kimi-code/chat`）
- 后端代码已合并，本棒不改后端

**test_strategy: required**
- 先写/调整可失败的自动化测试（Vitest），再改实现
- 覆盖：
  - `chat-session.ts`：getOrCreate 稳定、localStorage 读写、降级行为
  - `chat.ts` parser / `formatOpsEventSummary`：schema_version 识别、新 event 类型
  - `OpsChatClient`：多轮消息追加、clarify 卡片、checkpoint 提示
  - BFF artifacts route：参数校验、404/5xx 降级
- 最终 `pnpm lint` → `pnpm test` → `pnpm build` 必须绿

**失败路径硬性检查**
- task §失败路径所列：localStorage 不可用降级、artifacts 404/5xx 静默降级、clarify 超时允许跳过。

**你必须完成**
0. **Invoke 快照（开帽起点）**：将本用户消息全文落盘到 `ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_YYYYMMDD_HHMM_30_ops_chat_session_sink_p0_p1_fe_v1.md`（含元数据表 + 快照 fenced code）。同一会话内追问 **不** 再新增快照文件。
0b. **人工闸**：扫描 task / 关联 reviews 的 human_gate。若任一对本帽（30）为 pending → 仅输出须人改的 gate_id 与路径，拒开工；禁止代填 approved。
1. 通读 task 全文：头部 gates_before_code、audit_profile、orchestration、chain_prompt、test_strategy / test_strategy_note、failure_paths、验收标准、必读列表、非范围。
2. 阅读 PLAN §3.3 / §4.3 与配对后端 task 中 BFF 契约说明。
3. 先读本仓必读：`ai-ink-brain/AGENTS.md`、`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`、`.cursor/rules/*.mdc`、相关 `_tech_graph/`。
4. 先读现有代码：`components/ops/OpsChatClient.tsx`、`lib/ops/chat.ts`、`components/ops/ThinkingChainTimeline.tsx`、`app/api/ops/chat/messages/route.ts`、`app/ops/kimi-code/chat/page.tsx`。
5. 先写失败可复现的测试，再实现 F0-1/F0-2/F0-3/F1-1/F1-2/F1-3。
6. 执行验证命令，保留可核对输出要点；修复直至通过。
7. 按 40-self-check.md 将结论与命令摘要回填至 task 正文「### 自检结论（执行者）」小节。
8. 对话回复：生成可以完整复制的 Prompt，用于直接交给下一棒 40 自检执行。
9. **自动 commit**：在输出下一棒 Prompt 且本轮代码/测试/task 自检回填已落盘后，按 HANDOFF_AUTO_COMMIT.md 在 `ai-ink-brain/` commit（仅本轮路径；禁止 git add -A；对话报 short-hash）。
10. **禁止**自行 push；由 Lead 合并。

**输出要求**
- 若拒开工：仅 Markdown 阻塞清单
- 若执行：diff 摘要、验证命令输出、commit short-hash、下一棒 40 Prompt

**Judgment（本帽 · 对话末尾必填）**：experience_capture / gate/risk / hat_self
```
