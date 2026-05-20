# Task：技术图谱 v2 — 前端 `_manifest.json` 与 manifest_check（T5 · W6）

> **状态**：`active`（R1 审查通过；30 帽实现中）  
> **关联 SPEC**：`content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md` §4 W6、§8 T5、§11 顺序 6  
> **关联图谱**：`docs/_tech_graph/99_spec.md`、`00_main.ai.md`、`10_flow_route.ai.md`、`11_flow_api.ai.md`  
> **invoke_snapshot**：`content/harness/invokes/invoke_20260520_10_tech-graph-v2-frontend-manifest-requirements.md`  
> **路线图**：`docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md` §2.2 **T5**（关账后 §0 回填）  
> **git_branch**：`task/tech-graph-v2-frontend-manifest-v1`  
> **test_strategy**：`required`  
> **test_strategy_note**：manifest 漂移须 **可失败自动化**；负向用例（删 manifest 中一条 route）须使校验 **exit 1**，与后端 P1 manifest task 同口径。  
> **freeze_id**：`TECH_GRAPH_S2_FREEZE_20260519_V2_3`（仅约束图谱 freeze 行；manifest schema bump 须本 task 修订记录一行说明）  
> **audit_profile**：`full`（建议 R1 任务审核后再执行）

---

## 1. 背景与目标

### 1.1 背景

- **T1/T2** 已落地（`36acb5e` 及后续合并）：`graph.json` export `--check`、equivalence 已进 **`quality`**；**不重做** export/equivalence，**不重跑** 闸口 A/B/C。
- 后端 **P1** 已有 `docs/_tech_graph/_manifest.json` + `tools/tech_graph_manifest_check.py`（Python 域：FastAPI 端点 / Supabase / env）。
- 前端 **99_spec** 已声明反幻觉规则：`app/**/page.tsx`、`app/api/**/route.ts` 须在图谱体现，但 **尚无** 机器可读 manifest 与强校验。

### 1.2 目标（完成态）

1. 在 **`ai-ink-brain/docs/_tech_graph/_manifest.json`** 落盘 **Next.js 域** 真值（页面路由 + App Router API + 关键 env 子集）。
2. **复用** 配对后端仓 `tech_graph_manifest_check.py`（扩展 profile，见 §6 裁定），前端仅增 **`pnpm tech-graph:manifest-check`** 封装与 CI 一步。
3. **机械验收**：故意从 manifest 删除一条现存 `route.ts` 对应项 → 校验 **非 0** 且 stderr 可定位 **缺失/多余**。

---

## 2. 范围

| # | 工作项 | 产出 |
| --- | --- | --- |
| W6-1 | 设计并提交 `_manifest.json` | `schema_version: tech_graph_manifest_v1`；`repo: ai-ink-brain`；覆盖 **§3.1 真值扫描面** |
| W6-2 | 扩展 `tech_graph_manifest_check.py` | CLI：`--repo frontend`（或 `--profile frontend`）+ `--repo-root` + `--manifest`（默认 `docs/_tech_graph/_manifest.json`） |
| W6-3 | 真值抽取 | 从 `app/**/page.tsx` 推导 **页面 URL**；从 `app/api/**/route.ts` 抽取 **HTTP method**（`GET`/`POST`/… 导出函数名）+ **路径**；从 `lib/**` + `app/**` 抽取 **关键 env**（见 §3.2） |
| W6-4 | DX | `package.json`：`tech-graph:manifest-check`（与现有 `tech-graph:graph-check` 同模式，指向 sibling `ai-ink-brain-api-python/tools/...`） |
| W6-5 | CI | **裁定**：并入 **`.github/workflows/quality.yml`**，在 **equivalence** 之后、`pnpm lint` 之前新增一步（**不**新建独立 `tech-graph-manifest.yml`） |
| W6-6 | 文档 | `99_spec.md` 增加 manifest 小节；`AGENTS.md` 脚本矩阵补一行（**勿依赖** `docs/meta/PROJECT_CONFIG_*.md` 若未入库 Git） |

---

## 3. 非范围

- **禁止** 新建第二份 `_contract_manifest.json`（跨仓契约真值仍仅在后端）。
- **禁止** 复制后端 RAG/Text2SQL **业务子图** 或后端 manifest 的 **endpoints/supabase/rpc** 段落到前端 manifest。
- **禁止** 本 task 修改 `docs/_tech_graph/*.ai.md` 拓扑（**T3** 独占；仅可在 manifest 中 **引用** 既有锚点路径）。
- **禁止** 重复实现 `tech_graph_graph_export` / `equivalence` 逻辑或调整其 CI 顺序。
- **禁止** 在前端仓复制完整 `tools/tech_graph_*.py` 树（除通过后端脚本 + 参数调用）。
- **禁止** 把所有 `process.env` 写入 manifest（仅 **关键子集**，与 §3.2 一致）。

