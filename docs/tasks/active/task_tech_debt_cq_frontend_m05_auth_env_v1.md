# Tech-debt M05 · 鉴权与环境变量

> **状态**：draft  
> **epic**：[`task_tech_debt_code_quality_frontend_epic_v1.md`](task_tech_debt_code_quality_frontend_epic_v1.md)  
> **module_id**：M05  
> **depends_on**：M04 `done`  
> **SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-cq-frontend-m05-auth-env` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **chain_next** | `task_tech_debt_cq_frontend_m06_components_misc_v1.md` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | `production` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

## 背景与目标

对齐 **F-03 / F-13 / AF-06**：密钥仅服务端；`site-mode` 集中；无 Client 误读非 PUBLIC env。

## 范围

| 路径 | 动作 |
|------|------|
| `lib/auth.ts` + `lib/auth/**` | 审查 env 读取经 `admin-env`/`sync-admin-env`；dev 日志不打印 token 全文 |
| `lib/site-mode.ts` | 已集中；确认无组件内散落 `NEXT_PUBLIC_SITE_MODE` 字符串比较 |
| `lib/supabase.ts` + `lib/supabase/**` | service role 仅服务端 |
| `app/api/auth/session/route.ts` | PY_API_URL 探测改经 `getPyApiBaseUrl()`（若仍直读 env） |

## 非范围

- 改鉴权契约 / 新增 env 变量

## 验收标准（10 帽细化）

- [ ] **AF-06**：`grep -r 'process.env' components/ app/ --include='*.tsx' | grep -v NEXT_PUBLIC` 零命中（Client 路径）
- [ ] **F-13**：`lib/auth.ts` dev 日志不含完整 token（仅 prefix/len）
- [ ] **F-03**：`app/api/auth/session/route.ts` 不直读 `process.env.PY_API_URL`（用 M01 helper）
- [ ] **F-03**：组件内 `site-mode` 均经 `lib/site-mode.ts` 导出函数
- [ ] `pnpm lint` → `pnpm test` → `pnpm build` 绿
- [ ] commit + 链式 **M06**

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 |
|---|----------|----------|--------|
| F1 | 鉴权回归 | 停链 | 是 |

## 实现备忘（子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | |

## ### 自检结论（执行者）

（40 帽回填）
