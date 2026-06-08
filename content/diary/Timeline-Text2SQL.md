# Unified Chat Timeline —— Text2SQL **单步成功** 事件流说明

<blockquote>
<p><strong>本文范围</strong>：<strong>一种</strong> 场景 —— <strong>第 1 步即 @@PH0@@ 成功</strong>：生成/执行 SQL 成功 → 出现 <strong>@@PH1@@</strong> → 对最终答句做 <strong>@@PH2@@</strong> 的 <code>agent.llm.*</code> 伪流式 → <strong>@@PH4@@</strong>。 <strong>前提</strong>：<code>POST /api/py/unified/chat/stream</code>、<code>CHATBI_USE_AGENT=true</code>，建议带 <strong>@@PH7@@</strong>（增量路径）；下表为 <strong>@@PH8@@ 的 @@PH9@@ 对象</strong> 逻辑顺序。 <strong>与抓包差异</strong>：部分 UI 导出会折叠 <strong>@@PH10@@</strong>；<strong>契约全量</strong>中应在 <strong>@@PH11@@（intent）</strong> 与 <strong>@@PH12@@</strong> 之间出现 <code>intent_1</code>，下文按 <strong>服务端完整序列</strong> 编写。 <strong>与 RAG 边界</strong>：<code>prefer=auto</code> 下 V1 规则已支持 <strong>@@PH15@@ 优先于纯 SQL 关键词</strong>；「问某篇 <code>.md</code>/日记写了什么」应走 <strong>RAG</strong> 而非本场景的 Text2SQL，详见 <code>api/intent_router.py</code> 与 <strong>@@PH18@@</strong>（2026-05-08 回补验收）。</p>
</blockquote>
### 术语：`ts`（消耗时间码）

每条 `chain` 上的 **`ts`**：自本轮 **`started_at`**（`perf_counter` 锚点）起算到该事件生成时刻的 **已消耗毫秒数**；用于 Timeline **相对刻度** 与耗时观感，**不是**墙钟时间戳。与 `latency.total_ms` 同源思路（均为相对本轮起点）；细粒度阶段耗时应以 `tool.call.end.latency_ms` 等字段为准。

<hr />

## 0. 用户消息（非 SSE `chain`，仅 UI）

**展示**：用户气泡 —— 「统计 agent_info 表里有多少条数据」

**含义**：本轮自然语言问题；驱动后续 Intent 与 Text2SQL 工具入参。

<hr />

## 1. `meta`

```json
{
  "type": "meta",
  "ts": 10,
  "step_id": "m1",
  "payload": {
    "run_id": "e64cf725-ba0d-4242-ba82-6aa6cbc1a2f3",
    "mode": "auto",
    "session_id": "1fe15587-f693-4451-885d-210278518d9b"
  }
}
```

**含义**：首包 —— `run_id`、`session_id`、初始 `mode`（常为 `auto`）。  
**解释**：与 `done` 中的 `run_id` 对齐；Timeline 挂载点。

<hr />

## 2. `agent.step.start`（第 1 步）

```json
{
  "type": "agent.step.start",
  "ts": 40,
  "step_id": "a1",
  "payload": { "step_number": 1, "max_steps": 5 }
}
```

**含义**：ReAct 第 1 步开始。  
**解释**：本场景仅一步即结束；`max_steps` 来自环境 `AGENT_MAX_STEPS`。

<hr />

## 3. `agent.llm.start`（`phase: intent`）

```json
{
  "type": "agent.llm.start",
  "ts": 40,
  "step_id": "e64cf725ba0d_s1_intent",
  "payload": { "phase": "intent", "step_id": "s1" }
}
```

**含义**：意图子阶段 LLM 流起点（vNext **chain-only**）。  
**解释**：随后多条 `agent.llm.delta` 为意图推理过程文本（伪流式）。

<hr />

## 4. `agent.llm.delta`（intent，示例合并为 4 条）

```json
{ "type": "agent.llm.delta", "ts": 41, "step_id": "e64cf725ba0d_s1_intent", "payload": { "text": "用户要求统计 agent_inf", "part_index": 0 } }
{ "type": "agent.llm.delta", "ts": 42, "step_id": "e64cf725ba0d_s1_intent", "payload": { "text": "o 表的数据条数，属于结构化数据", "part_index": 1 } }
{ "type": "agent.llm.delta", "ts": 43, "step_id": "e64cf725ba0d_s1_intent", "payload": { "text": "查询，应由数据库执行 COUNT", "part_index": 2 } }
{ "type": "agent.llm.delta", "ts": 44, "step_id": "e64cf725ba0d_s1_intent", "payload": { "text": " 查询给出结果。", "part_index": 3 } }
```

**含义**：意图可读推理的增量片段。  
**解释**：按 `part_index` 拼接；与 `router.decision.evidence.agent_reasoning` 常同源或互补。

<hr />

## 5. `agent.llm.end`（intent）

