> **状态**：done（P1 task 卫生归档 · 2026-06-09 · 功能已在 main；追溯见各 PR / Epic M01–M06）

# Task：Chain Chat 时间线可观测性与 Unified SSE 对齐（契约 + 前端补强）

> **状态**：`todo`  
> **帽子依据**：工作区 `docs/harness/prompts/10-requirements.md`（需求帽结构化输出）  
> **test_strategy**：`recommended`  
> **test_strategy_note**：后端已有 `tests/test_chain_chat_events.py`；前端建议 Vitest 测「hydrate + payload 提取」纯函数；全链路 E2E 可选 Playwright，不强制。  
> **gates_before_code**：`["failure_paths", "§依赖与真值"]`

---

## 1. 背景与目标

**现象**：用户在 **Chain Chat** 页中栏「Chain Timeline」看到 **`run=` 为空**、**`latency` 的 `total_ms: 0`**、**`assistant.message` 展开无正文**；与 **Unified Chat（SSE）** 左右分栏 + 丰富 chain 事件体验不一致，误以为「前端没改」。

**调查结论（代码真值，相对工作区根 `Projects/`）**：

1. **后端 `api/chain_chat.py`**：`_event()` 仅返回 `type` / `ts` / `step_id` / `payload`，**未写入每条事件的 `run_id`**，而响应体顶层另有 `run_id`。前端 `ChainEventCard` 页眉渲染为 `run={event.run_id}`，故显示为空（见 `components/chain-chat/ChainEventCard.tsx` 约 L969–970）。  
2. **同一文件**：非 Text2SQL 意图的 `assistant.message` 与成功路径的 `assistant.message` 使用 **`payload.role` + `payload.content`**；前端 `extractTextFromPayload` / `ChainEventCard` 的 `assistant.message` 分支只认 **`text` / `answer` / `output.answer`**，**不认 `content`**，导致展开体为空（见 `components/chain-chat/ChainEventCard.tsx` 与 `ChainChatPageClient.tsx` 内 `extractTextFromPayload`）。  
3. **`total_ms: 0`**：`latency` 事件的 `total_ms` 来自 `_now_ms(started_at)`（`int((perf_counter()-started_at)*1000)`），在极短路径上可能整段为 **0**；与「无耗时」语义混淆。  
4. **布局**：`ChainChatPageClient` 已为 **`lg` 三栏**（消息 | Timeline | 控制台）；窄屏为纵向堆叠，**不等价**于 Unified SSE 页的左右会话布局——属产品差异，可在本单用文案或响应式提示缓解。

**目标**：Chain Chat 在走 **`/api/py/chain/chat`** 真链时，时间线 **可核对 `run_id`、可读 assistant 正文、latency 语义不误导**；并与 **`components/chain-chat/types.ts`**、**`_contract_manifest.json`**（若登记 chain 事件字段）**不自相矛盾**。

---

## 2. 范围 / 非范围

**范围**

- **后端**：`ai-ink-brain-api-python/api/chain_chat.py` — 每条 `_event` 产出须含 **`run_id`**（与响应顶层一致）；`assistant.message` 的 payload 与前端解析 **二选一且文档写死**：**要么**改为 `text`/`answer` 与现网 Unified 对齐，**要么**保持字段由前端兼容 `content`（推荐前后端同时收敛，避免双真值）。  
- **前端**：`ai-ink-brain/components/chain-chat/ChainChatPageClient.tsx` — 在 `setEvents` 前若事件缺 `run_id`，用响应 **`data.run_id`** 填充；`ChainEventCard` 或共享 `extractTextFromPayload` **识别 `content`**（与后端对齐后二选一）。  
- **可选 UX**：中栏顶部展示当前 **`run_id`**（只读）、窄屏提示「与 Unified 布局不同」、`latency` 为 0 时显示 **「&lt;1ms」或「—」**（与产品一致即可）。

**非范围**

- 不重写 Unified SSE 解析器、不改 `POST /api/py/unified/chat/stream` 契约。  
- 不在本单把 Chain Chat **改为** SSE 双栏（若需要另开「Chain Chat 流式化」任务）。  
- 不扩展 Chain Chat v1 非 Text2SQL 链路的完整 Agent 仿真（仍可为单条说明性 `assistant.message`）。

