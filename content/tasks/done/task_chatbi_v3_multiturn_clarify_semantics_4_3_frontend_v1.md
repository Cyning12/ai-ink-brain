# 前端 Task：ChatBI V3 · 多轮低置信澄清（§4.3）SSE / Timeline 对接

> **状态**：`done（2026-05-23 · P1-4 手工烟测通过 · run_id 83b821f2-2a35-4197-9cf0-76dc9c5a9b0e）`  
> **关联图谱**：`docs/_tech_graph/`（Unified Chat SSE 消费；`11_flow_api.md` prose 已增量）

---

## 路径真值（避免相对链失效 · 必读）

本文件位于 **`ai-ink-brain` 仓**内路径：

`content/tasks/done/task_chatbi_v3_multiturn_clarify_semantics_4_3_frontend_v1.md`（相对该仓根）。

| 目标 | 写法 |
|------|------|
| **同仓 `content/tasks/done/`** | Markdown 可用 [`../done/…`](../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md)（从 `active/` 上一级到 `tasks/` 再进 `done/`） |
| **兄弟仓 `ai-ink-brain-api-python`（与总仓 AGENTS 一致：两仓均为 `Projects/` 下同级目录）** | **推荐**：在文档/PR 中写 **`Projects/ai-ink-brain-api-python/docs/...`** 全路径，便于人与 Cursor `@` 引用。**勿**使用 `../ai-ink-brain-api-python/` 从本文件出发——在磁盘上会解析到 **`content/tasks/ai-ink-brain-api-python/`**，该路径**不存在**。 |
| **若必须用相对路径从本文件指到兄弟仓根**（仅当两仓确为同级时） | `../../../ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v3_multiturn_clarify_semantics_4_3_v1.md` |

**配对后端任务（真值路径）**：`Projects/ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v3_multiturn_clarify_semantics_4_3_v1.md`（**done · 2026-05-13**）

**L1 / SPEC（同上，Projects 根）**：

- `Projects/ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-Multiturn-Debt.md`
- `Projects/ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Multiturn-Semantics.md`（§4 第 3 点）
- `Projects/ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-Identity-Access.md`
- `Projects/ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`
- `Projects/ai-ink-brain-api-python/docs/spec/v3-agent/P0/阶段B-验收-1.md`（`run_id` 与 meta 对齐留档）

---

## 开工闸门与前后端节奏

将本任务标为 **`in_progress`** 前，须满足 **下列之一**（由后端在 **其实现备忘** 勾选/贴 PR，前端抄链到 **§实现备忘**）：

| 闸门 | 条件 | 前端可做什么 |
|------|------|----------------|
| **A · 有契约变更** | 后端合并的 PR **同批**更新 **`SPEC-ChatBI-V2-Events.md`** + **`docs/_tech_graph/_contract_manifest.json`**，且 `python tools/tech_graph_contract_check.py` **绿**；且 **实现备忘** 含两行：**(1)** 冻结的 `chain.type` 列表或「仅扩写既有 type」声明；**(2)** 各 type 的 **payload 键白名单**（与 manifest 一致）。 | 解析 + UI 可开工 |
| **B · 无契约变更** | 后端在 **实现备忘** 明确写：**「本 PR 不改 manifest」**，并给出前端可消费的 **payload 键白名单**（对既有 `agent.think` / `assistant.message` 等）+ **PR 链接**。 | 仅 UI/文案分支可开工 |

**若后端先合了「纯 API」但未更新 manifest / 未写备忘闸门**：视为 **闸门未通过**，前端 **不**进入 `in_progress`；由后端补 PR 或在本文 **§实现备忘 · 阻塞** 登记追踪号。

**与状态行的关系**：「不阻塞母单其它条目」指 **后端仓库内**其它 PR；**不表示**前端可在无闸门时开工。

---

## 策略 B（本单内定义）

与已完成前端任务 [`../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md`](../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md) **§验收标准** 首条一致：

收到 **未知 `chain.type`**，或 **payload 出现 manifest 未承诺的键** 时：**跳过该帧的专项 UI**、**不向用户抛未捕获异常**、**整页不白屏**；可与现有 SSE 容错一致地做计数 / `console.debug`。

---

## 背景与目标

后端子任务将落地 **低置信 / 指代模糊时的澄清路径**（可能含新 **`chain.type`**，或在既有事件上扩展 **可机器区分的 payload** —— **具体 type / 键名以开工闸门 A 或 B 的冻结表为准**，不得仅依赖口头同步）。

本前端任务：用户在 **Unified Chat（Agent + SSE）** 中能 **读懂「系统在追问而非报错」**；Timeline / 最终答案区与 **`run_id`** 可追溯；并遵守 **§策略 B**。

