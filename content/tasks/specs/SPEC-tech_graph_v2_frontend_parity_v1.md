# SPEC：前端技术图谱对齐后端 graph_v2 工程化（parity 初稿）

> **状态**：`in_progress`（Phase 2 · T1+T2 落地中）  
> **类型**：规格初稿（`content/tasks/specs/`）；实施时拆为 `content/tasks/active/task_*.md`  
> **关联图谱**：`docs/_tech_graph/`（全目录）  
> **配对后端真值**：`ai-ink-brain-api-python/docs/_tech_graph/` + 已归档 task 族（见 §3）  
> **工作区规划**：`docs/tech_graph/改进方向.md` v1.1.3；`docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`；`docs/tech_graph/SPEC/query_graph/scheme_2_graph_query.md`  
> **test_strategy**：`required`（CI 门禁扩展须可失败；图谱正文变更须 `--check` / 等价门禁绿）  
> **freeze_id（目标对齐）**：与后端当前 `graph.json` 同源 — `TECH_GRAPH_S2_FREEZE_20260519_V2_3`（bump 须双仓 task 同步一行，禁止写 commit hash）

---

## 1. 背景与目标

### 1.1 背景

- 前端仓 **方案1** 已关闭：`content/tasks/done/task_engineering_tech_graph_graph_json_export_v1.md`（`quality` 内 `tech_graph_graph_export.py --check`，复用后端脚本 + 双 checkout）。
- 后端仓已完成 **graph_v2 + 方案2 查询 + P2-4a + CI 专链 + 跨仓契约** 等（`docs/tasks/done/task_engineering_tech_graph_*`、`task_tech_graph_p*` 系列）。
- **2026-05-19 快照**：前端 `docs/_tech_graph/graph.json` 已是 `schema_version: graph_v2`，`freeze_id` 与后端 **一致**，但 **工程化配套**（规约文档、等价 CI、manifest、契约参与、版本时间线、Agent 查询约定）仍显著落后于后端。

### 1.2 目标（完成态）

1. 前端 `docs/_tech_graph/` 在 **机器轨** 上与后端 v2 **同标准、可 CI 验证**（导出漂移 + 拓扑等价），**不**复制后端 RAG/Text2SQL 等业务子图文件。
2. 人读轨（`*.md`）与协议轨（`*.ai.md`）继续按前端域维护（route / api / auth / components），并满足 `99_mermaid_protocol` 拓扑约束。
3. 跨仓 SSE/契约校验 **有明确前端职责**（消费后端 `tech_graph_contract_check.py`，不另造第二份 `_contract_manifest` 真值）。
4. 拆分为 **可独立验收** 的子 task（§8），避免单次 PR 过大。
5. **对比实验**：**先落地** §4 首波工程化；**不重跑** 闸口 A/B/C batch。落地后以 Playbook §8 做单轮「落地前 vs 完全改进」效能对比。

**迁移实践（Quickstart 种子）**：`content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`。

---

## 2. 现状差距统计（2026-05-19 工作区快照）

### 2.1 目录与文件

| 维度 | 前端 `ai-ink-brain/docs/_tech_graph/` | 后端 `ai-ink-brain-api-python/docs/_tech_graph/` | 差距说明 |
| --- | ---: | ---: | --- |
| 流程图对（`.ai.md` + `.md`） | 5 对（route/api/auth/components + main） | 7 对（rag/text2sql/fts/rpc/obs/e2e + main） | **域不同，不要求文件同名** |
| `99_mermaid_protocol.md` | **无**（`AGENTS.md` 指向后端路径） | **有** | 前端须 **落盘策略二选一**（§4 W1） |
| `graph_v2_schema.md` | **无** | **有** | 机器轨 schema 文档缺失 |
| `_manifest.json` | **无** | **有**（Python 端点/RPC/表） | 前端 Next 路由/API **无** 等价 manifest（§4 W4） |
| `_contract_manifest.json` | **无**（真值在后端） | **有** | 前端 **参与校验** 即可（§4 W5） |
| `tools/tech_graph_*.py` | **0**（复用后端 checkout） | **11** | **不要求** 复制脚本；须 **文档化** 调用面（§4 W3） |
| 专用 workflow `tech-graph.yml` | **无** | **有** | 前端可 **扩展现有 `quality.yml`**，不强制独立 workflow |

