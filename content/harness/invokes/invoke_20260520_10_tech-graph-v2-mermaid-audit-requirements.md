# Harness invoke snapshot — 10 帽 · T3 Mermaid 审计

| 字段 | 值 |
| --- | --- |
| hat_id | 10 |
| template | `docs/harness/prompts/TEMPLATE-requirements-invoke.md` §3 |
| task_paths | `ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md`（由本帽 **新建**） |
| related_review_or_none | 无 |
| priority_roadmap | [`docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md`](../../../../docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md) §2 · **T3** · v1.1 |
| git_branch | **`task/tech-graph-v2-mermaid-audit-v1`**（子 Agent **须自行创建**） |
| parallel_with | `invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md`（T5 · 不同分支） |
| parity_baseline_commit | `36acb5e`（T1/T2/T4 已落地） |
| created | 2026-05-20 |
| revised | 2026-05-20（对齐 PRIORITY_ROADMAP v1.1） |
| task_delivered | 2026-05-20 · `content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md` · `draft` |

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-05-20 | 开帽：Invoke 初版 + PRIORITY_ROADMAP v1.1 对齐 |
| 2026-05-20 | 关帽：落盘 T3 task 初稿（`draft`/`required`/FP/freeze_id/下一棒 §10）；分支 `task/tech-graph-v2-mermaid-audit-v1` |

## 分支与并行（子 Agent 必读）

1. **路线图**：开工前读 [`PRIORITY_ROADMAP_v1_zh.md`](../../../../docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md) §2.2–§2.3；关账后 **必须** 按该文件 §0 更新 **T3** 行 `路线图状态`。  
2. **基线**：`git fetch` 后，优先从 **已含 `36acb5e`** 的分支建线（如已合并则 `main`；否则 `feat/unified-chat-typewriter-v0` 或维护者指定）。  
3. **创建分支**（勿与 T5 共用）：  
   `git checkout <含 36acb5e 的基线> && git pull && git checkout -b task/tech-graph-v2-mermaid-audit-v1`  
4. **文件边界**：仅 `docs/_tech_graph/*.ai.md` / `*.md` / 必要时 `graph.json`；**禁止** `package.json`、`quality.yml`、`_manifest.json`（T5）。

---

## 可复制 Prompt 正文（整段粘贴到新对话 user）

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5
- docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md §0（关账后须回填路线图）

【Git · 子 Agent 自行建分支】
- 仓库：ai-ink-brain
- 基线须含 parity 落地 commit 36acb5e（graph_v2_schema、equivalence CI、pnpm tech-graph:*）；若 main 尚未合并，用 feat/unified-chat-typewriter-v0 或维护者指定分支
- git checkout -b task/tech-graph-v2-mermaid-audit-v1
- 禁止与 T5 共用分支 task/tech-graph-v2-frontend-manifest-v1
- 禁止改 package.json / .github/workflows/quality.yml / _manifest.json

【目标与上下文】
PRIORITY_ROADMAP §2：T1/T2/T4 已为 done（代码落地）；本帽负责 **T3（W2）** task 初稿与完善。
对 docs/_tech_graph/ 下 5 对 flowchart 做拓扑审计（99_mermaid_protocol.md：零裸边、// → 锚点、HappyPath）；同步 .md 人类版；提升锚点/label 覆盖率以稳定 pnpm tech-graph:equivalence-check。
不重跑闸口 A/B/C；效能对比实验（Playbook §8）不在本 task。

【已有材料路径】
docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md
ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md
ai-ink-brain/content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md
ai-ink-brain/docs/_tech_graph/99_mermaid_protocol.md
ai-ink-brain/docs/_tech_graph/graph_v2_schema.md
ai-ink-brain/docs/_tech_graph/99_spec.md
ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_docs_and_scripts_v1.md
ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_ci_equivalence_v1.md

【是否按任务审核文档回填】
无

你必须完成：
0. Invoke：更新 ai-ink-brain/content/harness/invokes/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md 修订记录（勿重复新建同名）。
1. 在 task/tech-graph-v2-mermaid-audit-v1 新建 content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md（draft、test_strategy、failure_paths、freeze_id TECH_GRAPH_S2_FREEZE_20260519_V2_3、验收、非范围）。
2. 结构化输出：背景/范围/非范围/依赖/验收/failure_paths/给执行帽必读；矛盾单独小节。
3. test_strategy：required。
4. 下一棒：22 任务审核 或 30 执行 的可复制 Prompt 要点（本分支）。
5. commit（invoke + task）；用户说不要 commit 则跳过。
6. 若 task 定稿：在回复中给出 PRIORITY_ROADMAP §2.2 T3 行建议更新文案（in_progress → 保持直至执行帽关账）。

禁止：改 CI；新建 _manifest.json；重跑闸口实验；写业务 app 代码。
```