**已交付、本单不重复实现**：`meta.payload.run_id` 回填、`text2sql.phase.*`、`tool.call.end.output.text2sql_phases_ms` — 见 [`../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md`](../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md)。

---

## V1 交付与拍板

| 决议 | 说明 |
|------|------|
| **v1 关单** | **§验收标准** 全部 `- [x]` → 状态 `done（YYYY-MM-DD）` → `git mv` → `content/tasks/done/`（见 `content/tasks/README.md`）。 |
| **契约** | 新 `chain.type` / 新 payload 键：**必须**已进 **`Projects/ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`** 且后端同 PR；前端 **只渲染 manifest 已列键**（见 **§RBAC 与展示兜底**）。 |
| **Contract 头** | 默认 **`X-ChatBI-Sse-Contract: 2`**；升级 Contract 另开短任务（与 Text2SQL 前端 done 任务 **§非范围** 一致）。 |

---

## 范围

- [x] **SSE 解析**：`lib/unified-chat/sse/chainEventFromSse.ts` + `chainPayloadValidators.ts`（`agent.clarify` 最小键校验）；`UnifiedChatPageClient` 经既有 SSE 归约入链；遵守 **§策略 B**。
- [x] **BFF**：见 **§BFF（与后端显式结论）**；`app/api/py/unified/chat/stream/route.ts` 仅透传既有 header（含 `X-ChatBI-Sse-Contract`）。
- [x] **UI**：`ChainEventCard` 琥珀色 **「澄清中 · 待您确认」** + `message` / `prompt_for_user`；与 `agent.think`（slate 网格 + `thought`）视觉区分。
- [x] **类型**：`components/chain-chat/types.ts` — `AgentClarifyPayload` + 白名单含 `agent.clarify`；主路径无 `any`。
- [x] **图谱**：`docs/_tech_graph/11_flow_api.md` §「多轮澄清 SSE」prose 增量（无 flowchart 变更，**不**改 `.ai.md`）。

## 非范围

- 澄清 **触发阈值 / Intent 编排**（后端子任务）。
- **`CHATBI_JSON_LOG`**（后端）。
- Text2SQL **子阶段条** 的既有验收（done 任务已覆盖）。

---

## RBAC 与展示兜底（避免前后端各做一套）

1. **渲染 allowlist** = **`_contract_manifest.json`** 中为该 `chain.type` 声明的 **payload 键**（及 Events 子规已承诺的嵌套结构）。  
2. **未在 manifest 声明的键**：**不得**渲染为可读「表名 / 列名 / 候选库对象」；统一展示 **与后端对齐的一句占位**（例如 **`[字段已省略]`** 或后端 PR 指定的 i18n key），并在 **§实现备忘** 写明 **前后端同一字符串**。  
3. **不得**依赖前端自创「截断长度猜敏感」规则作为唯一防线；若 Identity-Access 未定稿，与后端一致采用 **公开 fixture 表名** 并在备忘声明 **产品展示待 P1-3**。

---

## BFF（与后端显式结论）

- **默认假设**：`app/api/py/unified/chat/stream/route.ts` **无**新增 query/header，继续透传 **`X-ChatBI-Sse-Contract`** 即可。  
- **若需变更**：须由 **后端子任务「实现备忘」** 显式写 **`需新增：…`**（header/query 名 + 示例值），并 **@ 本前端任务**；本任务 **§实现备忘** 回填「BFF 已改 / PR 链」后，范围中的 BFF 项方可勾选。

---

## 依赖与引用（本仓相对路径）

| 项 | 路径（`ai-ink-brain` 仓内） |
|----|---------------------------|
| SSE 入口 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| BFF | `app/api/py/unified/chat/stream/route.ts` |
| Timeline / 类型 | `components/chain-chat/ChainTimeline.tsx`、`ChainEventCard.tsx`、`types.ts` |
| 真值表 | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| manifest 消费锚点 | 见 **`Projects/ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`** → `frontend_anchors.sse_consumer_files` |

---

## 验收标准（可勾选 · 消除「两种/三种」歧义）

