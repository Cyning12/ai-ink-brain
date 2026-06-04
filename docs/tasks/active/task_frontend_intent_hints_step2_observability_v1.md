# 前端：Intent Hints Step2 — Timeline 路径/仲裁/软超时可观测（v1）

> **状态**：pending  
> **关联 SPEC**：[`docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md`](../specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md)  
> **后端依赖**：`ai-ink-brain-api-python` PR [#111](https://github.com/Cyning12/ai-ink-brain-api-python/pull/111) · task `chatbi_intent_hints_step2_v1`  
> **关联 task（done）**：[`task_frontend_unified_chat_agent_intent_cache_observability_v1.md`](../done/task_frontend_unified_chat_agent_intent_cache_observability_v1.md)  
> **并行（不阻塞）**：[`task_frontend_router_evidence_timeline_v1.md`](./task_frontend_router_evidence_timeline_v1.md)

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `frontend-intent-hints-step2-observability-v1` |
| **test_strategy** | `recommended`（UI 展示 + selector 单测；不强制 E2E） |
| **freeze_id** | `CHATBI-INTENT-HINTS-FE-OBS@2026-06-04` |
| **semi_auto** | `true` |
| **audit_profile** | `light` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/frontend-intent-hints-step2-observability-v1` |
| **acceptance_interaction** | `required` |
| **acceptance_interaction_note** | Debug 开/关 Unified Chat 烟测；Portfolio Q4 或 mock SSE fixture |
| **验收清单** | `docs/tasks/reinspect_results/CHECKLIST_frontend_intent_hints_step2_observability_v1_acceptance_zh.md`（关账前创建） |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | pending | 22-R1, 30 | 人扫 task + SPEC |
| HG-AUDIT-R1 | pending | 30 | 22 R1 后 |
| HG-REINSPECT | pending | done | 50 后 merge 前 |

---

## 背景与目标

后端 Intent Hints Step2 修复 Portfolio 误路由，并在 SSE 透出 `intent_path` / `intent_attempt` / `hints_arbitration` / `agent_step_routing` 等字段。

**完成态（一句话）**：Debug 开启时，Unified Chat Timeline 与路由调试区能 **结构化展示** Intent 决策路径、Step2 仲裁与 Agent 软超时，且 Debug 关闭时 **零视觉回归**。

---

## 范围

- [x] **F1** `lib/unified-chat/chainEventSelectors.ts`：解析 optional 路径字段（`IntentPathObs`）
- [x] **F2** `ChainEventCard`：`agent.intent` Debug 增强（path / attempt / 仲裁 badge）
- [x] **F3** `UnifiedChatRouterDebugPanel`：`router.decision.evidence` Intent 路径摘要条
- [x] **F4** `ChainEventCard`：`agent.think` step-1 软超时 badge + path 折叠
- [x] **F5**（可选）`executionTrace.ts` intent 行 path 摘要
- [x] **F6** `docs/_tech_graph/_contract_manifest.json` 登记 optional keys
- [x] **F7** 单测：`chainEventSelectors` 或 fixture 解析（≥2 用例：有字段 / 缺字段）

## 非范围

- 不改 BFF / 请求体 / Step2 后端逻辑
- 不做 `router.evidence` 独立 Timeline 节点（另 task）
- 不做图表统计

---

## 依赖与引用

| 依赖项 | 路径 |
| --- | --- |
| SPEC | [`SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md`](../specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md) |
| 后端契约 | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` |
| 前端契约 | `docs/_tech_graph/_contract_manifest.json` |
| SSE 消费 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| Debug 面板 | `components/unified-chat/UnifiedChatRouterDebugPanel.tsx` |
| Timeline | `components/chain-chat/ChainEventCard.tsx` |
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| RUNBOOK Q4 | `ai-ink-brain-api-python/docs/harness/guides/RUNBOOK_portfolio_rag_five_questions_v1_zh.md` |

---

## 验收标准

- [ ] Debug **关**：页面与改前一致（人工对比 Unified Chat）
- [ ] Debug **开**：`agent.intent` 展示 `intent_path` / `intent_attempt` / `hints_arbitration`（有则显示）
- [ ] Debug **开**：`agent.think` step-1 在软超时时显示 `agent_soft_timeout_v1` badge
- [ ] `router.decision.evidence` 调试区有路径摘要（非仅 JSON）
- [ ] `rule:portfolio_*` rule_hits chips 正常
- [ ] 缺字段旧 payload 不报错
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿

---

## 失败路径

| # | 触发 | 行为 | 可重试 | 用户可见 |
| --- | --- | --- | --- | --- |
| F1 | SSE 无新字段 | 显示 `—` | — | 无 |
| F2 | 未知 `intent_path` 枚举 | 原样 monospace 展示 | — | Debug 区可见 raw |
| F3 | 后端 #111 未 merge | 本地对 staging API 或 mock fixture 验收 | 是 | — |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
| --- | --- |
| 涉及文件 | `lib/unified-chat/chainEventSelectors.ts` · `intentPathLabels.ts` · `chainEventSelectors.test.ts` · `executionTrace.ts` · `components/chain-chat/{types,ChainEventCard,ChainTimeline}.tsx` · `components/unified-chat/{UnifiedChatRouterDebugPanel,UnifiedChatTimelinePanel,UnifiedChatExecutionTracePanel}.tsx` · `UnifiedChatPageClient.tsx` · `docs/_tech_graph/_contract_manifest.json` |
| 图谱变更 | `_contract_manifest.json` · `payload_optional_keys_by_type`（Step2 intent_path / hints_arbitration / agent_step_routing） |
| Prompt 启动 | [`PROMPT_semi_auto_startup_intent_hints_step2_frontend_v1_zh.md`](../specs/PROMPT_semi_auto_startup_intent_hints_step2_frontend_v1_zh.md) |

---

## ### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: 94% · **状态**: pass · **帽**: 22-R2 · 30 · 40 · 50 · **aggregator**: CLOSE

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|-----|----------------|
| 22 | R2 | main_chat | 100 | 100 | 100 | 60 | — | D4 warn: task 文内 HG-TASK-DRAFT/HG-AUDIT-R1 仍 pending（light kickoff pre-approve；关账前建议人改 approved） |
| 30 | R1 | main_chat | 100 | 100 | 100 | 100 | — | — |
| 40 | R1 | main_chat | 100 | 100 | 100 | 100 | — | — |
| 50 | close | main_chat | 100 | 100 | 100 | 100 | 100 | pass-with-notes: 自动化全绿；§B 浏览器验收待 CHECKLIST + HG-REINSPECT |

**Task 维聚合**: D1=100 · D2=100 · D3=100 · D4=60 · D5=100 → **94%**

**blocked 原因**: 无（KPI 语义 pass）；**关账硬规则**仍 blocked：`HG-REINSPECT pending` + CHECKLIST §B 未签

---

## ### 自检结论（执行者）

**工作目录**：`ai-ink-brain` · **分支**：`task/frontend-intent-hints-step2-observability-v1` · **commit**：`1cc3954`

### 验证命令

| 命令 | 退出码 | 摘要 |
| --- | ---: | --- |
| `pnpm lint` | 0 | eslint 无报错 |
| `pnpm test` | 0 | 13 files · 52 tests passed（含 `chainEventSelectors.test.ts` ×4） |
| `pnpm build` | 0 | Next.js 16.2.3 编译与 TS 检查通过 |

### 验收标准（40 · 命令可证 + 代码审查）

| # | 项 | 结果 | 证据 |
| --- | --- | --- | --- |
| AC1 | Debug **关**无视觉回归 | **待 50 交互** | 新 UI 均 `debugRouter` 门控；无浏览器烟测 |
| AC2 | Debug **开** agent.intent path/attempt/仲裁 | **pass（代码）** | `ChainEventCard` + `UnifiedChatRouterDebugPanel` |
| AC3 | Debug **开** agent.think 软超时 badge | **pass（代码）** | step-1 + `agent_soft_timeout_v1` |
| AC4 | router.decision.evidence 路径摘要 | **pass（代码）** | `IntentEvidenceSummaryBlock` |
| AC5 | rule:portfolio_* chips | **pass（未改）** | `RouterDecisionBlock` rule_hits 逻辑未动 |
| AC6 | 缺字段旧 payload 不报错 | **pass** | 单测 + `extractIntentPathObs` 缺键返回 null |
| AC7 | lint · test · build 绿 | **pass** | 见上表 |

**已知未测**：Portfolio Q4 实 SSE / Debug 开关联动（`acceptance_interaction: required` → 50 + CHECKLIST）。

**audit_profile: light** · HG-AUDIT-R1 已由人 pre-approve（开 30 前用户 Prompt 声明）；无 R1 review 文件。
