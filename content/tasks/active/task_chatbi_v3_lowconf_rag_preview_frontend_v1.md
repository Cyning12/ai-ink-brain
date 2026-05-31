# Task（前端）：ChatBI V3 — 低置信 RAG 预览 + 确认放行（§5-3 · Ink）

> **状态**：`draft`（P0 Harness 已落盘 · 待 `HG-TASK-DRAFT` 人扫）  
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
| **kpi_aggregator** | `CLOSE`（本仓关账汇总；后端 task 可用 `00`） |
| **git_branch** | `task/chatbi-v3-lowconf-rag-preview`（与后端同分支名 **建议**；双 PR 互锁） |

### prompts 与落盘（Ink）

| 项 | 路径 |
|----|------|
| 帽子 / 模板 | **不复制**；`@` 工作区 `Projects/docs/harness/prompts/` |
| invoke | `content/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/`（建议） |
| review | `content/harness/reviews/by-task/chatbi-v3-lowconf-rag-preview-frontend/` |
| 50 复检 | `content/tasks/reinspect_results/reinspect_chatbi-v3-lowconf-rag-preview-frontend_*` |

### 跨仓节奏（硬）

1. **P0**：✅ `content/harness/README.md` · `TASK_TEMPLATE` · `AGENTS.md` · `06-harness-content.mdc`（2026-05-31）。  
2. 本 task **`HG-TASK-DRAFT` approved** 后，可与后端 **22/30** 并行；**30 后** 联调 FE-1～F5。  
3. 后端关账 **阻塞**于本单 FE-1～F5 勾选或书面 defer（人签）。  
4. 契约键：**与后端 `_contract_manifest.json` 同 PR 或紧耦合 PR**（22 前拍板 RAG payload 形态）。

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1,30 | 含下文验收与契约分支 |
| HG-AUDIT-R1 | approved | 30 | 22 R1 后 |
| HG-REINSPECT | pending | done | 50 后、merge 前 |

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
- [ ] **FE-5** 烟测留证：Timeline JSON ×2 + 截图；路径写入 §实现备忘并链后端 `docs/diary/samples/chatbi-v3-lowconf-rag-preview/`

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

- [ ] FE-1～FE-5 满足
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 全绿（D5）
- [ ] 契约：仅消费 manifest 承诺键；`isValidAgentPlanPreviewPayload` 与 RAG 载荷一致（**禁止** 因缺 `sql_draft` 整帧丢弃 RAG preview）
- [ ] Harness：22/30/40/50 invoke · review · reinspect · **`### KPI（00）`**
- [ ] **HG-*** → `approved` 后再 merge

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
| 烟测路径 | （待 FE-5 · 依赖后端 G1–G2 staging） |
| 图谱变更 | `_contract_manifest.json` 新增 Ink 镜像；`11_flow_api` 未改 |

---

## ### KPI（00）

> **由 CLOSE 填写**；格式见工作区 `KPI_RUBRIC_v1_2.md`。

（占位 · 关账后删除）

---

## ### 自检结论（执行者）

**帽**：30-execute-code · **日期**：2026-05-31 · **cwd**：`ai-ink-brain`

### 验证命令

| 命令 | cwd | 退出码 | 要点 |
|------|-----|--------|------|
| `pnpm lint` | ai-ink-brain | 0 | eslint 无报错 |
| `pnpm test` | ai-ink-brain | 0 | 10 files · 41 tests passed（含新增 `chainPayloadValidators.test.ts` 6 例） |
| `pnpm build` | ai-ink-brain | 0 | Next.js 16.2.3 编译与 TS 通过 |

### 验收项（30 范围）

| 项 | 结论 | 证据 |
|----|------|------|
| FE-1 | pass | `isValidAgentPlanPreviewPayload`：`rag_search` + `rewrite_query` 无 `sql_draft` 单测通过 |
| FE-2 | pass | `UnifiedChatPageClient` 按 `tool` 分支标题/正文；保留执行/取消与 TTL |
| FE-3 | pass | `send()` 续跑路径未改；token/问句/session 校验沿用 5-2 |
| FE-4 | pass | `ChainEventCard` RAG 分支展示 rewrite_query / planned_top_k / preview_headlines |
| FE-5 | **未测** | 待后端 RAG preview staging + 两轮真机烟测 |
| D5 | pass | 上表三命令全绿 |
| F2 修复 | pass | validator 不再对 `rag_search` 强制 `sql_draft` |
| 契约 C1 | pass（Ink 侧） | `docs/_tech_graph/_contract_manifest.json` 落盘；**merge 前须与后端同键双 PR** |

### 已知未测项

- FE-5 烟测（Timeline×2 + 截图）
- 与后端联调 `rag_search` 低置信 SSE 真帧
- `pnpm tech-graph:manifest-check`（本变更未改 `_manifest.json`）

---

## 给 Cursor

`chatbi-v3-lowconf-rag-preview-frontend`、`5-3`、`rag_search`、`agent.plan.preview`、`plan_execution_token`、`UnifiedChatPageClient`、`chainPayloadValidators`、`cross-repo`、`KPI_RUBRIC_v1_2`、`required`