```json
{
  "type": "agent.llm.end",
  "ts": 45,
  "step_id": "e64cf725ba0d_s1_intent",
  "payload": { "ok": true, "phase": "intent", "step_id": "s1", "simulated_stream": true }
}
```

**含义**：意图 LLM 子阶段结束。  
**解释**：`simulated_stream: true` 表示服务端切分；`ok: false` 时仍可能继续发结构化 `agent.intent` 或错误策略（依实现）。

<hr />

## 6. `agent.intent`（契约全量；抓包可能省略）

```json
{
  "type": "agent.intent",
  "ts": 46,
  "step_id": "intent_1",
  "payload": {
    "tool": "text2sql_query",
    "mode": "text2sql",
    "reasoning": "用户要求统计 agent_info 表的数据条数，属于结构化数据查询，应由数据库执行 COUNT 查询给出结果。",
    "confidence": 0.95,
    "fallback": null,
    "cache": null,
    "cache_key_hash": null,
    "latency_ms": null
  }
}
```

**含义**：结构化意图 —— 选定 **`text2sql_query`** 与 **`text2sql`** mode。  
**解释**：`cache` / `cache_key_hash` / `latency_ms` 在缓存命中或 debug 时可有值；本条为机读真值，`agent.llm.delta` 为过程展示。

<hr />

## 7. `router.decision`

```json
{
  "type": "router.decision",
  "ts": 47,
  "step_id": "r1",
  "payload": {
    "prefer": "auto",
    "candidate_mode": "text2sql",
    "final_mode": "text2sql",
    "rule_hits": [],
    "evidence": {
      "agent_reasoning": "用户要求统计 agent_info 表的数据条数，属于结构化数据查询，应由数据库执行 COUNT 查询给出结果。"
    },
    "fallback": null
  }
}
```

**含义**：与 V1 对齐的 Router 快照（Agent 路径下证据来自意图）。  
**解释**：`candidate_mode` 与 `final_mode` 均为 `text2sql` 表示本 run 以查库为主路径。

<hr />

## 8. `agent.think`（第 1 步，工具前摘要）

```json
{
  "type": "agent.think",
  "ts": 48,
  "step_id": "a1_think",
  "payload": {
    "step_number": 1,
    "thought": "用户要求统计 agent_info 表的数据条数，属于结构化数据查询，应由数据库执行 COUNT 查询给出结果。",
    "selected_tool": "text2sql_query",
    "mode": "text2sql",
    "confidence": 0.95
  }
}
```

**含义**：用户级短摘要，紧接工具调用。  
**解释**：Timeline 一行「准备干什么」；非 SQL 正文。

<hr />

## 9. `tool.call.start`（`text2sql_query`）

```json
{
  "type": "tool.call.start",
  "ts": 50,
  "step_id": "t_step1",
  "payload": {
    "tool": "text2sql_query",
    "input": { "query": "统计 agent_info 表里有多少条数据" }
  }
}
```

**含义**：Text2SQL 工具开始执行（内部含 SQL 生成、校验、执行、总结等）。  
**解释**：`input.query` 为传入工具的自然语言（可与用户字面值略有改写差异）。

<hr />

## 10. `tool.call.end`（成功）

```json
{
  "type": "tool.call.end",
  "ts": 6060,
  "step_id": "t_step1",
  "payload": {
    "output": { "answer": "agent_info 表中共有 10 条数据。" },
    "error": null,
    "latency_ms": 6010
  }
}
```

**含义**：工具返回；`error: null` 表示本步执行成功。  
**解释**：`output.answer` 为面向用户的自然语言结论（常由 SQL 结果 + LLM 总结得到）；`latency_ms` 为工具侧耗时量级示例。

<hr />

## 11. `sql.result`（成功路径专有）

```json
{
  "type": "sql.result",
  "ts": 6065,
  "step_id": "q_step1",
  "payload": {
    "sql": "select count(*) as total_count\nfrom agent_info",
    "columns": ["total_count"],
    "rows": [{ "total_count": 10 }],
    "truncated": false
  }
}
```

**含义**：可展示的 **SQL + 列 + 行预览**（契约字段）。  
**解释**：Timeline 上「查库证据」卡片；`truncated: true` 时表示行/列被截断以控体积。与 `agent.llm.*` 分工：本条偏结构化证据，delta 偏答句流式。

<hr />

## 12. `agent.llm.start`（`phase: text2sql_summary`）

```json
{
  "type": "agent.llm.start",
  "ts": 6070,
  "step_id": "e64cf725ba0d_s1_text2sql_summary",
  "payload": { "phase": "text2sql_summary", "step_id": "s1" }
}
```

**含义**：对 **最终答句**（或与答句等价文本）再走子步 LLM 流，便于右栏增量。  
**解释**：`phase=text2sql_summary` 标识「本段流对应 SQL 路径上的答句呈现」；与 `rag_generate` / `intent` 同级不同相。

