# 前端 Task：ChatBI V3 · Text2SQL 子阶段 SSE 对接（Timeline / 契约）

> **状态**：draft  
> **关联图谱**：`docs/_tech_graph/`（Unified Chat SSE 消费流；按需增量 `11_flow_api*.md`）  
> **配对后端任务**：`../ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_text2sql_tool_latency_obs_v1.md`（阶段 A 已产出 `text2sql.phase.*` + `tool.call.end.output.text2sql_phases_ms`）  
> **L1 子规**：`../ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-Observability-Text2SQL.md`

---

## 背景与目标

后端 Agent 路径下 `text2sql_execute` 在 **增量 SSE**（`CHATBI_SSE_INCREMENTAL` + `X-ChatBI-Sse-Contract: 2`）已可下发：

| `chain.type` | 作用 |
|--------------|------|
| `text2sql.phase.start` | 子阶段开始；`payload.subphase_id` / `phase_id`、`phase_kind`（`llm` / `db` / `io`） |
| `text2sql.phase.end` | 子阶段结束；`payload.latency_ms` |
| `tool.call.end`（既有） | `output` 内可含 **`text2sql_phases_ms`**（各阶段累计 ms） |

本任务目标：前端在 **不破坏策略 B**（未知 `type` 跳过、不白屏）的前提下，**可选到必选递进**地消费上述事件，使用户在 **`tool.call.end` 之前** 能区分「等模型」与「查库 / 检索」等阶段（与后端任务改进点 1 对齐）。

---

## 范围

- [ ] **SSE 解析**：在 `components/unified-chat/UnifiedChatPageClient.tsx`（或抽离的 parser）中识别 `text2sql.phase.start` / `text2sql.phase.end`，写入本轮助手消息的 **执行链路状态**（与现有 `ChainEvent` / Timeline 数据结构对齐或扩展）。
- [ ] **BFF 透传**：确认 `app/api/py/unified/chat/stream/route.ts` 已将 **`X-ChatBI-Sse-Contract`** 原样带给上游（现状应已满足；若新增查询参数或版本枚举，须与后端 vNext 文档一致）。
- [ ] **Timeline UI**：在 `ChainTimeline` / `ChainEventCard`（或 Text2SQL 工具步骤区域）展示子阶段条（至少：阶段名 + 进行中 / 已完成 + 可选 `latency_ms`）；**进行中** 与 **`tool.call.end` 后** 的 **`text2sql_phases_ms`** 可同时存在，UI 策略在实现备忘中写死一种（避免双写抖动）。
- [ ] **契约对齐**：前端仅读取 `_contract_manifest.json` 已承诺的 payload 键（`subphase_id`、`phase_id`、`phase_kind`、`latency_ms`）；不读取未承诺键；本地 `grep`/自审与跨仓 `tech_graph_contract_check` 的 **`frontend_expect ⊆ contract`** 一致。
- [ ] **类型与回归**：为新增 `chain.type` 分支补充最小类型收窄；单测或 Story 级快照（若有现成 harness）覆盖「收到 phase.start → phase.end → tool.call.end」序列。

## 非范围

- 不修改 Python 后端语义（字段变更走后端任务单 + 同 PR manifest）。
- 不在本任务单独实现 **P0-2 JSON 日志**（属后端 `SPEC-ChatBI-V3-Logging-Trace`）；前端仅消费 SSE。
- 不强制升级 **`X-ChatBI-Sse-Contract: 3`**：当前后端在 **Contract 2** 下已下发 `text2sql.phase.*`；若产品要求「显式版本绑定」，另开短任务改常量 + 文档矩阵（见 `SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md` §8.7 / §9）。

---

## 依赖与引用

| 项 | 路径 |
|----|------|
| SSE 契约真值 | `../ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`（`text2sql.phase.start` / `text2sql.phase.end`） |
| 事件语义 | `../ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` §8.2 |
| 前端消费锚点（manifest 已列） | `../ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` → `frontend_anchors.sse_consumer_files` |
| 实现入口（本仓） | `components/unified-chat/UnifiedChatPageClient.tsx`（`SSE_CONTRACT_HEADER` / `SSE_CONTRACT_V2`） |
| BFF | `app/api/py/unified/chat/stream/route.ts` |
| Timeline 组件 | `components/chain-chat/ChainTimeline.tsx`、`components/chain-chat/types.ts`（以实际引用为准） |
| 前端 PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |

---

## 验收标准

- [ ] **策略 B**：随机插入未知 `chain.type` 或缺字段帧时，页面不崩溃、解析错误计数可接受（与现有 SSE 容错一致）。
- [ ] **进行中可感知**：在真实 Agent + Text2SQL 场景（或 mock SSE fixture）下，用户能在 **`tool.call.end` 之前** 看到至少一种 UI 反馈区分 **`phase_kind === "llm"`** 与 **`"db"` 或 `"io"`**（文案或图标二选一即可，不要求动画）。
- [ ] **`text2sql_phases_ms`**：在 `tool.call.end` 到达且 `output.text2sql_phases_ms` 存在时，Timeline 或详情区能展示 **分段 ms**（可与子阶段条合并展示，二选一或并存，实现备忘固定）。
- [ ] **契约无越界**：不读取 manifest 未列键；必要时跑后端仓 `python tools/tech_graph_contract_check.py` 绿。
- [ ] **图谱**：若改了 SSE 消费或数据流，增量更新本仓 `docs/_tech_graph/` 对应 flow（人类版 + 若改 flowchart 则 `.ai.md` 双轨）。

---

## 手动测试用例（建议）

1. **本地**：`CHATBI_USE_AGENT=true`、增量 SSE 开启，发起会触发 `text2sql_query` 的问题；抓 Network SSE，确认存在 `text2sql.phase.*` 帧序列。
2. **UI**：同一请求中，观察 Text2SQL 工具步骤是否在「整段 tool 未完成」时出现子阶段条或等价反馈。
3. **结束帧**：`tool.call.end` 后 `output` 含 `text2sql_phases_ms` 时，总耗时与子阶段和合理（允许少量未计入开销）。

---

## 实现备忘（由实现 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `<待回填>` |
| UI 决策 | `<进行中 vs end 汇总：以谁为准>` |
| 契约版本 | `<当前维持 header 2 / 或升级 3 + 文档>` |

---

**给 Cursor**：`text2sql.phase`、`text2sql_phases_ms`、`UnifiedChatPageClient`、`ChainTimeline`、`X-ChatBI-Sse-Contract`、`task_chatbi_v3`
