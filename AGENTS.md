# AI-Ink-Brain（前端）— Agent 导航

> **角色**：Next.js 15 博客 + BFF、页面渲染、AI 对话 UI、Python API 代理转发。  
> **边界**：Embedding、向量检索、分块、写入逻辑 **不在本仓**；所有 AI 能力以 `PY_API_URL` 为唯一入口。

---

## 必读（按顺序）

1. **`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`**：环境变量、目录职责、API 契约摘要
2. **规则文件**（`.cursor/rules/*.mdc`）：Next.js 规范、视觉风格、Streaming、API 边界分离；其它 Agent 平台读本文 **自动同步规则** 小节（运行 `python3 tools/gen_agents_md.py` 从 `.mdc` 生成）
3. **`docs/_tech_graph/`**：技术图谱（架构唯一可信来源）
   - `00_main.md` — 路由 & 渲染流程（[AI 协议版](docs/_tech_graph/00_main.ai.md)）
   - `01_struct.md` — TS 类型 & 数据结构
   - `02_version.md` — 前端版本迭代
   - `10_flow_route.md` — 页面路由流程（[AI 协议版](docs/_tech_graph/10_flow_route.ai.md)）
   - `11_flow_api.md` — API 请求 & 代理流程（[AI 协议版](docs/_tech_graph/11_flow_api.ai.md)）
   - `12_flow_auth.md` — 登录 & 权限 & Session（[AI 协议版](docs/_tech_graph/12_flow_auth.ai.md)）
   - `13_flow_components.md` — 组件渲染 & 数据交互（[AI 协议版](docs/_tech_graph/13_flow_components.ai.md)）
   - `99_spec.md` — 前端实现规约（含 graph_v2 CI、跨仓契约指针）
   - `graph_v2_schema.md` — `graph.json` 字段与失败码
   - `99_mermaid_protocol.md` — Mermaid 拓扑协议摘要（完整版见配对后端仓同名文件）
   - **迁移实践**：`content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`
4. **`content/tasks/README.md`** + **`content/tasks/active/`**、**`content/tasks/done/`**：任务规格与归档规则（与后端 `docs/tasks/` 分类一致）
5. **Coding Wiki（L2 编译层 · 关账回顾默认读序）**
   - 入口：`../ai-ink-brain-api-python/docs/coding_wiki/index.md`、`../ai-ink-brain-api-python/docs/coding_wiki/CODING_WIKI.md`、`../ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Wiki-Agent-Readorder-v1.md`
   - 读序：`index` → `syntheses/<slug>` → pointer 回到 L1 task；当任务涉及改代码（路由/BFF/契约）时，仍以本仓 L0 `docs/_tech_graph/` + query 为准，Wiki 不替代实现真值。
6. **多子仓协作**（总设职责、任务单规范与落盘路径）见工作区根 `Projects/AGENTS.md` **§2**，跨仓任务按该约定先写任务初稿再分派子 Agent 丰富。

---

## 非必读（按需）

| 路径 | 说明 |
|------|------|
| **`docs/diary/`** | Agent 总结、实验报告；**默认不读**，仅 task / 用户 `@` 显式指向时打开 |
| **`content/diary/`** | 博客日记正文素材；**默认不读** |
| **配对后端 `docs/diary/jsonPKmermaid/`** | 图谱 **行为实验轨**（闸口 A–C″、fixtures、runs）；**非必读**，非实验复现任务勿主动遍历 |
| **写作规范** | 向 diary 新增内容时见 `docs/diary/DIARY_GUIDE.md`；工作区根 `DIARY_GUIDE.md` 为跨仓日记格式 |

---

## 关键入口文件（改代码从这里开始）

