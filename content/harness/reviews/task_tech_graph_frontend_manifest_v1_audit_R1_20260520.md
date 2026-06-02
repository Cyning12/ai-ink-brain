# 任务审核：技术图谱 v2 — 前端 `_manifest.json` 与 manifest_check（T5 · W6 · R1）

## 元信息

| 项 | 内容 |
|----|------|
| **关联 task** | [`../../tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md`](../../tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md) |
| **关联 SPEC** | [`../../tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md`](../../tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md) §4 W6、§8 T5、§11 顺序 6 |
| **轮次** | R1 |
| **审查日期** | 2026-05-20 |
| **slug** | `tech_graph_frontend_manifest_v1` |
| **invoke_snapshot（10 帽）** | [`../invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md`](../invokes/by-task/frontend-tech-graph-v2-manifest/invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md) |
| **上一轮审查** | 无 |
| **对照规约** | `docs/harness/prompts/22-task-audit.md`、`docs/harness/HARNESS_V2_PLAN.md` §5（工作区根） |
| **建议分支** | `task/tech-graph-v2-frontend-manifest-v1`（前端）；后端扩展同主题分支或独立 `api-python` PR |

---

## 审查结论摘要

待审 task v1.0 与 SPEC T5/W6、10 帽 invoke 一致：**方案 A**（扩展 `ai-ink-brain-api-python/tools/tech_graph_manifest_check.py` 的 `--repo frontend` profile）、**CI 并入** `quality.yml`（equivalence 后、lint 前）、**跨仓顺序**「先 api-python 脚本、再前端 manifest + CI」、**§6 双向负向验收**（删 truth 项 / 多加 manifest 项）与 `test_strategy: required` 均已写清且可机械执行。

对照现网：`quality.yml` 已 **checkout 后端仓** + **Python 3.11** + graph `--check` + equivalence（约 L19–50）；`package.json` 已有 `tech-graph:graph-check` / `equivalence-check` 模式可复用；后端 `manifest_check.py` **尚无 CLI**，默认仅校验 api-python（`endpoints`/`supabase`/`env`），扩展工作量在 task §5 已界定。§4.1 路由快照（11 `page.tsx` + 15 `route.ts`）与仓库 `find` 计数 **一致**。

**结论**：**零阻塞**；**建议 30 执行帽开工**。`audit_profile: full` → 执行与自检完成后须 **R2** 在「签收 / 关闭」声明关账；本轮 R1 **不** 声明 task 可 `done`。

---

## 重点核对（用户指定）

### §5 裁定：后端扩展 + quality CI

| 裁定项 | 可执行性 | 核对依据 |
|--------|----------|----------|
| **A：扩展 `tech_graph_manifest_check.py`** | **可执行** | 与 T1/T2「后端 tools + 路径参数」一致；现脚本 diff 语义（missing/extra、`exit 1/2`）可复用；须新增 **frontend profile**：`pages[]`/`routes[]`/`env[]` 校验分支，**默认无 `--repo` 行为不变**（task §5 已写）。 |
| **前端仅 wrapper** | **可执行** | 对齐 `tech-graph:graph-check` 的 `sh -c 'python3 …api-python/tools/…'`；禁止双份校验逻辑（task §3 非范围）。 |
| **CI：并入 `quality.yml` 单 job** | **可执行** | 现 workflow 已有后端 checkout 与 Python step；在 **L49–50 equivalence 之后、L52 lint 之前** 插入一步即可，无需新 Required check（task W6-5）。 |
| **manifest 段结构** | **可执行** | 与后端 `endpoints`/`supabase` **域分离**；执行帽在 frontend profile 内实现 `_expect_pages` / `_expect_routes` 等，勿混读后端 manifest。 |

**执行帽契约补充（非阻塞）**：扩展时建议 `--repo frontend` 与 task 全文统一（invoke 曾写 `--graph-root`，以 task §5 为准）；CLI 须显式 `--repo-root`、`--manifest`，与 §8 第 4 条 CI 示例一致。

### 跨仓 PR 顺序