---

## 4. 依赖与引用

| 依赖 | 路径（相对工作区根 `Projects/`） |
| --- | --- |
| Parity SPEC | `ai-ink-brain/content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md` |
| Playbook Phase 5 | `ai-ink-brain/content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md` §3 Phase 5 |
| 路线图 | `docs/tech_graph/tasks/PRIORITY_ROADMAP_v1_zh.md` §2.2 T5 |
| 前端规约 | `ai-ink-brain/docs/_tech_graph/99_spec.md` |
| 后端 manifest 样例 | `ai-ink-brain-api-python/docs/_tech_graph/_manifest.json` |
| 后端 manifest 脚本（扩展点） | `ai-ink-brain-api-python/tools/tech_graph_manifest_check.py` |
| 后端 P1 归档 task | `ai-ink-brain-api-python/docs/tasks/done/task_tech_graph_p1_manifest_and_validation_v1.md` |
| 现有 CI | `ai-ink-brain/.github/workflows/quality.yml` |
| 现有 pnpm 脚本 | `ai-ink-brain/package.json`（`tech-graph:*`） |
| 方法论 R1 | `ai_coding_governance/methodology/graph/改进方向.md` |

**真值扫描面（执行帽初始化 manifest 时须全覆盖）**

### 4.1 页面与 API（2026-05-20 基线快照 · 共 26 文件）

**`app/**/page.tsx`（11）**：`/about`、`/blog`、`/blog/[...slug]`、`/chain-chat`、`/chat`、`/diary`、`/`、`/learning`、`/projects`、`/text2sql`、`/unified-chat`。

**`app/api/**/route.ts`（15）**：`/api/admin/ingest`、`/api/admin/sync`、`/api/auth/logout`、`/api/auth/session`、`/api/auth/unlock`、`/api/chat`、`/api/ingest`、`/api/py/chain/chat`、`/api/py/chat/history`、`/api/py/chat`、`/api/py/chatbi/access/verify`、`/api/py/text2sql/chat`、`/api/py/unified/chat`、`/api/py/unified/chat/stream`、`/api/system/status`。

> 动态段（如 `[...slug]`）在 manifest 中用 **App Router 段语法** 登记；校验脚本须与 Next 文件路径规则一致（执行帽实现时以 **文件系统 walk** 为 truth，禁止手写遗漏）。

### 4.2 关键 env（子集 · 对齐代码与 99_spec 叙述）

须覆盖（至少，可从 `lib/**` + `app/api/**` 扫描合并）：