| 文件 | 职责 |
|------|------|
| `app/layout.tsx` | 根布局、全局导航 |
| `app/page.tsx` | 首页 |
| `app/chat/page.tsx` | RAG 对话页面 |
| `app/unified-chat/page.tsx` | Unified Chat 页面 |
| `app/api/py/chat/route.ts` | Python API 代理（chat） |
| `app/api/py/unified/chat/route.ts` | Python API 代理（unified） |
| `app/api/py/unified/chat/stream/route.ts` | SSE 流式代理 |
| `lib/auth.ts` | 统一鉴权入口 |
| `lib/chat/chatApi.ts` | Chat API 封装 |
| `components/ChatPanel.tsx` | 对话面板组件 |
| `components/unified-chat/UnifiedChatPageClient.tsx` | Unified Chat 客户端 |

---

## 技术栈

- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **AI Stack**: SiliconFlow API, Vercel AI SDK, LangChain.js
- **Database**: Supabase (PostgreSQL + pgvector)
- **Visual Style**: 水墨风格（低饱和、大量留白）
  - 背景：`#F9F9F7`
  - 文字：`#2C2C2C`
  - 强调色：低饱和靛蓝 / 石墨色

---

## 并行 worktree（多 Agent · 多 `task/*` 分支）

- **规范真值**：工作区 [`docs/harness/README.md`](../docs/harness/README.md) **并行分支与 Git worktree**；invoke 元信息 **`worktree_root`** + **`git_branch`**。
- **graph_v2 parity 并行（2026-05-20）**：T5 manifest → 目录 **`ai-ink-brain`** · 分支 `task/tech-graph-v2-frontend-manifest-v1`；T3 mermaid → **`ai-ink-brain-wt-mermaid-audit`** · 分支 `task/tech-graph-v2-mermaid-audit-v1`。
- **禁止**两线共用同一 checkout 或跨 worktree `git switch` 抢分支；Harness `reviews/` / `invokes/` / `task` 须在 **本线分支** commit。

---

## Harness（Ink · KPI v1.2 · P0）

> **真值目录**：`content/harness/README.md` · **prompts 单源**：工作区 `Projects/docs/harness/prompts/`（勿复制到本仓）。

| 项 | 约定 |
|----|------|
| 新建 task | 用 `content/tasks/templates/TASK_TEMPLATE.md`；必填 `test_strategy`、`kpi_rubric`、`kpi_aggregator`（默认 **CLOSE**） |
| 关账 | 正文 **`### KPI（00）`**；评分细则见工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../docs/harness/guides/KPI_RUBRIC_v1_2.md) |
| 帽序 | 工作区 [`docs/harness/SDD_HAT_FLOW.md`](../docs/harness/SDD_HAT_FLOW.md) |
| invoke | `content/harness/invokes/by-task/<task_slug>/` |
| 50 | `content/tasks/reinspect_results/` |
| 迁移方案 | 工作区 [`docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md`](../docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md) |
| 关账前交互验收清单 | `.cursor/skills/harness-close-acceptance-checklist/SKILL.md` · `content/tasks/templates/CHECKLIST_TEMPLATE_acceptance_zh.md` |
| 合并前必绿 | `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test` → `pnpm build`（工作区根 `AGENTS.md` §8） |

**Open Folder**：仅改前端业务 / Harness 落盘 → **本仓** `ai-ink-brain/`；跨子仓 Harness task → Open **`Projects/`**。

---

## 交付物约定

- **配置真值表**：`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`（随代码演进持续更新）
- **任务驱动**：优先阅读对应 `content/tasks/active/task_*.md`，实现完成后回填验收项；**验收通过后**须按 `content/tasks/README.md` 将任务单 **`git mv`** 至 `content/tasks/done/` 并更新 `content/tasks/_views/done.md`
- **图谱同步**：代码变更后自动增量更新 `docs/_tech_graph/` 对应文件
  - flowchart 流程图维护双轨：`.md`（人类版）+ `.ai.md`（AI 协议版）
  - 修改代码后，优先更新 `.ai.md`，再同步 `.md`
  - 拓扑协议见本仓 `docs/_tech_graph/99_mermaid_protocol.md`（摘要）与后端仓完整版
  - 变更 `.ai.md` 后：`pnpm tech-graph:graph-export` 并提交 `graph.json`；PR 前 `pnpm tech-graph:graph-check`、`pnpm tech-graph:equivalence-check` 与 `pnpm tech-graph:manifest-check`
  - 影响分析：`pnpm tech-graph:query describe-impact <node_id> 2`（机器轨默认，见后端闸口 B 结论）