| 项 | 结论 |
|----|------|
| task §9 / §8-6 | **先** `ai-ink-brain-api-python` 合并 `manifest_check` frontend profile，**再** 前端 `_manifest.json` + `quality.yml` + `package.json`。 |
| CI 风险 | 前端 `quality.yml` 固定 `checkout` 后端 **`main`**（现 L23–24）；若仅前端 PR 先合并而 api-python 未上 main，CI 将 **FP-MF-3**（脚本无 frontend 分支）或跑旧逻辑。**可操作**：执行阶段 **api-python PR 先合 main**，或临时在 workflow 用 `ref:` 指向含扩展的分支（须 PR 说明，非 task 阻塞）。 |
| 双 PR 纪律 | 允许两 PR 并行开发；**合并顺序**以 task 为准，前端合并前确认 main 上脚本已含 `--repo frontend`。 |

### §6 负向验收

| 验收条 | 可操作性 |
|--------|----------|
| 删 manifest 中仍存在的 `route` → **exit 1** + stderr **缺失（truth→manifest）** | **可操作**；示例 `POST /api/py/unified/chat/stream` 合理；须 **恢复** manifest 再提交（task 已写）。 |
| 多余 API → **exit 1** + **多余（manifest→truth）** | **可操作**；与后端 P1 口径一致。 |
| `test_strategy: required` + `test_strategy_note` | **满足** Harness §5.1「先可失败自动化」；负向为 **脚本/CLI 红绿**，非 vitest，与 manifest 域匹配。 |
| PR `quality` 日志 step | **可操作**；建议 step 名 **`Tech graph manifest check`**（与 task §6 一致）。 |

### §4.2 env 子集是否可操作

| 维度 | 结论 |
|------|------|
| **前缀 + 精确集合** | **可操作**：`NEXT_PUBLIC_`、`SUPABASE_`、`SILICONFLOW_`、`RAG_`、`EMBEDDING_`、`DASHSCOPE_` + `{ NODE_ENV, PY_API_URL, CHAT_API_SECRET }` 覆盖现网 `lib/**` 与 `app/api/**` 中主要 `process.env.*`（抽样：`PY_API_URL`、`SILICONFLOW_*`、`EMBEDDING_DIM`、`DASHSCOPE_API_KEY` 等）。 |
| **扫描实现** | frontend profile 须用 **`process.env.VAR` / `process.env["VAR"]` 正则**（非后端 `os.getenv`）；扫描面 `lib/**` + `app/api/**` 与 task §4.2 一致。 |
| **`RAG_MATCH_COUNT`** | 当前仓库 **无引用**；「若代码引用」→ truth 集合不含此项，**不阻塞**。 |
| **`SILICONFLOW_EMBEDDING_*`** | 代码实为 `SILICONFLOW_EMBEDDING_ENDPOINT` / `_MODEL` / `_DIM` 等；**前缀规则**可覆盖，无需逐字列举。 |
| **平台变量** | `VERCEL_*` 出现在 `app/api/system/status/route.ts`，**不在** §4.2 前缀表内 → 按前缀过滤 **不应** 进入 env truth，避免误报；执行时勿改为「凡 `process.env` 全量」。 |
| **与后端 env 表差异** | 后端 `KEY_ENV_PREFIX` 含 `DEBUG_`/`SSE_`/`TEXT2SQL_`；前端 task **刻意不含**，符合域分离，**非矛盾**。 |

---

## 阻塞 / 非阻塞

| 类型 | 说明 |
|------|------|
| **阻塞** | **无** |
| **非阻塞（已核对）** | （1）**Harness 字段**：`test_strategy`/`freeze_id`/`failure_paths` FP-MF-1～5 齐全且与脚本语义一致。（2）**非范围**：无第二份 contract manifest、不改 `.ai.md`、不重做 export/equivalence。（3）**SPEC**：W6 在 SPEC 标「二期」，路线图 T5 `in_progress` 与本 task 立项一致。（4）**§4.1 快照**：11+15 与仓库一致；执行仍以 **walk** 为 truth（task §8-3）。（5）**T3 并行**：无 `.ai.md` 冲突。 |
| **非阻塞（执行帽注意，不必 R2 前改 task）** | （1）`manifest` 中 `routes[]` 建议键格式与后端对齐为 **`METHOD path`**（与现 `_endpoint_key` 一致），便于复用 diff 打印。（2）`page.tsx` URL 推导须处理 `app/` 根、`(groups)`、动态段 `[...slug]`（task §4.1 已提示）。（3）关账须改 `PRIORITY_ROADMAP` §2.2 T5（task §6 最后一条）。（4）`PROJECT_CONFIG` 未入库时以 **代码扫描 + 99_spec** 为准（task §2 W6-6 已免责）。 |

---

## 需任务帽回填清单（若有）

本轮 **无必须回填项**。

