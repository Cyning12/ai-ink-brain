## 这是什么
这里是 `ai-ink-brain`（前端）仓的 Cursor Project Rules，使用 `.mdc` 文件模块化维护。

## 如何生效
- 规则文件：本目录下 `*.mdc`
- 仓内导航入口：`ai-ink-brain/AGENTS.md`

## 文件分工（当前）
- `10-tech-graph.mdc`：前端 `_tech_graph/` 规范与双轨说明
- `20-tech-graph-update.mdc`：图谱增量更新规则
- `30-frontend-architecture.mdc`：Next.js 15 架构规范、API 边界、Streaming、性能与数据约束
- `40-ui-stability.mdc`：视觉风格（水墨极简）与稳定性/错误展示、前端防幻觉约束

## 维护约定
- 新规则尽量落在对应主题 `.mdc`；避免跨文件重复。
- 规则变更若影响流程/结构：同步更新 `docs/_tech_graph/`。