---

## 3. 依赖与真值

| 项 | 路径 |
|----|------|
| 后端 Chain 实现 | `ai-ink-brain-api-python/api/chain_chat.py` |
| 后端单测 | `ai-ink-brain-api-python/tests/test_chain_chat_events.py` |
| 前端 Chain 页 | `ai-ink-brain/components/chain-chat/ChainChatPageClient.tsx` |
| 时间线卡片 | `ai-ink-brain/components/chain-chat/ChainEventCard.tsx`、`ChainTimeline.tsx` |
| 事件类型白名单（SSE 侧参考） | `ai-ink-brain/components/chain-chat/types.ts`（`ChainEvent` / `UNIFIED_SSE_CHAIN_TYPE_WHITELIST`） |
| BFF 转发 | `ai-ink-brain/app/api/py/chain/chat/route.ts` |
| 契约（若需改字段名） | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` + CI `tech_graph_contract_check` |

---

## 4. 验收标准（可勾选）

- [ ] **run_id**：任意 `POST /api/py/chain/chat` 成功响应中，**每条** `events[]` 元素含 **`run_id`**，且与顶层 **`run_id`** 相同（pytest 断言）。  
- [ ] **assistant 可读**：非 Text2SQL 样例与 Text2SQL 成功样例下，前端时间线 **展开 `assistant.message` 可见正文**（与 `extractFinalAnswer` / 卡片 body 一致）。  
- [ ] **latency**：文档或 UI 说明 `total_ms` 含义；全链路成功响应末尾 `latency` 的 `total_ms` **在常规硬件上 &gt; 0**，或明确展示「&lt;1ms」且不写死 0 为成功条件（择一写进 task 实现备忘）。  
- [ ] **回归**：`pytest tests/test_chain_chat_events.py`（后端）与 `pnpm test` 中与 chain 相关用例（若新增 Vitest）通过。  
- [ ] **图谱/契约**：若修改对外 JSON 字段形状，同步 **`_contract_manifest.json`** 与 `docs/_tech_graph` 中 Chain 说明（与仓库 CI 规则一致）。

---

## 5. failure_paths

| ID | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----|-----------|----------|--------|----------|
| FP-1 | 后端仍漏 `run_id` 字段 | CI pytest 失败 | 否 | 无（开发阶段拦截） |
| FP-2 | 仅改前端不认 `content`、后端未改 | assistant 仍空白 | 否 | Timeline 展开无正文 |
| FP-3 | 契约 manifest 与实现漂移 | `tech_graph_contract_check` 失败 | 否 | PR 阻塞 |

---

## 6. 给执行帽的必读列表

1. 通读 `api/chain_chat.py` 中 **`_event` 与所有 `events.append`**。  
2. 通读 `ChainEventCard` 中 **`assistant.message`** 与 **`fmtTs`/`run=` 行**。  
3. 合并前：后端 `pytest tests/test_chain_chat_events.py`；前端 `pnpm lint` + `pnpm test`（与 `quality` workflow 一致）。

---

## 7. 实现备忘（执行后回填）

| 项 | 内容 |
|----|------|
| 选用契约 | （后端统一 `run_id` 进 events / `assistant` 用 `text` 或 `content` + 前端兼容 — 择一写死） |
| 涉及文件 | （回填） |

---

## 8. 矛盾与待确认（需求帽列出，执行前消解）

| 矛盾 | 说明 |
|------|------|
| **A**：`ChainEvent` 类型要求 `run_id: string` | **B**：后端 `_event` 历史实现未带 `run_id` | → 以 **后端补字段** 为主真值；前端 hydrate 为 **防御性补强**。 |
| **A**：Unified SSE 常用 `payload.text` | **B**：chain_chat 用 `payload.content` | → 单一真值，避免 `extractTextFromPayload` 双轨长期分叉。 |

**待确认**：`assistant.message` 最终是否对齐 **`SPEC-ChatBI-V2-Events.md`** 或 manifest 中已有字段名（若无可由本 task §7 写死为 `text`）。

---

## 9. 给 Cursor 的稳定关键词

`Chain Chat`、`Chain Timeline`、`chain_chat`、`run_id`、`assistant.message`、`latency`、`observability`、`Unified SSE`、`10-requirements`