`NODE_ENV`、`PY_API_URL`、`NEXT_PUBLIC_ADMIN_SECRET`、`CHAT_API_SECRET`、`NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`SUPABASE_SERVICE_KEY`、`SILICONFLOW_API_KEY`、`SILICONFLOW_BASE_URL`、`SILICONFLOW_CHAT_MODEL`、`SILICONFLOW_EMBEDDING_*`、`EMBEDDING_PROVIDER`、`EMBEDDING_DIM`、`RAG_MATCH_THRESHOLD`、`RAG_MATCH_COUNT`（若代码引用）、`DASHSCOPE_*`（若 embeddings 路径引用）。

**前缀规则（建议与后端脚本对称）**：`NEXT_PUBLIC_`、`SUPABASE_`、`SILICONFLOW_`、`RAG_`、`EMBEDDING_`、`DASHSCOPE_` + 精确集合 `{ NODE_ENV, PY_API_URL, CHAT_API_SECRET }`。

---

## 5. 方案裁定（需求帽 · 不写 Python 实现）

| 决策点 | 裁定 | 理由 |
| --- | --- | --- |
| manifest_check 落点 | **A：扩展后端 `tech_graph_manifest_check.py`**（`--repo frontend` + `--repo-root` + `--manifest`） | 与 T1/T2 **「后端 tools + 路径参数」** 一致；diff/退出码逻辑 **单点维护**；避免双实现漂移 |
| 前端 wrapper | **仅 DX**：`package.json` 一条 `sh -c 'python3 …manifest_check.py --repo frontend …'`；**不**在前端仓再写一份校验逻辑 | wrapper 不能替代 A；若只加 wrapper 而不改脚本则无法校验 Next 路由 |
| CI 接入 | **并入 `quality.yml` 单 job**（equivalence 后、lint 前） | Python 3.11 与后端 checkout **已存在**；独立 workflow 增加 Required checks 维护成本，收益低 |
| manifest 段结构 | **`pages[]` + `routes[]` + `env[]` + 可选 `anchors[]`**；**不含** `supabase` / 后端式 `endpoints` | 域分离；防止与后端 manifest 混读 |
| `_manifest.json` 路径 | `docs/_tech_graph/_manifest.json`（与 `graph.json` 同目录） | 与后端布局对称，Agent 单目录消费 |

**后端脚本扩展契约（执行帽须满足）**

- 默认行为（无 `--repo`）**不变**：仍校验 `ai-ink-brain-api-python` 现有 manifest。
- `--repo frontend`：`--repo-root` 指向 **前端仓根**（CI：`GITHUB_WORKSPACE`；本地：`pwd`）。
- 退出码：**0**=OK，**1**=drift，**2**=运行/配置错误（与现脚本一致）。
- Next `route.ts` truth：识别 `export async function GET|POST|PUT|PATCH|DELETE`（及 `export function` 变体）；路径由 `app/api/.../route.ts` 相对路径映射为 URL（含 `route groups` 若未来出现须一并规则化）。

---

## 6. 验收标准

- [ ] `docs/_tech_graph/_manifest.json` 存在；`schema_version`=`tech_graph_manifest_v1`；`repo`=`ai-ink-brain`；`pages`/`routes`/`env` 字段齐全。
- [ ] 本地：`pnpm tech-graph:manifest-check` → **exit 0**，stdout 含 `OK`（或等价成功语义）。
- [ ] **负向（required）**：从 manifest **删除** 一条仍存在于仓库的 `route`（例如 `POST /api/py/unified/chat/stream`）→ 同一命令 **exit 1**，stderr 列出 **缺失（truth→manifest）**；测试后 **恢复** manifest 再提交。
- [ ] **正向漂移**：临时在 manifest **多余** 一条不存在的 API → **exit 1**，stderr 列出 **多余（manifest→truth）**；恢复后 exit 0。
- [ ] PR **`quality`** workflow 全绿，且日志中存在 **Tech graph manifest check**（或同等 step 名）步骤且 exit 0。
- [ ] `99_spec.md` / `AGENTS.md` 已文档化 manifest 命令与失败语义（FP-MF-*）。
- [ ] **未** 修改任何 `docs/_tech_graph/*.ai.md`（除非人工另开 T3；本 task 不计入验收）。
- [ ] 关账后更新 `PRIORITY_ROADMAP_v1_zh.md` §2.2 **T5** → `done（YYYY-MM-DD）` 并填 **子 task 路径**。

---

## 7. failure_paths

| ID | 触发 | 系统行为 | 可重试 | 用户可见 |
| --- | --- | --- | --- | --- |
| FP-MF-1 | manifest 与源码路由/env 不一致 | `manifest_check` **exit 1**；打印 missing/extra/changed | 修 manifest 或代码后重跑 | CI 失败 / 本地非 0 |
| FP-MF-2 | `_manifest.json` 缺失或 JSON/schema 字段错误 | **exit 2**；`ERROR: manifest invalid` | 修复文件结构 | CI 失败 |
| FP-MF-3 | CI 未 checkout `ai-ink-brain-api-python` 或脚本路径错误 | **exit 2**；file not found | 修 `quality.yml` checkout | CI 配置错误 |
| FP-MF-4 | `--repo-root` 指错仓（在后端 cwd 跑 frontend profile） | **exit 2** 或空扫描误报 | 修正 CLI 参数 / pnpm 脚本 | 本地/CI 误配 |
| FP-MF-5 | 执行帽误改 `.ai.md` 拓扑 | 与 T3 冲突；本 task **拒验收** | 回滚 ai 图变更 | 流程阻塞 |

---

## 8. 给执行帽的必读列表

1. 先读 **§5 裁定**；不得改为「仅前端复制脚本」或「独立 tech-graph workflow」除非新开变更请求。  
2. 只读参考后端：`ai-ink-brain-api-python/tools/tech_graph_manifest_check.py`、`docs/_tech_graph/_manifest.json`。  
3. 初始化 manifest 时以 **§4.1 文件 walk** 为准，勿仅抄本 task 列表（列表为需求帽快照，新增路由须由脚本发现）。  
4. CI step 示例（cwd=前端仓根）：  
   `python3 ai-ink-brain-api-python/tools/tech_graph_manifest_check.py --repo frontend --repo-root "${GITHUB_WORKSPACE}" --manifest "${GITHUB_WORKSPACE}/docs/_tech_graph/_manifest.json"`  
5. 合并前必绿（本 task）：`pnpm tech-graph:manifest-check` + 现有 `pnpm tech-graph:graph-check` + `pnpm tech-graph:equivalence-check` + `pnpm lint` + `pnpm test` + `pnpm build`（与根 `AGENTS.md` §8 一致）。  
6. **后端仓改动**：扩展 `manifest_check` 时须在 **api-python 仓** 提交；前端 PR 须 pin 或假设 **main 已含** 扩展（跨仓 PR 顺序在审查帽注明）。

---

## 9. 实现备忘（由 30 帽回填）

| 项 | 内容 |
| --- | --- |
| 前端涉及文件 | `docs/_tech_graph/_manifest.json`、`package.json`、`.github/workflows/quality.yml`、`docs/_tech_graph/99_spec.md`、`AGENTS.md` |
| 后端涉及文件 | `tools/tech_graph_manifest_check.py`（扩展 frontend profile） |
| 图谱变更 | **无** `.ai.md` 要求；可选 `99_spec` 文字 |
| 跨仓顺序 | 建议 **先** api-python 合并脚本扩展，**再** 前端 manifest + CI |

### 自检结论（执行者）

| 项 | 结果 |
| --- | --- |
| 执行日期 | 2026-05-20 |
| 分支 | `task/tech-graph-v2-frontend-manifest-v1`（`ai-ink-brain` + `ai-ink-brain-api-python`） |
| invoke_snapshot（30） | `content/harness/invokes/invoke_20260520_30_tech-graph-v2-frontend-manifest-execute.md` |
| 审查 R1 | `content/harness/reviews/task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md` |

**VERIFY（本地 · 全链 exit 0）**

```text
pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build
```

要点：

- `tech-graph:manifest-check` → **exit 0**；stdout：`OK: frontend manifest matches code truth (pages=11, routes=16, env=20).`
- `tech-graph:graph-check` / `equivalence-check` → **exit 0**
- `pnpm lint` / `test`（23 tests）/ `build` → **exit 0**

**负向（required · 删 route）**

- 操作：从 `_manifest.json` 删除 `POST /api/py/unified/chat/stream` 后执行 `pnpm tech-graph:manifest-check`
- 结果：**exit 1**；stderr 含 `Routes 缺失（truth->manifest）：` 与 `POST /api/py/unified/chat/stream`
- 恢复 manifest 后再次 **exit 0**

**跨仓**

- `ai-ink-brain-api-python/tools/tech_graph_manifest_check.py`：新增 `--repo frontend`；默认无 `--repo` 行为未变（本地 api-python manifest **exit 0**）
- **CI 风险**：`quality.yml` checkout 后端 `main`；须 **先** 合并 api-python PR（含 frontend profile），再合并前端 PR

**待 40 帽 / R2**：§6 勾选、路线图 T5 关账、PR 合并证据。

---

## 10. 下一棒 Prompt 要点

### 10.1 任务审核帽（22）— 建议优先

- 待审：`content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md`  
- SPEC：`content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md`  
- 重点核对：§5 裁定是否可执行、§4.2 env 子集是否过宽/过窄、跨仓 PR 顺序、**required** 负向验收是否写入 §6。  
- 审查落盘：`ai-ink-brain/content/harness/reviews/`（若目录不存在则创建，遵循 `docs/harness/reviews/README.md` 命名）。  
- 无阻塞后：下一棒 **30**。

### 10.2 执行编码帽（30）

- `{{TASK_PATH}}`：`ai-ink-brain/content/tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md`  
- `{{SUBPROJECT_ROOT}}`：`ai-ink-brain`（后端改动在 `ai-ink-brain-api-python`）  
- `{{VERIFY_COMMAND}}`：`pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check && pnpm lint && pnpm test && pnpm build`  
- 分支：`task/tech-graph-v2-frontend-manifest-v1`  
- **先** 实现 backend script frontend profile + **负向自测**，**再** manifest JSON + quality step。

---

## 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-05-20 | 10 帽需求分析落盘；方案裁定 A + quality CI；Harness 字段齐全 |
| v1.1 | 2026-05-20 | 30 帽：manifest + script frontend profile + quality step；§9 自检回填 |

---

## 给 Cursor

`tech_graph_manifest_v1`、`_manifest.json`、`manifest_check`、`--repo frontend`、`quality.yml`、`T5`、`W6`、`test_strategy: required`、`FP-MF`
