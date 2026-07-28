> **状态**：done（P1 task 卫生归档 · 2026-06-09 · 功能已在 main；追溯见各 PR / Epic M01–M06）

# 前端 Task：推荐问法走 API 动态拉取（v1）

> **状态**：in_progress
> **关联图谱**：无（本任务不改流程图谱）
> **关联 Issue/PR**：无
> **后端依赖**：`GET /api/py/chat/suggested-questions` · 配对 PR [ai-ink-brain-api-python#114](https://github.com/Cyning12/ai-ink-brain-api-python/pull/114)（推荐问法列表 + `AGENT_MAX_LATENCY_MS` 默认 45s，后者仅后端）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `frontend-suggested-questions-api-v1` |
| **test_strategy** | `recommended` |
| **freeze_id** | `frontend@2026-06-04` |
| **semi_auto** | `true` |
| **audit_profile** | `light` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/frontend-suggested-questions-api-v1`（可选） |
| **acceptance_interaction** | `required` |
| **验收清单** | `docs/tasks/reinspect_results/CHECKLIST_task_frontend_suggested_questions_api_v1_acceptance_zh.md` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

---

## 背景与目标

后端已新增 `GET /api/py/chat/suggested-questions`，返回推荐问法列表（含 Q2="Tech Graph 是什么"、Q4="简单介绍下刘新宁"）。前端目前两处写死推荐问法：

1. `lib/unified-chat/portfolio-demo-chips.ts` — `PORTFOLIO_DEMO_CHIPS` / `DEVELOPMENT_SUGGESTED_PROMPTS`
2. `components/chain-chat/ChainChatPageClient.tsx` — 组件内硬编码数组

目标是将推荐问法改为**启动时从 API 动态拉取**，不再本地写死，方便后端随时调整问题列表而无需发前端版本。

---

## 范围

- [x] **新增 API Client**：在 `lib/unified-chat/suggestedQuestionsApi.ts` 新增 `fetchSuggestedQuestions()` / `loadSuggestedQuestionsOnce()`。
- [x] **Unified Chat 页改造**：`UnifiedChatPageClient.tsx` 解锁后通过 `useSuggestedQuestions` 拉取，替换静态 `suggestedChips`。
- [x] **Chain Chat 页改造**：`ChainChatPageClient.tsx` 解锁后拉取，替换硬编码数组。
- [x] **Loading / 失败降级**：
  - [x] API 加载中：骨架 chip，不阻塞主流程。
  - [x] API 失败：静默降级为 `suggestedQuestionsDefaults` 静态列表。
- [x] **缓存策略**：`loadSuggestedQuestionsOnce` 模块级会话缓存，同会话仅一次上游请求。
- [x] **静态降级与后端对齐**（2026-06-04）：`portfolio-demo-chips.ts` 五条与 api-python `chat_suggested_questions` 一致（含 Q2 Tech Graph · Q4 刘新宁 · Q5 架构）。

## 非范围

- 不改后端契约（仅消费已有 `GET /api/py/chat/suggested-questions`）。
- 不改动推荐问法的展示样式与交互逻辑（点击 chip 填入输入框等行为保持不变）。
- 不引入新的状态管理库（用现有 `useState` / `useEffect` 即可）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 后端 API | `GET /api/py/chat/suggested-questions`（api-python `api/index.py` · PR #114） |
| 图谱 / CI | 本仓 `pnpm tech-graph:manifest-check`；**后端**改 `api/` 还须 `manifest_check` + **`tech_graph_drift_check`** + `graph_export --check`（见 api-python `RUNBOOK_graph_contract_ci_red_v1.md`） |
| 现有 chip 数据 | `lib/unified-chat/portfolio-demo-chips.ts` |
| Unified Chat 页 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| Chain Chat 页 | `components/chain-chat/ChainChatPageClient.tsx` |

---

## 验收标准

- [ ] 解锁后页面加载完成时，推荐问法区展示后端返回的问题列表（Q2="Tech Graph 是什么"、Q4="简单介绍下刘新宁" 须可见）。（须后端部署 `GET /api/py/chat/suggested-questions` · 人验）
- [x] 点击推荐 chip 仍正常填入输入框并支持发送。（逻辑未改，仅数据源）
- [x] API 不可用（如后端未部署）时，前端静默降级，展示原有静态默认列表，不抛错不白屏。
- [x] 同会话刷新页面，推荐问法只拉取一次（`loadSuggestedQuestionsOnce` + 单测）。

---

## 失败路径（建议）

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | API 返回非 200 | 降级为静态默认列表 | 否（下次刷新重试） | 无（静默降级） |
| F2 | API 返回 JSON 缺少 `questions` | 降级为静态默认列表 | 否 | 无（静默降级） |
| F3 | 网络超时 | 降级为静态默认列表 | 否 | 无（静默降级） |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `app/api/py/chat/suggested-questions/route.ts`、`lib/unified-chat/suggestedQuestionsApi.ts`、`lib/unified-chat/suggestedQuestionsDefaults.ts`、`lib/unified-chat/hooks/useSuggestedQuestions.ts`、`lib/unified-chat/suggestedQuestionsApi.test.ts`、`components/unified-chat/UnifiedChatPageClient.tsx`、`components/chain-chat/ChainChatPageClient.tsx` |
| 新增 API Client | `lib/unified-chat/suggestedQuestionsApi.ts` |
| BFF | `app/api/py/chat/suggested-questions/route.ts` |
| 请求改动点 | 无（仅新增 GET） |
| UI 改动点 | Unified / Chain 推荐问法区 + 加载骨架 |

---

## ### KPI（00）

> **由 `kpi_aggregator` 填写**（默认 CLOSE）；格式见工作区 `KPI_RUBRIC_v1_2.md`。

（占位 · 关账后删除）

---

## ### 自检结论（执行者）

（40 帽回填）
