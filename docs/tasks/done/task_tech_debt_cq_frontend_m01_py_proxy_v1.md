# Tech-debt M01 · Python 代理层（py-service-proxy）

> **状态**：`done`  
> **epic**：[`task_tech_debt_code_quality_frontend_epic_v1.md`](task_tech_debt_code_quality_frontend_epic_v1.md)  
> **module_id**：M01  
> **SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)  
> **后端依赖**：无

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-cq-frontend-m01-py-proxy` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **chain_prompt** | 工作区 `PROMPT_cursor_task_chain_serial_v1.md` |
| **chain_next** | `task_tech_debt_cq_frontend_m02_bff_routes_v1.md` |
| **semi_auto** | `false` |
| **audit_profile** | `post_close` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | `production` |
| **acceptance_interaction** | `not_applicable` |
| **acceptance_interaction_note** | 内部 refactor |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

## 背景与目标

对齐 L2 **F-03 / F-05 / AF-01**：`PY_API_URL` 解析与 Python 转发 **单点** 于 `lib/py-service-proxy.ts`；消除 M01 路径内散落 `process.env.PY_API_URL ?? "http://127.0.0.1:8000"`。

## 范围

| 路径 | 动作 |
|------|------|
| `lib/py-service-proxy.ts` | 导出 `getPyApiBaseUrl`、`buildPyApiUrl`、`forwardToPyApi`、鉴权头 helper；保留 `forwardToPyAdmin` |
| `lib/server/chatbi-access-verify-upstream.ts` | 改用 `getPyApiBaseUrl()` |
| `lib/py-service-proxy.test.ts` | **新增** URL 构建与 header helper 单测 |

**路径 glob**：`lib/py-service-proxy.ts`、`lib/server/**`、`lib/chatbi-client.ts`（仅 header 常量，不改行为）

## 非范围

- `app/api/py/**`（M02）
- 改 Python 后端契约

## 验收标准（10 帽细化 · 可命令断言）

- [x] **AF-01（M01 范围）**：`grep -r 'process.env.PY_API_URL\|127.0.0.1:8000' lib/py-service-proxy.ts lib/server/` 仅出现在 `py-service-proxy.ts` 的 `getPyApiBaseUrl` 实现内（注释除外）
- [x] **F-03**：导出 `getPyApiBaseUrl()` 为唯一 PY_API_URL 解析入口
- [x] **F-05**：`forwardToPyApi` 连接失败返回结构化 JSON `{ ok: false, error, detail? }` status 503
- [x] **F-08**：无新增 `any`；`pnpm lint` 绿
- [x] **F-12**：`lib/py-service-proxy.test.ts` ≥3 case（base URL 去尾斜杠、path 拼接、chatbi header 解析）
- [x] `pnpm lint` → `pnpm test` → `pnpm build` 绿
- [x] commit 至 `task/tech-debt-code-quality-frontend`
- [x] 链式派发 **M02**（40 pass 后）

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 |
|---|----------|----------|--------|
| F1 | proxy 转发失败 | 503 + 结构化 body；保持 status 语义 | 是 |
| F2 | 单测红 | 停链；输出失败 case | 是 |

## 实现备忘（子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `lib/py-service-proxy.ts`、`lib/server/chatbi-access-verify-upstream.ts`、`lib/py-service-proxy.test.ts` |
| 图谱变更点 | 通常无 |
| 10 帽扫描 | 初稿 8 处 PY_API_URL 散落（2×lib + 6×app/api/py 待 M02） |

## ### 自检结论（执行者）

| 命令 | cwd | 退出码 | 摘要 |
|------|-----|--------|------|
| `rg 'process.env.PY_API_URL\|127.0.0.1:8000' lib/py-service-proxy.ts lib/server/` | `ai-ink-brain` | 0 | 仅 `py-service-proxy.ts` 内 3 处（含 DEFAULT） |
| `pnpm lint` | `ai-ink-brain` | 0 | 0 error（2 warnings 为 UnifiedChat 遗留） |
| `pnpm test` | `ai-ink-brain` | 0 | 16 files / 64 tests pass；含 `py-service-proxy.test.ts` |
| `pnpm build` | `ai-ink-brain` | 0 | Next build 成功 |

**Judgment**：hat_self **pass** · gate **须人审:HG-M1-SIGNOFF**（M1 链末）