### 2.2 `graph.json`（机器轨）

| 指标 | 前端 | 后端 | 备注 |
| --- | ---: | ---: | --- |
| `schema_version` | `graph_v2` | `graph_v2` | 已对齐 |
| `freeze_id` | `TECH_GRAPH_S2_FREEZE_20260519_V2_3` | 同左 | 已对齐 |
| `nodes` | 101 | 134 | 域不同，**不比数量** |
| `edges` | 130 | 185 | 同上 |
| `graphs[]` 分图数 | 5 | 7 | 与各自 `.ai.md` 一致 |
| `edges[].ref` | 0 | 0 | P2-4a-2 **双方均未物化引用边**；非阻塞 |
| `nodes[].kind` | 均未填充 | 均未填充 | 与后端导出现状一致；可选增强 |
| 含 `anchors` 的边占比 | 40/130 | 60/185 | 前端可 **补锚点** 提升 Agent 定位（§4 W2） |

**本地校验（已通过）**：

- `tech_graph_graph_export.py --check` → exit 0  
- `tech_graph_graph_equivalence_check.py`（默认图路径）→ exit 0  

**CI 缺口**：等价校验 **未** 接入 `quality.yml`（仅 `--check`）。

### 2.3 已关闭 vs 未落地（按后端 done task 映射）

| 后端能力（done task 摘要） | 前端对应状态 |
| --- | --- |
| 方案1 `graph.json` + export `--check` | **已落地**（done task） |
| graph_v2 schema + 等价门禁（P2-0 / P4 CI） | JSON **已是 v2**；**缺** `graph_v2_schema.md` + CI 等价步 |
| 方案2 `tech_graph_graph_query.py` | 脚本在后端；前端 **无** Agent 调用约定文档 |
| P2-4a `graphs[]` / `ref` / `kind` | `graphs[]` **有**；`ref`/`kind` 与后端同为未用 |
| P1 `_manifest.json` + manifest_check | **未做**（后端 Python 域）；前端路由 manifest **待立项** |
| P6 跨仓 `_contract_manifest` + contract_check | 真值在后端；前端 **未** 文档化本地/CI 触发方式 |
| 闸口 A/B/C/C′/C″ 对比实验 | **非前端范围**；仅引用结论，不重跑 batch |
| 方案3 Neo4j | **非范围**（R2） |

---

## 3. 依赖与引用

| 依赖 | 路径 |
| --- | --- |
| 前端 PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 前端 AGENTS | `AGENTS.md` |
| 前端图谱目录 | `docs/_tech_graph/` |
| 前端已关闭 scheme1 | `content/tasks/done/task_engineering_tech_graph_graph_json_export_v1.md` |
| 后端图谱 + 工具 | `ai-ink-brain-api-python/docs/_tech_graph/`、`ai-ink-brain-api-python/tools/tech_graph_*.py` |
| 后端 v2 核心 task | `docs/tasks/done/task_engineering_tech_graph_v2_graph_query_v1.md` |
| 后端 v2 P2-4a | `docs/tasks/done/task_engineering_tech_graph_v2_p4_extended_v1.md` |
| 后端方案2补全 | `docs/tasks/done/task_engineering_tech_graph_scheme2_completion_v1.md` |
| 后端 CI / manifest / 契约 | `task_tech_graph_p4_ci_guardrail_v1.md`、`task_tech_graph_p6_cross_repo_contract_guardrail_v1.md` 等 |
| 工作区 SPEC | `docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`、`docs/tech_graph/SPEC/query_graph/scheme_2_graph_query.md` |

---

## 4. 工作包清单（统计 · 供排期）

> **合计约 7 个工作包、建议 4 个子 task**（§8）。行内「估」为相对工作量（S/M/L），非人日承诺。

### W1 — 规约与索引对齐（估：**S**）

