# Unified Chat Timeline —— 最长典型事件流说明（单场景稿）

> **本文范围**：只展开 **一种** 后端可能打出的事件序列 —— **双步 ReAct：第 1 步 `text2sql_query` 失败并继续 → 第 2 步 `rag_search` 成功并收尾**。  
> **更长还可能包括**（后续可另开「场景 B」）：`tool.call.start`/`end` 的 **SQL 重试**（`t_step{n}_retry`）、`agent.llm.truncated`、第三步及以后、`error` chain、超时降级等。  
> **前提**：`POST /api/py/unified/chat/stream`、`CHATBI_USE_AGENT=true`，且请求带 **`X-ChatBI-Sse-Contract: 2`**、`CHATBI_SSE_INCREMENTAL` 为默认开启；以下为 **`event: chain` 的 `data` 对象** 的逻辑顺序（非完整 SSE 原文）。

### 术语：`ts`（消耗时间码）

每条 `chain` 上的 **`ts`** 表示：自本轮流在服务端记录的 **`started_at`**（`time.perf_counter()` 锚点）起算，到构造该条事件时的 **已消耗毫秒数**（实现上等价于 `int((perf_counter() - started_at) * 1000)`）。用于 **相对排序** 与 **粗粒度耗时观感**；**不是** Unix 墙钟时间戳，也不保证全局严格单调（并发/多段逻辑下可能持平或回跳，前端以 **SSE 到达顺序** 为主）。

---

## 0. 用户消息（非 SSE `chain`，仅 UI 对齐）

**展示**：用户气泡 —— 「销售额下降原因有哪些」

**含义**：本轮提问文本；与后续 `meta.run_id` / `chain.step_id` 无结构耦合，仅属会话 UI。

---

## 1. `meta`

```json
{
  "type": "meta",
  "ts": 10,
  "step_id": "m1",
  "payload": {
    "run_id": "f0e1d2c3-b4a5-6789-abcd-ef0123456789",
    "mode": "auto",
    "session_id": "session-uuid-…"
  }
}
```

**含义**：**首包契约** —— 告知本轮 `run_id`、当前路由 `mode`（Agent 路径上常为 `auto` 直至意图收敛）、`session_id`。  
**解释**：前端据此挂载 Timeline、去重、与 `done.run_id` 对齐；**vNext 验收**里「`meta` 之后首条有意义 `chain`」的白名单统计**不包含**注释型 keepalive，只认后续 `chain` JSON。

---

## 2. `agent.step.start`（第 1 步）

```json
{
  "type": "agent.step.start",
  "ts": 20,
  "step_id": "a1",
  "payload": { "step_number": 1, "max_steps": 5 }
}
```

**含义**：ReAct **第 1 步**边界开始。  
**解释**：`max_steps` 为环境允许的上限；本步内将先后出现意图侧 LLM（若有）、`agent.intent`、`router.decision`，再进入本步 `think` / `tool.*`。

---

## 3. `agent.llm.start`（`phase: intent`）

```json
{
  "type": "agent.llm.start",
  "ts": 25,
  "step_id": "f0e1d2c3b4a5_s1_intent",
  "payload": { "phase": "intent", "step_id": "s1" }
}
```

**含义**：**意图子阶段**的 LLM 流边界起点（vNext **chain-only**；不走顶层 `token`）。  
**解释**：`phase=intent` 表示接下来一串 `agent.llm.delta` 属于「意图推理可读文本」；`payload.step_id` 与外层 `step_id` 便于右栏/聚合关联。

---

## 4. `agent.llm.delta`（intent，多条示例）

```json
{ "type": "agent.llm.delta", "ts": 26, "step_id": "f0e1d2c3b4a5_s1_intent", "payload": { "text": "问题涉及业务指标与", "part_index": 0 } }
{ "type": "agent.llm.delta", "ts": 27, "step_id": "f0e1d2c3b4a5_s1_intent", "payload": { "text": "原因分析，倾向结构化查询。", "part_index": 1 } }
```

**含义**：意图阶段正文的**增量片段**（当前后端多为**伪流式切分**）。  
**解释**：前端按 `part_index` 顺序拼接；缺 `text` 的帧应策略 B 丢弃并计数。与 Legacy RAG 页的 `token` 事件**无混用**（路径 + 协商头区分）。

---

## 5. `agent.llm.end`（intent）

