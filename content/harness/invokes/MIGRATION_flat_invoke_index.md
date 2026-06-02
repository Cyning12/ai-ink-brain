# MIGRATION_flat_invoke_index（前端仓 · P1-4 扁平 → by-task）

> **用途**：2026-05-20 及以前落在 `invokes/` 根下的历史快照，迁入 `invokes/by-task/<task_slug>/` 后的 **真值索引**。  
> **执行**：[`task_harness_frontend_invokes_by_task_migration_v1.md`](../../tasks/active/task_harness_frontend_invokes_by_task_migration_v1.md) · **2026-06-02** 已执行 `git mv`。  
> **对照**：后端 `docs/harness/invokes/` 已于 2026-05-25 完成同类迁移；历史归档见后端 `docs/diary/harness-archive/invokes/`。

---

## 迁移映射表

| 原路径（根 `invokes/`） | 目标 slug | 目标路径 |
|-------------------------|-----------|----------|
| `invoke_20260520_10_frontend-unified-chat-typewriter-v0.md` | `frontend-unified-chat-typewriter-v0` | `by-task/frontend-unified-chat-typewriter-v0/` |
| `invoke_20260520_40_frontend-unified-chat-typewriter-v0-self-check.md` | 同上 | 同上 |
| `invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md` | `frontend-tech-graph-v2-manifest` | `by-task/frontend-tech-graph-v2-manifest/` |
| `invoke_20260520_30_tech-graph-v2-frontend-manifest-execute.md` | 同上 | 同上 |
| `invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.md` | 同上 | 同上 |
| `invoke_20260520_50_tech-graph-v2-frontend-manifest-reinspect.md` | 同上 | 同上 |
| `invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md` | `engineering-tech-graph-v2-mermaid-audit` | `by-task/engineering-tech-graph-v2-mermaid-audit/` |
| `invoke_20260520_30_tech-graph-v2-mermaid-audit-execute.md` | 同上 | 同上 |
| `invoke_20260520_50_tech-graph-v2-mermaid-audit-reinspect.md` | 同上 | 同上 |
| `invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute.md` | `frontend-vercel-ai-sdk-main-stream` | `by-task/frontend-vercel-ai-sdk-main-stream/` |
| `invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute-pr2.md` | 同上 | 同上 |
| `invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-vbuild-fix.md` | 同上 | 同上 |
| `invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-pr2.md` | 同上 | 同上 |
| `invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.md` | 同上 | 同上 |
| `invoke_20260520_50_frontend-vercel-ai-sdk-main-stream-reinspect-pr2.md` | 同上 | 同上 |
| `invoke_20260521_30_frontend-vercel-ai-sdk-pr3-timeline.md` | 同上 | 同上 |
| `invoke_20260522_rules-sync-from-api-python.md` | `harness-rules-sync-api-python-20260522` | `by-task/harness-rules-sync-api-python-20260522/` |

**合计**：17 个文件 · 5 个 slug 目录。

---

## 未入库 invoke（仅 review / task 引用 · 无物理文件）

| 文件名 | 预期 slug | 说明 |
|--------|-----------|------|
| `invoke_20260520_10_frontend-vercel-ai-sdk-main-stream-requirements.md` | `frontend-vercel-ai-sdk-main-stream` | 审查全文在 `reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md` |
| `invoke_20260520_22_frontend-vercel-ai-sdk-main-stream-audit.md` | 同上 | 同上 |

---

## slug 与 task 对照

| task_slug | task 路径 | 备注 |
|-----------|-----------|------|
| `frontend-unified-chat-typewriter-v0` | `content/tasks/active/task_frontend_unified_chat_typewriter_v0.md` | HG-FRONTEND-GOLD-SLUGS |
| `frontend-tech-graph-v2-manifest` | `content/tasks/done/task_engineering_tech_graph_frontend_manifest_v1.md` | HG-FRONTEND-GOLD-SLUGS |
| `frontend-vercel-ai-sdk-main-stream` | `content/tasks/done/task_frontend_vercel_ai_sdk_main_stream_v1.md` | HG-FRONTEND-GOLD-SLUGS |
| `engineering-tech-graph-v2-mermaid-audit` | `content/tasks/done/task_engineering_tech_graph_v2_mermaid_audit_v1.md` | 工程向 slug |
| `harness-rules-sync-api-python-20260522` | 无独立 task 单 | 元任务 · rules 同步 |

**已在 by-task（迁移前即正确）**：`chatbi-v3-lowconf-rag-preview-frontend` · `portfolio-*-v1`

---

## 链接更新范围（迁移后须 grep 确认）

```bash
# 应无匹配（除本索引「原路径」列）
rg 'content/harness/invokes/invoke_' content/
rg '\.\./invokes/invoke_' content/harness/reviews/
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-02 | 初版：17 文件 git mv + 17 处引用批量更新 |
