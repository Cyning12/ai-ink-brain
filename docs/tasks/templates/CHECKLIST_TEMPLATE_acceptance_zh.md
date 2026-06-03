# <任务标题> · 验收清单（关账前 · 维护者用）

| 项 | 内容 |
|----|------|
| **task** | `docs/tasks/active/<task_filename>.md` |
| **task_slug** | `<task_slug>` |
| **freeze_id** | `<freeze_id>` |
| **分支** | `task/<slug>`（可选） |
| **acceptance_interaction** | `required` |
| **Agent 批次** | YYYY-MM-DD（<帽：30–50>） |
| **50 复检** | `docs/tasks/reinspect_results/<reinspect_filename>.md`（50 后补链） |

> 在 **浏览器 / Preview / 生产 URL** 上逐项勾选。关账须满足 task 验收标准 + **HG-REINSPECT**（若存在）approved。

---

## A. 环境与前置（<按需改名>）

| # | 检查项 | 通过标准 | Agent | 维护者 |
|---|--------|----------|-------|--------|
| A1 | | | — | ☐ |
| A2 | | | — | ☐ |

---

## B. 前端交互步骤（核心）

| # | 步骤 | 通过标准 | Agent | 维护者 |
|---|------|----------|-------|--------|
| B1 | | | — | ☐ |
| B2 | | | — | ☐ |

---

## C. 自动化 / CI（可选）

| 命令 / 项 | Agent | 维护者 |
|-----------|-------|--------|
| `pnpm lint` | ☐ | ☐ |
| `pnpm test` | ☐ | ☐ |
| `pnpm build` | ☐ | ☐ |

---

## D. Harness 关账（CLOSE 前）

| 工件 | 状态 |
|------|------|
| 22 R1/R2 `docs/harness/reviews/...` | ☐ |
| 50 reinspect | ☐ |
| `HG-REINSPECT`（若有） | ☐ pending → approved（**仅人**） |
| task `### KPI（00）` | ☐ |
| `git mv` → `done/` | ☐ |

---

## H. 维护者签收

| ☐ **可关账**（本节 + 上表全绿 / 已书面豁免） |
| ☐ **豁免**（注明：____________） |
| ☐ **仍阻塞**（项：____________） |

**签字 / 日期**：____________