```json
{
  "type": "agent.llm.end",
  "ts": 40,
  "step_id": "f0e1d2c3b4a5_s1_intent",
  "payload": { "ok": true, "phase": "intent", "step_id": "s1", "simulated_stream": true }
}
```

**含义**：意图 LLM 子阶段**正常结束**。  
**解释**：`simulated_stream: true` 表示片段由服务端切分产生；`ok: false` 时可能接 `error` chain，但 `done` 仍会到达（见总规 §8.7）。

---

## 6. `agent.intent`

```json
{
  "type": "agent.intent",
  "ts": 45,
  "step_id": "intent_1",
  "payload": {
    "tool": "text2sql_query",
    "mode": "text2sql",
    "reasoning": "需要结合数据库统计与维度分析。",
    "confidence": 0.88,
    "fallback": "rag_search",
    "cache": null,
    "cache_key_hash": null,
    "latency_ms": null
  }
}
```

**含义**：**结构化意图结果**（选工具、mode、置信度、fallback）。  
**解释**：与上一段 `agent.llm.*` 分工不同：`agent.llm.*` 偏「过程可读」，本条偏「机读决策」。`cache*` / `latency_ms` 在命中缓存或 debug 时可有值。

---

## 7. `router.decision`

```json
{
  "type": "router.decision",
  "ts": 50,
  "step_id": "r1",
  "payload": {
    "prefer": "auto",
    "candidate_mode": "text2sql",
    "final_mode": "text2sql",
    "rule_hits": [],
    "evidence": { "agent_reasoning": "……完整意图推理……" },
    "fallback": "rag_search"
  }
}
```

**含义**：与 V1 形态对齐的 **Router 决策快照**（Agent 路径下内容来自意图 Agent）。  
**解释**：`candidate_mode` / `final_mode` 用于 Timeline 与旧版对照；`evidence.agent_reasoning` 可放较长推理文本（与 `agent.llm.delta` 可能部分重复，服务不同消费端）。

---

## 8. `agent.think`（第 1 步，工具前摘要）

```json
{
  "type": "agent.think",
  "ts": 55,
  "step_id": "a1_think",
  "payload": {
    "step_number": 1,
    "thought": "先查库看统计结果。",
    "selected_tool": "text2sql_query",
    "mode": "text2sql",
    "confidence": 0.88
  }
}
```

**含义**：**用户级短摘要**（一步内、工具调用前）。  
**解释**：便于人读 Timeline；不等同于 `agent.llm.delta` 全文。

---

## 9. `tool.call.start`（第 1 步）

```json
{
  "type": "tool.call.start",
  "ts": 60,
  "step_id": "t_step1",
  "payload": { "tool": "text2sql_query", "input": { "query": "销售额下降原因有哪些" } }
}
```

**含义**：**工具执行开始**（此处为 Text2SQL）。  
**解释**：与 `agent.step.start` 不同：本条绑定具体 `tool` 与入参。

---

## 10. `tool.call.end`（第 1 步，失败）

```json
{
  "type": "tool.call.end",
  "ts": 1200,
  "step_id": "t_step1",
  "payload": {
    "output": { "answer": null },
    "error": "relation \"sales_daily\" does not exist",
    "latency_ms": 1140
  }
}
```

**含义**：**工具返回**（失败时 `error` 非空，`output.answer` 可为 null）。  
**解释**：Agent 据 `error_code` 等决定下一步是否换工具；本场景假设失败类型触发 **继续第二步**，故尚未出现最终 `assistant.message`。

---

## 11. `agent.step.end`（第 1 步，`next_action: continue`）

```json
{
  "type": "agent.step.end",
  "ts": 1210,
  "step_id": "a1_end",
  "payload": {
    "step_number": 1,
    "tool_used": "text2sql_query",
    "mode": "text2sql",
    "success": false,
    "next_action": "continue"
  }
}
```

**含义**：**第 1 步闭合**；`success: false` 但 `next_action: continue` 表示将进入第 2 步。  
**解释**：失败步在 vNext 实现里若无可拼接答案文本，可能**不**发本步的 `agent.llm.*`（仅 `agent.step.end`）；与成功步「工具后再 `agent.llm.*` 拼答案」不同。

---

## 12. `agent.step.start`（第 2 步）

```json
{
  "type": "agent.step.start",
  "ts": 1220,
  "step_id": "a2",
  "payload": { "step_number": 2, "max_steps": 5 }
}
```

**含义**：**第 2 步**开始（例如 fallback 到 RAG）。  
**解释**：从本条起重复「`think` → `tool.call.*` →（成功则 `rag.sources` / `sql.result`）→ 答案侧 `agent.llm.*` → `agent.step.end`」子序列。

