# 前端 Task：ChatBI V3 · 低置信预览 SQL 与 `plan_execution_token` 放行（Unified Chat）

> **状态**：done（2026-05-13 验收通过）  
> **关联图谱**：`docs/_tech_graph/11_flow_api.md` / `11_flow_api.ai.md`（Unified Chat SSE 消费路径；若新增交互分支须双轨增量）  
> **后端依赖**：`Projects/ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_low_confidence_plan_preview_confirm_v1.md`（后端已实现 **`plan_execution_token` 请求体** + **`agent.plan.preview`** 帧）

---

## 路径真值（避免相对链失效 · 必读）

本文件位于 **`ai-ink-brain`** 仓：`content/tasks/done/task_chatbi_v3_plan_execution_token_frontend_v1.md`。

| 目标 | 写法 |
|------|------|
| **兄弟仓后端** | 推荐写 **`Projects/ai-ink-brain-api-python/...`** 全路径，便于 `@` 引用。 |
| **同仓 done 任务** | 例如 [`./task_frontend_unified_chat_streaming_sse_v1.md`](./task_frontend_unified_chat_streaming_sse_v1.md) |
| **同仓 active 任务** | 例如 [`../done/task_chatbi_v3_multiturn_clarify_semantics_4_3_frontend_v1.md`](../done/task_chatbi_v3_multiturn_clarify_semantics_4_3_frontend_v1.md) |

**契约与语义真值（后端仓）**：

- `Projects/ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`（`agent.plan.preview` 最小 payload 键）
- `Projects/ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` **§3.2.2** `agent.plan.preview`
- `Projects/ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md`（产品语义 / 安全边界）

**配对澄清前端母单**（Timeline 上 `agent.clarify` 已对接时，本单在其上叠加「确认执行」动作）：[`../done/task_chatbi_v3_multiturn_clarify_semantics_4_3_frontend_v1.md`](../done/task_chatbi_v3_multiturn_clarify_semantics_4_3_frontend_v1.md)

---

## 背景与目标

后端在 **`CHATBI_V3_LOW_CONFIDENCE_CLARIFY`** 与 **`CHATBI_V3_PLAN_PREVIEW_CONFIRM`** 同时开启时，会在 **`agent.clarify`** 前后下发 **`agent.plan.preview`**，其中含 **`sql_draft`**、**`plan_execution_token`**、**`expires_in_sec`**。用户若仅重复发送同一 `query` 而**不带**令牌，仍会卡在澄清短路，**不会**得到「已执行 SQL」的最终结果。

**本任务完成态**：用户在 Unified Chat 中可阅读预览 SQL（遵守展示策略），通过显式动作（如「按预览执行」）发起**下一轮**请求；该请求在 **body** 中携带 **`plan_execution_token`**，且 **`query` / `session_id` 与签发预览时一致**（与后端 HMAC 绑定规则一致），从而走后端放行分支并得到完整 Text2SQL 链路结果。

---

## 范围

- [x] **消费 SSE**：在 `components/unified-chat/UnifiedChatPageClient.tsx`（或抽离模块）识别 **`agent.plan.preview`**，解析 manifest 已承诺字段（`plan_id`、`tool`、`sql_draft`、`warnings`、`plan_execution_token`、`expires_in_sec`）。
- [x] **状态管理**：在「待确认」窗口内缓存 **`plan_execution_token`** + 绑定的 **`query` 文本** + **`session_id`**（与当前 `useSessionId` 一致）；**用户改写输入框并发送新问题时**须丢弃旧令牌，避免误用。
- [x] **请求体**：在用户确认「按预览执行」时，对 **`POST /api/py/unified/chat/stream`** 的 JSON body 追加 **`plan_execution_token`**（字符串）；**`query` 必须与预览当轮用户问题完全一致**（后端绑定问句指纹）。
- [x] **UI**：在 Timeline / 侧栏提供可区分的「预览 SQL」展示与「确认执行 / 取消（丢弃令牌）」；可选展示 TTL 倒计时（基于 `expires_in_sec` 与本地收到时间近似，**以后端校验为准**）。
- [x] **类型**：`components/chain-chat/types.ts` 中 `ChainEvent` / `chain.type` 联合类型纳入 **`agent.plan.preview`**；主路径避免 `any`。
- [x] **策略 B**：未知 `chain.type` 或 payload 多键时，不白屏、不抛未捕获异常（与既有 SSE 容错一致）。

