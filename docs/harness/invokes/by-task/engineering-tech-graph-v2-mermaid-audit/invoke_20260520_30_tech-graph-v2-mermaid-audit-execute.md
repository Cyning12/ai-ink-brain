# Harness invoke snapshot

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3（对话 user 全文） |
| task_paths | ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md |
| related_review_or_none | ai-ink-brain/docs/harness/reviews/task_engineering_tech_graph_v2_mermaid_audit_v1_audit_R1_20260520.md |
| git_branch | task/tech-graph-v2-mermaid-audit-v1 |
| worktree_root | ai-ink-brain-wt-mermaid-audit |
| parallel_with | T5 `task/tech-graph-v2-frontend-manifest-v1`（禁止混用分支） |
| created_utc_or_local | 2026-05-20 CST |
| notes | 30 执行编码帽开帽；human_gate 无 pending（R1 零阻塞） |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽必读」、根 AGENTS.md §8（合并前必绿；本 task 不改 quality 矩阵，但 PR 仍须不破坏现有 CI）

输入（占位符已替换；若仍见 {{…}} 或「待填」须追问，不得写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md
- 子仓根（cwd）：
ai-ink-brain
- 分支：
task/tech-graph-v2-mermaid-audit-v1
- 合并前验证（与 task §7 一致）：
pnpm tech-graph:graph-export && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check
（建议 pnpm tech-graph:schema-check）
- 关联任务审核：
ai-ink-brain/docs/harness/reviews/task_engineering_tech_graph_v2_mermaid_audit_v1_audit_R1_20260520.md
- 关联 SPEC：
ai-ink-brain/docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md §4 W2

你必须完成：
0. **Invoke 快照**：将本 user 消息全文按 docs/harness/invokes/README.md 落盘至 ai-ink-brain/docs/harness/invokes/（开帽一次即可）。
0b. **human_gate**：若 task/reviews 对 30 帽为 pending → 仅输出 gate_id，拒开工。
1. 通读 task §2–§7、failure_paths FP-V2-* / FP-T3-*；freeze_id TECH_GRAPH_S2_FREEZE_20260519_V2_3 禁止 bump。
2. 仅改 docs/_tech_graph/ 下 5 对 flowchart、02_version.md、graph.json（导出产物）；按 §2 检查表审计 .ai.md 并同步 .md。
3. test_strategy required：equivalence 已绿则实现备忘记录基线%；有缺口则先可复现红再修至绿。
4. 禁止 package.json、.github/workflows/quality.yml、_manifest.json、app/**、闸口实验。
5. 回填 task §9 实现备忘；执行后增「### 自检结论（执行者）」并贴命令要点与 exit code。
6. 关账：验收勾选 → git mv 至 docs/tasks/done/ → 更新 PRIORITY_ROADMAP §2.2 T3 为 done（日期）。
7. 输出下一棒 40 自检 Prompt 或阻塞说明。
8. 按 docs/harness/prompts/HANDOFF_AUTO_COMMIT.md 分仓 commit；用户说不要 commit 则跳过。
```
