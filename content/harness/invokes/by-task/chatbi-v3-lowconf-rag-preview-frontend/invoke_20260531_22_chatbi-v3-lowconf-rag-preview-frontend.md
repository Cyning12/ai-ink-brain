# Invoke 快照 · 22 任务审核帽

| 字段 | 值 |
|------|-----|
| hat | 22-task-audit |
| task_slug | `chatbi-v3-lowconf-rag-preview-frontend` |
| task_path | `ai-ink-brain/content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md` |
| audit_round | R1 |
| date | 2026-05-31 |
| git_branch | `task/chatbi-v3-lowconf-rag-preview`（建议） |
| worktree_root | `ai-ink-brain` |
| review_out | `ai-ink-brain/content/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md` |

---

## 快照（用户消息全文）

```text
你正在扮演工作区 Harness「任务审核帽」，严格遵循：
- Projects/docs/harness/prompts/22-task-audit.md
- Projects/docs/harness/HARNESS_V2_PLAN.md §5
- ai-ink-brain/content/harness/reviews/README.md

【Open Folder】ai-ink-brain/

输入：
- 待审 task：ai-ink-brain/content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md
- 配对后端 task：ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_v1.md
- SPEC：ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md
- 上一轮审查：无

落盘：ai-ink-brain/content/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md

审查要点：FE-1～FE-5 可测性；F2（validator 勿强制 sql_draft）；pnpm lint/test/build；跨仓契约键与后端 C1；是否可批准 30 开工。
Invoke 落盘：content/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/invoke_YYYYMMDD_22_*.md
审查 md 末尾附「下一棒 30 Prompt」；Judgment 必填；按 HANDOFF_AUTO_COMMIT 提交。
```
