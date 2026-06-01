# specs（任务相关规格）

与后端 `docs/tasks/specs/` 对齐：存放 **`SPEC-*.md`**，可被多个 `content/tasks/active/` 下 task 交叉引用；**不**替代仓库内 `docs/spec/` 等既有规格真值目录。

边界说明见上级 [`../README.md`](../README.md)。

## 索引

| 文件 | 说明 |
| --- | --- |
| [`SPEC-tech_graph_v2_frontend_parity_v1.md`](SPEC-tech_graph_v2_frontend_parity_v1.md) | 前端 graph_v2 对齐后端；§11 执行顺序与工作量 |
| [`MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`](MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md) | 迁移实践（Quickstart 样板种子） |
| [`SPEC-portfolio_demo_site_v1_zh.md`](SPEC-portfolio_demo_site_v1_zh.md) | Portfolio 演示模式（投递 2026-06-09）；**active** · `freeze_id` **`PORTFOLIO-RAG-DEMO@2026-06-01`** |
| [`PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md`](PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md) | 上述 SPEC · ≤5 轮读问解 · §5 **semi_auto 链至 50** |
| [`PROMPT_50_invoke_portfolio_demo_site_v1_zh.md`](PROMPT_50_invoke_portfolio_demo_site_v1_zh.md) | Epic 22 签收后 · **Task 子 Agent** 50 独立复检 · §5 可复制 Prompt |
| [`PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md`](PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md) | **W1 子 task** 50 · 对齐后端 `PROMPT_50_startup` · invoke 已填真值 |
| [`PROMPT_semi_auto_startup_portfolio_w1_v1_zh.md`](PROMPT_semi_auto_startup_portfolio_w1_v1_zh.md) | W1 · gates approved 后 **§3 一键启动** 30→40→22 R2→Task 50 |
