# Task Audit · Ops Chat Session Sink · 前端 P0 + P1 · R2

## 元信息

| 项 | 内容 |
| --- | --- |
| task_path | docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md |
| review_path | ai-ink-brain/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_frontend_v1_audit_R2_20260708.md |
| audit_round | R2 |
| date | 2026-07-08 |
| invoke_snapshot | docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_20260708_0000_22_ops_chat_session_sink_p0_p1_frontend_v1_R2.md |
| spec_path | docs/harness/guides/PLAN_ops_chat_session_sink_p0_p1_v1_zh.md |
| prev_review | ai-ink-brain/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_frontend_v1_audit_R1_20260708.md |
| human_gate | HG-TASK-DRAFT `pending`（blocks 30）· HG-AUDIT-R1 `pending`（blocks 30）· 本帽不代签 |

## 审查结论摘要

- R1 阻塞项 `kpi_rubric` 已在 task 头部补填为 `KPI_RUBRIC_v1_2`。
- R1 建议项均已在 10-task 回填中落实：`experience_capture: recommended`、`freeze_id: PARALLEL-TRACKS-ORCH-V1`、`audit_profile: full`、`failure_paths` 已按 §5.3 扩展为五列。
- `test_strategy: required` 与 `test_strategy_note` 完整说明了 red-green 验证命令（`pnpm test -- <pattern>` → `pnpm lint` → `pnpm test` → `pnpm build`）。
- 执行帽必读列表 7 条齐全，覆盖 PLAN、配对后端 task、子仓 AGENTS/PROJECT_CONFIG/规则/图谱/入口文件/链式常模。
- 与线 B 后端联调节点 D3/D5/D8/D10 已声明，并明确成对验收标准与建议同批 merge。
- **R2 零阻塞**；task 文档层已达到可派 30 的状态，但须等人签 `HG-TASK-DRAFT` 与 `HG-AUDIT-R1` 后方可开工。

## 详细核对

| 字段 / 小节 | 状态 | 说明 |
| --- | --- | --- |
| 状态 `active` / `slug` / `git_branch` / `worktree_root` | 通过 | 与 Master Dispatch 线 C 一致 |
| `test_strategy: required` | 通过 | 已声明，note 说明 red-green 理由与 `pnpm lint/test/build` 验证 |
| 验收标准 M0-F / M1-F | 通过 | 可观测、与 PLAN §3.3 前端日历对齐 |
| `failure_paths` | 通过 | 已按 §5.3 扩展为五列：触发 / UI 行为 / HTTP 状态 / 可重试 / 用户可见文案类型 |
| `freeze_id` | 通过 | `PARALLEL-TRACKS-ORCH-V1`，指向 Master Dispatch 冻结点 |
| `gates_before_code` | 通过 | 默认隐式 `true`；task 内已显式声明执行帽必读列表 |
| `audit_profile` | 通过 | `full` |
| `experience_capture` | 通过 | `recommended`（跨仓配对 / 成对 merge / 联调节点具备可复用经验） |
| `code_quality_bar` | 通过 | 未声明，默认 `baseline` |
| `kpi_rubric` | 通过 | `KPI_RUBRIC_v1_2`（R1 阻塞项已回填） |
| `kpi_aggregator` | 通过 | `CLOSE` |
| `orchestration` / 配对后端 | 通过 | 声明 `epic: parallel-tracks-orchestration · paired_with: B`；指向线 B task |
| `human_gate` 表 | 通过 | HG-TASK-DRAFT / HG-AUDIT-R1 均为 `pending`，正确 blocks 30 |
| 给执行帽的必读列表 | 通过 | 7 条齐全，覆盖 PLAN、后端 task、AGENTS、PROJECT_CONFIG、rules、图谱、入口文件、链式常模 |
| 与线 B 后端联调节点 | 通过 | D3/D5/D8/D10 成对验收标准与建议同批 merge 已声明 |

## 阻塞 / 非阻塞

### 阻塞项

无。

### 非阻塞备注

1. **`failure_paths` 已补强**：R1 建议的 HTTP 状态 / 错误码、可重试、用户可见文案类型三列已补齐。
2. **`experience_capture` 已声明为 `recommended`**：与跨仓配对、成对 merge、D3/D5/D8/D10 联调的流程经验相匹配。
3. **`freeze_id` 已声明**：指向 `PARALLEL-TRACKS-ORCH-V1`，与 Master Dispatch 一致。
4. **人工闸仍 pending**：属正常状态，本帽不代签；30 执行帽须待人签 `HG-TASK-DRAFT` + `HG-AUDIT-R1` 后方可开工。

## 需任务帽回填清单（10-task）

无。R1 回填项已在本轮全部闭合。

## 是否建议执行帽开工

**文档层已就绪，但当前不建议 30 执行帽立即开工**。

