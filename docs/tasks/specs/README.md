# specs（任务相关规格）

与后端 `docs/tasks/specs/` 对齐：存放 **`SPEC-*.md`**，可被多个 `docs/tasks/active/` 下 task 交叉引用；**不**替代仓库内 `docs/spec/` 等既有规格真值目录。

边界说明见上级 [`../README.md`](../README.md)。

## 索引

| 文件 | 说明 |
| --- | --- |
| [`SPEC-tech_graph_v2_frontend_parity_v1.md`](SPEC-tech_graph_v2_frontend_parity_v1.md) | 前端 graph_v2 对齐后端；§11 执行顺序与工作量 |
| [`MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`](MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md) | 迁移实践（Quickstart 样板种子） |
| [`SPEC-portfolio_demo_site_v1_zh.md`](SPEC-portfolio_demo_site_v1_zh.md) | Portfolio 演示模式（投递 2026-06-09）；**v1.2 draft** · post-#47 rescan · `freeze_id` **`PORTFOLIO-RAG-DEMO@2026-06-01`** |
| [`SPEC-portfolio_admin_sync_auth_v1_zh.md`](SPEC-portfolio_admin_sync_auth_v1_zh.md) | W5 admin/sync BFF 鉴权（`SYNC_ADMIN_SECRET` · ChatBI admin 会话） |
| [`SPEC-harness_acceptance_checklist_v1_zh.md`](SPEC-harness_acceptance_checklist_v1_zh.md) | 关账前 · 前端交互验收 **必有 CHECKLIST**（Skill + 模板） |
| [`投递冲刺_20260609_v1_zh.md`](投递冲刺_20260609_v1_zh.md) | 投递里程碑 · **§2 五问** chip 逐字真值 · 与 Epic SPEC §6.4 对齐 |
| [`PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md`](PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md) | 上述 SPEC · ≤5 轮读问解 · §5 **semi_auto 链至 50** |
| [`PROMPT_50_invoke_portfolio_demo_site_v1_zh.md`](PROMPT_50_invoke_portfolio_demo_site_v1_zh.md) | Epic 22 签收后 · **Task 子 Agent** 50 独立复检 · §5 可复制 Prompt |
| [`PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md`](PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md) | **W1 子 task** 50 · 对齐后端 `PROMPT_50_startup` · invoke 已填真值 |
| [`PROMPT_semi_auto_startup_portfolio_w1_v1_zh.md`](PROMPT_semi_auto_startup_portfolio_w1_v1_zh.md) | W1 · gates approved 后 **§3 一键启动** 30→40→22 R2→Task 50 |
| [`PROMPT_looptask_startup_portfolio_w5_v1_zh.md`](PROMPT_looptask_startup_portfolio_w5_v1_zh.md) | **W5 LoopTask** · 00 开帽 → 10⇄22 → 30→40→22 R2→50 **STOP** |
| [`PROMPT_looptask_startup_portfolio_w2_v1_zh.md`](PROMPT_looptask_startup_portfolio_w2_v1_zh.md) | **W2 LoopTask** · 三内容页 + §4.6 根页/去 Ink · `_rsc` 验收 · 止于 50 |
| [`PROMPT_looptask_startup_portfolio_w3_v1_zh.md`](PROMPT_looptask_startup_portfolio_w3_v1_zh.md) | **W3 LoopTask** · 访客鉴权 · 关账至 CLOSE+KPI |
| [`PROMPT_looptask_startup_portfolio_w4_v1_zh.md`](PROMPT_looptask_startup_portfolio_w4_v1_zh.md) | **W4 LoopTask** · Unified 裁剪 + 五问 chip · **done**（#50） |
| [`PROMPT_looptask_startup_portfolio_w6_v1_zh.md`](PROMPT_looptask_startup_portfolio_w6_v1_zh.md) | **W6 LoopTask（当前）** · 五问 E2E 联调 · 录屏 · CLOSE |
