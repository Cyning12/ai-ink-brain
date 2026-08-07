> **状态**：done（P1 task 卫生归档 · 2026-06-09 · 功能已在 main；追溯见各 PR / Epic M01–M06）

# 前端任务：Unified Chat 多轮会话可见化与 L6 验收对齐

> **状态**：implemented（代码已落地；**范围/验收**勾选留待 PR 合并前人工确认）  
> **关联图谱**：`docs/_tech_graph/13_flow_components.md` · `docs/_tech_graph/11_flow_api.md`（Unified SSE 段）  
> **关联 Issue/PR**：（待填）  
> **后端依赖**：无新增 HTTP 契约；后端多轮语义见配对仓 **`ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Agent-Overview.md`**（**§2.6**、**§7.5.5**、**§7.5.5.1**）  
> **关联任务（后端）**：`ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v2_agent_p1_behavior.md`（行为总览，可选）  
> **关联任务（V2 Timeline / LLM Prompt 调试）**：`docs/tasks/active/task_frontend_unified_chat_v2_rewrite_llm_prompt_debug_v1.md`（与后端 `ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v2_rewrite_timeline_llm_prompt_capture_v1.md` 配对）

---

## Harness 元信息（2.18 迁移补录）

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 背景与目标

Unified Chat 页面（`UnifiedChatPageClient`）已在请求体中通过 **`useSessionId("unified-chat")`** 持久化并回传 **`session_id`**，Python V2 Agent 路径可按该 id 从 `rag_conversation_logs` 加载历史，**后端多轮能力已具备**。

但当前 **`send()` 每轮以 `setEvents([userEvent])` 重置 Timeline**，左侧「从 events 提取的 user/assistant」仅覆盖**当前一轮**，用户无法从 UI 看到连续对话，也难以在浏览器内完成与 **L6** 对齐的多轮验收（对照追问、上下文是否延续）。

本任务目标：在**不改变**既有 `session_id` 与 BFF 透传行为的前提下，让 **/unified-chat** 具备**产品可感知的多轮会话**（可滚动 transcript + 当前轮 Timeline/执行链路），并满足 **L6** 在「全栈」口径下的可观测条目（Network 与 UI 一致）。

---

## 口径钉死（避免实现/验收各说各话）

### D1. 与后端 SPEC 的竞态（验收必守）

对齐 **`SPEC-ChatBI-V2-Agent-Overview.md` §2.6.3**：首轮 SSE **已正常结束**（出现 **`done`**）后，再发第二轮；或两轮之间 **间隔 ≥ 1s**。  
**禁止**依赖「连点两次发送」验收多轮语义——否则可能撞上异步落库窗口，误判「多轮坏了」。

### D2. 「最终答」与追加时机（纯前端数据口径）

- **「最终答」真值**：与当前页**用户可见的最终回答**同源——实现须与以下**之一**绑定并在 PR 中写死选用（同一 PR 内二者应对齐）：
  - **`finalAnswer` state**（SSE 消费完成后写入页面的主答案）；或
  - **`extractMessagesFromEvents(events)` 中最后一条 `role === "assistant"` 的文本**（与左栏「从 events 提取」逻辑一致）。
- **追加时机**：在**正常完成路径**下追加一整条「用户问 + 最终答」——即 SSE 流结束且本轮按现有逻辑视为成功交付最终文本时（与当前 `done` / `lastDone` 处理一致处挂钩）。  
- **流中断 / 5xx / 未收到 `done`**：**不**追加完整助手条；可选追加一条 **失败态** transcript（如「（本轮未完成）」）或**完全不追加**助手侧——**二选一**，在 PR 描述中写明；验收不强制检查失败 UI，但不得出现「空助手条被当成成功多轮」的歧义。

### D3. `session_id` 展示策略（默认 vs 调试）

