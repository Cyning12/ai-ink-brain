## 这是什么
这里是 `ai-ink-brain`（前端）仓的 Cursor Project Rules，使用 `.mdc` 文件模块化维护。

## 如何生效
- 规则文件：本目录下 `*.mdc`
- 仓内导航入口：`ai-ink-brain/AGENTS.md`（`<!-- RULES_AUTO_GENERATED -->` 以下由 `python3 tools/gen_agents_md.py` 同步，勿手改）

## 文件分工（当前）
- `00-core.mdc`：语言、职责边界、修改前确认、完成后报告（`globs: *`）
- `05-harness-semi-auto.mdc`：Harness 半自动续跑、`docs/tasks/active/` 与 `docs/harness/invokes/by-task/`（`alwaysApply`）
- `06-harness-content.mdc`：Harness 落盘 taxonomy、工作区 prompts 单源、KPI v1.2 新建 task 必填（`alwaysApply`）
- `08-docs-diary.mdc`：`docs/diary/`、`content/diary/` 非必读；实验轨 jsonPKmermaid 跨仓只读后端（`alwaysApply`）
- `10-tech-graph.mdc`：`_tech_graph/` 生产轨 + `graph_query` 机器轨；globs 含 `app/`、`components/`、`lib/`
- `20-tech-graph-update.mdc`：图谱增量更新规则
- `30-frontend-architecture.mdc`：Next.js 15 架构规范、API 边界、Streaming、性能与数据约束
- `40-ui-stability.mdc`：视觉风格（水墨极简）与稳定性/错误展示、前端防幻觉约束
- `50-agent-observability.mdc`：Agent 可观测性与成本控制（执行报告、Loop 防护、模式选择）

## 维护约定
- 新规则尽量落在对应主题 `.mdc`；避免跨文件重复。
- 规则变更若影响流程/结构：同步更新 `docs/_tech_graph/`，并运行 `python3 tools/gen_agents_md.py` 刷新 `AGENTS.md` 自动段。
