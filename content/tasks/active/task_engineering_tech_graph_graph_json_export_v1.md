# Task：技术图谱 — 方案1 静态 `graph.json` 导出与 CI 门禁（前端仓）

> **状态**：`draft`  
> **关联规划**：`docs/tech_graph/改进方向.md` **v1.1.3**（含 **2026-05-15** 勘误行：R1 与 scheme_1「PR 必绿」一致）；`docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`  
> **invoke_snapshot**：`docs/tech_graph/invokes/invoke_20260514_0000_10_tech-graph-scheme1-dual-task-draft.md`；`docs/harness/invokes/invoke_20260514_0031_10_tech-graph-scheme1-exec-converge.md`；`docs/harness/invokes/invoke_20260515_0000_10_tech-graph-scheme1-exec-converge-hat10.md`（链：`docs/harness/invokes/invoke_20260514_20_tech-graph-scheme1-review-hat20.md`）  
> **test_strategy**：`required`  
> **test_strategy_note**：与后端同源：确定性解析 + 无漂移门禁；若无可失败自动化（`pnpm`/`node` 或复用 Python 的 `--check` + 最小 golden），PR 易静默破坏图语义。  
> **freeze_id**：`TECH_GRAPH_S1_FREEZE_20260514_V1_1_3`

---

## 1. 背景与目标

从本仓 **`docs/_tech_graph/*.ai.md`** 解析 Mermaid **flowchart** / **classDiagram** 边，生成 **`docs/_tech_graph/graph.json`**，与 [`scheme_1_graph_json.md`](../../../../docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md) 及 **R1**（[`改进方向.md`](../../../../docs/tech_graph/改进方向.md) v1.1.3 表「R1」）一致。

**R1 物理条件已满足**（聚合仓复检：仅有 `docs/_tech_graph/`、仓根无 `_tech_graph/`）时，本 task 落地后 **`graph.json` 导出 / `--check` 须纳入 `quality` 等 PR 必绿**（与后端 task、scheme_1「已定稿」一致）。

与 **`tech_graph_contract_check.py`** + **`_contract_manifest.json`** **并行互补**：**不得**把契约校验合并进 graph 导出脚本；CI 中 **顺序执行、各自独立失败**（仅前端单仓 CI 时，若未检出后端工具，contract 门禁可留在后端 workflow 或聚合 CI 另步——见 §7）。

---

## 2. 范围 / 非范围

**范围**

- 导出 / `--check` 落点：`docs/_tech_graph/graph.json`。  
- **cwd**：执行任何导出或校验命令时，**当前工作目录须为 `ai-ink-brain` 子仓根**（与 `scheme_1` 输入根 `docs/_tech_graph` 相对本仓根一致）。  
- 在 **`.github/workflows/quality.yml`**（或等效 PR 必绿 workflow）接入步骤；与 **quality** 其余 step 的先后由实现 PR 定稿并写入「实现备忘」。  
- 若 **复用** 后端仓脚本：在 task / PR 中写清 **checkout 路径**（例如工作区布局下相对路径 `../ai-ink-brain-api-python/tools/<export_script>.py`）及 **Python 版本**；**不得**改脚本内契约校验逻辑。

**非范围**

- 方案2 / 方案3。  
- 跨仓合并 `graph.json`。  
- 改写 **`99_mermaid_protocol.md`** 语义（仅遵守）。  
- 在本仓内用单脚本 **替代** `_contract_manifest` / `tech_graph_contract_check`。

---

## 3. 依赖链接（相对工作区根 `Projects/`）

