# invoke · 40 self-check · M01 py-proxy

| 字段 | 值 |
|------|-----|
| task_slug | `tech-debt-cq-frontend-m01-py-proxy` |
| task | `docs/tasks/done/task_tech_debt_cq_frontend_m01_py_proxy_v1.md` |
| hat | 40 |
| git_branch | `task/tech-debt-code-quality-frontend` |
| m1_tracking | 工作区 `task_harness_m1_epic_orchestration_frontend_pilot_v1.md` |
| date | 2026-06-09 |

## §3 执行摘要

- M01 40 pass：`lib/py-service-proxy.ts` 单点 + `lib/py-service-proxy.test.ts`（≥3 case）
- AF-01：`lib/server/` 无散落 `PY_API_URL`
- 三门禁：`pnpm lint` / `pnpm test` / `pnpm build` 退出码 0
- 链式续跑：**M02** `task_tech_debt_cq_frontend_m02_bff_routes_v1.md`

## Judgment

- hat_self: **pass**
- gate: 须人审 **HG-M1-SIGNOFF**（M03 完成后）
