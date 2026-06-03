# 前端 Task：Unified Chat — Intent 缓存命中可观测（SSE `agent.intent` + UI）（v1）

> **状态**：done  
> **关联图谱**：`docs/_tech_graph/11_flow_api.md`（BFF / SSE）、`docs/_tech_graph/13_flow_components.md`（Unified Chat UI）  
> **关联 Issue/PR**：无  
> **后端依赖**：已在 `ai-ink-brain-api-python` 的 `agent.intent` payload 透传可观测字段，并更新 `docs/_tech_graph/_contract_manifest.json` 中 `agent.intent` 的 `payload_min_keys`。

---

## 背景与目标

后端 P1-C 已在 `IntentDecision.raw_response` 内写入 **`cache`（`hit`/`miss`）**、**`cache_key_hash`**、**`latency_ms`**，用于评测与排障。但当前 **SSE 事件 `agent.intent` 的 payload 未包含上述字段**，且前端 **`ChainEventType` 未纳入 `agent.intent` 等 V2 类型**，导致 **Unified Chat 页面无法看到「意图缓存是否命中」**，与「同一 session 内重复提问为何仍打 LLM」等问题难以对齐解释。

**完成态**：在 **Debug 已开启**（沿用现有 `debug_router: true` 请求体开关，或本任务新增专用开关二选一并在任务内写死）时，用户能在 **Router / Timeline 区域**看到本轮 **`agent.intent` 的 tool + 缓存命中状态 + 短哈希 + 延迟**；默认关闭 Debug 时不展示、不增加噪音。

---

## 范围

- [x] **SSE 消费**：在 `UnifiedChatPageClient`（或抽出的 SSE 解析模块）中 **稳定解析** `type=agent.intent` 的 chain 事件（与现有 `router.decision` 等并列），不因 `ChainEventType` 联合类型过窄而丢弃或静默吞掉。
- [x] **类型与兼容**：更新 `components/chain-chat/types.ts`（或等价单一事实来源）：至少支持 `agent.intent`（可选再含 `agent.step.start` 等 V2 类型，**以契约 manifest 为准**，避免一次性无限扩张）。
- [x] **UI 展示**（二选一或组合，实现前在实现备忘中写死方案）：
  - [x] **方案 A**：在现有「路由决策（intent router）」折叠面板下增加 **「Intent（V2）」** 子块，展示 `tool` / `mode` / `confidence` / **`cache`** / **`cache_key_hash`** / **`latency_ms`**（字段缺失时显示「—」）。
  - [x] **方案 B**：在 `ChainTimeline` 中为 `agent.intent` 增加轻量节点（与 `router.decision` 区分样式），仅在 Debug 开启时渲染。
- [x] **开关策略**：与现有 **Router Debug**（`debug_router`）联动 **或** 新增 `debug_intent_cache` 布尔 state，并在 **stream / 非流式** 请求 body 中透传后端约定字段（若后端选用独立 env/开关，以前端任务单「依赖」节为准）。
- [x] **文案**：用简短中文说明 **`cache=miss` 在「有历史对话」时属正常**（与后端 `history_hash` 参与缓存键一致），避免用户误以为缓存失效。

---

## 非范围

- 不修改后端 Intent 算法、TTL/LRU、缓存键设计（属 `ai-ink-brain-api-python` / P1-C）。
- 不新增数据库表或新的 Python 查询接口。
- 不在本任务内完成 **macro-F1 / intent_eval** 等评测链路改造。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| BFF SSE | `app/api/py/unified/chat/stream/route.ts`（确认 **透传 body** 与 **不缓冲删字段**；一般无需改，以实测为准） |
| 现有 Debug 参考 | `docs/tasks/active/task_frontend_debug_router_observability_toggle_v1.md` |
| 后端契约真值 | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` → `sse.chain.type_values` / `payload_min_keys_by_type.agent.intent` |
| 后端实现参考 | `ai-ink-brain-api-python/api/unified_chat.py`（`agent.intent` 组装处）、`api/intent_agent.py`（`raw_response` 字段名） |

### 后端配合项（阻塞前端验收）

须在 **`ai-ink-brain-api-python`** 将下列字段并入 **`agent.intent` 的 `payload`**（建议仅在 **`debug_router`** 或 **`debug_intent`** 请求开关为 true 时附带，避免默认泄露过多实现细节）：

- `cache`: `"hit" \| "miss"`
- `cache_key_hash`: `string`（16 hex）
- `latency_ms`: `number`（整数毫秒）

并更新 **契约 manifest** 与（如需要）**contract_check** 门禁，避免 CI 回归失败。

---

## 验收标准

- [x] **Debug 关闭**：UI 不出现 Intent 缓存相关块；SSE 解析不因未知类型崩溃。
- [x] **Debug 开启**且后端已透传字段：同一请求时间线中可看到 **`cache` / `cache_key_hash` / `latency_ms`**，并与后端日志或 JSONL 导出 **一致**。
- [x] **重复提问场景**：在同一 `session_id` 下连续两轮提问时，UI 能解释 **第二轮 `cache` 常为 `miss`**（因 `history` 变化导致复合键变化），与产品说明文案一致。
- [x] **TypeScript**：新增/修改处避免 `any`；SSE 解析对缺字段降级安全。
- [x] **回归**：原有 Unified Chat、Router Debug、Timeline 行为不受影响（手动 smoke：开/关 Debug 各一轮）。

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `components/unified-chat/UnifiedChatPageClient.tsx`、`components/chain-chat/types.ts`、`components/chain-chat/ChainEventCard.tsx`；后端 `api/unified_chat.py`、契约 `docs/_tech_graph/_contract_manifest.json` |
| 请求体字段 | `debug_router: true`（与 Router Debug 共用；无 `debug_intent_cache`） |
| 图谱变更点 | 未改 `11_flow_api` / `13_flow_components`（可选后续补档） |

---

## 给 Cursor

验收、非范围、依赖、图谱、`_tech_graph`、Unified Chat、SSE、`agent.intent`、`cache` / `cache_key_hash`、`debug_router`、契约 manifest、TypeScript strict。
