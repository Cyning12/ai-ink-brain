# 40-self-check Invoke Snapshot · ops-chat-session-sink-p0-p1-fe

| 项 | 内容 |
| --- | --- |
| **hat** | 40-self-check |
| **task** | docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md |
| **subproject** | ai-ink-brain |
| **branch** | task/ops-chat-session-sink-p0-p1-fe |
| **timestamp** | 2026-07-10 11:07 |
| **human_gate** | HG-TASK-DRAFT approved · HG-AUDIT-R1 approved |
| **prev_invoke** | ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_20260710_1101_30_ops_chat_session_sink_p0_p1_fe_v1.md |

## 输入快照

```text
你正在扮演工作区 Harness「40-self-check · 执行者自检帽」，严格遵循 docs/harness/prompts/40-self-check.md。

**输入**
- 主 task：docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md
- 子仓：ai-ink-brain（cwd）
- 分支：task/ops-chat-session-sink-p0-p1-fe
- 验证命令：pnpm lint && pnpm test && pnpm build
- 30 commit：ai-ink-brain @ abceee4
- 30 invoke：ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_20260710_1101_30_ops_chat_session_sink_p0_p1_fe_v1.md

**本棒目标**
独立复核前端 P0+P1 实现：F0-1 session_id、F0-2 events schema v1、F0-3 多轮线程、F1-1 Clarify、F1-2 Artifacts BFF/展示、F1-3 Checkpoint 提示。

**必须完成**
0. Invoke 快照落盘到 ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/
1. 独立阅读 30 invoke、task 正文「### 自检结论（执行者）」、本棒改动代码
2. 在 ai-ink-brain/ 完整执行 pnpm lint && pnpm test && pnpm build
3. 执行 git diff origin/main...HEAD --stat 核对未扩 scope 到后端/Session/P2
4. 按 40-self-check.md 回填 task「### 自检结论（40 复核）」
5. 自动 commit（仅本轮路径；禁止 git add -A）
6. 生成下一棒 50 Prompt
7. 禁止 push

**输出**
- 复核方法、命令输出、与 30 差异核对表、验收项复核表、阻塞项、合并建议、下一棒 50 Prompt
- Judgment：experience_capture / gate/risk / hat_self
```

## 开帽动作

- 人工闸扫描：HG-TASK-DRAFT approved · HG-AUDIT-R1 approved → 可开工。
- 复核策略：独立阅读 30 invoke 与 task 自检结论；二次运行验证命令；抽样阅读 F0/F1 关键实现文件；执行 tech-graph:check 作为 BFF/路由改动的额外一致性校验；生成 50 复检 Prompt。
