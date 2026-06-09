# Tech-debt M02 · BFF Route Handlers（app/api/py）

> **状态**：`done`  
> **epic**：[`task_tech_debt_code_quality_frontend_epic_v1.md`](../done/task_tech_debt_code_quality_frontend_epic_v1.md)  
> **module_id**：M02  
> **depends_on**：M01 `done`  
> **SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-cq-frontend-m02-bff-routes` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **orchestration** | `Cursor Task 链` |
| **chain_next** | `task_tech_debt_cq_frontend_m03_unified_chat_v1.md` |
| **semi_auto** | `false` |
| **audit_profile** | `post_close` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | `production` |
| **acceptance_interaction** | `not_applicable` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

## 背景与目标

对齐 **F-01 / F-02 / F-05 / AF-01**：8 个 `app/api/py/**/route.ts` 经 M01 `forwardToPyApi` 转发；RAG chat 特殊逻辑下沉 `lib/server/`。

## 范围

| route | 行数（初稿） | 重点 |
|-------|-------------|------|
| `app/api/py/chat/route.ts` | 113 | 拆至 `lib/server/forward-py-rag-chat.ts`；route ≤80 行 |
| `app/api/py/chat/history/route.ts` | 71 | 经 proxy GET + query passthrough |
| `app/api/py/chat/suggested-questions/route.ts` | 51 | 经 proxy GET |
| `app/api/py/unified/chat/route.ts` | 47 | chatbi auth header helper |
| `app/api/py/unified/chat/stream/route.ts` | 55 | SSE stream passthrough |
| `app/api/py/text2sql/chat/route.ts` | 60 | admin 鉴权 + proxy |
| `app/api/py/chain/chat/route.ts` | 43 | admin 鉴权 + proxy |
| `app/api/py/chatbi/access/verify/route.ts` | 44 | chatbi verify + proxy |

## 非范围

- `components/`、`app/chat` 页面（M03/M04）
- `app/api/admin/**`（已用 `forwardToPyAdmin`）

## 验收标准（10 帽细化）

- [x] **AF-01**：`grep -r 'process.env.PY_API_URL\|127\.0\.0\.1:8000\|await fetch' app/api/py/` 零命中（route 内无直连 fetch / 无 env 读取）
- [x] **F-01**：各 `route.ts` ≤80 行；`chat/route.ts` 业务在 `lib/server/`
- [x] **F-02**：含 `requireAdminApiSecret` 的 route 鉴权置于函数顶部早 return
- [x] **F-05**：RAG chat 保留 `UND_ERR_HEADERS_OVERFLOW` 502 与 x-sources 透传语义
- [x] **F-08**：无新增 `any`
- [x] `pnpm lint` → `pnpm test` → `pnpm build` 绿
- [x] commit + 链式 **M03**

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 |
|---|----------|----------|--------|
| F1 | 转发行为回归 | 停链；对照旧 route 响应 | 是 |

## 实现备忘（子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | 8×route.ts + `lib/server/forward-py-rag-chat.ts`（或等价） |

## ### 自检结论（执行者）

| 命令 | cwd | 退出码 | 摘要 |
|------|-----|--------|------|
| `rg 'process.env.PY_API_URL\|127.0.0.1:8000\|await fetch' app/api/py/` | `ai-ink-brain` | 1 | 零命中（exit 1 = no match） |
| route 行数 | — | — | 最大 33 行（chatbi/access/verify）；chat 14 行 |
| `pnpm lint` / `test` / `build` | `ai-ink-brain` | 0 | 全绿 |

**Judgment**：hat_self **pass**
