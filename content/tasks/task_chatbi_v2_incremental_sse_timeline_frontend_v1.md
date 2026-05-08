# 前端：ChatBI V2 增量 SSE —— Timeline 实时感知与 LLM 流式栏（v1）

**状态**：待排期  
**范围**：仅 `ai-ink-brain`（Unified Chat、`components/unified-chat`、`components/chain-chat`；BFF）  
**关联 SPEC（后端仓）**：`ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md`（**§0、§5、§6、§7、§9**）  
**关联 Events（后端仓）**：`ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` **§8**

**配对后端任务**：`ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v2_incremental_sse_backend_v1.md`

---

## 开工门槛（前置）

- **最小子集**（不必等 v1 任务单全部勾选）：  
  - BFF `app/api/py/unified/chat/stream/route.ts` **已透传** `body` 与 **常用鉴权头**；  
  - `UnifiedChatPageClient` **已能** `fetch` stream + `\n\n` 分帧 + 处理 `chain` / `done`。  
- **本任务合并前**：须 **联调** 后端增量分支；并在 stream 请求上携带 **`X-ChatBI-Sse-Contract: 2`**（BFF **原样透传**）。

---

## 背景与目标

后端 vNext 边执行边下发后，前端 **边收边渲染**。**LLM 子步**仅消费 **`chain.type` ∈ `agent.llm.*`**（见 Events **§8.1**，**不**解析 Unified 路径顶层 `token` 作子步增量）。**默认左右双栏**；**单栏**为可选降级。**布局开关不使用 `NEXT_PUBLIC_*`**。

---

## 范围 / 非范围

### 范围

| 项 | 说明 |
|----|------|
| **版本头** | 对 **`/api/py/unified/chat/stream`** 请求设置 **`X-ChatBI-Sse-Contract: 2`**；BFF 透传。 |
| **单栏降级** | **Query**：`?single_panel=1` 首屏强制单栏；**`localStorage`** 键 **`ink-brain.chatbi.unified.singlePanel`**，值 **`"1"`** / **`"0"`**（持久化偏好）。**默认双栏** = 无 query 且 localStorage 非 `"1"`。 |
| **右栏** | 拼接 **`agent.llm.delta`** 的 `payload.text`（`part_index` 顺序）；标题来自 **`agent.llm.start`** / `phase`。 |
| **坏帧** | JSON 坏帧：**跳过** + **`parse_error_count++`**；**默认不对用户展示计数**（`console.debug` 可开）；与 vNext **§5.4** 一致。 |
| **未知 `chain.type`** | 策略 B：不崩、可忽略或折叠。 |
| **性能** | 高频 delta **节流**渲染。 |

### 非范围 / v1 明确不做

- **`step_id` 聚合**多 delta 为单卡片：**v1 不做**（右栏纯拼接即可；留 v2）。  
- **移动端专适**：**不验收**（与 vNext §3.2 一致）；将来若要做，产品建议 **单栏 + 抽屉**（仅备注，非本任务交付）。  
- **布局**：**不使用** `NEXT_PUBLIC_*` 控制双栏/单栏（避免构建态分叉）。

---

## CI vs 真实 LLM（与后端任务一致）

- **CI**：组件/解析单测 + mock SSE 序列（含 **`agent.llm.delta`**）。  
- **真实 LLM**：staging / release checklist。

---

## 验收标准（可勾选）

- [ ] 默认 **左 Timeline + 右流式**；`done` 解锁输入。  
- [ ] **`X-ChatBI-Sse-Contract: 2`** 已发且 BFF 透传（Network 面板可证）。  
- [ ] **`single_panel` + localStorage** 行为与 vNext **§6** 一致。  
- [ ] 坏帧策略与 **§5.4** 一致；未知 type 不白屏。  
- [ ] `pnpm` / `tsc` / 既有前端 CI 通过。

---

## 实现备忘（子 Agent 回填 — **实现 PR 落地选型**，非 SPEC 缺口）

以下 **`______`** 在合并实现 PR 时填实；与澄清简报 **§8.8**、主 SPEC **§8.1** 一致：**不属**契约阻断项。

- 主要修改文件：______  
- 单栏 UI 入口（若除 `?single_panel=1` / `localStorage` 外另有 **设置页 / 菜单**）：入口路径与文案：______  

---

## 给 Cursor

验收、非范围、依赖、图谱、UnifiedChat、ChainTimeline、SSE、incremental、`agent.llm.delta`、`X-ChatBI-Sse-Contract: 2`、`single_panel`、`ink-brain.chatbi.unified.singlePanel`、vNext §8