---

## 安全红线

- **不要**把 `.env` / `.env.local` / API key 提交进 Git。
- service role key **绝不**暴露给浏览器。

<!-- RULES_AUTO_GENERATED -->

## Core

> 核心行为约束 — 语言、职责边界、修改前确认、完成后报告

# Core Principles
- **Language**: 所有解释、注释用简体中文；代码与专有名词保持英文。
- **Single Responsibility**: 仅修改请求涉及的模块，不碰无关文件或函数。
- **Logic Preservation**: 修改前分析现有逻辑，增量修复，不随意删除正确代码。
- **Consistency**: 遵循项目现有代码风格（缩进、命名、结构），禁止纯格式化变更。

# Before Any Modification
1. 列出计划修改的文件清单（相对路径）。
2. 若涉及 3+ 个文件，等待用户确认或收到明确授权「无需确认直接执行」。
3. 自评变更风险等级（Low / Medium / High），High 需额外说明回滚方案。

# After Completion
- 提供 git diff 风格摘要（按文件：+N/-N）。
- 新功能附最小验证示例、预期返回值或日志片段。
- 禁止仅在大段文本中描述变更，必须实际写入文件系统。

---

## Harness Semi Auto

> Harness 半自动 — 无人工闸阻塞时链式续跑 task，invoke 落盘优先

# Harness 半自动续跑（本仓）

执行 `content/tasks/active/*.md` 或用户 `@task` 时：

1. **先读** task 文首 `semi_auto`、`human_gate`、`audit_profile`；通则见工作区 `Projects/docs/harness/prompts/HANDOFF_SEMI_AUTO.md`（及 `HANDOFF_AUTO_COMMIT`、`HANDOFF_CLOSE_TRACE`）。
2. **无阻塞则连续跑**：凡 `human_gate` 对下一棒 **非** `pending`（或 `blocks_hats` 不含该帽），**同会话**自动戴下一帽；**禁止**每棒要求用户重贴 `TEMPLATE-*` §3。
3. **下一棒前必落盘**：将下一棒 §3 全文写入 `content/harness/invokes/by-task/<task_slug>/invoke_*.md`，再 **commit** 本轮路径，然后执行。
4. **人工闸**：仅 **人** 可将 `pending`→`approved`；遇 `pending` **停**，只输出须改的 `gate_id` 与文件路径，**不得**代填、不得标 `done`。
5. **新会话续跑**：读 task + **最新** `content/harness/invokes/` 下与本 task 相关的 invoke，按其中 §3 继续；用户可说「按 semi_auto 继续」。
6. **关账**：无下一棒时输出 **执行路线与 Commit 回溯**（`HANDOFF_CLOSE_TRACE`），非空 Prompt。

---

## Docs Diary

> diary — 非必读、易过时产物；实验轨 jsonPKmermaid 按需读（跨仓引用后端）

# `docs/diary/` 与 `content/diary/` 目录约定（非必读）

## Agent 读取策略（强制）

- **非必读**：`docs/diary/`、`content/diary/` **全树**不纳入日常必读链路；**非需要不主动读取**（不预加载、不 glob 遍历、不在无关任务中引用）。
- **何时可读**：用户 `@` 明确路径；当前 **task / invoke**（`content/tasks/*`、`content/harness/invokes/*`）依赖列出 diary 路径；排障、复盘、实验复现且范围已锁定到**具体文件**。
- **真值优先级**：实现与架构以 `docs/_tech_graph/`、`docs/meta/`、`content/tasks/`、`content/tasks/specs/` 为准；diary **不得**覆盖或替代上述真值。

