# Task：技术图谱 v2 — Mermaid 双轨拓扑审计（T3 · W2）

> **状态**：`done（2026-05-20 · T3 W2 Mermaid 审计）`  
> **类型**：前端图谱质量（`content/tasks/active/`）  
> **关联 SPEC**：`content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md` §4 W2、§8 T3、§11 顺序 5  
> **关联路线图**：`docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md` §2.2 **T3**（关账后 **必须** 按 §0 回填）  
> **Invoke**：`content/harness/invokes/by-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.mdby-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md` · **30 执行**：`invoke_20260520_30_tech-graph-v2-mermaid-audit-execute.md`  
> **git_branch**：`task/tech-graph-v2-mermaid-audit-v1`（**禁止** 与 T5 共用 `task/tech-graph-v2-frontend-manifest-v1`）  
> **worktree_root**：`ai-ink-brain-wt-mermaid-audit`（相对 `Projects/`；git worktree；Cursor Open Folder 对准此目录；**禁止**在 `ai-ink-brain` 主 checkout 改图）  
> **parity 基线**：含 commit `36acb5e`（或已合并 parity 的 `main` / `f4f77b5` 及以后）  
> **test_strategy**：`required`  
> **test_strategy_note**：须以 **可失败** 的 `pnpm tech-graph:*` 门禁背书拓扑与导出；改图后 **先** 本地红→绿，再提交。  
> **freeze_id**：`TECH_GRAPH_S2_FREEZE_20260519_V2_3`（**禁止** 在本 task 内 bump；若审计发现须改 freeze，另开双仓变更请求）

---

## 1. 背景与目标

### 1.1 背景

- **T1/T2/T4** 已落地（`graph_v2_schema.md`、`99_mermaid_protocol.md`、`pnpm tech-graph:*`、`quality.yml` equivalence 步）；MVP 工程化已满足 SPEC §6 首波，**除** W2 拓扑质量项。
- 前端 `docs/_tech_graph/` 现有 **5 对** flowchart（`00_main`、`10_flow_route`、`11_flow_api`、`12_flow_auth`、`13_flow_components`）；机器轨由 `*.ai.md` 导出 `graph.json`。
- SPEC §2.2：含 `anchors` 的边占比约 **40/130**；等价门禁阈值见 `graph_v2_schema.md` §6（锚点 ≥95%、边 label ≥90%）。本 task 通过 **协议轨审计 + 锚点/label 补强** 稳定 `pnpm tech-graph:equivalence-check`。

### 1.2 目标（完成态）

1. **5 个 `*.ai.md`** 通过 `99_mermaid_protocol.md` 审计：**零裸边**、关键边旁 **`// →` 仓库相对路径锚点**、HappyPath 走主干、异常分支外挂。
2. **5 个对应 `*.md`** 人类版与 `.ai.md` **语义等价**（允许裸边与更短 label，**禁止** 与协议轨流程矛盾）。
3. 导出链闭环：`pnpm tech-graph:graph-export`（或等价）→ `graph.json` 与 `--check` 一致；`pnpm tech-graph:equivalence-check` **exit 0**。
4. **`02_version.md`** 追加 v2 / Mermaid 审计里程碑节点（日期 + 主题，**无** 绝对本机路径）。
5. **不** 修改 CI 脚本矩阵、**不** 新建 `_manifest.json`、**不** 重跑闸口 A/B/C 或 Playbook §8 效能实验。

---

## 2. 范围

| # | 工作项 | 产出路径 |
| --- | --- | --- |
| W2-1 | 5 个 `*.ai.md` 拓扑审计与修复 | `docs/_tech_graph/{00_main,10_flow_route,11_flow_api,12_flow_auth,13_flow_components}.ai.md` |
| W2-2 | 同步 5 个 `*.md` 人类版 | 同上 basename 的 `.md` |
| W2-3 | 锚点 / 边 `label` 覆盖率提升（支撑等价门禁） | 体现在 `graph.json` 与 equivalence 报告 |
| W2-4 | 版本时间线 | `docs/_tech_graph/02_version.md` |

**审计检查表（每文件须勾选于实现备忘）**

- [ ] 无未标记 `-->` / 裸 `--` 边（边须带 `->` / `~>` / `?>` 等协议标记）
- [ ] 关键节点/边附近有 `// → path`（仓库相对路径，与 `graph_v2_schema.md` §4 一致）
- [ ] HappyPath 在图结构上可识别（主干连续、分支不淹没主路径）
- [ ] 与配对 `.md` 无流程语义冲突

