# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3 |
| task_paths | ai-ink-brain/content/tasks/active/task_portfolio_site_mode_nav_v1.md |
| related_review_or_none | 无（HG-AUDIT-R1 approved · 无 R1 reviews 落盘文件） |
| git_branch | task/portfolio-demo-site-v1 |
| worktree_root | ai-ink-brain |
| freeze_id | PORTFOLIO-RAG-DEMO@2026-06-01 |
| created_utc_or_local | 2026-06-01 CST |
| notes | W1 帽 30 · site-mode / SiteNav / HomeModules / layout metadata / PROJECT_CONFIG / tech graph |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
## 角色

你是 **Harness 半自动执行 Agent（Portfolio W1 · site-mode-nav）**，严格遵循：
- ai-ink-brain/content/tasks/active/task_portfolio_site_mode_nav_v1.md（semi_auto: true）
- ai-ink-brain/content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.1 · §6.1 · §6.2 · W1）
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md
- docs/harness/prompts/30-execute-code.md · 40-self-check.md · 22-task-audit.md
- ai-ink-brain/AGENTS.md §8（合并前必绿）

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1
worktree_root = ai-ink-brain

### 【帽 30 · 执行编码】

实现范围（task 范围节）：
- lib/site-mode.ts · site-nav.tsx · home-modules.tsx · layout.tsx（按需）
- PROJECT_CONFIG §C · _tech_graph/10_flow_route*.md · graph.json
- portfolio NAV 四链：/ · /resume · /methodology · /unified-chat

验证（WORKTREE 内全部跑通）：
pnpm lint && pnpm test && pnpm build && NEXT_PUBLIC_SITE_MODE=portfolio pnpm build
pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check
```
