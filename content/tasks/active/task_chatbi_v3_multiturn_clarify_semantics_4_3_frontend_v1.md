# 前端 Task：ChatBI V3 · 多轮低置信澄清（§4.3）SSE / Timeline 对接

> **状态**：`pending`（**P1-4**；与后端 **同批次契约** 对齐后再 `in_progress`；**不阻塞**后端先合纯 API 若契约未变）  
> **关联图谱**：`docs/_tech_graph/`（Unified Chat SSE 消费；若新增 `chain.type` 则增量 `11_flow_api*.md`）  
> **配对后端任务**：`../ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_multiturn_clarify_semantics_4_3_v1.md`（澄清触发、编排、**SSE 形状草案 → 终稿**）  
> **L1 子规**：`../ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-Multiturn-Debt.md`（§0.1、§2、§4 RBAC、§5）  
> **V2 语义**：`../ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Multiturn-Semantics.md` — **§4 第 3 点（澄清）**  
> **RBAC 展示**：`../ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-Identity-Access.md` — 澄清 UI **不得**在规约缺失时裸露无权限物理表名；与后端「占位 / 白名单 fixture」策略一致

---

## 背景与目标

后端子任务将落地 **低置信 / 指代模糊时的澄清路径**（可能含新 **`chain.type`**、或在既有 `agent.think` / `assistant.message` 上扩展 **可机器区分的 payload** —— **以后端任务单终稿为准**）。

本前端任务目标：用户在 **Unified Chat（Agent + SSE）** 中能 **读懂「系统在追问而非报错」**，Timeline / 最终答案区与 **`run_id`** 可追溯；并在 **策略 B** 下不因未知帧崩溃。

**与已交付能力的关系**：**`meta.payload.run_id` 回填**、**`text2sql.phase.*`**、**`tool.call.end.output.text2sql_phases_ms`** 已由前序任务完成（见 **§配对与前置**）；本单 **不重复** 实现上述项，仅在其上 **扩展** 澄清相关展示。

---

## 配对与前置（真值）

| 项 | 说明 |
|----|------|
| **P0 可观测基线** | `../ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v3_text2sql_tool_latency_obs_v1.md`（done）；Timeline **`run_id`** 与 **`done` / `CHATBI_JSON_LOG`** 同源 — 见 `../ai-ink-brain-api-python/docs/spec/v3-agent/P0/阶段B-验收-1.md` |
| **前序前端任务（done）** | [`../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md`](../done/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md) — Text2SQL 子阶段 SSE + `text2sql_phases_ms` UI |
| **本单焦点** | **澄清话术**、**可选新 `chain` 类型** 的解析与展示、**与最终答案 / transcript 的边界**（不吞消息、不误判为失败） |

---

## V1 交付与拍板（与 Text2SQL 前端任务对齐）

| 决议 | 说明 |
|------|------|
| **v1 关单** | 本文 **§验收标准** 全部 `- [x]` 方可标 **`done`** 并 `git mv` → `content/tasks/done/`。 |
| **契约** | 任何新 `chain.type` / payload 键：**须**落在 `../ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` 且后端同 PR；前端 **只读已承诺键**；合并前跑 **`python tools/tech_graph_contract_check.py`** 绿。 |
| **Contract 版本** | 默认维持 **`X-ChatBI-Sse-Contract: 2`**；若后端要求显式升级，另开短任务改 `UnifiedChatPageClient` 常量 + vNext 矩阵（见 Text2SQL 前端任务 **§非范围**）。 |

---

## 范围