| 项 | 路径 |
|----|------|
| 规划 | `docs/tech_graph/改进方向.md` |
| SPEC 方案1 | `docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md` |
| 配对后端 task | `ai-ink-brain-api-python/docs/tasks/active/task_engineering_tech_graph_graph_json_export_v1.md` |
| 契约门禁（真值在后端仓） | `ai-ink-brain-api-python/tools/tech_graph_contract_check.py` |
| 契约真值 | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` |
| 拓扑协议 | `ai-ink-brain/docs/_tech_graph/99_mermaid_protocol.md`（若存在） |
| 工作区双轨 | 工作区根 `AGENTS.md`（§7） |

---

## 4. 验收标准（可勾选 / 可命令）

- [ ] 在 **`ai-ink-brain` 仓根**（cwd）执行约定命令后，`docs/_tech_graph/graph.json` 与 `.ai.md` 一致且已提交。  
- [ ] `--check`（或等价）失败时 **非 0**，stderr 可定位到文件 / 差异类型。  
- [ ] **PR 必绿**：修改 `.ai.md` 未更新 `graph.json` 时 CI **失败**（与 scheme_1 §CI 门禁一致）。  
- [ ] 自动化最小集：`pnpm test` / 专用脚本 / 或调用 Python `--check` 之一，具备 **可失败** 断言（与 `test_strategy: required` 一致）。  
- [ ] PR 说明写清：**graph 门禁** 与 **contract 门禁**（若同 pipeline）两条命令及顺序；**未**合并为一脚本。

---

## 5. failure_paths

| ID | 触发 | 行为（退出码/日志） | 可重试 | 用户可见类型 |
|----|------|---------------------|--------|----------------|
| FP-1 | `.ai.md` 不符合解析子集 | 非 0；stderr 含路径与行级提示 | 修图后重跑 | CI / 本地失败 |
| FP-2 | `--check` 下 `graph.json` 漂移 | 非 0；diff 摘要 | 重新生成并提交 | 同上 |
| FP-3 | cwd 非本仓根导致扫错目录 | 非 0 或生成空图 | 修正 CI `working-directory` | CI 配置错误 |
| FP-4 | 聚合 CI 未 checkout 后端脚本却配置复用路径 | import / 文件不存在 | 改路径或改为单仓自带脚本 | CI |

---

## 6. 闸口 A（方案1 后）

与后端 task 配对：对比实验 **现状 vs 方案1** 可在任一侧子仓或工作区 `docs/tech_graph/` 归档；本前端 task 须在「实现备忘」链到最终 md 与 **同一 `freeze_id`** 行（与后端 **逐字一致**，便于机械比对）。

---

## 7. CI 布局二选一（须定稿其一并在 PR 描述写明）

| 模式 | 说明 |
|------|------|
| **A. 单仓 CI** | 仅 `ai-ink-brain` 被 checkout：`cwd` = 该仓根；graph 步骤只校验本仓 `docs/_tech_graph/graph.json`。若复用后端 Python 脚本，须在 workflow 中 **额外 checkout** 后端路径或 **vendored 拷贝**（实现择一），并固定相对路径。 |
| **B. 工作区聚合 CI** | 工作区根 checkout：`cwd` 在 graph step 中 **`cd ai-ink-brain`**（或 `working-directory`），再调用 `python ../ai-ink-brain-api-python/tools/<export_script>.py --input docs/_tech_graph ...`；contract 与 graph **同 job 可顺序跑、独立失败**，**不**合并脚本。 |

**默认推荐**：在 **`ai-ink-brain` 自有 `quality`** 中采用 **模式 A**，避免上层 monorepo 与单独克隆前端仓行为分叉。

---

## 8. 实现备忘（由执行帽回填）

| 项 | 内容 |
|----|------|
| 采用 CI 模式 | **A**（`quality` 单仓：额外 `checkout` `Cyning12/ai-ink-brain-api-python` 至 `ai-ink-brain-api-python/`，与 §7 一致） |
| 导出 / 校验命令 | **cwd** = `ai-ink-brain` 仓根。复用后端脚本时 `--input` / `--output` 须为**绝对路径**（`tech_graph_graph_export.py` 内 `REPO_ROOT` 为 api-python 根，相对路径会解析错）。**CI**：`python3 ai-ink-brain-api-python/tools/tech_graph_graph_export.py --input "${GITHUB_WORKSPACE}/docs/_tech_graph" --output "${GITHUB_WORKSPACE}/docs/_tech_graph/graph.json" --check`。**本地再生成**：`python3 ../ai-ink-brain-api-python/tools/tech_graph_graph_export.py --input "$(pwd)/docs/_tech_graph" --output "$(pwd)/docs/_tech_graph/graph.json"`（工作区下后端仓为 `../ai-ink-brain-api-python`）。**本地校验**：`pnpm tech-graph:graph-check`（`package.json` 已封装 `sh -c` + 绝对路径）。 |
| workflow 文件与 job 名 | `.github/workflows/quality.yml` → job **`lint-and-build`**：步骤 **`Tech graph graph.json (--check)`** 位于 **`Install`** 之后、**`Lint`** 之前；与 **`tech_graph_contract_check`** 不同脚本、未合并。 |
| 闸口 A 链接 | 与后端同 freeze 对齐：`ai-ink-brain-api-python/docs/tech_graph/gate_a_scheme1_backend.md`（详：`gate_a_scheme1_perf_compare_backend_detail.md`） |

---

## 给 Cursor

`graph.json`、`tech_graph_contract_check`、`_contract_manifest`、`--check`、`cwd`、`quality`、`scheme_1`、`failure_paths`、`test_strategy`、`freeze_id`、`docs/_tech_graph`
