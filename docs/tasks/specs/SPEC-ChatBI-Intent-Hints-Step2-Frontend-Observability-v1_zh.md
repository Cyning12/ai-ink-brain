# SPEC — ChatBI Intent Hints Step2 · 前端 Timeline 可观测（v1）

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` |
| **层级** | L1 · 前端消费规约 |
| **后端依赖** | `ai-ink-brain-api-python` PR [#111](https://github.com/Cyning12/ai-ink-brain-api-python/pull/111)（Step2 + Timeline 字段） |
| **Epic** | Intent Hints Step2 · **仅观测层**（不含 YAML / 仲裁逻辑） |
| **freeze_id（建议）** | `CHATBI-INTENT-HINTS-FE-OBS@2026-06-04` |
| **关联 task** | [`task_frontend_intent_hints_step2_observability_v1.md`](../active/task_frontend_intent_hints_step2_observability_v1.md) |

---

## 0. 结论（是否必改前端）

| 维度 | 是否需要 | 说明 |
| --- | --- | --- |
| 问答 / 路由行为 | **否** | Step2 纯后端；BFF 与请求体不变 |
| Debug / Timeline | **建议（P2）** | 新 SSE 字段已下发，前端未结构化展示 |
| 阻塞后端 Step2 merge | **否** | 排障体验增强 |

---

## 1. 背景

后端 Step2 通过 `intent_hints.yaml` 合并 V1 规则 + 可选 LLM 仲裁，修复 Portfolio Q4 误路由。

后端 PR #111 另增 **Intent 路径可观测** SSE 字段，用于区分：

- Intent **LLM 首轮** vs **U1.5 重试**（`llm` / `llm_retry` + `attempt`）
- Intent **超时 v1_fallback** vs **Agent 软超时**（`agent_step_routing`）
- Step2 **hints 仲裁**（`hints_arbitration`）

复盘文档（后端 diary，按需读）：`ai-ink-brain-api-python/docs/diary/2026-06-04-chatbi-q4-timeline-intent-path-observability.md`

---

## 2. 范围

### 2.1 在范围

| # | 交付 |
| --- | --- |
| F1 | 扩展 `chainEventSelectors` / 类型：解析 optional 路径字段 |
| F2 | `ChainEventCard`：`agent.intent` Debug 增强（path / attempt / 仲裁 badge） |
| F3 | `UnifiedChatRouterDebugPanel`：`router.decision.evidence` 路径摘要条 |
| F4 | `agent.think`（step-1）：`agent_soft_timeout_v1` badge + path 折叠区 |
| F5 | （可选 P2.1）`executionTrace` intent 行增 path 摘要 |
| F6 | 前端 `docs/_tech_graph/_contract_manifest.json` 登记 **optional keys** |

### 2.2 非范围

- 不改 Unified Chat 请求契约（仍用 `debug_router`）
- 不改 BFF 透传（SSE 原样转发）
- 不实现 `router.evidence` Timeline 节点（见 [`task_frontend_router_evidence_timeline_v1.md`](../active/task_frontend_router_evidence_timeline_v1.md)）
- Step3 Graph 注入 UI

---

## 3. SSE 契约扩展（optional · 向后兼容）

> 下列键均为 **optional**；缺失时 UI 显示 `—`，不得抛错。  
> 须在 manifest 增 `payload_optional_keys_by_type`（或与后端协商同名段），避免与「未承诺键」规则冲突。

### 3.1 `agent.intent` payload

| 键 | 类型 | 何时出现 | 含义 |
| --- | --- | --- | --- |
| `intent_path` | `string \| null` | 有 Intent 时 | `llm` · `llm_retry` · `v1_fallback` · `heuristic` |
| `intent_attempt` | `number \| null` | LLM 路径 | 外呼次数 ≥1 |
| `hints_arbitration` | `{ applied: true, reason: string } \| null` | Step2 仲裁生效 | 配置强制改 rag |
| `cache` | `"hit" \| "miss" \| null` | **始终** | Intent 缓存（不再仅 debug） |
| `cache_key_hash` | `string \| null` | 仅 `debug_router=true` | 短哈希 |
| `latency_ms` | `number \| null` | 有观测时 | Intent 延迟 |

既有键 `tool` / `mode` / `reasoning` / `confidence` / `fallback` **不变**。

### 3.2 `router.decision.evidence`（嵌套）

```json
{
  "agent_reasoning": "…",
  "intent_path": "llm_retry",
  "intent_attempt": 2,
  "hints_arbitration": { "applied": true, "reason": "配置：站点人物须查 resume" }
}
```

`router.decision.rule_hits` 可能含 Step2：`rule:portfolio_keyword` · `rule:portfolio_regex:*` · `rule:portfolio_person`（复用现有 chips）。

### 3.3 `agent.think` payload（`step_number === 1`）

| 键 | 类型 | 含义 |
| --- | --- | --- |
| `agent_step_routing` | `"intent" \| "agent_soft_timeout_v1"` | 本步路由来源 |
| `intent_path` / `intent_attempt` / `hints_arbitration` | 同 3.1 | 与 Intent 对齐 |

**文案对照（排障）**：

| `agent_step_routing` | `thought` 典型 | 易混淆 |
| --- | --- | --- |
| `intent` | Intent reasoning | — |
| `agent_soft_timeout_v1` | 「Agent 超时，降级到 V1 规则路由。」 | Intent 重试 / `v1_fallback` |

---

## 4. UI 规格

### 4.1 门控

| 区域 | 条件 | 行为 |
| --- | --- | --- |
| Router Debug Panel | `debugRouter === true` | 结构化 path / 仲裁 |
| Timeline `agent.intent` | Debug 开 | 标题 + grid 增行 |
| Timeline `agent.think` | Debug 开 | 软超时 badge |
| 执行链路 | 可选 | 一行 path 摘要 |

**Debug 关**：视觉与改前一致（`cache` hit/miss 可保留既有展示，不强制新增行）。

### 4.2 `agent.intent` 标题增强（Debug 开）

示例：`agent.intent · rag_search · LLM重试#2 · 仲裁`

