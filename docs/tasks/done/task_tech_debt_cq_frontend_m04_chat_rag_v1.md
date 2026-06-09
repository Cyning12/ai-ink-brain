# Tech-debt M04 · Chat / RAG 页面栈

> **状态**：`done`  
> **epic**：[`task_tech_debt_code_quality_frontend_epic_v1.md`](../done/task_tech_debt_code_quality_frontend_epic_v1.md)  
> **module_id**：M04  
> **depends_on**：M03 `done`  
> **SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-cq-frontend-m04-chat-rag` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **chain_next** | `task_tech_debt_cq_frontend_m05_auth_env_v1.md` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | `production` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

## 背景与目标

对齐 **F-09 / F-10 / F-11**：Chat/RAG 路径组件边界与重复逻辑抽取。

## 范围

| 路径 | 初稿行数 | 动作 |
|------|---------|------|
| `components/ChatPanel.tsx` | 556 | 抽共享 auth header 构建至 `lib/chat/buildChatAuthHeaders.ts`（若与 chatApi 重复） |
| `lib/chat/chatApi.ts` | 356 | 审查 F-11 重复；统一 fetch 封装 |
| `app/chat/**` | — | Server/Client 边界审查 |
| `components/chat/**` | — | 若存在则对齐 F-09 |

## 非范围

- `components/unified-chat/`（M03 已覆盖）
- RAG 检索逻辑（后端）

## 验收标准（10 帽细化）

- [x] **F-11**：ChatPanel 与 chatApi 间 auth header / fetch 逻辑无 ≥2 处重复（已抽 `lib/chat/buildChatAuthHeaders.ts`）
- [x] **F-09**：`app/chat/page.tsx` 为 Server Component 包裹 Client 叶子（无 `'use client'`）
- [x] **F-01**：`ChatPanel.tsx` 555 行 — **明示例外**：Epic 阶段 1 保留单文件；ChainEventCard 偿还留 M06
- [x] **F-08**：无新增 `any`
- [x] `pnpm lint` → `pnpm test` → `pnpm build` 绿
- [x] commit + 链式 **M05**

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 |
|---|----------|----------|--------|
| F1 | Chat 流式回归 | 停链 | 是 |

## 实现备忘（子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `lib/chat/buildChatAuthHeaders.ts`、`components/ChatPanel.tsx`、`app/chat/page.tsx` |

## ### 自检结论（执行者）

| 命令 | cwd | 退出码 | 摘要 |
|------|-----|--------|------|
| `rg buildChatbiBearerHeaders components/ChatPanel.tsx` | `ai-ink-brain` | 0 | 经 `lib/chat/buildChatAuthHeaders` |
| `head app/chat/page.tsx` | — | — | 无 `'use client'` |
| `wc -l ChatPanel.tsx` | — | — | 555（例外已记） |
| 三门禁 | `ai-ink-brain` | 0 | lint/test/build 全绿 |

**Judgment**：hat_self **pass**