## 落盘纪律（写什么进 diary）

- **用途**：存放 **非长期维护**、**易过时** 的产物，例如：一次性验收记录、实验批次报告、对比跑分、留证 curl、阶段性结论草稿、排障快照。
- **长期真值不得滞留**：结论已冻结并写入 `_tech_graph/`、`content/tasks/done/`、`docs/_tech_graph/99_spec.md` 等稳定位置后，diary 内文稿仅作 **历史回溯**；Agent 默认 **不再**以其叙述作为实现依据。
- **Agent 总结**：优先落在 `docs/diary/`（按 `docs/diary/DIARY_GUIDE.md` 命名）；**博客日记正文素材**落在 `content/diary/`；若内容将长期引用，须同步提炼进真值表 / 图谱 / task，而非仅堆在 diary。

## 实验轨：配对后端 `docs/diary/jsonPKmermaid/`（非必读）

| 项 | 约定 |
| --- | --- |
| **物理位置** | **`ai-ink-brain-api-python/docs/diary/jsonPKmermaid/`**（本仓 **不复制**） |
| **性质** | 图谱 **行为实验 / 闸口对照** 的脚本、`fixtures/`、`reports/`、`runs/` 等 |
| **读取** | **非必读**；仅在做 jsonPKmermaid 复现、闸口实验、或 task 显式引用其中路径时，打开 **最小必要文件集** |
| **与生产轨** | accepted 结论的 **执行真值** 在 `docs/_tech_graph/`、`pnpm tech-graph:*` 与 CI；**禁止**为日常改代码默认遍历 `jsonPKmermaid/` |

## 日期总结（`docs/diary/YYYY-MM-DD.md`）

- 按 `docs/diary/DIARY_GUIDE.md` 写的前端知识总结同属 diary，同样 **按需** 读取，作为归总素材而非实现依据；格式遵工作区根 `DIARY_GUIDE.md`。

---

## Tech Graph

> 技术图谱 — Mermaid 维护轨 + graph.json 机器轨（双轨，低幻觉）

## `_tech_graph/` 技术图谱（唯一事实来源）

- 所有技术逻辑、架构、流程必须基于 `docs/_tech_graph/` 下的 Mermaid 图谱；禁止用大段纯文本文档替代图谱做业务逻辑依据。
- 前端**独立**维护本仓 `docs/_tech_graph/`，禁止混用后端或其它子仓图谱文件。
- 与 **jsonPKmermaid 实验轨**（配对后端 `ai-ink-brain-api-python/docs/diary/jsonPKmermaid/`）的关系：**非必读**（见 `08-docs-diary.mdc`）；本规则描述 **生产轨**（`_tech_graph/` + `graph_query`）。仅在做闸口复现或 task 显式引用时按需读实验目录，**禁止**默认遍历。

## 双轨制（维护轨 vs 机器轨）

| 轨道 | 载体 | 谁维护 | Agent 何时优先读 |
|------|------|--------|------------------|
| **维护轨** | `*.md` / `*.ai.md`（内嵌 Mermaid） | 人 + Agent 改图后导出 | 改流程拓扑、补锚点、写规约叙述、对照 `01_struct` |
| **机器轨** | `graph.json`（**graph_v2**）、`_manifest.json`、`_contract_manifest.json` | 脚本导出 + 契约门禁；`graph.json` 由 `.ai.md` 导出 | **影响分析、依赖遍历**：**`graph_query` 子图优先**（`pnpm tech-graph:query`），再 `_manifest` / `_contract`；**禁止**默认整包 `graph.json` 或 **graph_v1** 整图灌 prompt |

