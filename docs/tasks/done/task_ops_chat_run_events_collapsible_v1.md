# Task · Ops Chat · 运行事件折叠与布局调整

> **状态**：`done（2026-06-26 验收通过）`  
> **页面**：`/ops/kimi-code/chat`  
> **图谱**：[`14_flow_ops_chat.md`](../../_tech_graph/14_flow_ops_chat.md)  
> **前置**：[`content/tasks/done/task_ops_desk_p1_chat_ui_v1.md`](../../../content/tasks/done/task_ops_desk_p1_chat_ui_v1.md) · Ops Chat 基础 UI

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-chat-run-events-collapsible` |
| **test_strategy** | `not_applicable` — 纯 UI 布局/折叠交互，无新 BFF 或业务逻辑 |
| **freeze_id** | `OPS-CHAT-RUN-EVENTS-COLLAPSIBLE@2026-06-26` |
| **git_branch** | `task/ops-chat-run-events-collapsible` |
| **worktree_root** | `ai-ink-brain/` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

---

## 背景与目标

Ops Chat 运行事件时间线默认占据终答上方，长 run 时用户需先滚过事件才能看到答案。调整为：**终答优先展示**，运行事件置于其下，并支持折叠以节省纵向空间。

### 完成态

- [x] 运行事件区块支持「收起 / 展开」，**默认展开**
- [x] 布局顺序：最终答案在上 · 运行事件在下（运行中无终答时仍展示事件流）
- [x] Fast / Deep / ReAct 三路径共用折叠壳
- [x] 新 run 发送后折叠状态重置为展开

---

## 范围

- [x] 新增 `components/ops/OpsCollapsibleSection.tsx`
- [x] 调整 `components/ops/OpsChatClient.tsx` 区块顺序与折叠状态

## 非范围

- BFF / Python `/ops/*` 契约变更
- 事件复制逻辑重构（保留 header「复制全部」+ 单条复制）
- 图谱锚点增量（无路由/API 拓扑变更）

---

## 验收标准

- [x] run 结束后：终答在上、运行事件在下
- [x] 点击「收起」隐藏事件列表，「展开」恢复；默认展开
- [x] 再次发送问题后事件区默认仍为展开
- [x] 浏览器人工验收通过（2026-06-26）
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿（CI）

---

## 实现备忘

| 文件 | 变更 |
| --- | --- |
| `components/ops/OpsCollapsibleSection.tsx` | 新增 · 标题栏折叠按钮 + `aria-expanded` |
| `components/ops/OpsChatClient.tsx` | 终答区块上移；`eventsExpanded` 状态；三路径统一 `OpsCollapsibleSection` |

### KPI（00）

| 检查项 | 结果 |
| --- | --- |
| 人工验收 | PASS（2026-06-26） |
| `pnpm lint` | CI |
| `pnpm test` | CI |
| `pnpm build` | CI |
