# Task：技术图谱 — 方案1 静态 `graph.json` 导出与 CI 门禁（前端仓）

> **状态**：`draft`  
> **关联规划**：`docs/tech_graph/改进方向.md` v1.1（方案1 + **R1**）；`docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`  
> **invoke_snapshot**：`docs/tech_graph/invokes/invoke_20260514_0000_10_tech-graph-scheme1-dual-task-draft.md`  
> **test_strategy**：`required`  
> **test_strategy_note**：方案1 价值在 **可 diff 的 `graph.json` + CI**；无自动化则图谱与 JSON 易脱节。与本工作区复检一致：**R1 物理条件已满足**（仅 `docs/_tech_graph/`、仓根无 `_tech_graph/`），**应**将 graph 门禁纳入 PR 必绿路径（与 SPEC「未完成 R1 勿标必绿」区分）。  
> **freeze_id（建议）**：同后端 — `docs/tech_graph/改进方向.md` **v1.1** + `docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`。

---

## 1. 背景与目标

在 **`ai-ink-brain/docs/_tech_graph/`** 生成 **`graph.json`**，与 `.ai.md` 双轨及 **`99_mermaid_protocol.md`**（若存在）对齐；CI 上 **`--check`** 防止漂移。

前端 **不承担** `_contract_manifest` 真值（契约仍在后端仓）；若工作区 CI **复用后端解析脚本**，须在 task / PR 中固定 **cwd、Python 版本、相对路径**（见 §7）。

---

## 2. 范围 / 非范围

**范围**

- 本仓 **`graph.json`** 路径、门禁命令、与 **quality workflow** 对齐的接入方式（执行帽改 YAML；本初稿 **不**贴 YAML 正文）。  
- 若复用后端脚本：写明从工作区根 **`Projects/`** 维度的调用方式（例如在本仓 job 中 `working-directory` + `python ../ai-ink-brain-api-python/tools/... --graph-root docs/_tech_graph` 等，**以最终实现为准**）。

**非范围**

- 后端契约 manifest 维护。  
- Snail / secondCar。  
- 方案2 / 方案3。

---

## 3. 依赖链接（相对工作区根 `Projects/`）

| 项 | 路径 |
|----|------|
| 规划 | `docs/tech_graph/改进方向.md` |
| SPEC 方案1 | `docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md` |
| 前端 AGENTS | `ai-ink-brain/AGENTS.md` |
| 图谱真值目录 | `ai-ink-brain/docs/_tech_graph/`（现网文件集） |
| 可选复用脚本 | `ai-ink-brain-api-python/tools/<export_script>.py`（与后端 task 同 PR 或先行定名） |
| 配对后端 task | `ai-ink-brain-api-python/docs/tasks/active/task_engineering_tech_graph_graph_json_export_v1.md` |

---

## 4. 验收标准

- [ ] **`ai-ink-brain/docs/_tech_graph/graph.json`** 存在且与解析器输出一致。  
- [ ] 文档化的一键检查命令在 **PR CI** 通过（与 **`pnpm lint` / `pnpm test` / `pnpm build`** 的先后关系见本仓 **quality** 与 `PROJECT_CONFIG` 既有约定）。  
- [ ] 若走 **独立前端解析** 路径：须有 **Vitest** 或与后端对称的 **最小自动化**。  
- [ ] 若仅 **shell 调用 Python**：在「实现备忘」写明 **以前端 CI 调用为真**；`test_strategy` 仍为 `required`，理由为 **门禁命令在 CI 必跑**。

---

## 5. failure_paths

| ID | 触发 | 行为（退出码/日志） | 可重试 | 用户可见类型 |
|----|------|---------------------|--------|----------------|
| FP-1 | `.ai.md` 解析失败 | 非 0；stderr 含路径提示 | 修图后重试 | CI 失败 |
| FP-2 | `--check` 下 `graph.json` 漂移 | 非 0；diff 摘要 | 重生成并提交或修图 | CI 失败 |
| FP-3 | monorepo 相对路径错误（找不到 `../ai-ink-brain-api-python`） | 非 0 | 修正 workflow 或 clone 布局 | CI 失败 |

---

## 6. 闸口 A（方案1 后）

与后端 **共用同一对比实验文档**，或在本仓 **小节 + 链接** 指向总文档（避免两份矛盾）；最低字段与后端 task **闸口 A** 表一致（现状 vs 方案1、指标、复现命令、快照 id、结论）。

---

## 7. 给执行帽的必读列表

1. 确认 **`docs/_tech_graph/`** 为唯一输入根（SPEC）。  
2. 复用后端脚本时：**cwd**、参数 **`--graph-root`**（或等价）、**两仓在 CI 中均可检出**（工作区聚合 vs 分仓 CI **二选一**写清）。  
3. **勿**与 `tech_graph_contract_check` 混为一谈；前端 **quality** 仅增加 **graph** 一步或独立 job。

---

## 8. 矛盾与前提（R1）

| 结论 | 说明 |
|------|------|
| 本工作区 | `改进方向.md` v1.1：**R1 物理条件已满足**；若某克隆仍见仓根 `_tech_graph/`，须先按规划完成 **迁移 task** 再绑本单 CI。 |

---

## 9. 实现备忘（由执行帽回填）

| 项 | 内容 |
|----|------|
| CI 接入方式 | `<待回填>` |
| 闸口 A 文档链接 | `<待回填>` |
| 与后端脚本复用关系 | `<待回填>` |

---

## 给 Cursor

`graph.json`、`docs/_tech_graph`、`quality`、`--check`、`scheme_1`、`failure_paths`、`test_strategy`、`task_engineering_tech_graph_graph_json_export_v1`
