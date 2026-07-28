# Tech-debt M03 · Unified Chat 栈

> **状态**：`done`  
> **epic**：[`task_tech_debt_code_quality_frontend_epic_v1.md`](../done/task_tech_debt_code_quality_frontend_epic_v1.md)  
> **module_id**：M03  
> **depends_on**：M02 `done`  
> **SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-cq-frontend-m03-unified-chat` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **chain_next** | `task_tech_debt_cq_frontend_m04_chat_rag_v1.md` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | `production` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 背景与目标

对齐 **F-01 / F-09 / F-10 / AF-02 / AF-03**：Server/Client 边界、Hook 纪律；`UnifiedChatPageClient.tsx`（1147 行）须拆出 ≥1 独立 hook/模块。

## 范围

| 路径 | 初稿行数 | 动作 |
|------|---------|------|
| `components/unified-chat/UnifiedChatPageClient.tsx` | 1147 | 抽 transcript/history 至 `lib/unified-chat/hooks/useUnifiedChatTranscript.ts`；目标 ≤900 行（Epic 内阶段 1） |
| `lib/unified-chat/hooks/**` | — | 审查 useEffect 依赖；无链式 trigger |
| `app/unified-chat/page.tsx` | 39 | 保持 Server Component；无 `'use client'` |
| `components/unified-chat/*Panel*.tsx` | ≤264 | 已是 Client 叶子；仅 lint 对齐 |

## 非范围

- `lib/chat/`（M04）
- Unified Chat 业务行为变更

## 验收标准（10 帽细化）

- [x] **F-09**：`app/unified-chat/page.tsx` 无 `'use client'`；Client 仅在 `components/unified-chat/*`
- [x] **F-01**：`UnifiedChatPageClient.tsx` 拆出 ≥1 hook 文件；主文件行数下降 ≥150 行（1147→918）
- [x] **F-10**：`lib/unified-chat/hooks/` 无新增 eslint-disable；useEffect deps 完整
- [x] **AF-02**：`app/unified-chat/` 无页面级 useEffect 拉数
- [x] **F-08**：无新增 `any`
- [x] `pnpm lint` → `pnpm test` → `pnpm build` 绿
- [x] commit + 链式 **M04**（M1 外 · 不阻塞签收）

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 |
|---|----------|----------|--------|
| F1 | 拆分导致 Unified Chat 回归 | revert 拆分；缩小 scope | 是 |

## 实现备忘（子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `UnifiedChatPageClient.tsx`、`useUnifiedChatTranscript.ts`、`UnifiedChatPlanPreviewPanel.tsx`、`UnifiedChatUnlockSection.tsx` |

## ### 自检结论（执行者）

| 命令 | cwd | 退出码 | 摘要 |
|------|-----|--------|------|
| `wc -l UnifiedChatPageClient.tsx` | `ai-ink-brain` | — | **918** 行（基线 1147，↓229） |
| `wc -l useUnifiedChatTranscript.ts` | — | — | 100 行 hook |
| `pnpm lint` / `test` / `build` | `ai-ink-brain` | 0 | 全绿；lint 0 error |

**Judgment**：hat_self **pass** · M1 签收子集最后一棒
