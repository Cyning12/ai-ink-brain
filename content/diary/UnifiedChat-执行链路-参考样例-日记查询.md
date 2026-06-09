# Unified Chat 执行链路 —— 参考样例（日记类 Query）

<blockquote>
<p><strong>用途</strong>：后续对照 <strong>SSE 到达序</strong>、右侧「<strong>执行链路</strong>」摘要与左侧 <strong>@@PH0@@</strong> 时作参考。 <strong>关联实现</strong>：前端 <code>buildExecutionTraceSections</code>；后端 <code>api/agent.py</code>（含 <code>AGENT_MAX_LATENCY_MS</code> 软超时、<code>FailureTypeHandler</code> RAG 空 gating）。 本文含 <strong>两段</strong> 样例：<strong>A</strong> 真实链路上的历史抓包（含已修复的重复 rag）；<strong>B</strong> pytest <strong>mock 工具桩</strong> 后 <code>RAG_RETRIEVE_EMPTY</code> → <code>direct_answer</code> 的干净两步。</p>
</blockquote>
<hr />

## A. 样例正文（真实链路抓包摘录，含历史异常段）

```
执行链路
按 SSE 顺序展示 Agent 子步与决策（每段 agent.llm.* 单独成块，不混拼）；明细见左侧 Timeline
Query
2026-04-28的日记大致内容
step-1:
agent.llm.start · intent（使用 LLM 意图识别）
用户询问2026-04-28日记内容，需要从文档库中检索该文件内容。
agent.llm.end · intent · ok
step-2:
agent.intent · rag_search · mode rag
step-3:
router.decision → rag
step-4:
agent.think
用户询问2026-04-28日记内容，需要从文档库中检索该文件内容。
tool rag_search · mode rag
step-5:
tool.call.start · rag_search
step-6:
tool.call.end · rag_search
step-7:
agent.think
Agent 超时，降级到 V1 规则路由。
tool rag_search · mode rag
step-8:
tool.call.start · rag_search
step-9:
tool.call.end · rag_search
step-10:
agent.think
Agent 超时，降级到 V1 规则路由。
tool rag_search · mode rag
step-11:
tool.call.start · rag_search
step-12:
tool.call.end · rag_search
2026-04-28的日记主要记录了作者围绕“如何让AI（或新人）快速接手复杂代码库”这一真实问题，进行的三轮对比实验及最终沉淀出的混合工作流Hybrid V1。

核心结论是：**没有银弹，但可以通过“先导航（架构图谱建立心智地图）→ 再深潜（代码/SQL/清单做真值核验）→ 过安检（门禁脚本防漂移）”的组合流程，最大化信息密度和可审计性**。该流程同样适用于人与人之间的代码库交接。
step-13:
agent.llm.start · rag_generate（RAG 生成）
2026-04-28的日记主要记录了作者围绕“如何让AI（或新人）快速接手复杂代码库”这一真实问题，进行的三轮对比实验及最终沉淀出的混合工作流Hybrid V1。

核心结论是：**没有银弹，但可以通过“先导航（架构图谱建立心智地图）→ 再深潜（代码/SQL/清单做真值核验）→ 过安检（门禁脚本防漂移）”的组合流程，最大化信息密度和可审计性**。该流程同样适用于人与人之间的代码库交接。
agent.llm.end · rag_generate · ok
```

<hr />

## 说明（与「理想正常路径」对照）

<div class="md-table-wrap">
<table>
<thead><tr>
<th>段落</th>
<th>语义</th>
</tr></thead>
<tbody>
<tr>
<td>step-1～3</td>
<td>意图 LLM（<code>agent.llm.*</code> intent）→ <code>agent.intent</code> → <code>router.decision</code></td>
</tr>
<tr>
<td>step-4～6</td>
<td><code>agent.think</code> → 首工具 <code>rag_search</code> → <code>tool.call.start</code> / <code>end</code></td>
</tr>
<tr>
<td>step-7～12</td>
<td><strong>历史异常片段（已修复）</strong>：<code>Agent 超时，降级到 V1 规则路由</code> 与 <strong>重复 @@PH1@@</strong> 来自旧逻辑在<strong>每步循环开头</strong>用软超时覆盖 <code>current_tool</code>，与日记类 V1 路由「恒 rag」叠加后会<strong>打断</strong>本应进入的 <code>direct_answer</code> / <code>text2sql</code> / 收尾路径，形成多余轮次。<strong>当前后端</strong>：仅在 <code>len(tools_used)==0</code> 时允许该次 V1 覆盖（见 <code>api/agent.py</code> 中 ReAct 主循环注释）。修复后<strong>不应</strong>再出现多轮无意义的重复 <code>rag_search</code>。</td>
</tr>
<tr>
<td>step-12 末～13</td>
<td>RAG 命中后的正文（或中间结果展示）→ <strong>@@PH0@@</strong> 段 <code>agent.llm.start</code> … <code>end</code>（最终可读答案的流式/伪流式呈现）</td>
</tr>
</tbody>
</table></div>
**理想正常路径（日记类、首轮 RAG 成功且未触顶超时）**：step-1～6 →（必要时一步失败转路）→ **`rag_generate`**（`agent.llm.*`）→ `assistant.message` / `done` 等（以实际 SSE 为准）。

