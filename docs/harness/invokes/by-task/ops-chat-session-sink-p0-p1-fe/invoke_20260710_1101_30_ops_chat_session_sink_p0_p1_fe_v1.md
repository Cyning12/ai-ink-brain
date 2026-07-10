# 30-execute-code Invoke Snapshot · ops-chat-session-sink-p0-p1-fe

| 项 | 内容 |
| --- | --- |
| **hat** | 30-execute-code |
| **task** | docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md |
| **subproject** | ai-ink-brain |
| **branch** | task/ops-chat-session-sink-p0-p1-fe |
| **timestamp** | 2026-07-10 11:01 |
| **human_gate** | HG-TASK-DRAFT approved · HG-AUDIT-R1 approved |

## 输入快照

```text
你正在扮演工作区 Harness「30-execute-code · 执行编码帽」，严格遵循 docs/harness/prompts/30-execute-code.md。

**输入**
- 主 task：`docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md`
- 子仓：`ai-ink-brain`（cwd）
- 分支：`task/ops-chat-session-sink-p0-p1-fe`
- 验证命令：`pnpm lint && pnpm test && pnpm build`
- 配对后端 task：`docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_v1.md`
- 关联 PLAN：`docs/harness/guides/PLAN_ops_chat_session_sink_p0_p1_v1_zh.md`

**本棒目标**
实现前端 P0+P1：
1. `lib/ops/chat-session.ts`：localStorage 持久化 `ops_chat_session_id`（F0-1）
2. `lib/ops/chat.ts`：events schema v1 类型与 parser（F0-2）
3. `components/ops/OpsChatClient.tsx`：同 session 多轮消息线程（F0-3）、Clarify 卡片（F1-1）、Checkpoint 提示（F1-3）
4. `app/api/ops/runs/[runId]/artifacts/route.ts` + `components/ops/OpsRunArtifacts.tsx`：Artifacts BFF 与展示（F1-2）

**约束**
- 先写失败可复现测试再实现
- 不改后端、不改 Session 生产图、不改 P2 UI
- 最终 `pnpm lint && pnpm test && pnpm build` 绿

**必须完成**
0. Invoke 快照落盘到 `ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/`
1. 通读 task、PLAN §3.3/§4.3、本仓 AGENTS.md 与相关代码
2. 先写测试再实现
3. 执行验证命令并保留输出
4. 回填 task「### 自检结论（执行者）」
5. 自动 commit（仅本轮路径；禁止 git add -A）
6. 生成下一棒 40 Prompt
7. 禁止 push

**输出**
- diff 摘要、验证命令输出、commit short-hash、下一棒 40 Prompt
- Judgment：experience_capture / gate/risk / hat_self
```

## 开帽动作

- 人工闸扫描：HG-TASK-DRAFT approved · HG-AUDIT-R1 approved → 可开工。
- 下一步：按 task 必读列表依次阅读 PLAN、配对后端 task BFF 契约、本仓 AGENTS/PROJECT_CONFIG/.cursor/rules/_tech_graph、现有入口代码；先写失败可复现测试，再实现 F0/F1。