| 场景 | 行为 |
|------|------|
| **默认（生产/普通用户）** | **不**展示完整 `session_id`；允许一行**无敏感数值**的说明文案，例如：「同一浏览器内连续提问共享上下文，直至点击新会话」。 |
| **调试** | 与页面现有 **`?debug=1`** / `debugEnabled`（`URLSearchParams`）**同一扇门**：在此模式下展示 **`session_id` 短前缀**（如前 8 字符）+ **复制**按钮，便于与 Network Payload 对照。 |
| **本地 dev 是否默认等同调试** | **不强制**；若实现为 `NODE_ENV === "development"` 时自动展示短前缀，须在 PR 中明确写出，避免与生产行为混淆。 |

### D4. 硬刷新与 transcript 持久化（已知限制 / 产品定性）

- **`session_id`**：`localStorage` 持久化 → **硬刷新后仍相同**，后端多轮仍成立。  
- **transcript（本任务默认可选实现）**：默认仅 **内存**；**硬刷新后 transcript 清空**、Timeline 仅当前轮，与「Network 仍带同一 `session_id`、后端仍有历史」**允许并存**——记为 **已知限制**。  
- **验收口径**：「页面上同时看到两轮」以 **单次页面生命周期内、未刷新** 为准。  
- 若产品要求 **刷新后仍见完整 transcript**：须 **localStorage / IndexedDB** 等与 `session_id` 关联的持久化 → **另起任务**，**本任务非范围**。

### D5. 与 §7.5.5.1「全量 L6」的对齐声明（本任务边界）

| 内容 | 本任务 |
|------|--------|
| **最小宣称（必达）** | Network 两轮 **`session_id` 一致** + UI transcript **两轮可见** + 「新会话」后 **新 UUID** + 遵守 **D1** 竞态。 |
| **§7.5.5.1 其余项** | **首轮 `chain` 中 `meta.payload.session_id` 与请求体一致**、**不同 `session_id` 负例** 等——**不作为本任务前端验收清单必选项**；由后端 SPEC 的 **curl / 集成** 路径覆盖。若 PR 标题宣称「与 §7.5.5.1 全量等价」，须单独列出并自证。 |

### D6. 「当前轮」Timeline 边界

- **一轮** = 从用户触发一次**发送**（生成该轮 `runId` / `user.message`）起，至**下一次发送**前止。  
- 若未来增加「同轮重试 / 取消后重发」，以**最近一次**针对该轮意图的完成或失败处理为准；**当前无重试则不扩展**。

### D7. 与 Overview **§7.5.5 步骤 2**（至少 2 类 query）

- **本任务验收**侧重 **§7.5.5.1** 多轮 UI / Network + **D1**；**不强制**在同一任务内完成「概念类 + 查数类」跨 **mode** 矩阵（§7.5.5 步骤 2）。  
- **打包整段 L6 回归**时：执行者在同一浏览器会话内 **另补** §7.5.5 步骤 2，或在 `docs/diary/` 中注明「多轮 transcript 任务 + §7.5.5 步骤 2」分条归档。

---

## 范围

- [ ] **会话 transcript（必做）**：维护跨轮次的用户/助手摘要列表（可与现有 `extractMessagesFromEvents` 逻辑复用或抽取）；每轮在 **D2** 定义的时机将「用户问 + 最终答」追加到 transcript，**不再**因新一轮发送而丢失上一轮可见文本。
- [ ] **Timeline 行为（必做）**：明确约定——**当前轮**仍展示完整 chain events（便于调试）；历史轮二选一（实现前在 PR 描述中写清选型）：
  - **方案 A**：主时间线仅当前轮；上方或侧栏增加「历史消息」列表（推荐，改动面小）；或
  - **方案 B**：折叠式「历史轮 Timeline」区块（每轮可展开），当前轮保持现有三栏体验。
- [ ] **「新会话」一致性（必做）**：沿用现有 `resetSession()` + 清空 UI；需同时清空 **transcript** 与 **events**，避免旧会话文本残留。
- [ ] **L6 可观测（必做）**：遵守 **D3**（默认文案 + `?debug=1` 下短前缀与复制）；与 Network Payload 对照方式在 PR 或实现备忘中写清。
- [ ] **图谱（必做）**：合并后更新 `docs/_tech_graph/13_flow_components.md`（及若含 flowchart 则同步 **`13_flow_components.ai.md`**）中 Unified 三栏/消息流描述，避免与代码漂移。

