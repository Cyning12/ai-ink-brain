# Task · Ops Session S1 Multiturn UI（Session 列表 · 续聊 BFF）

> **状态**：`draft`  
> **epic**：Session Orchestrator · S1 `ops-session-s1-multiturn`  
> **schedule_ref**：SPEC §12.1 S1 · §9.3  
> **关联 SPEC**：`[docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md](../../docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md)` §9.3 · §12 S1  
> **配对后端**：`[task_ops_session_s1_multiturn_api_v1.md](../../../ai-ink-brain-api-python/docs/tasks/active/task_ops_session_s1_multiturn_api_v1.md)`  
> **前置**：S0 done · 后端 S1 API 可联调（可并行开发 · 以 OpenAPI/契约为准）

---

## Harness 元信息


| 字段                | 值                                          |
| ----------------- | ------------------------------------------ |
| **task_slug**     | `ops-session-s1-multiturn-ui`              |
| **module_id**     | `OPS-SESSION-ORCH`                         |
| **freeze_id**     | `OPS-SESSION-ORCH-SPEC-V1`                 |
| **test_strategy** | `recommended`                              |
| **worktree_root** | `ai-ink-brain/`                            |
| **git_branch**    | `task/ops-session-s1-multiturn-ui`         |
| **blocked_by**    | 后端 `ops-session-s1-multiturn-api`（契约冻结后联调） |
| **blocks**        | S2 UI 授权区扩展                                |




### 人工闸 `human_gate`


| human_gate_id | status     | blocks_hats       | 说明        |
| ------------- | ---------- | ----------------- | --------- |
| HG-TASK-DRAFT | `approved` | 20-task-audit, 30 | 00 起草     |
| HG-AUDIT-R1   | `approved` | 30                | 20 R1 后人签 |


---



## 背景与目标

在 Ink Ops Desk 增加 **Session 多轮入口**：列表页 + 按 `session_id` 续聊。BFF 转发 api-python Session API；复用现有 Ops Chat 组件模式（参考 `app/ops/kimi-code/chat`）。

**完成态一句话**：维护者可在 `/ops/kimi-code/sessions` 查看 session 列表 · 点击进入 `/ops/kimi-code/sessions/[session_id]` 多轮对话 · URL 可分享续聊 · **不含** S2 授权按钮区。

---



## 范围

- [ ] **BFF**：`app/api/ops/sessions/route.ts` · `app/api/ops/sessions/[session_id]/route.ts` · `.../messages/route.ts` · `.../events/route.ts`（`forwardOpsRequest` + `requireOpsDeskAccess`）
- [ ] **列表页**：`app/ops/kimi-code/sessions/page.tsx` — status · title · updated_at · 新建 session
- [ ] **续聊页**：`app/ops/kimi-code/sessions/[session_id]/page.tsx` — 加载历史摘要 + 多轮输入 · 展示 `run_id` / events 时间线（可复用 `OpsChatClient` 或薄封装）
- [ ] **导航**：`app/ops/kimi-code/layout.tsx` 增加 Sessions 入口（与 Chat/Graph 并列）
- [ ] **Vitest**：BFF 路由契约 smoke（mock `forwardOpsRequest`）· 可选组件快照



## 非范围

- 授权按钮「授权并开始」「修改计划」（**S2**）
- promote 向导（**S4**）
- Playwright E2E（可选 follow-up）
- 改 api-python 实现（配对后端 task）

---



## 依赖与引用


| 依赖项         | 路径                                                                 |
| ----------- | ------------------------------------------------------------------ |
| 现有 Chat BFF | `app/api/ops/chat/messages/route.ts`                               |
| Ops 鉴权      | `lib/auth/ops-session.ts`                                          |
| 转发          | `lib/server/forward-ops-request.ts`                                |
| Chat UI 参考  | `components/ops/OpsChatClient` · `app/ops/kimi-code/chat/page.tsx` |
| SPEC §9.3   | 页面路径与行为                                                            |


---



## 行为变更（Delta）



### ADDED

- **Requirement**：Session 列表与续聊路由。  
  - **Scenario**：`s1-ui-session-list` — GIVEN ops 登录 WHEN 打开 `/ops/kimi-code/sessions` THEN 展示 session 行与新建按钮。
- **Requirement**：续聊携带 session_id。  
  - **Scenario**：`s1-ui-resume` — GIVEN 有效 session_id WHEN 打开详情页并发送消息 THEN BFF POST `/api/ops/sessions/{id}/messages`。

---



## 失败路径


| #   | Scenario ID         | 触发条件          | 系统行为               | 用户可见        |
| --- | ------------------- | ------------- | ------------------ | ----------- |
| F1  | `fp-ui-session-404` | 无效 session_id | 详情页错误态 + 回列表       | 未找到 session |
| F2  | `fp-ui-ops-denied`  | 未登录 ops       | 302/403 与现有 ops 一致 | 登录提示        |


---



## 验收标准

- [ ] `/ops/kimi-code/sessions` 列表可渲染（空态 + 有数据）
- [ ] `/ops/kimi-code/sessions/[session_id]` 可发多轮消息并看到回复
- [ ] BFF 路径与后端 Session API 对齐
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [ ] 现有 `/ops/kimi-code/chat` 单轮页不退化

---



## 给 Cursor

`ops-session-s1-multiturn-ui` · Open `ai-ink-brain/` · 配对 api-python S1 API · SPEC §9.3 · **非 S2 授权 UX**