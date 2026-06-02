# invokes/by-task（按 task 绑定）

> 新 invoke **仅**落本目录子文件夹；`<task_slug>` 与 task Harness 元信息 **`task_slug`** 字段一致。  
> 历史扁平迁移：[`../MIGRATION_flat_invoke_index.md`](../MIGRATION_flat_invoke_index.md)

## 示例

```text
by-task/chatbi-v3-lowconf-rag-preview-frontend/
  invoke_20260531_22_chatbi-v3-lowconf-rag-preview-frontend.md
  invoke_20260531_30_chatbi-v3-lowconf-rag-preview-frontend.md
```

## slug 索引

| task_slug | task 路径 | 备注 |
|-----------|-----------|------|
| `chatbi-v3-lowconf-rag-preview-frontend` | `content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md` | KPI pilot |
| `portfolio-content-sync-v1` | `content/tasks/done/task_portfolio_content_sync_script_v1.md` | LoopTask · done |
| `portfolio-site-mode-nav-v1` | `content/tasks/done/task_portfolio_site_mode_nav_v1.md` | W1 · done |
| `portfolio-content-pages-v1` | `content/tasks/done/task_portfolio_content_pages_v1.md` | W6 · done |
| `frontend-unified-chat-typewriter-v0` | `content/tasks/active/task_frontend_unified_chat_typewriter_v0.md` | GOLD · 迁移 2026-06-02 |
| `frontend-tech-graph-v2-manifest` | `content/tasks/done/task_engineering_tech_graph_frontend_manifest_v1.md` | GOLD · 迁移 |
| `frontend-vercel-ai-sdk-main-stream` | `content/tasks/done/task_frontend_vercel_ai_sdk_main_stream_v1.md` | GOLD · 迁移 |
| `engineering-tech-graph-v2-mermaid-audit` | `content/tasks/done/task_engineering_tech_graph_v2_mermaid_audit_v1.md` | 迁移 |
| `harness-rules-sync-api-python-20260522` | 无 task 单 | 元任务 · 迁移 |
