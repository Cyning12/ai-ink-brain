# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| template | docs/harness/prompts/TEMPLATE-self-check-invoke.md §3 |
| task_paths | ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md |
| git_branch | task/portfolio-demo-site-v1 |
| worktree_root | ai-ink-brain |
| impl_commit | bed2baf feat(portfolio-w1): site mode switch and four-link portfolio nav |
| created_utc_or_local | 2026-06-01 CST |
| notes | W1 帽 40 · 逐条验收 + 命令证据回填 task |

## 可复制 Prompt 快照

```text
你正在扮演工作区 Harness「自检帽」，遵循 docs/harness/prompts/40-self-check.md。

task：ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md
worktree：ai-ink-brain · 分支 task/portfolio-demo-site-v1
impl：bed2baf

须跑并记录证据：
pnpm lint && pnpm test && pnpm build && NEXT_PUBLIC_SITE_MODE=portfolio pnpm build
pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check

回填 task「### 自检结论（执行者）」；下一棒 50（HG-REINSPECT pending · 不得代填）。
```
