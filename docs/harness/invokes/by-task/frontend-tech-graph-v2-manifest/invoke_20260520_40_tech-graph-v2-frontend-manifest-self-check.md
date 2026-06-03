# Harness invoke snapshot — 40 帽 · T5 前端 manifest 自检

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| template | docs/harness/prompts/TEMPLATE-self-check-invoke.md §3 |
| task_paths | ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md |
| related_review_or_none | ai-ink-brain/docs/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md（路径见 task §9；若未入库则 50 帽核对） |
| git_branch | task/tech-graph-v2-frontend-manifest-v1（前端）；api-python 脚本提交 54c976b（`task/tech-graph-v2-frontend-manifest-v1`，**未**合 main） |
| worktree_root | **ai-ink-brain** |
| verify_command | `pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build` |
| diff_note | api-python @ 54c976b（--repo frontend）；本地 sibling `../ai-ink-brain-api-python` main 工作区含同内容未提交改动；CI checkout 后端 main 须先合并 api-python PR |
| created | 2026-05-20 CST |
| prev_invoke | docs/harness/invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_30_tech-graph-v2-frontend-manifest-execute.mdby-task/frontend-tech-graph-v2-manifest/invoke_20260520_30_tech-graph-v2-frontend-manifest-execute.md |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「自检帽（执行者）」，严格遵循：
- docs/harness/prompts/40-self-check.md
- docs/harness/HARNESS_V2_PLAN.md §5

输入：
- 主 task 路径：ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md
- 逻辑子仓：ai-ink-brain
- Worktree 研发目录：ai-ink-brain
- 主验证命令：pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build
- 变更范围说明：api-python @ 54c976b（--repo frontend）；前端分支 task/tech-graph-v2-frontend-manifest-v1 含 manifest/CI；本地 sibling `../ai-ink-brain-api-python` 须与已合并 main 或 worktree 脚本一致后再验

你必须完成：
0. Invoke 落盘：docs/harness/invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.mdby-task/frontend-tech-graph-v2-manifest/invoke_20260520_40_tech-graph-v2-frontend-manifest-self-check.md（同会话追问不重复）
1. 逐条跑验收命令并给 exit code / 关键输出
2. 验收表 pass/fail + 证据
3. 复核/更新 task「### 自检结论（执行者）」
4. 下一棒：50 独立复检 或 关账（HG-AUDIT-CLOSE 若已设闸）
5. 按 HANDOFF_AUTO_COMMIT 分仓 commit

上一节 invoke（30）：docs/harness/invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_30_tech-graph-v2-frontend-manifest-execute.mdby-task/frontend-tech-graph-v2-manifest/invoke_20260520_30_tech-graph-v2-frontend-manifest-execute.md
```