---

## 3. 非范围

| 项 | 说明 |
| --- | --- |
| **CI / 脚本矩阵** | **禁止** 改 `package.json`、`pnpm tech-graph:*` 定义、`.github/workflows/quality.yml` |
| **`_manifest.json`** | 属 **T5**；本 task **不** 新建或改 manifest |
| **业务代码** | **禁止** 改 `app/**`、`components/**`、`lib/**`（除非维护者单独立项且与图谱 task 解耦） |
| **后端仓** | **不** 复制 `tools/`；**不** 改后端 `docs/_tech_graph/*.ai.md` |
| **闸口实验** | **不重跑** 闸口 A/B/C/C′/C″ batch；**不做** Playbook §8 效能对比 |
| **`freeze_id` bump** | 非本 task 范围；须双仓 task 同步 |
| **classDiagram / timeline** | `01_struct.md`、`02_version.md` 中非 flowchart 图 **不要求** `.ai.md` 双轨 |

---

## 4. 依赖（相对工作区根 `Projects/`）

| 依赖 | 路径 |
| --- | --- |
| Parity SPEC | `ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md` |
| 迁移 Playbook | `ai-ink-brain/content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md` |
| 拓扑协议（前端摘要） | `ai-ink-brain/docs/_tech_graph/99_mermaid_protocol.md` |
| 完整协议（后端） | `ai-ink-brain-api-python/docs/_tech_graph/99_mermaid_protocol.md` |
| graph_v2 schema | `ai-ink-brain/docs/_tech_graph/graph_v2_schema.md` |
| 实现规约 | `ai-ink-brain/docs/_tech_graph/99_spec.md` |
| T1 / T2（已落地） | `ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_docs_and_scripts_v1.md`、`task_engineering_tech_graph_v2_ci_equivalence_v1.md` |
| 路线图 | `docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md` §2、§0 |
| 10 帽 Invoke | `content/harness/invokes/by-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.mdby-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md` |
| 导出/等价脚本 | `ai-ink-brain-api-python/tools/tech_graph_graph_export.py`、`tech_graph_graph_equivalence_check.py`（经 `pnpm tech-graph:*` 调用） |

---

## 5. 验收标准（可勾选）

- [x] **5 对** flowchart 文件均已按 §2 检查表审计；实现备忘列出每文件 **修复摘要**（裸边数、新增锚点数等，可为 0）
- [x] `pnpm tech-graph:graph-check` → **exit 0**（`graph.json` 无漂移）
- [x] `pnpm tech-graph:equivalence-check` → **exit 0**（锚点 / label 阈值满足 `graph_v2_schema.md` §6）
- [x] `pnpm tech-graph:schema-check` → **exit 0**（若 T1 已接入；回归不得回退）
- [x] `graph.json` 中 `freeze_id` 仍为 `TECH_GRAPH_S2_FREEZE_20260519_V2_3`（未擅自 bump）
- [x] `02_version.md` 已追加本 task 里程碑条目
- [x] **PR** 仅含 `docs/_tech_graph/**` 与本 task / invoke（**无** `package.json`、`quality.yml`、`_manifest.json`）
- [x] 关账后：`PRIORITY_ROADMAP_v1_zh.md` §2.2 **T3** 行 → `done（2026-05-20）`；§6 修订记录一行；可选同步 SPEC §11 T3 行

---

## 6. failure_paths

| ID | 触发条件 | 系统行为 | 可重试 | 用户/维护者可见 |
| --- | --- | --- | --- | --- |
| **FP-V2-1** | `.ai.md` 裸边或 Mermaid 语法错误 | `graph-export` / export **非 0** | 修图后重跑 | 本地/CI 脚本 stderr |
| **FP-V2-2** | 改图未重导出，`graph.json` 漂移 | `graph-check`（`--check`）**非 0** | 重导出并提交 `graph.json` | diff 摘要 |
| **FP-V2-3** | 锚点或边 label 未达等价阈值 | `equivalence-check` **非 0** | 补 `// →` / 边 label 后重导出 | 阈值与缺口报告 |
| **FP-T3-1** | 执行帽误改 `package.json` / `quality.yml` | 本 task **拒验收**；回滚无关 diff | — | PR review 阻塞 |
| **FP-T3-2** | 与 T5 共用分支或混入 `_manifest.json` | 维护者要求 **拆分 PR/分支** | 新建正确分支 cherry-pick | 流程阻塞 |
| **FP-T3-3** | 人类版 `.md` 与 `.ai.md` 流程矛盾 | 人工审计 / 复检 fail | 同步语义后重审 | review 备注 |