---

## 13. `agent.think`（第 2 步）

```json
{
  "type": "agent.think",
  "ts": 1225,
  "step_id": "a2_think",
  "payload": {
    "step_number": 2,
    "thought": "库表异常，改从文档检索原因表述。",
    "selected_tool": "rag_search",
    "mode": "rag",
    "confidence": 1.0
  }
}
```

**含义**：第 2 步执行前的摘要。  
**解释**：`confidence` 在非首步常见为 1.0（实现细节）；`selected_tool` 已与 fallback 对齐。

---

## 14. `tool.call.start` / `tool.call.end`（第 2 步，成功）

```json
{
  "type": "tool.call.start",
  "ts": 1230,
  "step_id": "t_step2",
  "payload": { "tool": "rag_search", "input": { "query": "销售额下降原因有哪些" } }
}
```

```json
{
  "type": "tool.call.end",
  "ts": 2100,
  "step_id": "t_step2",
  "payload": {
    "output": { "answer": "（此处为工具生成的完整答句，略）" },
    "error": null,
    "latency_ms": 870
  }
}
```

**含义**：第二次工具调用（RAG）生命周期。  
**解释**：成功后 `output.answer` 为工具侧全文；后续 `agent.llm.*` 常对该字符串做**伪流式**重放以便右栏增量展示。

---

## 15. `rag.sources`

```json
{
  "type": "rag.sources",
  "ts": 2110,
  "step_id": "s_step2",
  "payload": {
    "sources": [
      {
        "id": "chunk-1",
        "content": "……命中片段……",
        "filename": "report.md",
        "score": 0.82,
        "path": "docs/report.md",
        "url": null
      }
    ],
    "retrieval": { "top_k": 10, "rrf_k": 60 }
  }
}
```

**含义**：RAG **检索命中列表**（契约含 `sources[]` 与 `retrieval`）。  
**解释**：Timeline 展示引用卡片；与 `agent.llm.delta` 分工：本条偏「证据」，delta 偏「生成过程」。

---

## 16. `agent.llm.start` / `agent.llm.delta` × N / `agent.llm.end`（`phase: rag_generate`）

```json
{ "type": "agent.llm.start", "ts": 2120, "step_id": "f0e1d2c3b4a5_s2_rag_generate", "payload": { "phase": "rag_generate", "step_id": "s2" } }
```

```json
{ "type": "agent.llm.delta", "ts": 2121, "step_id": "f0e1d2c3b4a5_s2_rag_generate", "payload": { "text": "根据检索，", "part_index": 0 } }
{ "type": "agent.llm.delta", "ts": 2122, "step_id": "f0e1d2c3b4a5_s2_rag_generate", "payload": { "text": "销售额下降可能与管理、", "part_index": 1 } }
{ "type": "agent.llm.delta", "ts": 2123, "step_id": "f0e1d2c3b4a5_s2_rag_generate", "payload": { "text": "市场因素相关……（略）", "part_index": 2 } }
```

```json
{
  "type": "agent.llm.end",
  "ts": 2135,
  "step_id": "f0e1d2c3b4a5_s2_rag_generate",
  "payload": { "ok": true, "phase": "rag_generate", "step_id": "s2", "simulated_stream": true }
}
```

**含义**：对 **RAG 答案正文** 再走一遍「子步 LLM」流（便于右栏/流式栏）。  
**解释**：`phase=rag_generate` 与 `intent` / `direct` / `text2sql_summary` 同级枚举；条数 N 由文本长度与切分上限决定，**理论上最长**即接近单步字符上限 / `part_index` cap（触顶可出现 `agent.llm.truncated`，本文未展开）。

---

## 17. `agent.step.end`（第 2 步，`final_answer`）

```json
{
  "type": "agent.step.end",
  "ts": 2140,
  "step_id": "a2_end",
  "payload": {
    "step_number": 2,
    "tool_used": "rag_search",
    "mode": "rag",
    "success": true,
    "next_action": "final_answer"
  }
}
```

**含义**：最后一步成功且**不再继续**下一步。  
**解释**：之后接 `agent.final` 与 `assistant.message`。

---

## 18. `agent.final`

```json
{
  "type": "agent.final",
  "ts": 2150,
  "step_id": "a_final",
  "payload": {
    "total_steps": 2,
    "tools_used": ["text2sql_query", "rag_search"],
    "modes": ["text2sql", "rag"],
    "fallback_used": true
  }
}
```

