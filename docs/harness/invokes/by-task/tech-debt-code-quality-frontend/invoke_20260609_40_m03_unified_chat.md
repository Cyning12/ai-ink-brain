# invoke · 40 self-check · M03 unified-chat（M1 签收点）

| 字段 | 值 |
|------|-----|
| task_slug | `tech-debt-cq-frontend-m03-unified-chat` |
| task | `docs/tasks/active/task_tech_debt_cq_frontend_m03_unified_chat_v1.md` |
| hat | 40 |
| git_branch | `task/tech-debt-code-quality-frontend` |
| freeze_id | `freeze_epic_orchestration_pilot_v1` |
| date | 2026-06-09 |

## §3 执行摘要

- M03 40 pass：`useUnifiedChatTranscript.ts` + `UnifiedChatPlanPreviewPanel` / `UnifiedChatUnlockSection`
- `UnifiedChatPageClient.tsx` **918** 行（基线 1147，↓229 ≥150）
- `app/unified-chat/page.tsx` 保持 Server Component
- 三门禁全绿
- **M1 试点子集完成** → 回填工作区 M1 task；等人签 **HG-M1-SIGNOFF**
- M04～M06：Epic 延续，不阻塞 M1

## Judgment

- hat_self: **pass**
- gate: **HG-M1-SIGNOFF** pending（禁止 Agent 代签）
