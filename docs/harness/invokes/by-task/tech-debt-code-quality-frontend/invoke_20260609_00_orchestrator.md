# invoke · 00 orchestrator · tech-debt-code-quality-frontend

| 字段 | 值 |
|------|-----|
| task | `docs/tasks/active/task_tech_debt_code_quality_frontend_epic_v1.md` |
| hat | 00 |
| git_branch | `task/tech-debt-code-quality-frontend` |
| date | 2026-06-09 |

## §3 执行摘要

- 10 帽：M01～M06 验收细项落盘；SPEC v1.1 **active**
- 00：确认模块边界无修订；链式派发 M01→M06
- **HG-EPIC-SPEC**：用户会话授权执行；正式人签待维护者 `approved`
- 每棒 40：`pnpm lint` → `pnpm test` → `pnpm build` 全绿

## 链式结果

| module | 40 | commit |
|--------|-----|--------|
| M01 | pass | 见 branch |
| M02 | pass | 见 branch |
| M03 | pass | UnifiedChatPageClient 973→843 行 |
| M04 | pass | buildChatAuthHeaders 共享 |
| M05 | pass | session route isPyApiUrlConfigured |
| M06 | pass | chain-event-card-utils 拆分 |

## 关账

- PR base: **production**
- **HG-PRODUCTION-MERGE**：pending（人签后 merge）