| # | 工作项 | 产出 |
| --- | --- | --- |
| W1-1 | 引入 `docs/_tech_graph/graph_v2_schema.md` | 从后端 **摘录+改路径**（前端无 `ref` 实验可保留 FP 表）；链到工作区 SPEC |
| W1-2 | `99_mermaid_protocol.md` 策略 | **A**：子仓内放 **摘要+链接** 全文档；**B**：完整复制并标注 sync 来源（后端路径）。与 `AGENTS.md` §必读一致 |
| W1-3 | 更新 `99_spec.md` | 增加 **CI 门禁**、**graph_v2**、**禁止虚构路由/API** 与后端 P4 条文同级的前端表述 |
| W1-4 | 更新 `AGENTS.md` / `PROJECT_CONFIG` §D | 列出 `pnpm tech-graph:*` 脚本矩阵（export / equivalence / 可选 schema） |

### W2 — Mermaid 双轨与拓扑质量（估：**M**）

| # | 工作项 | 产出 |
| --- | --- | --- |
| W2-1 | 5 个 `*.ai.md` 拓扑审计 | 对照 `99_mermaid_protocol`：禁止裸边、`// → path` 锚点、HappyPath 主干 |
| W2-2 | 同步对应 `*.md` 人类版 | 语义与 `.ai.md` 等价（不要求逐字） |
| W2-3 | 锚点覆盖率提升 | 目标：关键边 `anchors` 覆盖 **≥ 后端当前比例**（约 45%+ 边带锚点） |
| W2-4 | `02_version.md` | 追加 tech graph v2 / CI 里程碑节点（日期 + 主题，无绝对路径） |

### W3 — 工具链与本地 DX（估：**S**）

| # | 工作项 | 产出 |
| --- | --- | --- |
| W3-1 | **不复制** `tools/` 到前端仓 | 维持「后端脚本 + 路径参数」模式（与 scheme1 一致） |
| W3-2 | `package.json` scripts | 至少新增：`tech-graph:equivalence-check`；可选 `tech-graph:schema-check` |
| W3-3 | Agent 使用说明（可写入 `99_spec.md` 或 `docs/diary/` 短文） | `tech_graph_graph_query.py --graph docs/_tech_graph/graph.json` 示例命令 |

### W4 — CI 门禁升级到 v2 最小集（估：**M**）

| # | 工作项 | 产出 |
| --- | --- | --- |
| W4-1 | `quality.yml` 在 graph `--check` 后增加 **等价校验** | `tech_graph_graph_equivalence_check.py`（cwd/路径与 export 步一致） |
| W4-2 | （可选）`tech_graph_graph_v2_schema.py` | 对 committed `graph.json` 结构校验 |
| W4-3 | 文档化失败路径 | 对齐 `graph_v2_schema.md` FP-4-x；写入子 task `failure_paths` |

**不做的 CI 项（除非单独立项）**：`tech_graph_manifest_check`（无前端 `_manifest.json`）、`tech_graph_token_estimate`（闸口 A 已后端归档）。

### W5 — 跨仓契约参与（估：**M**）

| # | 工作项 | 产出 |
| --- | --- |
| W5-1 | 在 `11_flow_api.md` / `13_flow_components.md` 标注 SSE 消费锚点 | 与后端 `_contract_manifest.json` 中前端路径互引 |
| W5-2 | 文档化 **本地** 校验命令 | 从工作区根或前端仓：`python3 ai-ink-brain-api-python/tools/tech_graph_contract_check.py`（参数以脚本 `--help` 为准） |
| W5-3 | （可选）前端 PR 增加 contract 步 | **仅当** 维护者要求与后端 `tech-graph-contract.yml` 对称；默认 **recommended**，非本 SPEC 硬验收 |

### W6 — 前端 `_manifest.json`（Next 域 · 估：**L** · 可二期）

| # | 工作项 | 产出 |
| --- | --- | --- |
| W6-1 | 设计 `tech_graph_manifest_v1` 前端 schema | 覆盖 `app/**/page.tsx`、`app/api/**/route.ts`、关键 `lib/*` env |
| W6-2 | 复用或扩展后端 `manifest_check` | **方案 A**：后端脚本加 `--repo frontend`；**方案 B**：前端薄 wrapper 调同一逻辑 |
| W6-3 | CI 接入 | 独立 job 或并入 `quality`（注意耗时） |

> **建议**：W6 **不纳入** 首波 v2 parity 关账；首波以 W1–W5 + 现有 `--check` 为准。

### W7 — 方案2 图查询（Agent 消费 · 估：**S** · 无代码）

