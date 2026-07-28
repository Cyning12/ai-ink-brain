# Task：技术图谱 — 方案1 静态 `graph.json` 导出与 CI 门禁（前端仓）

> **状态**：`done（2026-05-14 验收通过）`  
> **关联规划**：`docs/tech_graph/改进方向.md` **v1.1.3**（方案1 + **R1** + 前端 graph CI 消歧）；`docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`  
> **invoke_snapshot**：`docs/tech_graph/invokes/invoke_20260514_0000_10_tech-graph-scheme1-dual-task-draft.md`；`docs/harness/invokes/invoke_20260514_0031_10_tech-graph-scheme1-exec-converge.md`（链上一节：`docs/harness/invokes/invoke_20260514_20_tech-graph-scheme1-review-hat20.md`）；闸口 A 收口执行：`docs/harness/invokes/invoke_20260515_1200_30_tech-graph-gate-a-closeout.md`  
> **test_strategy**：`required`  
> **test_strategy_note**：方案1 价值在 **可 diff 的 `graph.json` + CI**；无自动化则图谱与 JSON 易脱节。与 **改进方向** v1.1.1 / v1.1.3 及 **SPEC scheme_1** 一致：**R1 物理条件已满足**（仅 `docs/_tech_graph/`、仓根无 `_tech_graph/`）时，**应**将 graph 门禁纳入 PR **必绿**；异构克隆仍须先完成 R1 迁移再绑 CI。  
> **freeze_id**：`TECH_GRAPH_S1_FREEZE_20260514_V1_1_3`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（profile.wiki=false）；本 task 未改 wiki |


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
| 复用导出脚本（真值） | `ai-ink-brain-api-python/tools/tech_graph_graph_export.py`（与后端 task 同源） |
| 配对后端 task | `ai-ink-brain-api-python/docs/tasks/active/task_engineering_tech_graph_graph_json_export_v1.md` |

---

## 4. 验收标准（与 `quality.yml` / `graph.json` 真值对齐 · 2026-05-15 勘误）

- [x] 在 **`ai-ink-brain` 仓根**（cwd）下，`docs/_tech_graph/graph.json` 与 `.ai.md` 解析输出一致且已纳入版本控制。  
- [x] **`--check`**（`tech_graph_graph_export.py --check`）失败时 **非 0**，stderr 可定位到文件 / 差异类型。  
- [x] **PR 必绿**：`quality` job **`lint-and-build`** 在 **`pnpm install`** 之后、**`pnpm lint`** 之前执行 **Tech graph graph.json (--check)**；与 `pnpm lint` / `pnpm test` / `pnpm build` 同链。  
- [x] **`test_strategy: required`**：以 CI 必跑的 **`python3 …/tech_graph_graph_export.py … --check`** 为可失败门禁（与 scheme_1 §CI 一致）；未另加 Vitest 专测，理由见 §9。

---

## 5. failure_paths

| ID | 触发 | 行为（退出码/日志） | 可重试 | 用户可见类型 |
|----|------|---------------------|--------|----------------|
| FP-1 | `.ai.md` 解析失败 | 非 0；stderr 含路径提示 | 修图后重试 | CI 失败 |
| FP-2 | `--check` 下 `graph.json` 漂移 | 非 0；diff 摘要 | 重生成并提交或修图 | CI 失败 |
| FP-3 | workflow 未检出后端仓或 `python3 ai-ink-brain-api-python/tools/...` 路径不存在 | 非 0；文件未找到 | 修正 `actions/checkout` 的 `path` / `repository` 或 job `working-directory` | CI 配置错误 |

> **说明**：当前实现为 **quality 单 job + 第二步 checkout** 将 `Cyning12/ai-ink-brain-api-python` 置于 **`${GITHUB_WORKSPACE}/ai-ink-brain-api-python`**（见 §9「采用 CI 模式」）；本地工作区则用 `../ai-ink-brain-api-python`（见 `package.json` **`pnpm tech-graph:graph-check`**）。

---

## 6. 闸口 A（方案1 后）

与后端 **共用同一闸口文档**：`ai-ink-brain-api-python/docs/tech_graph/gate_a_scheme1_backend.md`（含 **性能对比** 初案与前后端分工）；工作区规划 `docs/tech_graph/改进方向.md`「对比实验门闸」表仍为总纲。最低字段与后端 task **闸口 A** 表一致（现状 vs 方案1、指标、复现命令、快照 id、结论）。

---

## 7. 给执行帽的必读列表

1. 确认 **`docs/_tech_graph/`** 为唯一输入根（SPEC）。  
2. 复用后端脚本时：**`--input` / `--output` 须为绝对路径**（脚本内 `REPO_ROOT` 为 api-python 仓根）；CI 见 §9。  
3. **勿**与 `tech_graph_contract_check` 混为一谈；前端 **quality** 中 graph 与 contract **不同脚本、顺序独立失败**。

