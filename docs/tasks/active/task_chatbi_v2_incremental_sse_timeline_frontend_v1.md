# 前端：ChatBI V2 增量 SSE —— Timeline 实时感知与执行链路（v1）

**状态**：待排期  
**范围**：仅 `ai-ink-brain`（Unified Chat、`components/unified-chat`、`components/chain-chat`；BFF）  
**关联 SPEC（后端仓）**：`ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md`（**§0、§5、§6、§6.1、§7、§9**）  
**关联 Events（后端仓）**：`ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` **§8**

**配对后端任务**：`ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v2_incremental_sse_backend_v1.md`（已验收归档）

---

## 与 SPEC §6 差异（实现真值登记 · 2026-05-08）

| 项 | SPEC **产品目标**（§3.2 / §6） | **当前 `UnifiedChatPageClient` 真值** |
|----|----------------------------------|----------------------------------------|
| 主区布局 | 默认 **左右双栏**；**可选单栏**：`?single_panel=1` + **`localStorage`** `ink-brain.chatbi.unified.singlePanel`（`"1"`/`"0"`） | **固定** `grid-cols-2`（左 **`ChainTimeline`**、右 **执行链路** 摘要区）；**未**读 query、**未**读写上述 LS；右栏 **不**嵌套第二份 Timeline；实现入口 **`buildExecutionTraceSections`**（与主 SPEC **§3.2** 一致）。 |
| 后续 | — | 若需与 SPEC 全文一致，单独 PR 接线 `single_panel` + LS 并删/收窄主 SPEC **§6.1** 与本节。 |

---

## 开工门槛（前置）

- **最小子集**（不必等 v1 任务单全部勾选）：  
  - BFF `app/api/py/unified/chat/stream/route.ts` **已透传** `body` 与 **常用鉴权头**；  
  - `UnifiedChatPageClient` **已能** `fetch` stream + `\n\n` 分帧 + 处理 `chain` / `done`。  
- **本任务合并前**：须 **联调** 后端增量分支；并在 stream 请求上携带 **`X-ChatBI-Sse-Contract: 2`**（BFF **原样透传**）。

---

## 背景与目标

后端 vNext 边执行边下发后，前端 **边收边渲染**。**LLM 子步**仅消费 **`chain.type` ∈ `agent.llm.*`**（见 Events **§8.1**，**不**解析 Unified 路径顶层 `token` 作子步增量）。主区 **左 Timeline（全量 `chain`）+ 右执行链路（按 phase 的 Query + `step-*` 叙事，禁止跨 phase 混拼所有 delta）**；与 SPEC 可选单栏的差异见上表。**布局开关不使用 `NEXT_PUBLIC_*`**。

---

## 范围 / 非范围

### 范围

| 项 | 说明 |
|----|------|
| **版本头** | 对 **`/api/py/unified/chat/stream`** 请求设置 **`X-ChatBI-Sse-Contract: 2`**；BFF 透传。 |
| **主区双栏** | 左 **Timeline**（`ChainTimeline`，到达序）；右 **执行链路**（**非**第二份 Timeline）：**Query** + 按 SSE 顺序的 **`step-1` / `step-2` / …**；每段 **`agent.llm.start` … `agent.llm.delta*` … `agent.llm.end`** **仅在该 phase 内**拼接 `payload.text`；穿插 **`router.decision` / `agent.intent` / `agent.think` / `tool.call.*` / `error` / `agent.llm.truncated`** 等一行摘要；高频更新可用 **`requestAnimationFrame`** 合并渲染。 |
| **`single_panel` + LS（SPEC 目标）** | **延后**：见 **「与 SPEC §6 差异」**；验收见下。 |
| **坏帧** | JSON 坏帧：**跳过** + **`parse_error_count++`**；**默认不对用户展示计数**（`console.debug` 可开）；与 vNext **§5.4** 一致。 |
| **未知 `chain.type`** | 策略 B：不崩、可忽略或折叠。 |
| **性能** | 高频 delta **节流**渲染。 |

### 非范围 / v1 明确不做

- **`step_id` 聚合**多 delta 为单卡片：**v1 不做**（右栏已按 **start/end 分段** 可读展示即可；留 v2 聚合卡片）。  
- **移动端专适**：**不验收**（与 vNext §3.2 一致）；将来若要做，产品建议 **单栏 + 抽屉**（仅备注，非本任务交付）。  
- **布局**：**不使用** `NEXT_PUBLIC_*` 控制双栏/单栏（避免构建态分叉）。

---

## CI vs 真实 LLM（与后端任务一致）

- **CI**：组件/解析单测 + mock SSE 序列（含 **`agent.llm.delta`**）。  
- **真实 LLM**：staging / release checklist。

---

## 验收标准（可勾选）

- [x] **固定** **左 Timeline + 右执行链路**；右栏 **不**重复左侧 Timeline；`done` 解锁输入。  
- [x] **`X-ChatBI-Sse-Contract: 2`** 已发且 BFF 透传（Network 面板可证）。  
- [ ] **`?single_panel=1` + `localStorage` `ink-brain.chatbi.unified.singlePanel`** 与主 SPEC **§6** 产品目标一致（**当前未接线**，见 **§6.1** 与任务单差异表）。  
- [x] 坏帧策略与 **§5.4** 一致；未知 type 不白屏。  
- [x] `pnpm` / `tsc` / 既有前端 CI 通过。

---

## 实现备忘（子 Agent 回填 — **实现 PR 落地选型**，非 SPEC 缺口）

以下 **`______`** 在合并实现 PR 时填实；与澄清简报 **§8.8**、主 SPEC **§8.1** 一致：**不属**契约阻断项。

- 主要修改文件：`components/unified-chat/UnifiedChatPageClient.tsx`、`components/chain-chat/*`、`app/api/py/unified/chat/stream/route.ts`（首版已动，回填可补行号/PR 链）  
- **`single_panel` / LS** 若下版接线：入口（仅 URL / 仅 LS / 设置页）与文案：**______**  

---

## 给 Cursor

验收、非范围、依赖、图谱、UnifiedChat、ChainTimeline、执行链路、`buildExecutionTraceSections`、SSE、incremental、`agent.llm.delta`、`X-ChatBI-Sse-Contract: 2`、`single_panel`、`ink-brain.chatbi.unified.singlePanel`、vNext §3.2、§6.1、§8
