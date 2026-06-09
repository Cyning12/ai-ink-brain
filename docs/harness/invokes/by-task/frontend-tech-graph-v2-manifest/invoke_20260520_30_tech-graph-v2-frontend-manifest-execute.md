# Harness invoke snapshot — 30 帽 · T5 前端 manifest 执行

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| template | docs/harness/prompts/TEMPLATE-execute-invoke.md §3（用户消息全文） |
| task_paths | ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md |
| related_review_or_none | ai-ink-brain/docs/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md |
| git_branch | task/tech-graph-v2-frontend-manifest-v1（前端 + api-python） |
| worktree_root | **ai-ink-brain**（主 checkout；禁止在 `ai-ink-brain-wt-mermaid-audit` 改本任务） |
| created | 2026-05-20 CST |

## 可复制 Prompt 快照（与对话首条 user 一致）

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽的必读列表」、根 AGENTS.md §8（合并前须跑通的验证命令真值，若与本条 VERIFY 冲突以 task + 子仓 workflow 为准）

输入（已由人工替换占位符；若你仍看到 {{…}} 或「待填」，须先追问用户，不得开工写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md
- 逻辑子仓（task 路径前缀）：
ai-ink-brain
- Worktree 研发目录（git/pnpm cwd；见 docs/harness/README.md）：
ai-ink-brain
- 合并前须跑通的验证命令（与 CI / task 一致）：
pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build
- 关联任务审核书面结论路径（无则「无」）：
ai-ink-brain/docs/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md
- 关联 SPEC / 总规（无则「无」）：
ai-ink-brain/docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md

你必须完成：
0. **Invoke 快照（开帽起点）**：在输出下列第 1 条起的实质性结果之前，先将 **本用户消息全文**（= 本模板 §3、占位符已全部替换）按 `docs/harness/invokes/README.md` 落盘。前端 task 落盘至 `ai-ink-brain/docs/harness/invokes/`（含元数据表 + 快照 fenced code）。同一会话内追问 **不** 再新增快照文件。
0b. **人工闸**：扫描 task / 关联 reviews 的 `human_gate`（见 docs/harness/prompts/HANDOFF_SEMI_AUTO.md）。若任一对 **本帽（30）** 为 `pending` → 仅输出须人改的 `gate_id` 与路径，**拒开工**；禁止代填 `approved`。
1. 通读 task 全文：§5 裁定、§6 验收、§8 必读、failure_paths FP-MF-*；不得改为「仅前端复制脚本」或独立 tech-graph workflow。
2. 若拒开工条件未满足 → 仅输出阻塞清单，不写业务代码。
3. `test_strategy: required`：**先** 扩展 api-python `tech_graph_manifest_check.py`（`--repo frontend`）并跑通 **负向**（删一条 route → exit 1），**再** 提交前端 `_manifest.json` 与 CI。
4. **跨仓顺序**：api-python PR（脚本扩展）优先合 **main**（或 CI 显式 pin ref）；再前端 PR（manifest + quality.yml + package.json `tech-graph:manifest-check`）。
5. 在 **Projects/ai-ink-brain**（worktree_root）分支 `task/tech-graph-v2-frontend-manifest-v1` 工作；后端改动在 `ai-ink-brain-api-python` 对应分支；**禁止**在 `ai-ink-brain-wt-mermaid-audit` 改本任务。
6. 执行 VERIFY 命令，保留要点；回填 task **§9「### 自检结论（执行者）」**（含负向用例摘要、exit code）。
7. 对话输出下一棒 Prompt（如需 40 自检）或阻塞说明。
8. **自动 commit**：按 `docs/harness/prompts/HANDOFF_AUTO_COMMIT.md` 在 **各仓 git 根** 分别 commit 本轮路径（禁止 `git add -A`）。用户写明「不要 commit」则跳过。

禁止：修改 `docs/_tech_graph/*.ai.md`；第二份 `_contract_manifest`；在未合 main 的脚本上单独合并前端 PR 而不说明 CI 风险。
```
