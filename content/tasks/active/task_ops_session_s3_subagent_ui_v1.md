# Task · Ops Session S3 Subagent UI（dispatched 深析 · 交付物 · 事件流）

> **状态**：`draft`  
> **epic**：Session Orchestrator · S3 `ops-session-s3-subagent`  
> **schedule_ref**：SPEC §12.1 S3 · §12.3 Epic 验收（subagent 交付物）  
> **关联 SPEC**：[`SPEC_ops_session_orchestrator_v1_zh.md`](../../docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md) §7 · §12 S3  
> **配对后端**：[`task_ops_session_s3_subagent_api_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/active/task_ops_session_s3_subagent_api_v1.md)  
> **前置**：S2 UI done · 本地验收通过

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-session-s3-subagent-ui` |
| **module_id** | `OPS-SESSION-ORCH` |
| **freeze_id** | `OPS-SESSION-ORCH-SPEC-V1` |
| **test_strategy** | `recommended` |
| **worktree_root** | `ai-ink-brain/` |
| **git_branch** | `task/ops-session-s3-subagent-ui` |
| **blocked_by** | 后端 `ops-session-s3-subagent-api` |
| **blocks** | S4 promote UI |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | `approved` | 20-task-audit, 30 | 00 起草 · 2026-07-02 |
| HG-AUDIT-R1 | `pending` | 30 | 20 R1 后人签 |

---

## 背景与目标

S2 已交付授权区与 `dispatched` 占位回复。本 task 在 Session 续聊页展示 **真实 deep/ReAct 思考链**、**deliverables 列表**，并接入节点级 **thinking** 文案（可与 [`task_ops_session_thinking_node_status_v1.md`](./task_ops_session_thinking_node_status_v1.md) 合并排期）。

**完成态一句话**：`dispatched` 后发消息可见完整 run 事件流与终答 · 可查看/复制 deliverables 路径摘要。

---

## 范围

- [ ] **Session Chat**：`dispatched` 时走与 `/ops/kimi-code/chat` 一致的 deep/react 事件展示
- [ ] **deliverables 区**：只读列表（路径 · run_id · 类型）· BFF 若需 `GET .../deliverables` 与后端对齐
- [ ] **状态提示**：`dispatched` 横幅更新为「已派工 · 可深析」
- [ ] **授权区**：可选合并「修改/取消」为单按钮（API 仍 `revise`）
- [ ] **manifest / tech-graph**：新 BFF 路由登记
- [ ] **Vitest**：deliverables BFF smoke（若有）

---

## 非范围

- promote（S4）
- probe verify UI（S4）

---

## 验收标准

- [ ] `dispatched` 多轮 deep/react 与单轮 chat 体验一致
- [ ] deliverables 可浏览（至少路径列表）
- [ ] S2 授权/planning 路径不退化
- [ ] `pnpm ci:local` 绿

---

## 给 Cursor

`ops-session-s3-subagent-ui` · Open `ai-ink-brain/` · **HG-AUDIT-R1 pending 拒开工** · PR 批次暂定 S4 后