- **禁止**把 `graph.json` 当作可手改源文件；改图 → 改对应 `.ai.md` → `pnpm tech-graph:graph-export`（或 CI `--check`）再生 `graph.json`。
- **禁止**在对话里用整份 `graph.json` 替代已导出的 Mermaid 维护义务；JSON 与 Mermaid 语义须等价。
- **禁止**将 **graph_v1 整包** 或 **graph_v2 整文件** 作为 Agent 默认主载荷；须 **`pnpm tech-graph:query`**（`downstream` / `upstream` / `neighbors`）取子图 + anchors。无 `graph_v2` 时 query **FAIL（FP-5）**，不得静默降级为 v1 整包。
- `01_struct.md` 的 **classDiagram** 仍为 TS/数据结构 Struct 真值（未并入 `graph.json` 时不得仅用 JSON 推断类型）。

## 图谱格式与 flowchart 拓扑协议（维护轨）

- 图谱文件：`.md` / `.ai.md`，内嵌 Mermaid；数据结构用 Struct / `classDiagram`，**禁止**在图谱正文中粘贴完整 interface / 长 JSON。
- flowchart 遵循 `docs/_tech_graph/99_mermaid_protocol.md`（摘要；完整版见配对后端仓同名文件）：
  - 边标记：`->` 同步、`~>` 异步（Promise/await）、`?>` 条件、`[ok]` / `[err]` 状态、`::xxx` 元关系
  - 禁止裸边（无边标记的 `-->`）
  - 锚点用 `// → path#Ln` 独立注释行，不写在节点标签内

## 本仓 `docs/_tech_graph/` 目录（摘要）

```text
docs/_tech_graph/
├─ 00_main.md / 00_main.ai.md           # 全局路由 & 渲染流程（人/AI 双轨）
├─ 01_struct.md                         # TS 类型 & 数据结构（classDiagram）
├─ 02_version.md                        # 版本迭代时间线
├─ 10_flow_route.md / *.ai.md           # 页面跳转流程（双轨）
├─ 11_flow_api.md / *.ai.md             # API 请求 & 代理流程（双轨）
├─ 12_flow_auth.md / *.ai.md            # 登录 & 权限 & Session（双轨）
├─ 13_flow_components.md / *.ai.md      # 组件渲染 & 数据交互（双轨）
├─ 99_spec.md                           # 前端实现规约（含 graph_v2 CI）
├─ graph_v2_schema.md                   # graph.json 字段与失败码
├─ 99_mermaid_protocol.md
├─ graph.json                           # 【机器轨】由 *.ai.md 导出，勿手改
├─ _manifest.json                       # 端点 / 页面 / env 清单
└─ _contract_manifest.json              # 跨端契约（如 Unified SSE）
```

## Mermaid 人读 / AI 协议双轨（`.md` vs `.ai.md`）

- `.md`：人类友好（可裸边、锚点可写在节点内）；水墨极简叙述可保留于此轨。
- `.ai.md`：AI 协议版（零裸边、锚点分离、异步/错误显式）；**导出 `graph.json` 的输入源**。
- flowchart 须保持两者语义等价；**classDiagram / timeline** 等无流程边的图无需 `.ai.md`。

## Agent 读取顺序（本仓前端）

1. **影响分析 / 改路由 / 改 BFF 代理 / 改组件数据流**（**query 优先**）：
   - `pnpm tech-graph:query downstream <id> <depth>`（或 `upstream` / `neighbors`）→ 子图 JSON + `anchors`
   - → `_manifest.json` 切片 →（若涉 **Unified Chat / SSE**）`_contract_manifest.json` 切片
   - → 按需 `01_struct.md` / `99_spec.md` / `graph_v2_schema.md`
   - → query 不足时再读对应 `10_flow_*.ai.md` 片段
   - **T003 / Admin Ingest 类题**（且 **task 已指向** 配对后端 `docs/diary/jsonPKmermaid/fixtures/...`）：在子图 + manifest/contract 之后，可参照实验轨 **`manifest_slice` + `impact_surface`**；产出 `impacts[]` **须含 `path` + `kind`**。**无 task 指向时勿读** jsonPKmermaid fixtures。
   - **勿**默认 `cat graph.json` 整包；**勿**用 graph_v1 冒充 v2 query。
