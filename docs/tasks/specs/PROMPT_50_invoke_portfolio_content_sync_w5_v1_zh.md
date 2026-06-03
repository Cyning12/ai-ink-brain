# Prompt 50 · Portfolio W5 · content-sync · 独立复检（Task 子代理）

> **task**：`docs/tasks/active/task_portfolio_content_sync_script_v1.md`  
> **落盘**：`docs/tasks/reinspect_results/task_portfolio_content_sync_v1_reinspect_YYYYMMDD.md`  
> **invoke**：`docs/harness/invokes/by-task/portfolio-content-sync-v1/invoke_YYYYMMDD_50_*.md`

---

## §4 父侧 Handoff（主 Agent → Task 子代理）

```text
【Harness 50 · Task 子代理 · Portfolio W5 content-sync】

- hat_code: 50
- task_slug: portfolio-content-sync-v1
- Open Folder: ai-ink-brain
- git_branch: task/portfolio-demo-site-v1
- freeze_id: PORTFOLIO-RAG-DEMO@2026-06-01
- REINSPECT_MODE: 两者
- impl_commit: {{IMPL_COMMIT}}
- audit_R2: docs/harness/reviews/task_portfolio_content_sync_v1_audit_R2_20260601.md
- prompt_spec: docs/tasks/specs/PROMPT_50_invoke_portfolio_content_sync_w5_v1_zh.md

- 禁止带入：主 Chat 30 执行史全文
- 必读：
  - docs/tasks/active/task_portfolio_content_sync_script_v1.md（含 ### 自检结论）
  - docs/harness/reviews/task_portfolio_content_sync_v1_audit_R1_20260601.md
  - docs/harness/reviews/task_portfolio_content_sync_v1_audit_R2_20260601.md
  - docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.5 · §6.5）
  - tools/README-portfolio-content-sync.md
- diff：git diff origin/main...HEAD -- tools/sync-portfolio-content.sh tools/README-portfolio-content-sync.md content/methodology content/resume content/evidence docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md
- 落盘：docs/tasks/reinspect_results/task_portfolio_content_sync_v1_reinspect_20260601.md

（以下为 §5 子 Agent 正文）
```

---

## §5 子 Agent §3 正文

```text
你正在扮演 Harness「独立复检帽（50）」，严格遵循：
- Projects/docs/harness/prompts/50-independent-reinspect.md
- 本文件 §4 Handoff

W5 复检重点（非 W2/W6）：
- tools/sync-portfolio-content.sh CLI 与 task「同步脚本约定」一致
- 三文件路径：methodology/vol3_* · resume/cv-online.md · evidence/methodology-card.md
- 幂等（脚本文档或自述重跑）
- README + PROJECT_CONFIG CONTENT_ROOT 指针
- 独立重跑：pnpm lint · pnpm test · pnpm build（development + NEXT_PUBLIC_SITE_MODE=portfolio）

defer（非 W5 fail）：
- /resume 等页面路由 · 访客秘钥 · 五问全绿 · 自动化 admin POST

admin sync 烟测：若环境无 token/后端，标 defer/环境阻塞，不得以 silently pass 勾 W6 项。

输出：reinspect md + Judgment；不改 human_gate。

Judgment（50）：experience_capture / gate/risk / hat_self
```
