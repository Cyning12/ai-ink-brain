# Task · Ops Desk P1-5 · Chat UI + BFF

> **状态**：`done`  
> **合并 PR**：https://github.com/Cyning12/ai-ink-brain/pull/84  
> **分支 HEAD SHA**：`ccb58f226f8383cda60f68ba96ab2f1bb836e9ad`  
> **合并 SHA**：待用户/Claude Code 完成 merge 后填入  
> **SPEC**：§4.6 · §4.3  
> **图谱**：[`14_flow_ops_chat.md`](../../docs/_tech_graph/14_flow_ops_chat.md)  
> **后端契约**：[`16_flow_ops_chat.md`](../../../ai-ink-brain-api-python/docs/_tech_graph/16_flow_ops_chat.md) · merge **`b0af89df`**（PR #187）  
> **依赖**：P1-1～3 已 merge  
> **后继**：P1 Demo 人类验收（与 P1-6 合并 · 非本 task 阻塞）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p1-chat-ui` |
| **test_strategy** | `required` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P1-CHAT-UI` |
| **git_branch** | `task/ops-desk-p1-chat-ui` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |

---

## 交付摘要

- 替换 `app/api/ops/[...slug]/route.ts` skeleton，新增三条 BFF 路由：
  - `POST /api/ops/chat/messages`
  - `GET /api/ops/runs/[id]`
  - `GET /api/ops/runs/[id]/events`
- 新增 `lib/server/forward-ops-request.ts`，BFF 转发时注入服务端 `x-ops-secret`。
- 新增 `app/ops/kimi-code/chat/page.tsx` + `components/ops/OpsChatClient.tsx`：
  - 发送消息后保存 `run_id`
  - `after_seq` 增量轮询 events
  - 渲染运行时间线与最终答案
- `app/ops/kimi-code/layout.tsx` Chat 导航改为可点击链接。
- 新增 Vitest：`lib/server/forward-ops-request.test.ts`、`lib/ops/chat.test.ts`。
- 更新 `docs/_tech_graph/14_flow_ops_chat.graph.yaml` 锚点并重新导出 `graph.json`、编译 `.md`。

### KPI（00）

| 检查项 | 结果 |
| --- | --- |
| `pnpm lint` | 绿（2 条 pre-existing warning） |
| `pnpm test` | 绿（21 files / 91 tests） |
| `pnpm build` | 绿 |
| `pnpm tech-graph:yaml-check` | 绿 |
| `pnpm tech-graph:graph-check` | 绿 |
| 50 review | PASS，落盘 `Projects/docs/harness/reviews/task_ops_desk_p1_chat_ui_reinspect_R1_20260622.md` |

---

## 背景与目标

实现 `/ops/kimi-code/chat`：BFF 转发 Python `/ops/*` · events 时间线 · `after_seq` 轮询。**禁止**走 `/api/py/unified/chat`。

### 完成态

- [x] `app/ops/kimi-code/chat/page.tsx` + 客户端组件（借鉴 unified-chat **trace 壳** · 非数据源）
- [x] BFF 细化（替换 skeleton）：
  - `POST /api/ops/chat/messages` → Python `POST /ops/chat/messages`
  - `GET /api/ops/runs/[id]` · `GET /api/ops/runs/[id]/events`
  - 透传 `x-ops-secret`（与 `lib/auth/ops-session` · `OPS_DESK_SECRET` 对齐）
- [x] `lib/ops/` 或 `lib/server/forward-ops-*.ts` · 复用 `lib/py-service-proxy` 模式
- [x] layout 导航 Chat 由 placeholder → 可点击链
- [x] `pnpm test` 覆盖 BFF/轮询逻辑（Vitest · required）
- [x] 更新 `14_flow_ops_chat.graph.yaml` 锚点 · tech-graph check 绿

---

## 非范围

- LangGraph（P1-4）· demo-cache 表（P1-6 · 可并行另一 Agent）
- 浏览器人类 checklist（P1 Demo · P1-5+6 merge 后统一做）

---

## 验收标准（脚本 · merge 卡点）

- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [x] `pnpm tech-graph:yaml-check` 等 graph 步骤绿（若改 `_tech_graph`）
- [x] Vitest：BFF 转发 mock · `after_seq` 增量合并逻辑
- [x] **不**要求本 task 单独人类 checklist

---

## 失败路径

| # | 触发 | 行为 |
| --- | --- | --- |
| F1 | 无 ops cookie | middleware → `/ops/login` |
| F2 | Python 不可达 | UI 展示结构化错误 · 已发 run 则 events 轮询可续 |
| F3 | 误走 unified chat | 禁止 · BFF 仅 `/ops/*` |

---

## 给 Cursor

`ops-desk-p1-chat-ui` · Open `ai-ink-brain/` · invoke `ops-desk-p1-chat-ui/PROMPT_CHAIN_30_40_50_CLOSE_v1.md`。