---

## 非范围

- **不**修改 Python API、**不**新增 BFF 路由（`/api/py/unified/chat/stream` 已透传 body，`session_id` 无需改路径）。
- **不**强制实现 **Chain Chat**（`/chain-chat` → `/api/py/chain/chat`）与 Unified 的 transcript 统一；若顺带对齐，须在单独 PR 或子任务中说明，避免本任务范围膨胀。
- **不**在本任务内实现 **SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext** 全量（增量子步 UI）；仅做消息级多轮可见化。
- **不**在本任务内实现 **transcript 刷新后持久化**（见 **D4**）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`（`PY_API_URL`、鉴权） |
| 页面与逻辑 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| session 钩子 | `lib/hooks/useSessionId.ts`（**一般无需改**；除非要支持「无 localStorage 场景」的显式降级） |
| BFF | `app/api/py/unified/chat/stream/route.ts`（**一般无需改**） |
| 后端契约真值 | `ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Agent-Overview.md` §2.6、§7.5.5、§7.5.5.1 |
| 图谱 | `docs/_tech_graph/13_flow_components.md`、`11_flow_api.md` |

---

## 验收标准

- [ ] **竞态（必守）**：多轮语义验收遵守 **D1**（首轮 `done` 后再发第二轮，或轮间 ≥1s）；任务评审发现「连点验收」应打回说明。
- [ ] **连续两轮**在同一浏览器、不点「新会话」、且未硬刷新：第二轮请求体 **`session_id` 与第一轮相同**（DevTools → Network → `unified/chat/stream` → Request Payload）。
- [ ] **UI 可见两轮**：在 **D4** 口径下（单次页面寿命内），用户能同时看到第一轮与第二轮的「问/答」摘要（或历史区 + 当前轮），且 **D2** 中「最终答」来源在 PR 中已钉死。
- [ ] **点击「新会话」**：`session_id` 变化（新 UUID）、transcript 与 Timeline 清空，下一轮的 `session_id` 在新链路上稳定回传。
- [ ] **追问语义**：在 **`CHATBI_USE_AGENT=true`** 且 Supabase 可用的环境下，第二轮使用指代型问法，**人工**确认回答或 `agent.intent` 与首轮话题连贯（与 §7.5.5.1 步骤 4 口径一致；不要求自动化断言）。
- [ ] **调试门**：`?debug=1` 下可见 **D3** 约定的 `session_id` 短前缀 + 复制（或与 PR 声明的 dev 行为一致）。
- [ ] **已知限制可复述**：评审或 diary 中可一句说明 **D4**（刷新清空 transcript、与后端历史不矛盾）。
- [ ] **TypeScript**：无新增 `any`；eslint/tsc 与既有 CI 一致通过。
- [ ] **图谱**：`_tech_graph` 已更新且与实现一致。

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `components/unified-chat/UnifiedChatPageClient.tsx`、`docs/_tech_graph/13_flow_components.md`、`docs/_tech_graph/13_flow_components.ai.md` |
| 选型 | **方案 A**；**D2** 与 `extractFinalAnswer` + `setFinalAnswer` 同源；仅 `streamLastDone?.ok` 且非空最终答时 `setTranscript` |
| 流失败策略 | **D2**：未 `done` / `ok=false` / catch — **不**追加 transcript 助手条 |
| 图谱变更点 | `13_flow_components*.md` · `UC_UI` 子图：transcript + 当前轮双栏 + 底栏消息区 |
| L6 归档 | 可选：`docs/diary/` 短归档 + 截图/Network 说明（若仓库策略允许） |

---

## 给 Cursor

验收、非范围、依赖、图谱、`_tech_graph`、`session_id`、transcript、L6、D1、D2、D3、D4、D5、D7、UnifiedChatPageClient、`useSessionId`、`done`、竞态