---

## 7. 给执行帽必读

1. **分支**：`git checkout task/tech-graph-v2-mermaid-audit-v1`（从含 parity 的 `main` 或 `36acb5e` 祖先建线）；**勿** 使用 `task/tech-graph-v2-frontend-manifest-v1`。
2. **编辑顺序**：先 **`*.ai.md`**（协议轨）→ `pnpm tech-graph:graph-export` → 提交 `graph.json` → 再同步 **`*.md`**（人读轨）。
3. **命令顺序（自检最低集）**：`pnpm tech-graph:graph-export` → `pnpm tech-graph:graph-check` → `pnpm tech-graph:equivalence-check` → `pnpm tech-graph:schema-check`（可选但建议）。
4. **test_strategy `required`**：若 equivalence 当前已绿，须在实现备忘记录 **基线指标**；若有缺口，**先** 让 `equivalence-check` 可复现失败（或记录修复前报告），再修图至绿。
5. **禁止文件**：`package.json`、`.github/workflows/quality.yml`、`_manifest.json`、`app/**`。
6. **关账**：头部 `done（YYYY-MM-DD …）` → `git mv` 至 `content/tasks/done/` → 更新 `_views` → **同 PR 或紧随文档 PR** 更新 `PRIORITY_ROADMAP_v1_zh.md` §2.2 T3。
7. **可选**：T1/T2 仍标 `implemented` 时，本 PR 可 **一并** `git mv` 归档 T1/T2（非本 task 阻塞项，见路线图备注）。

---

## 8. 矛盾与待澄清（文档层）

| 编号 | 陈述 A | 陈述 B | 处理建议 |
| --- | --- | --- | --- |
| **C-1** | SPEC §2.2 / W2-3：提升「含 anchors 边占比」约 **≥ 后端比例（~45% 边）** | `graph_v2_schema.md` §6：等价门禁 **锚点 ≥95%、label ≥90%**（脚本口径） | **以 equivalence 脚本输出为准** 作为验收；边占比仅作 **参考指标**，写入实现备忘，**不** 替代 FP-V2-3 |
| **C-2** | `99_mermaid_protocol.md`：人读轨 `.md` **允许裸边** | 工作区 `AGENTS.md` §7.2：flowchart **须** 双轨 `.md` + `.ai.md` | **不矛盾**：本 task 只 **强制** 审计 `.ai.md`；`.md` 须 **语义等价**，不要求零裸边 |
| **C-3** | PRIORITY_ROADMAP：T1/T2 **done（代码落地）** 待 `git mv` | 本 task 范围 **不含** 强制归档 T1/T2 | 执行帽 **可** 同 PR 归档；**不** 写入本 task 验收阻塞 |

---

## 9. 实现备忘（由执行 Agent 回填）

| 项 | 内容 |
| --- | --- |
| 涉及文件 | `docs/_tech_graph/{00_main,10_flow_route,11_flow_api,12_flow_auth,13_flow_components}.{ai.md,md}`、`02_version.md`、`graph.json`；`content/harness/invokes/by-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_30_*.md`；本 task → `done/` |
| 基线 equivalence | 修图前已绿：**anchor 100%**、**label 100%**、topology_ok=true、exit **0**；freeze_id 未变 |
| 每图修复摘要 | **00_main**：裸边 0，锚点 +0（已合规）。**10_flow_route**：裸边 0，锚点 **+22**（HOME_LINKS/NAV_ITEMS/FILTER/PAGE 分支）。**11_flow_api**：裸边 0，锚点 +0。**12_flow_auth**：裸边 0，锚点 **+8**（Unlock/Session/Gate 主干）。**13_flow_components**：裸边 0，锚点 **+4**（CP→MD/SC、CCP/T2P→SID）。人读轨 `.md` 与 `.ai.md` 语义一致，未改流程 |
| PR / CI | 分支 `task/tech-graph-v2-mermaid-audit-v1` · worktree `ai-ink-brain-wt-mermaid-audit`；未改 `package.json`/`quality.yml`；`pnpm tech-graph:*` 全绿 |

### 自检结论（执行者）

