# 前端 Task：ChatBI V3 · 多轮低置信澄清（§4.3）SSE / Timeline 对接

> **状态**：`pending`（**P1-4**；**开工闸门**见 **§开工闸门与前后端节奏**；未满足前保持 `pending`）  
> **关联图谱**：`docs/_tech_graph/`（Unified Chat SSE 消费；若新增 `chain.type` 则增量 `11_flow_api*.md`）

---

## 路径真值（避免相对链失效 · 必读）

本文件位于 **`ai-ink-brain` 仓**内路径：

`content/tasks/active/task_chatbi_v3_multiturn_clarify_semantics_4_3_frontend_v1.md`（相对该仓根）。

| 目标 | 写法 |
|------|------|
| **同仓 `content/tasks/done/`** | Markdown 可用 [`../done/…`](../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md)（从 `active/` 上一级到 `tasks/` 再进 `done/`） |
| **兄弟仓 `ai-ink-brain-api-python`（与总仓 AGENTS 一致：两仓均为 `Projects/` 下同级目录）** | **推荐**：在文档/PR 中写 **`Projects/ai-ink-brain-api-python/docs/...`** 全路径，便于人与 Cursor `@` 引用。**勿**使用 `../ai-ink-brain-api-python/` 从本文件出发——在磁盘上会解析到 **`content/tasks/ai-ink-brain-api-python/`**，该路径**不存在**。 |
| **若必须用相对路径从本文件指到兄弟仓根**（仅当两仓确为同级时） | `../../../ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_multiturn_clarify_semantics_4_3_v1.md`（`active`→`tasks`→`content`→`ai-ink-brain` 根，再进入兄弟目录） |

**配对后端任务（真值路径）**：`Projects/ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_multiturn_clarify_semantics_4_3_v1.md`

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

- [ ] **SSE 解析**：`components/unified-chat/UnifiedChatPageClient.tsx`（或抽离模块）按 **§开工闸门** 冻结表解析澄清帧；遵守 **§策略 B**。
- [ ] **BFF**：见 **§BFF（与后端显式结论）**；默认仅透传既有 header。
- [ ] **UI**：用户可见 **「澄清中 / 待您确认」** 与追问文案（payload 内、且为 manifest 键）；Timeline / `ChainEventCard` **须与 `agent.think` 可区分**（标签/图标/样式三选一即可）。
- [ ] **类型**：`components/chain-chat/types.ts` 收窄 `ChainEvent` / `chain.type` 联合；主路径 **禁止 `any`**。
- [ ] **图谱**：若消费路径变化，增量 `docs/_tech_graph/11_flow_api.md`（flowchart 变更则 **`.ai.md` 双轨**）。

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

- [ ] **策略 B**：见 **§策略 B**；未知 type / 越界键不崩、不白屏。  
- [ ] **澄清 vs `agent.think`（必达）**：用户能 **稳定区分**「澄清态」与「普通思考」——二者 **不得**共用同一套不可区分的视觉形态（须各有标签/图标/样式之一）。  
- [ ] **澄清 vs 最终答案（必达）**：**最终答案**仅指 **`assistant.message`**（若产品改为其它单一事件，在 **§实现备忘** **一句话** 冻结并替换本句）；澄清 UI **不得**覆盖、顶替或误标为最终答案区。  
- [ ] **`run_id` 同源**：澄清相关 `ChainEvent.run_id` 与 **`meta.payload.run_id` / `done.run_id`** 一致（不回归既有 meta 回填逻辑）。  
- [ ] **契约无越界**：仅读 manifest 已列键；PR 前 **`Projects/ai-ink-brain-api-python`** 下 `python tools/tech_graph_contract_check.py` 绿。  
- [ ] **配对后端**：后端 **§验收标准** 中与「用户可见澄清」对应的项，在本仓有 **UI/解析** 与 **PR 互链**。

---

## 手动测试与 mock 入口

1. **首选**：后端实现 PR **附件**或 `ai-ink-brain-api-python/docs/spec/v3-agent/P0/` 下 **脱敏 SSE 文本样例**（`.md` 代码块 / `.jsonl` / `.txt` 任一）；路径由后端写入 **后端子任务实现备忘**，本任务 **§实现备忘** 抄录 **同一路径** 以便单测 / 手工重放。  
2. **次选**：staging 真实请求 + **`CHATBI_JSON_LOG`** grep `run_id`（排障，非 UI 必显）。  
3. **本仓单测**：若已有针对 `chain` 解析的 `*.test.ts` / `*.spec.ts`，在 **§实现备忘** 回填 **实际文件路径**；若无，可不强制，但 **不得**以「无文档」挡验收——须满足上条 **样例路径**。

---

## 实现备忘（回填）

- 开工闸门 **A / B** 及 PR：…  
- 冻结的 `chain.type` / payload 键表（或「未改契约」）：…  
- **澄清 vs 最终答案** 产品边界一句话（若与默认 `assistant.message` 不同）：…  
- **占位字符串**（与后端一致）：…  
- **BFF**：无需变更 / 已变更（链 PR）：…  
- **SSE 样例路径**（后端提供）：…  
- **阻塞**（若无写「无」）：…

---

## 给 Cursor

`§4.3`、`澄清`、`开工闸门`、`策略 B`、`Projects/ai-ink-brain-api-python`、`_contract_manifest`、`tech_graph_contract_check`、`run_id`、`Identity-Access`、`UnifiedChatPageClient`、`ChainEvent`

---

## 修订记录

| 日期 | 变更 |
|------|------|
| 2026-05-11 | 首版：配对后端 P1-4 |
| 2026-05-11 | 修订：路径真值、开工闸门、策略 B 本单定义、验收口径、mock、RBAC 兜底、BFF 显式结论 |
