# Task · Ops Session S2 LangGraph 00 UI（授权区 · auth BFF · 计划呈现）

> **状态**：`done（2026-07-02 本地验收通过）`  
> **epic**：Session Orchestrator · S2 `ops-session-s2-langgraph-00`  
> **schedule_ref**：SPEC §12.1 S2 · §6.3 · §9.3  
> **关联 SPEC**：[`SPEC_ops_session_orchestrator_v1_zh.md`](../../docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md) §6 · §9.3 · §12 S2  
> **配对后端**：[`task_ops_session_s2_langgraph_00_api_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/done/task_ops_session_s2_langgraph_00_api_v1.md)  
> **本地验收**：[`CHECKLIST_ops_session_s2_local_acceptance_v1_zh.md`](../../../docs/harness/reviews/CHECKLIST_ops_session_s2_local_acceptance_v1_zh.md)  
> **PR**：暂缓 · 与 S3/S4 合并批次开 PR（`task/ops-session-s2-langgraph-00-ui`）  
> **前置**：S1 UI done · PR #106 · 后端 S2 API 联调通过

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-session-s2-langgraph-00-ui` |
| **module_id** | `OPS-SESSION-ORCH` |
| **freeze_id** | `OPS-SESSION-ORCH-SPEC-V1` |
| **test_strategy** | `recommended` |
| **worktree_root** | `ai-ink-brain/` |
| **git_branch** | `task/ops-session-s2-langgraph-00-ui` |
| **blocked_by** | 后端 `ops-session-s2-langgraph-00-api`（auth 契约） |
| **blocks** | S3 UI 扩展 |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | `approved` | 20-task-audit, 30 | 00 起草 · 2026-07-02 |
| HG-AUDIT-R1 | `approved` | 30 | 20 R1 后人签 · 2026-07-02 |

---

## 背景与目标

S1 已交付 Session 列表与续聊（无授权区）。本 task 在续聊页增加 **00 计划呈现 + 结构化授权 UX**（BLOCKERS **B3**），BFF 转发 `POST .../auth`，并与 `session.status` / `gate_summary` 对齐。

**完成态一句话**：`awaiting_auth` 时展示计划摘要 + 三按钮「授权并开始」「修改计划」「取消」· 点击调用 auth API · `dispatched` 后隐藏授权区 · blocked 展示 `gate_id` + 路径 · **不含** promote（S4）。

### 拍板（与后端 S2 对齐）

| # | 决策 |
| --- | --- |
| D1 | **主路径仅按钮** 触发 auth；NL「确认/开始」若做，须 **二次摘要卡** 再点按钮 |
| D2 | `planning` 阶段可继续发 message 改计划（走后端 00 图）· UI 提示「规划中」 |
| D3 | auth 成功后刷新 session 详情 + gate 摘要 |

---

## 范围

- [ ] **BFF**：`app/api/ops/sessions/[session_id]/auth/route.ts` → `POST /api/py/ops/sessions/{id}/auth`
- [ ] **`lib/ops/session.ts`**：`postOpsSessionAuth(sessionId, action)` 类型
- [ ] **组件**：`OpsSessionAuthPanel.tsx`（或扩展 `OpsSessionDetailClient`）— 计划摘要 · 三按钮 · loading/error
- [ ] **续聊页**：`status === awaiting_auth` 显示授权区；`dispatched` 隐藏；`blocked` 错误态 + gate_id
- [ ] **manifest**：`POST /api/ops/sessions/[session_id]/auth` 登记 `_manifest.json`
- [ ] **Vitest**：BFF auth route smoke（mock `forwardOpsRequest`）

---

## 非范围

- promote 向导（S4）
- subagent 时间线增强（S3）
- Playwright E2E（可选 follow-up）
- 改 api-python LangGraph 实现

---

## 依赖与引用

| 依赖项 | 路径 |
| --- | --- |
| S1 UI | `OpsSessionDetailClient` · `OpsChatClient` |
| BFF 模式 | `app/api/ops/sessions/[session_id]/messages/route.ts` |
| SPEC §6.3 | 按钮主 + NL 辅 |
| 本地 CI | `pnpm tech-graph:check` · `pnpm ci:local` |

---

## 行为变更（Delta）

### ADDED

- **Requirement**：Session 授权区。  
  - **Scenario**：`s2-ui-auth-approve` — GIVEN `awaiting_auth` WHEN 点击「授权并开始」THEN BFF POST auth `approve` · UI 刷新为 `dispatched`.
- **Requirement**：blocked 展示。  
  - **Scenario**：`s2-ui-blocked` — GIVEN blocked gate WHEN 打开详情 THEN 展示 `gate_id` 与 task 路径提示.

### MODIFIED

- **Requirement**：续聊页状态驱动布局。  
  - **Previously（S1）**：仅 Chat + 最近摘要 · 无授权区.

---

## 失败路径

| # | Scenario ID | 触发条件 | 系统行为 | 用户可见 |
| --- | --- | --- | --- | --- |
| F1 | `fp-ui-auth-denied` | 未登录 | 与 ops 一致 401/302 | 登录提示 |
| F2 | `fp-ui-auth-409` | 错误 status 点授权 | 展示 API 错误 | 状态不符提示 |
| F3 | `fp-ui-auth-network` | BFF/上游失败 | toast/inline error | 重试提示 |

---

## 验收标准

- [ ] `awaiting_auth` 三按钮可用且调用正确 auth action
- [ ] `approve` 后授权区隐藏 · gate 摘要更新
- [ ] `revise` / `cancel` 后回到可继续对话改计划
- [ ] `_manifest.json` 含 auth route
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm tech-graph:manifest-check` 绿
- [ ] S1 列表/续聊不退化

---

## 给 Cursor

`ops-session-s2-langgraph-00-ui` · Open `ai-ink-brain/` · **HG-AUDIT-R1 pending 拒开工** · B3 · 配对 api S2