---

## 8. 矛盾与前提（R1）

| 结论 | 说明 |
|------|------|
| 本工作区 | `改进方向.md` v1.1：**R1 物理条件已满足**；若某克隆仍见仓根 `_tech_graph/`，须先按规划完成 **迁移 task** 再绑本单 CI。 |

---

## 9. 实现备忘（由执行帽回填 · 与仓库一致）

| 项 | 内容 |
|----|------|
| 采用 CI 模式 | **A**（`quality` 单 job：本仓 checkout 后 **再 checkout** `Cyning12/ai-ink-brain-api-python` 至 `ai-ink-brain-api-python/`；与改进方向 / scheme_1 所述「单仓 quality + 额外检出后端工具」一致） |
| 导出 / 校验命令 | **cwd** = `ai-ink-brain` 仓根（`GITHUB_WORKSPACE`）。**CI**：`python3 ai-ink-brain-api-python/tools/tech_graph_graph_export.py --input "${GITHUB_WORKSPACE}/docs/_tech_graph" --output "${GITHUB_WORKSPACE}/docs/_tech_graph/graph.json" --check`。**本地再生成**（工作区）：`python3 ../ai-ink-brain-api-python/tools/tech_graph_graph_export.py --input "$(pwd)/docs/_tech_graph" --output "$(pwd)/docs/_tech_graph/graph.json"`。**本地校验**：`pnpm tech-graph:graph-check`（`package.json` 已封装绝对路径 + `--check`）。 |
| workflow 文件与 job 名 | `.github/workflows/quality.yml` → job **`lint-and-build`**：步骤 **`Tech graph graph.json (--check)`** 位于 **`Install`** 之后、**`Lint`** 之前；与 **`tech_graph_contract_check`** 不同脚本、未合并。 |
| 闸口 A 链接 | 与后端同 **freeze_id**：`ai-ink-brain-api-python/docs/tech_graph/gate_a_scheme1_backend.md` |
| test_strategy / required 落实 | 以 **CI 必跑 `--check`** 为可失败自动化；未另加 Vitest，理由见 §4。 |
| 契约变更后 freeze_id | 若 bump 规划 / SPEC，须与后端 task **同一行**更新 **freeze_id**；实现 PR 可将 **短 commit hash** / Actions **run id** 记入 PR 描述（**不**写入本行 `freeze_id`） |

---

## 10. 验收签收（2026-05-14 · 书面关闭）

对照工作区模板 `docs/tech_graph/prompts/TEMPLATE-accept-tech-graph-graph-json-frontend-invoke.md` 验收表；**证据**以本仓已合并真值为准（合并 PR 的 **quality** 全绿与路径一致性由维护者在 PR 描述留痕 **run id**，不写入 `freeze_id` 行）。

| 编号 | 验收项 | 结论 | 证据 |
| --- | --- | --- | --- |
| A1 | `docs/_tech_graph/graph.json` 与解析器一致（CI `--check` 绿） | pass | 产物路径 `docs/_tech_graph/graph.json`；脚本 `ai-ink-brain-api-python/tools/tech_graph_graph_export.py` |
| A2 | **quality** 中 graph 步在 install 后、lint 前；Python 3.11 + 后端 checkout 与命令一致 | pass | `.github/workflows/quality.yml` → `Checkout backend` + `Tech graph graph.json (--check)` |
| A3 | `pnpm lint` / `pnpm test` / `pnpm build` 与 graph 步同链 | pass | 同上 workflow 步骤顺序 |
| A4 | `test_strategy=required`：CI 必跑 `--check` 理由成立 | pass | 见 §4、§9 |
| B1 | FP-1～FP-3 与实现一致（含第二 checkout 失败路径） | pass | 见 §5 |
| B2 | 闸口 A：备忘指针满足「可关任务 / 须后补」二选一 | pass | §6 / §9 链至 `gate_a_scheme1_backend.md`；**性能对比书面结论**仍属闸口 A 下一阶段（不阻塞本 task 关闭） |
| B3 | §9 与仓库路径、脚本名一致 | pass | `quality.yml`、`package.json` → `tech-graph:graph-check`、`../ai-ink-brain-api-python/tools/tech_graph_graph_export.py` |

**汇总**：2026-05-15 已按仓库真值勘误 §4 / §5 / §9 / 本表（此前误写本仓 `tools/export_graph_json.py`，与当前 **复用后端脚本 + 双 checkout** 不一致）。闸口 A 书面结论仍以 **`gate_a_scheme1_backend.md`** 为准。

---

## 给 Cursor

`graph.json`、`docs/_tech_graph`、`quality`、`--check`、`scheme_1`、`failure_paths`、`test_strategy`、`task_engineering_tech_graph_graph_json_export_v1`