2. **改 TS 类型 / Env / UI 契约**：`01_struct.md`、`99_spec.md` + 代码；不单靠 `graph.json`。
3. **改代码后**：同步更新受影响 `.ai.md` / `_manifest` / `_contract`，并确保 `graph.json`（**graph_v2**）导出与 CI（`pnpm tech-graph:manifest-check`、`pnpm tech-graph:graph-check`、`pnpm tech-graph:equivalence-check`）通过。

## jsonPKmermaid 物化轨 vs 默认 machine 轨（闸口 C / C′ / C″ · 实验轨 · 非必读）

> 本节为 **历史实验结论摘要**；日常实现以 **`pnpm tech-graph:query` + `_tech_graph/`** 为准。详文与 fixtures 在配对后端 `docs/diary/jsonPKmermaid/`，**仅 task/用户显式需要时**打开。

| 项 | 约定 |
| --- | --- |
| **machine 默认** | **`CTX_V2_QUERY`** / **`graph_query` 子图**（闸口 C **accepted**，C″ **不推翻**） |
| **物化切片** | 分题 `manifest_slice` / `impact_surface` 为 **实验/物化辅助**，**不等于**整包 `graph.json` 或默认 Mermaid 双轨主载荷 |
| **人读/对照轨** | **`CTX_DUAL_MD`** 仅对照或人读按需；**禁止**升为 machine 默认 |

## 禁止项（Agent 消费 · 重申）

- **禁止**将物化 `impact_surface` 或分题 `manifest_slice` **当作**默认整包 `graph.json`、graph_v1/v2 全文件或整段 Mermaid 双轨主载荷。
- **禁止**因物化切片有效而默认切换为 `CTX_DUAL_MD`；维持 **`graph_query` + `CTX_V2_QUERY`**。

## 稳定引用（生产轨）

- 方案 1 规约：配对后端 `docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`
- 方案 2 查询：配对后端 `docs/tech_graph/SPEC/query_graph/scheme_2_graph_query.md` · 本仓 `pnpm tech-graph:query`（脚本在后端 `tools/tech_graph_graph_query.py`）
- 前端迁移实践：`content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`

## 按需引用（实验轨 · 非必读）

- 闸口 C / C′ / C″ 结论文与 gold 题集：配对后端 `docs/diary/jsonPKmermaid/reports/`、`fixtures/`（**勿**在无 task 时主动读取）
- 后端 RAG/ingest 图谱：见 `ai-ink-brain-api-python/docs/_tech_graph/`
- 工作区总规范：`Projects/AGENTS.md` §7

## Visual Style（水墨 · 与图谱并列的 UI 约束）

- 背景 `#F9F9F7`、文字 `#2C2C2C`、低饱和靛蓝/石墨强调色；大量留白。
- 路由与页面行为以 `10_flow_route*.md` 为准，不编造不存在的页面或 API。

---

## Tech Graph Update

## 图谱自动增量更新规则（前端，核心）
- 代码/页面/接口/逻辑变更 → 自动更新 `docs/_tech_graph/` 对应图谱。
- 仅做增量修改，不全量重绘、不破坏原有结构。
- 自动同步版本记录到 `02_version.md`。
- 代码与图谱必须始终一致，不允许偏差。
- 优先读取图谱进行开发，不脑补逻辑。


---

## Frontend Architecture

## Frontend Architecture Standards（Next.js 15）
- 以 Server Components 为主，数据请求放服务端。
- Server Actions 用于表单操作、异步任务。
- 所有 AI/RAG 相关请求均代理到 Python 后端服务。

