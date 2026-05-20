# Harness invoke snapshot — 10 帽 · T5 前端 manifest（二期）

| 字段 | 值 |
| --- | --- |
| hat_id | 10 |
| template | `docs/harness/prompts/TEMPLATE-requirements-invoke.md` §3 |
| task_paths | `content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md`（v1.0 · 2026-05-20） |
| related_review_or_none | 无 |
| priority_roadmap | [`docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md`](../../../../docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md) §2 · **T5** · v1.1 |
| git_branch | **`task/tech-graph-v2-frontend-manifest-v1`** |
| worktree_root | **`ai-ink-brain`**（主 checkout；Cursor Open Folder 对准此目录） |
| parallel_with | `invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md`（T3 · `ai-ink-brain-wt-mermaid-audit`） |
| parity_baseline_commit | `36acb5e` |
| created | 2026-05-20 |
| revised | 2026-05-20（对齐 PRIORITY_ROADMAP v1.1） |
| task_outcome | 2026-05-20：已产出 `content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md` v1.0；裁定 **扩展后端 manifest_check + quality CI** |

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-05-20 | 初版 invoke（T5 · PRIORITY_ROADMAP v1.1） |
| 2026-05-20 | 10 帽完成：task v1.0 落盘；manifest 方案 **A**（`--repo frontend`）；CI **并入 quality**；下一棒 **22** |
| 2026-05-20 | 元信息增 **`worktree_root`**；并行 cwd 见 `docs/harness/README.md` |

## 分支与 worktree（子 Agent 必读）

1. **路线图**：[`PRIORITY_ROADMAP_v1_zh.md`](../../../../docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md) §2.2 **T5**；关账后 §0 更新状态。  
2. **研发目录**：`Projects/ai-ink-brain`（**禁止**在 `ai-ink-brain-wt-mermaid-audit` 改 manifest / quality / `_manifest.json`）。  
3. **分支**：`task/tech-graph-v2-frontend-manifest-v1`（基线含 **`36acb5e`**）。  
4. **范围**：`docs/_tech_graph/_manifest.json` 设计 + manifest_check 接入方案；**默认不改** `*.ai.md`（T3 独占）。  
5. **与 T3 并行**：无文件冲突；Harness 工件须 commit 在 **本分支 + 本 worktree**。

---

## 可复制 Prompt 正文（整段粘贴到新对话 user）

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5
- docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md §0（关账后须回填路线图）

【Git · worktree】
- 研发目录（cwd）：Projects/ai-ink-brain · 分支 task/tech-graph-v2-frontend-manifest-v1
- 只读引用 ai-ink-brain-api-python 的 _manifest.json 与 tech_graph_manifest_check.py
- 禁止在 ai-ink-brain-wt-mermaid-audit 改本任务文件；禁止与 T3 共用分支
- 默认不修改 docs/_tech_graph/*.ai.md

【目标与上下文】
PRIORITY_ROADMAP §2：T5（W6）由 planned 升为 in_progress；T1/T2 工程化已 done（代码）。
产出前端域 _manifest.json + manifest_check 方案 task：覆盖 app/**/page.tsx、app/api/**/route.ts、关键 env（对齐 content/tasks/specs 与 PROJECT_CONFIG 叙述，勿依赖 docs/meta 若未入库 Git）。
裁定：扩展后端 manifest_check（--repo frontend / --graph-root）vs 前端薄 wrapper；CI 是否进 quality 二选一写入 task。
不重复 export/equivalence；不重跑闸口 A/B/C。

【已有材料路径】
docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md
ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md
ai-ink-brain/content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md
ai-ink-brain-api-python/docs/_tech_graph/_manifest.json
ai-ink-brain-api-python/docs/tasks/done/task_tech_graph_p1_manifest_and_validation_v1.md
ai-ink-brain-api-python/tools/tech_graph_manifest_check.py
ai_coding_governance/methodology/graph/改进方向.md

【是否按任务审核文档回填】
无

你必须完成：
0. Invoke：更新 invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md 修订记录。
1. 在 task/tech-graph-v2-frontend-manifest-v1 新建 content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md（Harness 字段齐全）。
2. 结构化输出 + manifest 方案裁定（不写 Python 实现）。
3. test_strategy：required；验收可机械验证（删一条 route → manifest_check 非 0）。
4. 下一棒：22 或 30 的 Prompt 要点。
5. commit invoke + task（用户说不要 commit 则跳过）。
6. 回复含 PRIORITY_ROADMAP §2.2 T5 行建议更新文案。

禁止：第二份 _contract_manifest；复制后端 RAG 子图；本帽实现 manifest_check；改 .ai.md 拓扑。
```