| # | 工作项 | 产出 |
| --- | --- | --- |
| W7-1 | 文档化 CLI | `downstream` / `upstream` / `describe-impact` 等对 **前端图** 的调用示例 |
| W7-2 | 与后端闸口 B 结论对齐 | 链 `conclusion_gate_b_ctx_query_v1_zh.md`；声明 **CTX_QUERY** 为 Agent 默认，人读轨按需 |

---

## 5. 范围 / 非范围

### 5.1 范围

- §4 工作包 **W1–W5、W7**（首波）；**W6** 仅作二期占位。
- 现有 `graph.json` 在变更 `.ai.md` 后须重新导出并提交（与后端同导出器）。
- 子 task 拆分、验收表、Harness 字段（`test_strategy`、`failure_paths`、`freeze_id`）按 `content/tasks/README.md` 与根 `AGENTS.md` §2.3。

### 5.2 非范围

- 复制后端 `10_flow_rag` 等业务子图到前端仓。
- 在前端仓新建 `_contract_manifest.json` 真值（保持后端唯一真值）。
- 方案3 Neo4j、闸口 A/B/C **主实验重跑**、Gate D v2 题集实施。
- 在前端仓完整复制 11 个 `tech_graph_*.py`（除非 W6 立项且裁定需要 wrapper）。
- 修改 Python API / RAG 实现（纯文档与 CI/图谱域）。

---

## 6. 验收标准（首波 parity · 可勾选）

- [x] `docs/_tech_graph/graph_v2_schema.md` 存在且与 committed `graph.json` 字段一致。
- [x] `99_spec.md` 含 **graph_v2 + CI** 约束；`AGENTS.md` 与 `package.json` 脚本一致。
- [ ] 5 个 flowchart `.ai.md` 通过拓扑审计（无裸边；抽检 ≥3 文件有 `// →` 锚点）— **T3**
- [x] `pnpm tech-graph:graph-check` 与 `pnpm tech-graph:equivalence-check` 在本地 exit 0。
- [x] `quality` workflow：**export `--check` + equivalence** 同 PR 必绿；失败 stderr 可定位文件。
- [x] `graph.json` 的 `freeze_id` 与后端 **同一行**；schema bump 时双仓同步更新。
- [x] 跨仓契约：文档中存在 **可复现** 的 `tech_graph_contract_check` 命令与前端锚点互引（W5）。
- [x] T1+T2 落地；T3 可并行跟进（见 §11）。

---

## 7. failure_paths（首波）

| ID | 触发 | 系统行为 | 可重试 | 用户可见 |
| --- | --- | --- | --- | --- |
| FP-V2-1 | `.ai.md` 拓扑违规导致 export 失败 | export 非 0 | 修图后重试 | CI 失败 |
| FP-V2-2 | `graph.json` 漂移（`--check`） | 非 0；diff 摘要 | 重导出提交 | CI 失败 |
| FP-V2-3 | 等价门禁未达阈值（锚点/label） | equivalence 非 0 | 补锚点或修图 | CI 失败 |
| FP-V2-4 | CI 未 checkout 后端仓 | 脚本路径不存在 | 修 `quality.yml` checkout | CI 配置错误 |
| FP-V2-5 | `freeze_id` 与后端不一致 | 人工审计 / 规划拒开工 | 双仓对齐 freeze 行 | 流程阻塞 |

---

## 8. 建议子 task 拆分（由执行 Agent 落盘到 `active/`）

| ID | 建议文件名 | 覆盖工作包 | 优先级 | 阻塞首波关账 |
| --- | --- | --- | --- | --- |
| **T1** | `task_engineering_tech_graph_v2_docs_and_scripts_v1.md` | W1 + W3 + W7 | P0 | 是 |
| **T2** | `task_engineering_tech_graph_v2_ci_equivalence_v1.md` | W4 | P0 | 是 |
| **T3** | `task_engineering_tech_graph_v2_mermaid_audit_v1.md` | W2 | P1 | 否（可并行） |
| **T4** | `task_engineering_tech_graph_cross_repo_contract_frontend_v1.md` | W5 | P1 | 否 |
| **T5** | `task_engineering_tech_graph_frontend_manifest_v1.md` | W6 | P2 | 否（二期） |

---