| 命令 | cwd | exit（40 复核 2026-05-20） |
| --- | --- | ---: |
| `pnpm tech-graph:graph-export` | `ai-ink-brain-wt-mermaid-audit` | **0** |
| `pnpm tech-graph:graph-check` | 同上 | **0** |
| `pnpm tech-graph:equivalence-check` | 同上 | **0**（静默通过；无 stderr） |
| `pnpm tech-graph:schema-check` | 同上 | **0**（stdout：`OK: graph_v2 schema`） |

**指标（40 复核复算）**：anchor_coverage=**1.0000**，edge_label_coverage=**1.0000**，topology_ok=**true**；`freeze_id=TECH_GRAPH_S2_FREEZE_20260519_V2_3`（`graph.json` L1802）。

**§5 验收（40 证据）**

| 项 | 结论 | 证据摘要 |
| --- | --- | --- |
| 5 对 flowchart §2 审计 + 修复摘要 | pass | 实现备忘「每图修复摘要」；`*.ai.md` 无裸 `-->` 边（rg 抽检）；f9f40e6 改 3 个 `.ai.md` + `graph.json`，00_main/11_flow_api 基线已合规 |
| graph-check | pass | exit 0 |
| equivalence-check | pass | exit 0；指标 100%/100% |
| schema-check | pass | `OK: graph_v2 schema` |
| freeze_id 未 bump | pass | `TECH_GRAPH_S2_FREEZE_20260519_V2_3` |
| 02_version 里程碑 | pass | `02_version.md` 含 `2026-05-20 : T3 W2 Mermaid…` |
| PR 范围禁令 | pass | `main...HEAD` 无 `package.json`/`quality.yml`/`_manifest.json`/`app/**` |
| PRIORITY_ROADMAP T3 | pass | 工作区 `PRIORITY_ROADMAP_v1_zh.md` §2.2 **done（2026-05-20）** |

**40 复核结论**：**pass**（30 帽结论充分；命令链已复跑）。**已知**：`graph-export` 会刷新 `generated_at`；语义以 `graph-check` 为准，勿单独提交仅时间戳 diff。

**实现 commit**：`f9f40e6`（`task/tech-graph-v2-mermaid-audit-v1`）。

---

## 10. 下一棒可复制 Prompt 要点

### 10.1 → 22 任务审核帽

```text
你正在扮演工作区 Harness「任务审核帽」，遵循 docs/harness/prompts/22-task-audit.md。

【待审 task】
ai-ink-brain/content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md

【关联】
- Invoke：content/harness/invokes/by-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.mdby-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md
- SPEC：ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md §4 W2
- HARNESS_V2_PLAN.md §5（test_strategy: required、failure_paths）

【分支】task/tech-graph-v2-mermaid-audit-v1（仅审 task 文档，不要求已有实现 diff）

你必须：落盘 reviews/*_audit_R1_*.md（无阻塞亦须零阻塞记录）；核对验收可执行、FP 完整、非范围含 package.json/quality.yml 禁令；文末给执行帽是否可开工 + 下一棒 Prompt。
按 HANDOFF_AUTO_COMMIT.md commit 审查 md（用户说不要 commit 则跳过）。
```

### 10.2 → 30 执行编码帽（须在 22 签收后）

```text
你正在扮演工作区 Harness「执行编码帽」，遵循子仓规则与 task 必读列表。

【仓库与 worktree】Projects/ai-ink-brain-wt-mermaid-audit · 分支 task/tech-graph-v2-mermaid-audit-v1（禁止在 ai-ink-brain 主 checkout 改图）

【task】content/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md
【test_strategy】required · 【freeze_id】TECH_GRAPH_S2_FREEZE_20260519_V2_3

【只做】docs/_tech_graph/ 下 5 对 flowchart + 02_version.md + graph.json（导出产物）
【禁止】package.json、.github/workflows/quality.yml、_manifest.json、app/**、闸口实验

【自检最低集】
pnpm tech-graph:graph-export && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check
（建议 schema-check）

【关账】验收勾选 → git mv task 至 done/ → 更新 PRIORITY_ROADMAP §2.2 T3 为 done（日期）
回填 task「实现备忘」与「### 自检结论（执行者）」。
```

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-20 | v1：10 帽需求分析初稿（W2/T3）；`draft` + `required` + `freeze_id` |

---

## 给 Cursor

`T3`、`mermaid_audit`、`99_mermaid_protocol`、`equivalence-check`、`tech-graph`、`W2`、`task/tech-graph-v2-mermaid-audit-v1`