## 非范围

- 后端令牌签发、TTL、`CHATBI_PLAN_EXEC_TOKEN_SECRET` 等（`Projects/ai-ink-brain-api-python`）。
- 修改 Python **Intent 阈值**或澄清 **触发条件**。
- 非 Unified Chat 页面（若其它入口调用同一 BFF，可另开任务对齐）。

---

## 依赖与引用

| 依赖项 | 路径 / 说明 |
|--------|-------------|
| 主页面与 SSE | `components/unified-chat/UnifiedChatPageClient.tsx`（当前 body：`session_id`、`query`、`prefer`、`debug_*`，可选 **`plan_execution_token`**） |
| BFF | `app/api/py/unified/chat/stream/route.ts` — **整段 body 文本透传**至 Python，**一般无需改**；新增字段由前端 JSON 带上即可 |
| 前端 PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`（`PY_API_URL` 等） |
| Ink 规则 | `.cursor/rules/*.mdc`（若有 Unified Chat 专项） |

---

## 验收标准

- [x] **DevTools**：在低置信 + 双开关开启的联调环境中，首轮可见 **`agent.plan.preview`**；用户点击「按预览执行」后，第二轮 **`unified/chat/stream` Request Payload** 含 **`plan_execution_token`**，且 **`query` 与首轮相同**、`**session_id**` 未无故变更。
- [x] **行为**：带有效令牌的一轮 **不出现** `agent.clarify` 短路重复（与后端行为一致）；**过期或改问句后**不带令牌重发，回到澄清 / 新预览，无前端崩溃。
- [x] **展示**：`sql_draft` 仅在产品允许的上下文展示；`warnings` 可与预览块同区展示（内容含 TTL 与「须重新发起」说明，与后端文案对齐即可，**不必**硬编码长句若后端已下发）。
- [x] **类型检查**：`pnpm exec tsc --noEmit`（或仓内等价命令）通过涉及文件的变更。
- [x] **图谱**：若消费/请求路径有结构性变化，已更新 `docs/_tech_graph/11_flow_api.md`（及 flowchart 时的 `.ai.md`）。

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `components/unified-chat/UnifiedChatPageClient.tsx`、`components/chain-chat/types.ts`、`components/chain-chat/ChainEventCard.tsx`、`docs/_tech_graph/11_flow_api.md`、`docs/_tech_graph/11_flow_api.ai.md`（仓内 pre-commit 另可能更新 `docs/_tech_graph/02_version.md`） |
| UI 方案摘要 | 输入区卡片：「按预览执行」以绑定 `query` 重发并附带 `plan_execution_token`；「取消（丢弃令牌）」写入 `dismissedPlanTokenRef`；右栏执行链路与 Timeline 展示 `sql_draft` / `warnings`；TTL 以本地收到时刻近似倒计时 |
| PR / 联调记录 | 前端 `production`：`23149c1` — `feat(unified-chat): consume agent.plan.preview and send plan_execution_token` |

---

## 给 Cursor 的稳定关键词

`plan_execution_token`、`agent.plan.preview`、`UnifiedChatPageClient`、`/api/py/unified/chat/stream`、TTL、`expires_in_sec`、`agent.clarify`、验收、非范围、`_contract_manifest.json`、`SPEC-ChatBI-V2-Events` §3.2.2

---

## 修订记录

| 日期 | 变更 |
|------|------|
| 2026-05-13 | 实现合并；`pnpm exec tsc --noEmit` 通过；任务归档至 `content/tasks/done/` |
