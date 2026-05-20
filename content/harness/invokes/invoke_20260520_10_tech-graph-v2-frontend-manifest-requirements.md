# Harness invoke snapshot — 10 帽 · T5 前端 manifest（二期）

| 字段 | 值 |
| --- | --- |
| hat_id | 10 |
| template | `docs/harness/prompts/TEMPLATE-requirements-invoke.md` §3 |
| task_paths | `ai-ink-brain/content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md`（由本帽 **新建**） |
| related_review_or_none | 无 |
| git_branch | **`task/tech-graph-v2-frontend-manifest-v1`**（子 Agent **须自行创建**） |
| parallel_with | `invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md` |
| created | 2026-05-20 |

## 分支与并行（子 Agent 必读）

1. 在 `ai-ink-brain` 从 **`main`**（或维护者指定基线）创建：  
   `git checkout main && git pull && git checkout -b task/tech-graph-v2-frontend-manifest-v1`  
2. **范围**：设计 `docs/_tech_graph/_manifest.json`（Next 路由 / `app/api/**` / 关键 env）；**不** 改 `*.ai.md` 拓扑正文（属 T3 分支）。  
3. **工具**：优先 **扩展** `ai-ink-brain-api-python/tools/tech_graph_manifest_check.py` 支持 `--repo frontend`（文档化即可，实现留给执行帽）；**不** 在前端仓复制 11 个脚本。  
4. 与 T3 **可并行**：文件集几乎不交叠。

---

## 可复制 Prompt 正文（整段粘贴到新对话 user）

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5

【Git · 子 Agent 自行建分支】
- 仓库：ai-ink-brain（前端子仓）；必要时只读引用 ai-ink-brain-api-python 的 manifest 脚本与后端 `_manifest.json` 样例
- git checkout -b task/tech-graph-v2-frontend-manifest-v1（基线 = 最新 main）
- 禁止与 T3 共用分支 task/tech-graph-v2-mermaid-audit-v1
- 本 task 默认 **不** 修改 docs/_tech_graph/*.ai.md（避免与 T3 冲突）

【目标与上下文】
为 SPEC §4 **W6 / T5（二期）** 产出 **前端域** `_manifest.json` + manifest_check 接入方案的 task 初稿：覆盖 `app/**/page.tsx`、`app/api/**/route.ts`、与 `PROJECT_CONFIG` 对齐的关键 env 锚点；CI 是否纳入 `quality` 须在 task 中 **二选一裁定**（recommended：独立 workflow 或 quality 追加步）。对齐后端 P1 `task_tech_graph_p1_manifest_and_validation_v1` 思路，但 **schema 独立**（`tech_graph_manifest_v1` + `repo: ai-ink-brain`）。首波 v2 parity（T1+T2）已落地；本 task **不** 重复 export/equivalence 设计。

【已有材料路径】
ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md（§4 W6、§11 顺序 6）
ai-ink-brain/content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md（§6 故意不做 → 本期要做清）
ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md
ai-ink-brain-api-python/docs/_tech_graph/_manifest.json
ai-ink-brain-api-python/docs/tasks/done/task_tech_graph_p1_manifest_and_validation_v1.md
ai-ink-brain-api-python/tools/tech_graph_manifest_check.py
docs/tech_graph/改进方向.md（R1、方案1，工作区相对路径）

【是否按任务审核文档回填】
无

你必须完成：
0. Invoke 快照落盘 ai-ink-brain/content/harness/invokes/（10、tech-graph-v2-frontend-manifest）。
1. 在分支 task/tech-graph-v2-frontend-manifest-v1 新建 content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md（完整 Harness 字段 + 与后端 manifest **并行不合并** 的说明）。
2. 裁定：manifest 校验走「扩展后端脚本 + `--graph-root`」vs「前端薄 wrapper」；写入 task §实现备忘建议，**不** 在本帽写 Python 实现。
3. 验收须可机械验证（manifest_check 非 0、人为删一条 route 必 fail）。
4. test_strategy：required。
5. 下一棒 Prompt 要点（22 审核或 30 执行）；按 HANDOFF_AUTO_COMMIT.md commit invoke+task（用户说不要 commit 则跳过）。

禁止：复制后端 RAG 子图；新建第二份 `_contract_manifest.json`；在本帽实现 manifest_check 代码；重跑闸口 A/B/C。
```