理由：
- task 头部 `human_gate` 表显示 `HG-TASK-DRAFT: pending` 与 `HG-AUDIT-R1: pending`，均 `blocks: 30`。
- 依据 `HARNESS_V2_PLAN.md` §5.6，仅人可将 `pending` 改为 `approved`；Agent 遇 pending 应拒开工。
- 待人签两闸 approved 后，可立即使用文末「下一棒可复制 Prompt」派发 30 执行帽。

## 签收 / 关闭

- 本轮 **审查通过**（零阻塞），但 **不关闭 task**。
- 关闭条件：
  1. 人签 `HG-TASK-DRAFT: approved`。
  2. 人签 `HG-AUDIT-R1: approved`。
  3. 30 执行帽完成 F0/F1 实现与 `pnpm lint` → `pnpm test` → `pnpm build` 绿。
  4. 40 自检帽回填 `### 自检结论（执行者）`。
  5. 50 独立复检通过。
  6. 关账时填写 `### KPI（00）`（`kpi_aggregator: CLOSE`）。
- 本 task 与线 B 后端 task 配对，PR 建议成对 merge。

## 下一棒可复制 Prompt

待人签 `HG-TASK-DRAFT` + `HG-AUDIT-R1` 后，复制以下 Prompt 派发 30 执行帽：

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽的必读列表」、根 AGENTS.md §8

输入（占位符已全部替换；若仍看到 {{…}} 或「待填」，须先追问用户，不得开工写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
  docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md
- 逻辑子仓（task 路径前缀；相对 Projects/）：
  ai-ink-brain
- Worktree 研发目录（所有 git/pnpm 默认 cwd；并行时须与 invoke 元信息 worktree_root 一致）：
  ai-ink-brain
- 合并前须跑通的验证命令（与 CI / task 一致）：
  pnpm lint → pnpm test → pnpm build
- 关联任务审核书面结论路径（无则「无」）：
  ai-ink-brain/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_frontend_v1_audit_R2_20260708.md
- 关联 SPEC / 总规（无则「无」）：
  docs/harness/guides/PLAN_ops_chat_session_sink_p0_p1_v1_zh.md

你必须完成：
0. Invoke 快照（开帽起点）：在输出下列第 1 条起的实质性结果之前，先将本用户消息全文按 docs/harness/invokes/README.md 落盘到 ai-ink-brain/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_20260708_0000_30_ops_chat_session_sink_p0_p1_frontend_v1.md（含元数据表 + 快照 fenced code）。
0b. 人工闸：扫描 task 与关联 review 的 human_gate。若任一对本帽（30）为 pending → 仅输出须人改的 gate_id 与路径，拒开工；禁止代填 approved。
1. 通读 task 全文：gates_before_code、audit_profile、orchestration、test_strategy / test_strategy_note、freeze_id、failure_paths、拒开工条件、验收标准、必读列表、非范围。
2. 若 task 明示拒开工条件未满足 → 仅输出 Markdown 阻塞清单，不写业务实现代码。
3. test_strategy: required 时：先增加或调整可失败的自动化测试（Vitest），再改实现；禁止「只写实现、后补测」。
4. 在 ai-ink-brain/ 内按 task 范围 F0/F1 改代码/配置；禁止在并行另一 worktree 改同一子仓；禁止静默扩大 scope。
5. 执行 pnpm lint → pnpm test → pnpm build，保留可核对输出要点；修复直至通过或记录环境阻塞并停止扩写。
6. 按 40-self-check.md 将结论与命令摘要回填至 task 正文「### 自检结论（执行者）」。
7. 对话回复：生成可以完整复制的 Prompt，用于直接交给下一棒执行。
8. 自动 commit：在输出下一棒 Prompt 且本轮代码/测试/task 自检回填已落盘后，按 HANDOFF_AUTO_COMMIT.md 在 ai-ink-brain/ 对应 git 根 commit（仅本轮路径；禁止 git add -A；对话报 short-hash）。
9. 链式下一棒：若 task 由 00 / Lead 按 PROMPT_*_chain_serial_* 编排 → 不在本帽同会话自动换帽；仅输出下一棒 §3 或交还父 Agent。

禁止：在未读完必读与 failure_paths 的情况下改路由/契约；删除与 task 无关的大段重构；口头宣称「已测过」而无命令输出。

Judgment（本帽 · 对话末尾必填）：
- experience_capture: 维持 recommended（跨仓配对、成对 merge、联调节点具备可复用协调经验）
- gate/risk: 无新增；须人签 HG-TASK-DRAFT + HG-AUDIT-R1 后 30 方可开工
- hat_self: pass | pass-with-notes | blocked
```

---

Judgment（本帽 · R2）：
- experience_capture: recommended（维持；跨仓配对、成对 merge、D3/D5/D8/D10 联调具备可复用协调经验）
- gate/risk: HG-TASK-DRAFT pending + HG-AUDIT-R1 pending（均 blocks 30）· 本帽不代签 approved
- hat_self: pass-with-notes（R1 阻塞项与建议项已回填闭合；notes：人工闸仍 pending，须人签后派 30）