**含义**：**编排层汇总**（步数、工具序列、mode 序列、是否用过与首意图不同的工具链）。  
**解释**：`fallback_used: true` 表示实际执行工具路径相对「首意图选定工具」发生过切换；**不等于** HTTP 错误。

---

## 19. `assistant.message`

```json
{
  "type": "assistant.message",
  "ts": 2160,
  "step_id": "s_answer",
  "payload": { "role": "assistant", "content": "（与 RAG 工具产出一致或经归一化的最终用户可见全文）" }
}
```

**含义**：**最终用户可见答案**（产品真相源）。  
**解释**：成功路径上应与 `agent.llm.delta` 拼接结果在归一化规则下对齐；Timeline 气泡通常绑本条。

---

## 20. `latency`

```json
{
  "type": "latency",
  "ts": 2170,
  "step_id": "l1",
  "payload": { "total_ms": 2160, "stages_ms": {} }
}
```

**含义**：本轮 **耗时统计**（Agent 路径上 `stages_ms` 可为空对象）。  
**解释**：用于观测；在增量路径里一般在 **`assistant.message` 之后**、`done` 之前由 `unified_chat` 发出。

---

## 21. `done`（`event: done`，非 `chain`）

```json
{
  "ok": true,
  "mode": "rag",
  "run_id": "f0e1d2c3-b4a5-6789-abcd-ef0123456789",
  "session_id": "session-uuid-…",
  "request_id": "f0e1d2c3-b4a5-6789-abcd-ef0123456789"
}
```

**含义**：**SSE 结束帧**；释放输入框、结束 loading。  
**解释**：`mode` 取最终业务 mode（本例为 `rag`）；与首包 `meta.mode` 可能不同属预期。

---

## 附 A：场景 ——「`2026-04-28.md` 写了什么」（RAG 单步成功，与 V1 `rag_rule` 对齐）

> **与正文主场景的区别**：主文是 **双步**（SQL 失败 → RAG）；本附为 **单步即 `rag_search` 成功**，且依赖后端 **`intent_router` 的 `rag_rule_hits` + 证据门控**（见 `ai-ink-brain-api-python/docs/tasks/done/task_intent_router_backend_v1.md` §2026-05-08 回补）。

**展示**：用户气泡 —— `2026-04-28.md写了什么`

**事件顺序（逻辑 step，与 UI Timeline 对齐）**：

1. `agent.llm.start` · `phase: intent`（若开启 LLM 意图）
2. `agent.llm.end` · intent · ok（或超时后 V1 规则，仍以 `rag` 为收敛目标之一）
3. `agent.intent` · **`tool: rag_search`，`mode: rag`**
4. `router.decision` · **`final_mode: rag`**（`candidate` 与证据字段随部署可查）
5. `agent.think` · 选中 `rag_search` / `mode rag`
6. `tool.call.start` / `tool.call.end` · **`rag_search`**（检索命中则 `tool.call.end` 带摘要或 hits）
7. `agent.llm.start` / `delta*` / `end` · **`phase: rag_generate`**
8. `assistant.message` / `latency` / `done`（`mode` 与最终路由一致为 **`rag`**）

**验收结论（2026-05-08）**：上述 Query 下 **`router.decision → rag`**，且 **`rag_search` + `rag_generate` 完整闭环**，与「先误判 text2sql / 过早 no_data」的旧路径脱钩；以联调抓包为准。

---

## 附：更「长」时可插入的位置（备忘）

| 事件 | 插入时机（概念） |
|------|------------------|
| `: sse-keepalive` 注释行 | 任意长时间无 `chain` 写出时 |
| `tool.call.start` / `tool.call.end`（`*_retry`） | Text2SQL 同一步内第二次执行 |
| `sql.result` | `text2sql_query` **成功**且返回 `sql/rows` 时 |
| `agent.llm.truncated` | delta 队列或分片上限触顶 |
| `error` chain | 未捕获异常或子步明确失败策略 |
| 第 3+ 步 `agent.step.*` | `next_action: continue` 且未达 `max_steps` 上限 |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-08 | 改为单场景「双步 SQL 失败 → RAG 成功」最长典型说明；每步下附释义；原粘贴示例归档为结构化文档 |
| 2026-05-08 | 附 A：补充「按 MD 文件名问内容」RAG 单步场景与联调验收；对齐后端 `rag_rule_hits` 回补 |