## 9. 实现备忘（待子 Agent 回填）

| 项 | 内容 |
| --- | --- |
| 涉及文件（预估） | `docs/_tech_graph/*`、`AGENTS.md`、`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`、`package.json`、`.github/workflows/quality.yml` |
| 不涉及 | `app/**` 业务逻辑（除非契约锚点仅文档引用） |
| 图谱变更点 | `graph_v2_schema.md`、`99_spec.md`、`02_version.md`、可选 `99_mermaid_protocol.md` |
| 后端配对 | 无强制后端代码变更；若 bump `freeze_id` 须后端 task/PR 同步 |
| Harness | 首波 **不** 强制 semi_auto；关账可参考 `docs/tech_graph/prompts/TEMPLATE-accept-tech-graph-graph-json-frontend-invoke.md` 扩展等价项 |

---

## 10. 工作量汇总表

| 工作包 | 子 task | 估 | 首波 |
| --- | --- | --- | --- |
| W1 规约索引 | T1 | S | 是 |
| W2 Mermaid 审计 | T3 | M | 建议 |
| W3 工具 DX | T1 | S | 是 |
| W4 CI v2 | T2 | M | 是 |
| W5 跨仓契约 | T4 | M | 建议 |
| W6 前端 manifest | T5 | L | 否（二期） |
| W7 图查询文档 | T1 | S | 是 |

**首波最小可交付（MVP）**：T1 + T2 完成即可宣称「前端 graph_v2 工程化与后端 v2 CI 最小集对齐」；T3 提升图谱质量；T4/T5 按需跟进。

---

## 11. 任务执行顺序与工作量（落盘真值）

> **执行顺序**：严格按 Phase 编号；同 Phase 内可并行见「并行」列。  
> **实验**：全部 Phase 2 首波 **完成后** 再开 Playbook §8 效能对比 task（单轮，不重跑 A/B/C）。

| 顺序 | Phase | 子 task | 工作包 | 估 | 并行 | 状态 |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | R1 | — | 目录迁入 | — | — | done |
| 1 | scheme1 | （done）graph_json_export | export `--check` | S | — | done |
| **2** | **v2** | **T1** | W1+W3+W7 | S | — | **done（本批）** |
| **3** | **v2** | **T2** | W4 | M | 与 T1 同 PR | **done（本批）** |
| 4 | v2 | T4 | W5 | M | 与 T2 | **done（文档）** |
| 5 | 质量 | T3 | W2 | M | 与 2–4 | pending |
| 6 | 二期 | T5 | W6 | L | — | pending |
| 7 | 实验 | — | Playbook §8 | M | 依赖 2–4 | pending |

**工作量汇总（人时粗估 · 仅排期参考）**

| 工作包 | 子 task | 估 | 首波 | 累计状态 |
| --- | --- | --- | --- | --- |
| W1 规约索引 | T1 | S (~0.5d) | 是 | done |
| W3 工具 DX | T1 | S (~0.25d) | 是 | done |
| W7 图查询文档 | T1 | S (~0.25d) | 是 | done |
| W4 CI v2 | T2 | M (~0.5d) | 是 | done |
| W5 跨仓契约 | T4 | M (~0.5d) | 文档 | done |
| W2 Mermaid 审计 | T3 | M (~1d) | 建议 | pending |
| W6 前端 manifest | T5 | L (~2–3d) | 否 | pending |
| 效能对比实验 | — | M (~1d) | 落地后 | pending |

**依赖图（简）**

```text
[R1] → [scheme1] → [T1] ─┬→ [T2] → [MVP 可关账]
                         ├→ [T4]
                         └→ [T3]（不阻塞 MVP）
[T2+T4] → [Playbook §8 实验] → [可选 T5]
```

---

## 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v0.1 | 2026-05-20 | 初稿：差距统计 + 工作包 + 子 task 建议 |
| v0.2 | 2026-05-20 | §11 执行顺序与工作量；T1/T2/T4 落地；Playbook 链出 |

---

## 给 Cursor

`graph_v2`、`docs/_tech_graph`、`parity`、`equivalence`、`quality.yml`、`tech_graph_graph_export`、`freeze_id`、`SPEC-tech_graph_v2_frontend_parity_v1`、`content/tasks/specs`
