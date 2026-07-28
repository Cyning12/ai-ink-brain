# Task（前端）：ChatBI V3 — 低置信 RAG 预览 + 确认放行（§5-3 · Ink）

> **状态**：`done`（2026-06-01 验收通过 · `CHATBI-LOWCONF-RAG-PREVIEW-FE@2026-05-31` · Task_KPI% 100 pass）  
> **schedule_ref**：RECENT §1.1 #4 · 母单 §5.1 **5-3**（前端半）  
> **登记日期**：2026-05-31  
> **配对后端**：[`ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_v1.md)  
> **需求真值（L1）**：后端 [`SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md`](../../../ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md) **§2 RAG 预览**、**§4 确认令牌**  
> **前置（done）**：5-2 Text2SQL 预览 UI 基线（`UnifiedChatPageClient` · `pendingPlanConfirm` · `plan_execution_token` 续跑）

---

## Harness 元信息（执行 Agent 必读）

| 字段 | 值 |
|------|-----|
| **task_slug** | `chatbi-v3-lowconf-rag-preview-frontend` |
| **test_strategy** | `required`（`pnpm lint` → `pnpm test` → `pnpm build`；见根 `AGENTS.md` §8） |
| **freeze_id** | `CHATBI-LOWCONF-RAG-PREVIEW-FE@2026-05-31`（开跑前与后端 `freeze_id` 对齐 commit） |
| **semi_auto** | `true` |
| **audit_profile** | `full`（契约消费 + 跨仓联调） |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2`（工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md)） |
| **kpi_aggregator** | `50`（本仓关账汇总；后端 task 可用 `00`） |
| **git_branch** | `task/chatbi-v3-lowconf-rag-preview`（与后端同分支名 **建议**；双 PR 互锁） |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

### prompts 与落盘（Ink）

| 项 | 路径 |
|----|------|
| 帽子 / 模板 | **不复制**；`@` 工作区 `Projects/docs/harness/prompts/` |
| invoke | `docs/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/`（建议） |
| review | `docs/harness/reviews/by-task/chatbi-v3-lowconf-rag-preview-frontend/` |
| 50 复检 | `docs/tasks/reinspect_results/reinspect_chatbi-v3-lowconf-rag-preview-frontend_*` |

### 跨仓节奏（硬）

1. **P0**：✅ `docs/harness/README.md` · `TASK_TEMPLATE` · `AGENTS.md` · `06-harness-content.mdc`（2026-05-31）。  
2. 本 task **`HG-TASK-DRAFT` approved** 后，可与后端 **22/30** 并行；**30 后** 联调 FE-1～F5。  
3. 后端关账 **阻塞**于本单 FE-1～F5 勾选或书面 defer（人签）。  
4. 契约键：**与后端 `_contract_manifest.json` 同 PR 或紧耦合 PR**（22 前拍板 RAG payload 形态）。

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1,30 | 含下文验收与契约分支 |
| HG-AUDIT-R1 | approved | 30 | 22 R1 后 |
| HG-REINSPECT | approved | done | 50 后、merge 前 · 2026-06-01 FE-5 联调 pass |

---

## 背景与目标

5-2 已在 Ink 实现 **Text2SQL** 低置信预览卡片（标题「预览 SQL」、`sql_draft` 展示、`plan_execution_token` 续跑）。5-3 要求 **`rag_search`** 低置信路径对称：`agent.plan.preview` 含 RAG 方案字段，确认后执行 RAG 全链路。

**完成态**：用户可见 RAG 方案摘要 + TTL；「按预览执行」携带 token；Timeline / 执行链可读；两轮烟测留证并链后端 diary。

---

## 范围

- [x] **FE-1** 解析 `agent.plan.preview`：`tool === rag_search`（或 manifest 约定值）时消费 RAG 承诺键，**不**假定 `sql_draft` 非空
- [x] **FE-2** 确认卡片：按 `tool` 分支标题与正文（RAG：改写 query / 计划条数 / 标题级 hits 等，以实现拍板为准）；保留「按预览执行」「取消(丢弃令牌)」
- [x] **FE-3** 续跑：`POST …/unified/chat/stream` body 含 `plan_execution_token`；问句与首轮一致（沿用 5-2 校验）
- [x] **FE-4** `ChainEventCard`：`agent.plan.preview` RAG 分支非仅 `sql_draft` 围栏
- [x] **FE-5** 烟测留证：Timeline JSON ×2 + 截图；路径写入 §实现备忘并链后端 `docs/diary/samples/chatbi-v3-lowconf-rag-preview/`

