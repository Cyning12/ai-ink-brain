# Intent Hints Step2 · 前端 Timeline 可观测 · 验收清单（关账前 · 维护者用）

| 项 | 内容 |
|----|------|
| **task** | `docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md` |
| **task_slug** | `frontend-intent-hints-step2-observability-v1` |
| **freeze_id** | `CHATBI-INTENT-HINTS-FE-OBS@2026-06-04` |
| **分支** | `task/frontend-intent-hints-step2-observability-v1` |
| **acceptance_interaction** | `required` |
| **Agent 批次** | 2026-06-04（帽 22 R2 创建 · 50 复检引用） |
| **50 复检** | `docs/tasks/reinspect_results/reinspect_frontend_intent_hints_step2_observability_v1_20260604_v1.md`（50 后补链） |

> 在 **浏览器 / Preview** 上逐项勾选。关账须 task 验收 + **HG-REINSPECT** approved（仅人）。

---

## A. 环境与前置

| # | 检查项 | 通过标准 | Agent | 维护者 |
|---|--------|----------|-------|--------|
| A1 | 分支与 dev 可跑 | `task/frontend-intent-hints-step2-observability-v1` · `pnpm dev` 无报错 | — | ☐ |
| A2 | Unified Chat 可解锁 | Portfolio 或 dev 下 ChatBI token 解锁成功 | — | ☐ |
| A3 | Router Debug 可见 | 页面调试区可开 **Router Debug ON**（`debug_router`） | — | ☐ |
| A4 | 后端 SSE 含新字段（任选） | 对接 PR #111 / staging API，或 mock fixture 含 `intent_path` | — | ☐ |

---

## B. 前端交互（核心 · SPEC §6）

| # | 步骤 | 通过标准 | Agent | 维护者 |
|---|------|----------|-------|--------|
| B1 | Debug **关** · Timeline | `agent.intent` / `agent.think` **无**新增 path/仲裁/软超时行 | — | ☐ |
| B2 | Debug **开** · `agent.intent` | 可见 path/attempt；仲裁时 badge「配置仲裁 → rag」 | — | ☐ |
| B3 | Debug **开** · `agent.think` step-1 | 软超时 badge「Agent 软超时 → V1」+ path 折叠 | — | ☐ |
| B4 | Router Debug · evidence | evidence 上方 Intent 路径摘要条 | — | ☐ |
| B5 | rule_hits | `rule:portfolio_*` chips 正常 | — | ☐ |
| B6 | 旧 payload | 缺字段不报错，显示 `—` | ☑ 单测 | ☐ 浏览器 |

---

## C. 自动化 / CI

| 命令 / 项 | Agent | 维护者 |
|-----------|-------|--------|
| `pnpm lint` | ☑ 40 自检 | ☐ |
| `pnpm test` | ☑ 52 passed | ☐ |
| `pnpm build` | ☑ 40 自检 | ☐ |

---

## D. Harness 关账（CLOSE 前）

| 工件 | 状态 |
|------|------|
| 22 R2 review | ☐ |
| 50 reinspect | ☐ |
| `HG-REINSPECT` | ☐ pending → approved（**仅人**） |
| task `### KPI（00）` | ☐ |
| `git mv` → `done/` | ☐ |

---

## H. 维护者签收

| ☐ **可关账** |
| ☐ **豁免**（注明：____________） |
| ☐ **仍阻塞**（项：____________） |

**签字 / 日期**：____________
