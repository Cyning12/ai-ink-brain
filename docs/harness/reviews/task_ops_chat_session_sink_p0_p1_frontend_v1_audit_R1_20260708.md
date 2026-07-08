# Task Audit · Ops Chat Session Sink · 前端 P0 + P1 · R1

## 元信息

| 项 | 内容 |
| --- | --- |
| task_path | docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md |
| review_path | ai-ink-brain/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_frontend_v1_audit_R1_20260708.md |
| audit_round | R1 |
| date | 2026-07-08 |
| invoke_snapshot | docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/invoke_20260708_0000_22_ops_chat_session_sink_p0_p1_frontend_v1.md |
| spec_path | docs/harness/guides/PLAN_ops_chat_session_sink_p0_p1_v1_zh.md |
| human_gate | HG-TASK-DRAFT `pending`（blocks 30）· 本帽不代签 |

## 审查结论摘要

- task 范围（F0/F1）、非范围、验收标准、失败路径、依赖引用与 PLAN §3.3/§4.3 对齐，整体可执行性较好。
- **阻塞项**：task 头部未填 `kpi_rubric` 字段。依据 `HARNESS_V2_PLAN.md` §5.8，2026-05-31 起所有新建 task 均须声明 `kpi_rubric: KPI_RUBRIC_v1_2`。
- 其余项为建议增强（非阻塞），可在 10-task 回填时一并处理。

## 详细核对

| 字段 / 小节 | 状态 | 说明 |
| --- | --- | --- |
| 状态 `active` / `slug` / `git_branch` / `worktree_root` | 通过 | 与 Master Dispatch 线 C 一致 |
| `test_strategy: required` | 通过 | 已声明；验收标准含 `pnpm lint` / `pnpm test` / `pnpm build` |
| 验收标准 M0-F / M1-F | 通过 | 可观测、与 PLAN §3.3 前端日历对齐 |
| `failure_paths` | 建议补强 | 表非空，但缺少 HTTP 状态 / 错误码、是否可重试、用户可见文案类型等粒度（§5.3） |
| `freeze_id` | 建议声明 | 可选字段；本 task 跨 P0+P1，建议引用 PLAN 版本作为契约基准 |
| `gates_before_code` | 通过 | 未显式声明，默认隐式 `true` |
| `audit_profile` | 通过 | 未显式声明（可选） |
| `experience_capture` | 建议声明 | 未声明；本 task 与后端 B 线配对、PR 成对 merge、跨 D3/D5/D8/D10 联调，具备可复用协调经验 |
| `code_quality_bar` | 通过 | 未声明，默认 `baseline` |
| `kpi_rubric` | **阻塞** | **必填缺失**（§5.8） |
| `kpi_aggregator` | 通过 | 未声明，默认 `CLOSE` |
| `human_gate` 表 | 通过 | HG-TASK-DRAFT `pending` 正确，blocks 30 |

## 阻塞 / 非阻塞

### 阻塞项

1. **缺少 `kpi_rubric`**
   - 位置：task 头部元信息表。
   - 要求：依据 `HARNESS_V2_PLAN.md` §5.8，新建 task 头部须显式声明 `kpi_rubric: KPI_RUBRIC_v1_2`。
   - 回填方式：在头部元信息表新增一行，值为 `KPI_RUBRIC_v1_2`。

### 非阻塞建议

1. **`failure_paths` 可细化**
   - 建议按 §5.3 扩展为四列：触发条件、系统行为（含 HTTP 状态 / 错误码）、是否可重试、用户可见文案类型。
2. **`experience_capture` 建议 `recommended`**
   - 理由：跨仓配对、成对 merge、D3/D5/D8/D10 联调节点，均包含可复用流程经验。
3. **`freeze_id` 建议声明**
   - 建议指向 `PLAN_ops_chat_session_sink_p0_p1_v1_zh.md` 当前版本，便于 P0+P1 契约基线追溯。

## 需任务帽回填清单（10-task）

- [ ] 在 task 头部元信息表新增 `kpi_rubric: KPI_RUBRIC_v1_2`。
- [ ] （可选）新增 `experience_capture: recommended` 及简短 note。
- [ ] （可选）按 §5.3 增强 `failure_paths` 表格，补充 HTTP 状态、可重试、用户可见文案类型。
- [ ] （可选）新增 `freeze_id` 指向 PLAN 版本。

回填完成后，须触发 **20-task-audit R2**。

## 是否建议执行帽开工

**否**。当前存在阻塞项（`kpi_rubric` 缺失），且 `HG-TASK-DRAFT` 为 `pending`。须等 10-task 回填 + 20-task-audit R2 通过 + 人签 `HG-TASK-DRAFT` 后，方可派 30 执行帽。

## 签收 / 关闭

- 本轮 **不签收**、**不关闭**。
- 关闭条件：R2 审查通过 + `HG-TASK-DRAFT` approved + 30→40→50 链完成 + 关账时填写 `### KPI（00）`。

## 下一棒可复制 Prompt

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5

输入：

【目标与上下文】
按 20-task-audit R1 审查清单回填 task 头部元信息与小节，不改业务实现范围。

【已有材料路径或粘贴说明】
docs/harness/tasks/active/task_ops_chat_session_sink_p0_p1_frontend_v1.md
ai-ink-brain/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_frontend_v1_audit_R1_20260708.md
docs/harness/guides/PLAN_ops_chat_session_sink_p0_p1_v1_zh.md

【是否按任务审核文档回填】
ai-ink-brain/docs/harness/reviews/task_ops_chat_session_sink_p0_p1_frontend_v1_audit_R1_20260708.md

你必须完成：
0. Invoke 快照：将本用户消息全文落盘到 Projects/docs/harness/invokes/by-task/ops-chat-session-sink-p0-p1-fe/（按 invokes README 命名）。
1. 读取 task 与审查文档。
2. 在 task 头部元信息表新增 `kpi_rubric: KPI_RUBRIC_v1_2`。
3. （可选）新增 `experience_capture: recommended` 及简短 note。
4. （可选）按 HARNESS_V2_PLAN §5.3 增强 failure_paths 表格：补充 HTTP 状态 / 错误码、是否可重试、用户可见文案类型。
5. （可选）新增 `freeze_id` 指向 PLAN 版本。
6. 不改业务实现代码、不改 CI、不改验收标准本质。
7. 完成后输出下一棒 Prompt（20-task-audit R2）。

Judgment：
- experience_capture: recommended（跨仓配对、成对 merge、D3/D5/D8/D10 联调具备可复用协调经验）
- gate/risk: HG-TASK-DRAFT pending → 回填后仍须 20-task-audit R2 + 人签 approved
- hat_self: pass-with-notes
```

---

Judgment（本帽 · R1）：
- experience_capture: recommended（跨仓配对、成对 merge、联调节点有复用经验）
- gate/risk: HG-TASK-DRAFT pending（blocks 30）· 本帽不代签 approved
- hat_self: blocked（因 kpi_rubric 必填缺失，须退回 10-task 回填后 R2 再审）