可选增强（**不阻塞 30**）：在 task **§5 后端脚本扩展契约** 增一行「frontend env truth：`process.env` 正则，扫描 `lib/**` + `app/api/**`」；在 **§9 跨仓顺序** 增「前端 PR 合并门禁：api-python `main` 已含 frontend profile」。若执行中发现 CI checkout ref 问题，由 30 帽在 PR 描述记录，无需为 R1 开 R2。

---

## 是否建议执行帽开工

**建议开工**。

1. **顺序**：api-python 扩展 `manifest_check` + 本地负向自测 → 前端 `_manifest.json` + `pnpm tech-graph:manifest-check` + `quality.yml` step。  
2. **验证**（task §8）：`pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build`。  
3. **禁止**：独立 `tech-graph-manifest.yml`、前端复制完整 `tools/tech_graph_*.py`、本 task 改 `.ai.md`。  
4. 依赖本审查：`ai-ink-brain/content/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md`。

---

## 签收 / 关闭

| 项 | 结论 |
|----|------|
| **本轮 R1** | **通过审查**；**准许进入 30 执行帽**；task 头部 `pending` 可在开 PR 时改为 `active`（纪律项，非阻塞）。 |
| **task 正式关闭** | **未满足**。须：§6 全勾、§9 自检回填、双仓 PR 合并、`quality` 含 manifest step 且负向用例已跑通；完成后 **40 自检** + **R2** 签收（`audit_profile: full`）。 |

---

## 下一棒可复制 Prompt

以下与 **对话回复** 中「下一棒」块 **逐字一致**。

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽的必读列表」、根 AGENTS.md §8（合并前必绿命令真值，若与本条 VERIFY 冲突以 task + 子仓 workflow 为准）

输入（已由人工替换占位符；若你仍看到 {{…}} 或「待填」，须先追问用户，不得开工写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md
- 子仓根（相对 Projects/；主改代码 cwd；后端扩展在 ai-ink-brain-api-python）：
ai-ink-brain
- 合并前须跑通的验证命令（与 CI / task 一致）：
pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build
- 关联任务审核书面结论路径（无则「无」）：
ai-ink-brain/content/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md
- 关联 SPEC / 总规（无则「无」）：
ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md

你必须完成：
0. **Invoke 快照（开帽起点）**：在输出下列第 1 条起的实质性结果之前，先将 **本用户消息全文**（= 本模板 §3、占位符已全部替换）按 `docs/harness/invokes/README.md` 落盘。前端 task 落盘至 `ai-ink-brain/content/harness/invokes/`（含元数据表 + 快照 fenced code）。同一会话内追问 **不** 再新增快照文件。
0b. **人工闸**：扫描 task / 关联 reviews 的 `human_gate`（见 docs/harness/prompts/HANDOFF_SEMI_AUTO.md）。若任一对 **本帽（30）** 为 `pending` → 仅输出须人改的 `gate_id` 与路径，**拒开工**；禁止代填 `approved`。
1. 通读 task 全文：§5 裁定、§6 验收、§8 必读、failure_paths FP-MF-*；不得改为「仅前端复制脚本」或独立 tech-graph workflow。
2. 若拒开工条件未满足 → 仅输出阻塞清单，不写业务代码。
3. `test_strategy: required`：**先** 扩展 api-python `tech_graph_manifest_check.py`（`--repo frontend`）并跑通 **负向**（删一条 route → exit 1），**再** 提交前端 `_manifest.json` 与 CI。
4. **跨仓顺序**：api-python PR（脚本扩展）优先合 **main**（或 CI 显式 pin ref）；再前端 PR（manifest + quality.yml + package.json `tech-graph:manifest-check`）。
5. 在 `ai-ink-brain` 分支 `task/tech-graph-v2-frontend-manifest-v1` 工作；后端改动在 `ai-ink-brain-api-python` 对应分支。
6. 执行 VERIFY 命令，保留要点；回填 task **§9「### 自检结论（执行者）」**（含负向用例摘要、exit code）。
7. 对话输出下一棒 Prompt（如需 40 自检）或阻塞说明。
8. **自动 commit**：按 `docs/harness/prompts/HANDOFF_AUTO_COMMIT.md` 在 **各仓 git 根** 分别 commit 本轮路径（禁止 `git add -A`）。用户写明「不要 commit」则跳过。

禁止：修改 `docs/_tech_graph/*.ai.md`；第二份 `_contract_manifest`；在未合 main 的脚本上单独合并前端 PR 而不说明 CI 风险。
```
