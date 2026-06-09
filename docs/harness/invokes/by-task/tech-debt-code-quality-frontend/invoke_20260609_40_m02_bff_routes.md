# invoke · 40 self-check · M02 bff-routes

| 字段 | 值 |
|------|-----|
| task_slug | `tech-debt-cq-frontend-m02-bff-routes` |
| task | `docs/tasks/active/task_tech_debt_cq_frontend_m02_bff_routes_v1.md` |
| hat | 40 |
| git_branch | `task/tech-debt-code-quality-frontend` |
| date | 2026-06-09 |

## §3 执行摘要

- M02 40 pass：8× `app/api/py/**/route.ts` 经 `forwardToPyApi`；`rg` 零直连 fetch/env
- 最大 route 33 行；RAG 逻辑在 `lib/server/forward-py-rag-chat.ts`
- 三门禁全绿
- 链式续跑：**M03** `task_tech_debt_cq_frontend_m03_unified_chat_v1.md`

## Judgment

- hat_self: **pass**