Grid 增行：

- `intent_path` → 中文：`LLM` / `LLM 重试` / `Intent超时→V1` / `启发式`
- `intent_attempt` → `第 N 次`
- `hints_arbitration.reason` → 琥珀 badge「配置仲裁 → rag」

### 4.3 `agent.think` step-1

- `agent_step_routing === "agent_soft_timeout_v1"` → 琥珀/红 badge「Agent 软超时 → V1」
- 折叠区：`intent_path` / `intent_attempt`

### 4.4 `router.decision` 调试区

在 `evidence` JSON 之上增 **Intent 路径摘要条**（读 `evidence.intent_path` 等）。

---

## 5. 实现锚点

| 文件 | 改动 |
| --- | --- |
| `lib/unified-chat/chainEventSelectors.ts` | `IntentPathObs` · `extractIntentPathObs` · 扩展 `AgentIntentObsRow` |
| `components/chain-chat/types.ts` | payload optional 类型 |
| `components/chain-chat/ChainEventCard.tsx` | §4.2–4.3 |
| `components/unified-chat/UnifiedChatRouterDebugPanel.tsx` | §4.4 |
| `lib/unified-chat/executionTrace.ts` | 可选 §4.1 执行链路 |
| `docs/_tech_graph/_contract_manifest.json` | optional keys |
| `lib/unified-chat/intentPathLabels.ts`（新建，可选） | 枚举 → 中文 |

**建议常量**：

```typescript
export const INTENT_PATH_LABEL: Record<string, string> = {
  llm: "LLM",
  llm_retry: "LLM 重试",
  v1_fallback: "Intent 超时 → V1",
  heuristic: "启发式",
};
```

---

## 6. 验收标准

- [ ] Debug **关**：Unified Chat 无视觉回归
- [ ] Debug **开** + Portfolio Q4：`agent.intent` 可见 path / attempt；仲裁时可见 `hints_arbitration`
- [ ] Agent 软超时场景：`agent.think` 显示 `agent_soft_timeout_v1` badge
- [ ] `rule_hits` 含 `rule:portfolio_*` 时 chips 正常
- [ ] 旧后端（无新字段）：不报错，显示 `—`
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿

**烟测**：对齐 RUNBOOK Q4 + 后端 diary Q4 双 run 对照。

---

## 7. 与既有 task 关系

| task | 关系 |
| --- | --- |
| `task_frontend_unified_chat_agent_intent_cache_observability_v1`（done） | 本 SPEC **扩展** |
| `task_frontend_router_evidence_timeline_v1`（pending） | **独立**，可并行 |
| `task_chatbi_v2_incremental_sse_timeline_frontend_v1` | 执行链路可吸收 path 摘要 |

---

## 8. 后端 follow-up（非本 SPEC 实现）

PR #111 若未登记 optional keys，建议后端补 manifest commit，便于双端 `tech_graph_contract_check` 对齐。

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-04 | 初版：后端 Step2 可观测前端消费规约 |