### 实现触点（参考后端 task §6）

| 模块 | 路径 |
|------|------|
| 主会话 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| 事件卡片 | `components/chain-chat/ChainEventCard.tsx` |
| 类型 / 校验 | `components/chain-chat/types.ts`、`lib/unified-chat/sse/chainPayloadValidators.ts` |
| 契约 | `docs/_tech_graph/_contract_manifest.json`（与后端对齐） |

---

## 非范围

- 后端 `api/agent.py` / token 签发逻辑（后端 task）
- 5-4 审计字段产品化
- 复制工作区 `docs/harness/prompts/` 到本仓

---

## 依赖与引用

| 依赖项 | 路径 |
|--------|------|
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 后端 task | `ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_v1.md` |
| 5-2 后端（done） | `ai-ink-brain-api-python/docs/tasks/done/task_chatbi_v3_lowconf_sql_preview_v1.md` |
| Harness 规划 | `Projects/docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md` |
| KPI | `Projects/docs/harness/guides/KPI_RUBRIC_v1_2.md` |

---

## 验收标准

- [x] FE-1～FE-5 满足（2026-06-01 联调烟测 · diary 互链 · `reinspect_*_20260601_v2.md`）
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 全绿（D5 · 40/50 帽独立复验 2026-05-31）
- [x] 契约：仅消费 manifest 承诺键；`isValidAgentPlanPreviewPayload` 与 RAG 载荷一致（**禁止** 因缺 `sql_draft` 整帧丢弃 RAG preview）
- [x] Harness：22/30/40/50/CLOSE invoke · review · reinspect · **`### KPI（00）`**（2026-06-01 关账）
- [x] **HG-*** → `approved`（**HG-REINSPECT** 2026-06-01 · FE-5 pass）

---

## 失败路径