## API 边界严格分离（强制）
- 前端只负责页面、组件、路由、代理转发。
- 不实现 Embedding、向量检索、分块、写入逻辑。
- 所有 AI 能力以 `PY_API_URL` 为唯一入口。

## Streaming 输出（强制）
- AI 对话必须流式返回。
- 保持水墨 UI 打字机效果。

## 性能（强制关注）
- 优化 LCP。
- 懒加载非关键组件。
- 流式处理大文件。

## Data & RAG Standards（前端侧约束）
- 元数据必须保留：`filename`、`original_link`、`section_header`。
- 向量检索使用 Cosine Similarity（具体实现由后端负责）。
- 支持 Hybrid Search（向量 + 全文检索，具体实现由后端负责）。
- 分块策略遵循统一规范：`size 512` / `overlap 50`（具体实现由后端负责）。


---

## Ui Stability

## Visual Style Rules（水墨极简风）
- Tailwind CSS 为唯一样式规范。
- 水墨风格：低饱和、大量留白、优雅排版。
- 背景：`#F9F9F7`
- 文字：`#2C2C2C`
- 强调色：低饱和靛蓝 / 石墨色
- 标题衬线字体，正文无衬线字体

## Error & Stability Rules
- API / DB 请求必须 try/catch。
- 向量库异常 → 降级为关键词搜索（由后端/代理策略实现；前端需要有对应 UI 兜底）。
- 开发环境输出 retrieval top-k 分数便于调试（如有对应字段/接口时）。
- 统一优雅的错误状态展示。

## AI 防幻觉约束（前端）
- 不编造不存在的页面、组件、接口。
- 不编造不存在的 TS 类型、数据结构。
- 流程优先图形化，不用自然语言讲故事。
- 保持极简、高信息密度、低 Token 占用。


---

## Agent Observability

> 前端 Agent 可观测性与成本控制 — 执行报告、Loop 防护、模式选择

# Agent Observability & Cost Control（前端）

## Execution Report（每次任务末尾必须报告）
以结构化格式输出以下信息：

```
📊 Execution Report
├── Duration:     {从接收指令到输出完成的耗时}
├── Thinking Steps:
│   1. {关键决策 1：为什么这样改}
│   2. {关键决策 2}
│   3. {关键决策 3}
├── Files Modified:
│   - {文件 1 相对路径}
│   - {文件 2 相对路径}
├── Risk Level:   {Low / Medium / High}
└── Notes:        {阻塞点、待确认项、或「无」}
```

- **Duration**: 估算或记录实际耗时（分钟/秒）。
- **Thinking Steps**: 3–5 步，说明核心决策路径，不是流水账。
- **Files Modified**: 本次实际修改的文件清单（新增、修改、删除分别标注）。
- **Risk Level**: High 时必须附带回滚方案或风险提示。

## Cost Awareness
- **Fast Request Budget**: Cursor Pro Agent 模式 Fast Requests 约 500 次/月；Agent 应优先在一次对话轮次内完成任务。
- **Mode Preference**:
  - 纯代码生成、格式化、简单重构 → 优先建议 Auto 模式。
  - 跨文件重构、复杂调试、架构设计 → 使用 Agent 模式。
- **Batch Operations**: 涉及多文件时，先输出完整计划再一次性执行，避免「改一点测一点」的循环消耗。

## Loop Guard
- 同一文件修改 **3 次**仍未通过验证（构建失败、类型错误、逻辑不符），必须停止自动重试。
- 向用户报告当前阻塞点（错误日志、失败原因），请求人工介入或明确下一步指令。

## Ambiguity Stop
- 需求模糊、上下文缺失、或可能破坏现有功能时，**优先停止并询问用户**。
- 禁止基于假设继续执行，尤其是涉及路由变更、API 契约修改、全局状态重构等操作。
