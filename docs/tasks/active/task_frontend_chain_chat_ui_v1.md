# 前端：Chain Chat UI（v1）— 时间线展示工具调用 + SQL/图表

状态：pending  
关联：后端事件模型任务 `ai-ink-brain-api-python/docs/tasks/task_ui_chain_events_backend.md`  
设计参考：`ai-ink-brain-api-python/docs/UI/v1/UI-01-chain-chat-upgrade.md`

## 背景与目标

现有 Chat UI 只能看到最终回答；需要升级为“可观测链式对话 UI”，在一次对话中展示：

- 工具调用链（start/end、输入输出、耗时）
- SQL 结果表格（rows/columns）
- 图表（image/spec）

## 范围

- 新增独立页面路由（建议）：`/chain-chat`（不影响现有 `/chat`）
- UI 三栏布局：
  - 左：消息流
  - 中：Chain Timeline（核心）
  - 右：工具开关/推荐问法（v1 可简化）
- 支持 Debug 折叠区

## 非范围

- 不做链路图 Graph（v1 只做 Timeline）
- 不做权限/审计/敏感字段（后续）

## 依赖（后端）

需要后端提供 JSON：

- `POST /api/py/chain/chat`（或等价 debug 模式）
- 返回 `events[]`（见后端任务的 schema）

## UI 组件建议

- 基础：shadcn/ui（Accordion/Tabs/ScrollArea/Table/Badge）
- 图表：Recharts（v1）

## 验收标准

- [ ] 能发送问题并收到 `events[]`
- [ ] 中栏按时间顺序展示事件（至少 message/tool/sql/error）
- [ ] SQL 结果表展示前 20 行，支持复制 SQL
- [ ] 图表事件可展示（image 或 spec，v1 任一即可）
- [ ] 不影响现有 `/chat` 页面

## 实现备忘

- 建议新增组件：
  - `components/ChainTimeline.tsx`
  - `components/ChainEventCard.tsx`
  - `components/SqlResultTable.tsx`
  - `components/ChartView.tsx`
- 若后端暂未提供 `chart.*`，前端先只渲染 SQL 表即可

