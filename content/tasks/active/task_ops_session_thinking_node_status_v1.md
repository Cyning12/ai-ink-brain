# Task · Ops Session UX · thinking 节点态 + 运行事件流增强

> **状态**：`draft` · **需求池**（S2 验收后 / S3 前）  
> **epic**：Session Orchestrator · Ops Desk UX  
> **关联**：S2 UI [`task_ops_session_s2_langgraph_00_ui_v1.md`](./task_ops_session_s2_langgraph_00_ui_v1.md) · SPEC §7 图节点

---

## Harness 元信息（2.18 迁移补录）

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 背景与目标

S2 已将运行中空态文案统一为 **thinking……** + spinner（`OpsThinkingHint`）。下一版需按 **agent 实际执行节点**（`node_id` / `event_type`）实时更新提示文案，并与 Session 00 图（plan · present · auth · synthesize）及 Deep/ReAct 链对齐。

**完成态一句话**：用户发送消息后，UI 根据最新 `ops_run_events` 展示如「规划中…」「等待授权…」「综合答复中…」等节点级 thinking 文案，而非静态 `thinking……`。

---

## 范围

- [ ] `OpsThinkingHint` 支持 `label` 由事件流驱动（poll `after_seq` 或 SSE）
- [ ] 节点 → 文案映射表（00 层 + deep/react 复用 `node_id`）
- [ ] Session `route=session_00` 时展示计划/授权相关节点态
- [ ] 与 `OpsChatClient` / Session 详情页统一组件
- [ ] Vitest：映射函数单测

---

## 非范围

- 后端新增 SSE（可继续 poll）
- S3 subagent 全量时间线

---

## 验收标准

- [ ] 发送消息后 thinking 文案随 events 变化（至少 3 种节点态可观测）
- [ ] session_00 与 deep 路径不互相污染
- [ ] 无事件时回退 `thinking……`

---

## 给 Cursor

需求池 · **非 S2 合并阻塞** · 与 S3 UI 扩展可合并排期