<hr />

## 13. `agent.llm.delta`（text2sql_summary，示例 2 条）

```json
{ "type": "agent.llm.delta", "ts": 6071, "step_id": "e64cf725ba0d_s1_text2sql_summary", "payload": { "text": "agent_info 表中共有 ", "part_index": 0 } }
{ "type": "agent.llm.delta", "ts": 6072, "step_id": "e64cf725ba0d_s1_text2sql_summary", "payload": { "text": "10 条数据。", "part_index": 1 } }
```

**含义**：答句正文增量。  
**解释**：成功路径上拼接结果应与 `assistant.message.content` 在归一化规则下对齐（见 vNext SPEC §8.6）。

<hr />

## 14. `agent.llm.end`（text2sql_summary）

```json
{
  "type": "agent.llm.end",
  "ts": 6085,
  "step_id": "e64cf725ba0d_s1_text2sql_summary",
  "payload": { "ok": true, "phase": "text2sql_summary", "step_id": "s1", "simulated_stream": true }
}
```

**含义**：本子阶段 LLM 流结束。  
**解释**：随后发 `agent.step.end` 闭合本 ReAct 步。

<hr />

## 15. `agent.step.end`（`final_answer`）

```json
{
  "type": "agent.step.end",
  "ts": 6090,
  "step_id": "a1_end",
  "payload": {
    "step_number": 1,
    "tool_used": "text2sql_query",
    "mode": "text2sql",
    "success": true,
    "next_action": "final_answer"
  }
}
```

**含义**：第 1 步成功且不再继续下一步。  
**解释**：`next_action: final_answer` 与「仅一步」一致。

<hr />

## 16. `agent.final`

```json
{
  "type": "agent.final",
  "ts": 6100,
  "step_id": "a_final",
  "payload": {
    "total_steps": 1,
    "tools_used": ["text2sql_query"],
    "modes": ["text2sql"],
    "fallback_used": false
  }
}
```

**含义**：编排汇总。  
**解释**：`fallback_used: false` 表示未切换相对首意图的 fallback 工具链。

<hr />

## 17. `assistant.message`

```json
{
  "type": "assistant.message",
  "ts": 6110,
  "step_id": "s_answer",
  "payload": { "role": "assistant", "content": "agent_info 表中共有 10 条数据。" }
}
```

**含义**：**最终用户可见答案**（产品真相源）。  
**解释**：气泡与同步状态以本条为准；右栏 delta 为过程态。

<hr />

## 18. `latency`

```json
{
  "type": "latency",
  "ts": 10270,
  "step_id": "l1",
  "payload": { "total_ms": 10267, "stages_ms": {} }
}
```

**含义**：本轮总耗时（Agent 路径 `stages_ms` 可为 `{}`）。  
**解释**：在增量路径中通常由 `unified_chat` 在 `assistant.message` 之后发出。

<hr />

## 19. `done`（`event: done`）

```json
{
  "ok": true,
  "mode": "text2sql",
  "run_id": "e64cf725-ba0d-4242-ba82-6aa6cbc1a2f3",
  "session_id": "1fe15587-f693-4451-885d-210278518d9b",
  "request_id": "e64cf725-ba0d-4242-ba82-6aa6cbc1a2f3"
}
```

**含义**：SSE 结束；解锁输入、收尾 UI。  
**解释**：`mode` 为最终业务 mode（本例 `text2sql`），可与首包 `meta.mode` 不同。

<hr />

## 附：本场景未出现但相关的类型

<div class="md-table-wrap">
<table>
<thead><tr>
<th>类型</th>
<th>说明</th>
</tr></thead>
<tbody>
<tr>
<td><code>rag.sources</code></td>
<td>RAG 成功步才有；纯 Text2SQL 成功无此项。</td>
</tr>
<tr>
<td><code>agent.llm.*</code> / <code>phase: text2sql_sql</code></td>
<td>若将来把「SQL 生成语句」单独流式暴露，可能新增；当前实现多在工具内完成，对答句用 <strong>@@PH0@@</strong>。</td>
</tr>
<tr>
<td><code>tool.call.*</code>（<code>*_retry</code>）</td>
<td>同一步 SQL 生成失败重试时出现第二对 start/end。</td>
</tr>
<tr>
<td><code>agent.llm.truncated</code></td>
<td>delta 分片/队列触顶时出现。</td>
</tr>
</tbody>
</table></div>
<hr />

## 修订记录

<div class="md-table-wrap">
<table>
<thead><tr>
<th>日期</th>
<th>说明</th>
</tr></thead>
<tbody>
<tr>
<td>2026-05-08</td>
<td>按 <code>Timeline-Explanation.md</code> 体例改为结构化标注；单步 Text2SQL 成功；补 <code>agent.intent</code> 与契约化 <code>sql.result</code>；附与抓包差异说明</td>
</tr>
</tbody>
</table></div>