- [ ] **SSE 解析**：在 `components/unified-chat/UnifiedChatPageClient.tsx`（或抽离模块）中识别澄清相关帧（**具体 `type` 与 `payload` 键名以后端任务单「实现备忘」冻结为准**），写入 `ChainEvent` / Timeline 状态；**策略 B**：未知 `type` 跳过、不白屏。
- [ ] **BFF**：`app/api/py/unified/chat/stream/route.ts` 继续原样透传 **`X-ChatBI-Sse-Contract`**；若 BFF 需新增 query/header，与后端 vNext / 任务单一致。
- [ ] **UI**：用户可见 **「澄清中 / 待您确认」** 与 **具体追问文案**（来源：后端 SSE payload；**不**在前端硬编码业务表名除非后端已脱敏）；Timeline 或 `ChainEventCard` 有 **可区分于普通 `agent.think`** 的展示（样式/图标/标签三选一即可）。
- [ ] **类型**：`components/chain-chat/types.ts` 扩展 `ChainEventType` / `payload` **Discriminated Union**；禁止主路径 `any`。
- [ ] **RBAC 展示**：若 payload 含表名/列名候选，仅展示 **后端已脱敏或已白名单** 的字段；否则 UI 层 **二次兜底**（截断/占位）并在任务单「实现备忘」注明与 `SPEC-ChatBI-V3-Identity-Access` 差距。
- [ ] **图谱**：若消费路径变化，增量更新本仓 `docs/_tech_graph/11_flow_api.md`（及 flowchart 时 **`.ai.md` 双轨**）。

## 非范围

- 不实现 **澄清触发阈值 / Intent 编排**（属后端子任务）。
- 不单独实现 **P0-2 `CHATBI_JSON_LOG`**（后端日志）。
- 不扩大 **Text2SQL 子阶段条** 的验收口径（已由 done 任务覆盖）。

---

## 依赖与引用

| 项 | 路径 |
|----|------|
| 契约真值 | `../ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` |
| 事件语义 | `../ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` |
| 前端消费锚点 | manifest → `frontend_anchors.sse_consumer_files` |
| SSE 入口 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| BFF | `app/api/py/unified/chat/stream/route.ts` |
| Timeline / 类型 | `components/chain-chat/ChainTimeline.tsx`、`ChainEventCard.tsx`、`types.ts` |
| 本仓真值表 | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |

---

## 验收标准

- [ ] **策略 B**：注入未知 `chain.type` 或缺字段帧时，页面不崩溃；行为与现有 SSE 容错一致或可接受（与 Text2SQL 前端任务口径一致）。
- [ ] **可理解**：在 mock 或 staging 下，用户能区分 **「系统正在澄清 / 等待补充」** 与 **「普通思考」** 与 **「最终答案」**（至少两种可区分即可，具体以后端冻结文案 + 事件为准）。
- [ ] **`run_id` 一致**：澄清相关 `ChainEvent.run_id` 与本轮 **`meta.payload.run_id` / `done.run_id`** 同源（继承既有 meta 回填逻辑，**不回归**）。
- [ ] **契约无越界**：不读取 manifest 未列键；PR 前 `tech_graph_contract_check` 绿。
- [ ] **配对后端**：后端子任务 **§验收标准** 中与「用户可见澄清」相关的项，在本仓有 **对应 UI 或解析** 证明（可在后端任务单「实现备忘」互链 PR）。

---

## 手动测试建议

1. 开启 Agent + Text2SQL 路径，构造后端提供的 **澄清触发** 用例（或 fixture SSE）。  
2. 确认 Timeline 顺序：**澄清帧不覆盖** 既有 `user.message`；`done` 后 transcript 行为符合产品预期。  
3. 与 **`CHATBI_JSON_LOG`**（可选）对照同一 **`run_id`** 下的后端日志行（排障用，非 UI 必显）。

---

## 实现备忘（回填）

- PR 链接：…  
- 冻结的 `chain.type` / `payload` 键名：…  
- 与后端任务单互链：…

---

## 给 Cursor

`§4.3`、`澄清`、`低置信`、`UnifiedChatPageClient`、`ChainEvent`、`ChainTimeline`、`SSE_CONTRACT`、`_contract_manifest`、`tech_graph_contract_check`、`run_id`、`Multiturn-Debt`、`Identity-Access`

---

## 修订记录

| 日期 | 变更 |
|------|------|
| 2026-05-11 | 首版：配对 `task_chatbi_v3_multiturn_clarify_semantics_4_3_v1`（后端） |