- [x] **策略 B**：未知 type / 缺 manifest 键 → `chainEventFromSse` 返回 null；单测 `chainEventFromSse.test.ts`（2026-05-23 · 35 tests 绿）。
- [x] **澄清 vs `agent.think`（必达）**：`ChainEventCard` — clarify 琥珀 badge + 摘要/追问区；think 为 slate 工具网格 + `thought` 标题。
- [x] **澄清 vs 最终答案（必达）**：最终答案仅 **`assistant.message`**（`extractFinalAnswer` + 页面文案）；clarify 仅在 Timeline 卡片，不写入最终答案区逻辑。
- [x] **`run_id` 同源**：`applyChainSseFrame` 以 `meta.payload.run_id` 为 canonical（单测已有）；clarify 帧经同路径归约。
- [x] **契约无越界**：仅读 `step_number` / `message` / `prompt_for_user`；`python tools/tech_graph_contract_check.py` **OK**（2026-05-23）。
- [x] **配对后端 · 手工烟测**：Unified Chat **2026-05-23** 通过；`run_id=83b821f2-2a35-4197-9cf0-76dc9c5a9b0e`；15 帧含 `agent.clarify`，**无** `tool.call.*` / `sql.result`；`router.decision` 的 `candidate_mode`/`final_mode` 均为 `text2sql`；`assistant.message` 为澄清指引文案。探针 env：`CHATBI_V3_LOW_CONFIDENCE_CLARIFY=1`、`INTENT_MIN_CONFIDENCE=1.0`（使 intent `0.95` 命中低置信门）、`CHATBI_V3_PLAN_PREVIEW_CONFIRM=0`。

---

## 手动测试与 mock 入口

1. **首选**：`Projects/ai-ink-brain-api-python/docs/spec/v3-agent/P0/SSE-sample-agent-clarify.md`  
2. **E2E 参考 Timeline**：`Projects/ai-ink-brain-api-python/docs/spec/v3-agent/text2sql/P1-4-第二次对话测试.md`  
3. **本仓单测**：`lib/unified-chat/sse/chainEventFromSse.test.ts` + fixture `lib/unified-chat/sse/fixtures/chain-meta-and-tool.json`（`agentClarifyOk` / 负例）

**关单前手工清单（本地）**：

```text
api-python: CHATBI_V3_LOW_CONFIDENCE_CLARIFY=1，建议 CHATBI_V3_PLAN_PREVIEW_CONFIRM=0
前端: pnpm dev → /unified-chat → ChatBI token 解锁
问句: 「统计 heros 表里有多少条数据」，prefer=auto
期望: Timeline 有 agent.clarify；无 sql.result；run_id 同源；最终答案区为 assistant.message
```

---

## 实现备忘（回填）

- **开工闸门 B**（后端 done 任务 §实现备忘）：**契约未改 manifest**；`agent.clarify` 已在 manifest；后端关单 **2026-05-13**（`docs/tasks/done/task_chatbi_v3_multiturn_clarify_semantics_4_3_v1.md`）。
- **冻结 type / payload**：`agent.clarify` → `step_number`, `message`, `prompt_for_user`（manifest 真值，无新增键）。
- **澄清 vs 最终答案**：默认 **`assistant.message`** 为最终答案；clarify 仅 Timeline 展示。
- **占位字符串**：本单 clarify payload 仅 manifest 三键；**无**额外表名字段渲染；产品 RBAC 细粒度 **待 P1-3**（与后端一致）。
- **BFF**：**无需变更**（后端备忘 + 代码审阅 `route.ts` 仅透传 Contract / Auth）。
- **SSE 样例路径**：`Projects/ai-ink-brain-api-python/docs/spec/v3-agent/P0/SSE-sample-agent-clarify.md`
- **前端 PR / commit**：`ec59622`（解析 + UI + 图谱 prose）；烟测单测增量 **2026-05-23**（本对话）。
- **单测路径**：`lib/unified-chat/sse/chainEventFromSse.test.ts`
- **手工烟测留证**：`run_id=83b821f2-2a35-4197-9cf0-76dc9c5a9b0e`（2026-05-23）；与 `P1-4-第二次对话测试.md` 结构一致（15 帧、澄清短路）。
- **阻塞**：无

---

## 给 Cursor

`§4.3`、`澄清`、`开工闸门`、`策略 B`、`Projects/ai-ink-brain-api-python`、`_contract_manifest`、`tech_graph_contract_check`、`run_id`、`Identity-Access`、`UnifiedChatPageClient`、`ChainEvent`

---

## 修订记录

| 日期 | 变更 |
|------|------|
| 2026-05-11 | 首版：配对后端 P1-4 |
| 2026-05-11 | 修订：路径真值、开工闸门、策略 B 本单定义、验收口径、mock、RBAC 兜底、BFF 显式结论 |
| 2026-05-23 | 烟测：`in_progress`；闸门 B 抄录；范围/验收（除手工）勾选；`agent.clarify` fixture 单测；配对后端路径改 `done/` |
| 2026-05-23 | **关单**：手工烟测通过（`83b821f2-…`）→ `done/` 归档 |
