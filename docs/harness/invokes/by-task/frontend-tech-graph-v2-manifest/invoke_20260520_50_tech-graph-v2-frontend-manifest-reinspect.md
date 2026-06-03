# Harness invoke snapshot — 50 帽 · T5 前端 manifest 独立复检

| 字段 | 值 |
|------|-----|
| hat_id | 50 |
| template | docs/harness/prompts/TEMPLATE-independent-reinspect-invoke.md §3 |
| task_paths | ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md |
| related_review_or_none | ai-ink-brain/docs/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md（**本仓未入库**；真值见 `ai-ink-brain-wt-mermaid-audit/docs/harness/reviews/` 同路径 + 工作区指针 `docs/harness/reviews/pointer_task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md`） |
| git_branch | `task/tech-graph-v2-frontend-manifest-v1`（前端）；api-python `task/tech-graph-v2-frontend-manifest-v1` @ `54c976b`（**未**合 `origin/main` @ `531ef3c`） |
| worktree_root | **ai-ink-brain** |
| diff_note | 前端 `git diff origin/main...HEAD`；api-python `54c976b` vs `main`（`tools/tech_graph_manifest_check.py`） |
| created | 2026-05-20 CST |
| prev_invoke | docs/harness/invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.mdby-task/frontend-tech-graph-v2-manifest/invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.md |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「独立复检 + 全局验收帽」，严格遵循：
- docs/harness/prompts/50-independent-reinspect.md
- docs/harness/HARNESS_V2_PLAN.md §5
- 根 AGENTS.md §8

输入：
- 主 task 路径：ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md
- 子仓根：ai-ink-brain
- 模式：独立复检
- diff 或变更范围：git diff origin/main...HEAD（前端）；api-python 对照 54c976b vs main（manifest_check.py）
- 任务审核书面结论路径：ai-ink-brain/docs/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md

你必须完成：
0. Invoke 落盘：docs/harness/invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_50_tech-graph-v2-frontend-manifest-reinspect.mdby-task/frontend-tech-graph-v2-manifest/invoke_20260520_50_tech-graph-v2-frontend-manifest-reinspect.md（同会话追问不重复）
1. 读取 task「### 自检结论（执行者）」；对 §6 每条输出 pass/fail + 证据（含 PR CI 若可 gh 查询）
2. 重点：跨仓合并顺序（api-python main 是否含 --repo frontend）；quality.yml manifest step 与 40 帽结论一致性
3. 汇总是否建议合并；阻塞项清单
4. 无返工且人签后 → HANDOFF_CLOSE_TRACE；有返工 → 打回 30/40 的下一棒 Prompt
5. 按 HANDOFF_AUTO_COMMIT 分仓 commit

上一节 invoke（40）：docs/harness/invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.mdby-task/frontend-tech-graph-v2-manifest/invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.md
```