| # | 触发 | 系统行为 | 用户可见 |
|---|------|----------|----------|
| F1 | RAG preview 键未进 manifest 却强依赖 | 策略 B：降级文案，不白屏 | 预览不可用说明 |
| F2 | 校验仍要求 `sql_draft` 导致 RAG 帧丢弃 | 无确认卡片 | **须修** `chainPayloadValidators` |
| F3 | token 与问句/session 不一致 | 拒发（沿用 5-2） | 错误提示 |
| F4 | 改问句仍带旧 token | 发送路径丢弃 token | 与 5-2 一致 |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `lib/unified-chat/sse/chainPayloadValidators.ts` · `chainPayloadValidators.test.ts` · `components/chain-chat/types.ts` · `UnifiedChatPageClient.tsx` · `ChainEventCard.tsx` · `docs/_tech_graph/_contract_manifest.json` |
| 契约增量键 | C1 扁平键：`rewrite_query`（rag_search 必填）、`planned_top_k` / `preview_headlines`（可选）；`sql_draft` 仅 text2sql_query 必填 |
| 烟测路径 | Ink 索引 [`docs/diary/samples/chatbi-v3-lowconf-rag-preview/README.md`](../../../docs/diary/samples/chatbi-v3-lowconf-rag-preview/README.md) ↔ 后端真值 [`ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/) |
| 图谱变更 | `_contract_manifest.json` 新增 Ink 镜像；`11_flow_api` 未改 |

---

## ### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: **100%** · **状态**: **pass** · **帽**: 22→30→40→50→CLOSE

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|-----|----------------|
| 22 | R1 | main_chat | 100 | 100 | 100 | 100 | — | 零阻塞；C1 双仓 |
| 30 | R1 | main_chat | 100 | 100 | 100 | 100 | 100 | FE 实现 `72f8f0c` |
| 40 | R1 | main_chat | 100 | 100 | 100 | 100 | — | §自检结论 |
| 50 | v1 | main_chat | 100 | 100 | 100 | 100 | 100 | 代码复检 pass · FE-5 defer |
| 50 | v2 | main_chat | 100 | 100 | 100 | 100 | 100 | 关账轮 · FE-5 联调 pass |
| CLOSE | close | main_chat | 100 | 100 | 100 | 100 | 100 | done 归档 · 2026-06-01 |

**Task 维聚合**：D1 avg 100 · D2 min 100 · D3 avg 100 · D4 min 100 · D5 min 100 → **Task_KPI% = 100%** · **blocked：无**

**关闭回溯**：`docs/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/invoke_20260601_CLOSE_chatbi-v3-lowconf-rag-preview-frontend.md`

---

## ### 自检结论（执行者）

**帽**：40-self-check · **日期**：2026-05-31 · **cwd**：`ai-ink-brain` · **实现 commit**：`72f8f0c`

### 验证命令（40 帽独立复跑）

| 命令 | cwd | 退出码 | 要点 |
|------|-----|--------|------|
| `pnpm lint` | ai-ink-brain | 0 | eslint 无报错 |
| `pnpm test` | ai-ink-brain | 0 | Test Files 10 passed · Tests **41 passed**（含 `chainPayloadValidators.test.ts` 6 例） |
| `pnpm build` | ai-ink-brain | 0 | Next.js **16.2.3** · Compiled successfully · TS 通过 · 136 static pages |

### 验收项对照（FE-1～FE-5 · task 验收标准）

| 项 | 结论 | 证据 | 可重试 |
|----|------|------|--------|
| FE-1 | **pass** | 单测 `rag_search` + `rewrite_query` 无 `sql_draft` → `isValidAgentPlanPreviewPayload` true；`chainEventFromSse` 经同一 validator | — |
| FE-2 | **pass** | `UnifiedChatPageClient`：`AGENT_PLAN_PREVIEW_TOOL_RAG` 分支标题「预览 RAG 方案」+ rewrite_query / top_k / headlines | — |
| FE-3 | **pass** | `send(..., { planExecutionToken })` + session/query 绑定校验未改（diff 72f8f0c 未动 send 核心逻辑） | — |
| FE-4 | **pass** | `ChainEventCard` RAG 分支非仅 sql_draft 围栏 | — |
| FE-5 | **pass** | 2026-06-01 联调 · diary 互链 · round1/round2 JSON + 截图（后端 `526176d`） | — |
| D5 | **pass** | 上表三命令 exit 0 | — |
| F2 | **pass** | validator 按 tool 分支；RAG 不强制 sql_draft | — |
| 契约 C1 | **pass-with-notes** | Ink `_contract_manifest.json` 已落盘；**merge 前须与 api-python 同键双 PR** | — |
| Harness 40 | **pass** | invoke `invoke_20260531_40_chatbi-v3-lowconf-rag-preview-frontend.md` | — |

### 已知未测项 / 阻塞

- **无**（关账 2026-06-01）。答案质量「未来日记」误判见后端 `NOTES-future-diary-llm-date.md`，**非** §5-3 缺陷。

### 30 帽记录（归档）

30 帽于同日前后首次跑通 D5（41 tests）；40 帽 **独立复跑** 确认结果一致，未改业务代码。

---

## 联调标准样本（E2E · 2026-06-01）

| 路径 | 说明 |
|------|------|
| [`docs/diary/samples/chatbi-v3-lowconf-rag-preview/README.md`](../../../docs/diary/samples/chatbi-v3-lowconf-rag-preview/README.md) | Ink FE 索引 · 互链后端 JSON / 截图 |
| [`ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/`](../../../ai-ink-brain-api-python/docs/diary/samples/chatbi-v3-lowconf-rag-preview/) | 真值 Timeline×2 + 截图（后端 `526176d`） |

---

## 给 Cursor

`chatbi-v3-lowconf-rag-preview-frontend`、`5-3`、`rag_search`、`agent.plan.preview`、`plan_execution_token`、`UnifiedChatPageClient`、`chainPayloadValidators`、`cross-repo`、`KPI_RUBRIC_v1_2`、`required`
