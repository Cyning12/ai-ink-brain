# Invoke 快照 · 50 独立复检 · portfolio-site-mode-nav-v1（W1）

| 字段 | 值 |
|------|-----|
| hat_id | 50 |
| task_slug | portfolio-site-mode-nav-v1 |
| task_path | content/tasks/active/task_portfolio_site_mode_nav_v1.md |
| git_branch | task/portfolio-demo-site-v1 |
| freeze_id | PORTFOLIO-RAG-DEMO@2026-06-01 |
| REINSPECT_MODE | 两者 |
| impl_commit | bed2baf |
| audit_R2 | 无（路径 B · HG-AUDIT-R1 人 pre-approve · R2 未落盘） |
| prompt_spec | content/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md |
| date | 20260601 |

---

## §4 父侧 Handoff（主 Agent → Task 子代理）

```text
【Harness 50 · Task 子代理 Handoff · Portfolio W1 site-mode-nav】

- hat_code: 50
- task_slug: portfolio-site-mode-nav-v1
- Open Folder: ai-ink-brain
- git_branch: task/portfolio-demo-site-v1

- 禁止带入：主 Chat 30 执行史、30 invoke 全文
- 必读：
  - content/tasks/active/task_portfolio_site_mode_nav_v1.md
  - task ### 自检结论（执行者）
  - content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.1 · §6.1 · §6.2）
  - content/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md
- diff：git diff origin/main...HEAD -- lib/site-mode.ts lib/site-mode.test.ts app/_components/site-nav.tsx app/_components/home-modules.tsx app/layout.tsx docs/_tech_graph/
- freeze_id：PORTFOLIO-RAG-DEMO@2026-06-01
- 模式：两者
- impl_commit：bed2baf
- 落盘：content/tasks/reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md

（以下为 §5 子 Agent 正文）
```

---

## §5 调用体（快照 · 占位符已全部替换）

```text
你正在扮演工作区 Harness「独立复检 + 全局验收帽（50）」，严格遵循：
- docs/harness/prompts/50-independent-reinspect.md（§一 · §二 · Fresh Context P1）
- content/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md
- ai-ink-brain/AGENTS.md §8

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1

输入：
- 主 task：content/tasks/active/task_portfolio_site_mode_nav_v1.md
- SPEC：content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md
- 子仓根：ai-ink-brain
- 模式：两者
- diff：git diff origin/main...HEAD -- lib/site-mode.ts lib/site-mode.test.ts app/_components/site-nav.tsx app/_components/home-modules.tsx app/layout.tsx docs/_tech_graph/
- 22 审查：无（路径 B · 须声明书面审缺位 + human_gate diff 审查）
- freeze_id：PORTFOLIO-RAG-DEMO@2026-06-01
- impl_commit：bed2baf

你必须完成：
0. Invoke 快照（本文件已存在则跳过重复落盘）。

【§一 独立复检】
1. 读 task ### 自检结论（执行者）；缺失 → blocked → 打回 40。
2. Fresh Context：禁止读 30 invoke 全文。
3. 独立重跑：pnpm lint · pnpm test · pnpm build · NEXT_PUBLIC_SITE_MODE=portfolio pnpm build · tech-graph 三门禁。
4. W1 验收表（pass/fail/defer + 证据）：四链 NAV · 四卡 Home · unified 常显 · Portfolio Demo 副标题 · metadata · site-mode 单测 · development 回归 · 图谱。
5. defer：/resume · /methodology 404（W2）；W3–W6 Epic 项；PROJECT_CONFIG gitignore → warn。
6. human_gate：git log -p task 文件，确认未代填 approved。

【§二 全局验收】
7. freeze_id 范围内 diff；AGENTS §8 checklist。

落盘：content/tasks/reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md
commit reinspect（用户未禁 commit 时按 HANDOFF_AUTO_COMMIT）

短报告：reinspect 路径 · pass/fail/defer 统计 · 合并建议 · Judgment

禁止：改代码（除非人明示 patch）· 代填 HG-REINSPECT · 输出 CLOSE 全文
```