<hr />

## B. mock 桩后的执行链路（`RAG_RETRIEVE_EMPTY` → `direct_answer`，无 SQL gating）

**场景**：`CHATBI_V2_INTENT_LLM` 按环境可走真实意图；`rag_search` 由测试 **dummy** 返回 `error_code=RAG_RETRIEVE_EMPTY`；意图侧 **无** text2sql / 聚合 gating → `FailureTypeHandler` 选 **`direct_answer`**（`no_data`）。对应单测思路见 `ai-ink-brain-api-python/tests/test_unified_chat_backend_v2_agent.py` 中 **`test_v2_natural_diary_query_rag_empty_fallback_to_direct`** 及文件头 **①②④** 注释；**mock 步骤、恢复 skip、矩阵归档** 见后端 **`ai-ink-brain-api-python/docs/diary/L5-ChatBI-V2-FailureTypeHandler-pytest指南.md`**。

```
执行链路
按 SSE 顺序展示 Agent 子步与决策（每段 agent.llm.* 单独成块，不混拼）；明细见左侧 Timeline
Query
2026-04-28日记的大致内容
step-1:
agent.llm.start · intent（使用 LLM 意图识别）
用户询问特定日期的日记内容，属于非结构化文档信息，需要从文档库中检索。
agent.llm.end · intent · ok
step-2:
agent.intent · rag_search · mode rag
step-3:
router.decision → rag
step-4:
agent.think
用户询问特定日期的日记内容，属于非结构化文档信息，需要从文档库中检索。
tool rag_search · mode rag
step-5:
tool.call.start · rag_search
step-6:
tool.call.end · rag_search
step-7:
agent.think
文档检索无命中，改用直接回答或请用户澄清。
tool direct_answer · mode no_data
step-8:
tool.call.start · direct_answer
step-9:
tool.call.end · direct_answer
抱歉，作为一个AI助手，我无法知道你个人在2026年4月28日的具体日记内容。不过，我可以帮你构思或建议一篇日记的大致内容，例如：

- 当天发生的重要事件或活动
- 心情与感受的变化
- 对未来的计划或反思
- 与家人、朋友或同事的互动
- 遇到的挑战或收获的启发

如果你愿意分享一些背景或主题，我可以帮你写出更具体的日记草稿。
step-10:
agent.llm.start · direct（直接生成）
抱歉，作为一个AI助手，我无法知道你个人在2026年4月28日的具体日记内容。不过，我可以帮你构思或建议一篇日记的大致内容，例如：

- 当天发生的重要事件或活动
- 心情与感受的变化
- 对未来的计划或反思
- 与家人、朋友或同事的互动
- 遇到的挑战或收获的启发

如果你愿意分享一些背景或主题，我可以帮你写出更具体的日记草稿。
agent.llm.end · direct · ok
```

<div class="md-table-wrap">
<table>
<thead><tr>
<th>段落</th>
<th>语义</th>
</tr></thead>
<tbody>
<tr>
<td>step-1～6</td>
<td>与样例 A 相同前缀：intent → intent 卡片 → router → think → <strong>首轮</strong> <code>rag_search</code></td>
</tr>
<tr>
<td>step-7</td>
<td><strong>失败转路</strong>：<code>agent.think</code> 文案来自 <code>FailureTypeHandler</code>（RAG 空且无 SQL fallback）→ 下一工具 <strong>@@PH2@@</strong> / <code>no_data</code></td>
</tr>
<tr>
<td>step-8～9</td>
<td><code>direct_answer</code> 的 <code>tool.call.*</code>；正文为桩或真实 LLM 生成（此处为通用拒答式草稿）</td>
</tr>
<tr>
<td>step-10</td>
<td><strong>@@PH0@@</strong> 的 <code>agent.llm.*</code> 伪流式/流式包装最终答句（与 <code>tool.call.end</code> 后答案对齐，具体以 unified_chat 实现为准）</td>
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
<td>2026-05-06</td>
<td>落盘用户提供的执行链路样例；标注 step-7～12 与软超时修复的关系</td>
</tr>
<tr>
<td>2026-05-06</td>
<td>增补 <strong>§B</strong>：mock 后 <code>RAG_RETRIEVE_EMPTY</code> → <code>direct_answer</code> 执行链路样例，并链到 pytest 用例名</td>
</tr>
</tbody>
</table></div>
