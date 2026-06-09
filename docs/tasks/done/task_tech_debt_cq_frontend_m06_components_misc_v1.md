# Tech-debt M06 · 其余组件与工具（Epic 末棒）

> **状态**：`done`  
> **epic**：[`task_tech_debt_code_quality_frontend_epic_v1.md`](task_tech_debt_code_quality_frontend_epic_v1.md)  
> **module_id**：M06  
> **depends_on**：M05 `done`  
> **SPEC**：[`specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md`](specs/SPEC-tech_debt_code_quality_frontend_modules_v1_zh.md)

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `tech-debt-cq-frontend-m06-components-misc` |
| **test_strategy** | `required` |
| **code_quality_bar** | `strict` |
| **chain_next** | Epic 关账 PR → `production` |
| **git_branch** | `task/tech-debt-code-quality-frontend` |
| **pr_merge_target** | `production` |
| **orchestration** | `Cursor Task 链` |
| **semi_auto** | `false` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

## 背景与目标

收尾 **M03/M04 未覆盖** 的 `components/`、`lib/hooks/`、`lib/utils*`；对齐 **F-01 / F-11 / F-02**。

## 范围

| 路径 | 初稿行数 | 动作 |
|------|---------|------|
| `components/chain-chat/ChainEventCard.tsx` | 1106 | 抽 event 渲染子组件 ≥1 个；主文件 ≤900 行或明示偿还 |
| `components/chain-chat/ChainChatPageClient.tsx` | 515 | F-09/F-10 审查 |
| `components/SystemStatus.tsx` | 362 | F-02 早 return 审查 |
| `components/Text2SqlChatPanel.tsx` | 398 | F-11 与 ChatPanel 共享逻辑对齐 |
| `lib/hooks/**` | — | 单职责审查 |
| `lib/utils.ts` | — | 已有 test；lint 对齐 |

**排除**：`unified-chat/`、`ChatPanel*`、`chat/`（M03/M04）

## 非范围

- merge 至 `main`
- 全量 ChainEventCard 重写

## 验收标准（10 帽细化）

- [x] Epic 模块表路径已全部扫描；无遗漏 AF-01/AF-06
- [x] **F-01**：`chain-event-card-utils.ts` 已抽（71 行）；主文件 1043 行 — **偿还子项**：后续 Epic 再拆 event 子组件
- [x] **F-11**：`Text2SqlChatPanel` 用 admin LS token（与 ChatBI 路径不同）；无重复 Bearer 构建
- [x] `pnpm lint` → `pnpm test` → `pnpm build` 绿
- [x] M01～M06 task `git mv` 至 `docs/tasks/done/`
- [x] 开 PR：`production` ← `task/tech-debt-code-quality-frontend`（**禁止** merge `main`）
- [ ] 等人签 Epic `HG-PRODUCTION-MERGE` 后再 merge

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 |
|---|----------|----------|--------|
| F1 | CI 红 | 停链 fix | 是 |

## 实现备忘（子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `components/chain-chat/chain-event-card-utils.ts`、`ChainEventCard.tsx` |

## ### 自检结论（执行者）

| 命令 | cwd | 退出码 | 摘要 |
|------|-----|--------|------|
| `wc -l chain-event-card-utils.ts ChainEventCard.tsx` | `ai-ink-brain` | — | 71 + 1043 |
| 三门禁 | `ai-ink-brain` | 0 | 全绿 |
| PR | gh | — | `production` ← branch（见 commit 后 URL） |

**Judgment**：hat_self **pass** · **HG-PRODUCTION-MERGE** pending
