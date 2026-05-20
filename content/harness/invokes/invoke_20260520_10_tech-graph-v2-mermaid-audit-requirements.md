# Harness invoke snapshot — 10 帽 · T3 Mermaid 审计

| 字段 | 值 |
| --- | --- |
| hat_id | 10 |
| template | `docs/harness/prompts/TEMPLATE-requirements-invoke.md` §3 |
| task_paths | `ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md`（由本帽 **新建**） |
| related_review_or_none | 无 |
| git_branch | **`task/tech-graph-v2-mermaid-audit-v1`**（子 Agent **须自行创建**，见下文） |
| parallel_with | `invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md`（不同分支，可并行） |
| created | 2026-05-20 |

## 分支与并行（子 Agent 必读）

1. **基线**：在 `ai-ink-brain` 仓，先 `git fetch`；从 **`main`** 拉取最新后创建分支（若你所在环境默认集成分支持 `production`，以维护者指定为准）。  
2. **创建分支**（自行执行，勿与另一 10 帽共用分支）：  
   `git checkout main && git pull && git checkout -b task/tech-graph-v2-mermaid-audit-v1`  
3. **合并前提**：本任务 **仅** 改 `docs/_tech_graph/*.ai.md` / `*.md` / 必要时 `graph.json`；**禁止** 改 `package.json`、`.github/workflows/`、`_manifest.json`（属 T5 分支）。  
4. **与 T5 并行**：无文件冲突；可同时开工。

---

## 可复制 Prompt 正文（整段粘贴到新对话 user）

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5

【Git · 子 Agent 自行建分支】
- 仓库：ai-ink-brain（前端子仓）
- 在拉取最新 main 后执行：git checkout -b task/tech-graph-v2-mermaid-audit-v1
- 禁止在 feat/unified-chat-typewriter-v0 或其它 feature 分支上直接堆叠本 task 提交（除非用户另行指定基线）
- 本任务与「前端 manifest T5」并行：勿修改 package.json / quality.yml / _manifest.json

【目标与上下文】
为前端 tech_graph v2 parity 的 **T3（W2）** 产出可执行 task 初稿并完善：对 `docs/_tech_graph/` 下 5 对 flowchart（`00_main`、`10_flow_route`、`11_flow_api`、`12_flow_auth`、`13_flow_components`）做 **拓扑审计**（对照 `99_mermaid_protocol.md`：零裸边、`// →` 锚点、HappyPath 主干），同步人类版 `.md` 语义；目标提升 `graph.json` 锚点/label 覆盖率以稳定通过 `pnpm tech-graph:equivalence-check`。Phase 2 的 export+equivalence CI **已落地**（见下述 SPEC §11）；本 task **不重跑** 闸口 A/B/C。

【已有材料路径】
ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md
ai-ink-brain/content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md
ai-ink-brain/docs/_tech_graph/99_mermaid_protocol.md
ai-ink-brain/docs/_tech_graph/graph_v2_schema.md
ai-ink-brain/docs/_tech_graph/99_spec.md
ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_docs_and_scripts_v1.md
ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_ci_equivalence_v1.md
docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md

【是否按任务审核文档回填】
无

你必须完成：
0. Invoke 快照：将本 user 消息全文落盘到 ai-ink-brain/content/harness/invokes/（文件名含 10、tech-graph-v2-mermaid-audit；若已存在本文件则追加修订记录，不重复建同名）。
1. 在分支 task/tech-graph-v2-mermaid-audit-v1 上，新建或完善 content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md（含状态 draft、test_strategy、failure_paths、freeze_id 与后端对齐行、验收勾选、非范围）。
2. 输出结构化审查：背景/范围/非范围/依赖/验收/failure_paths/给执行帽必读；若有 SPEC 与 Playbook 矛盾须单独列出。
3. test_strategy 建议 required（equivalence 依赖图谱质量）。
4. 对话末尾给出「下一棒」：22 任务审核帽 或 30 执行帽 的可复制 Prompt 要点（仍在本分支）。
5. 按 HANDOFF_AUTO_COMMIT.md 在 ai-ink-brain 仓 commit（仅 invoke + task 草案；用户若写「不要 commit」则跳过）。

禁止：实现大规模代码改动；改 CI；新建 _manifest.json；重跑闸口实验。
```
