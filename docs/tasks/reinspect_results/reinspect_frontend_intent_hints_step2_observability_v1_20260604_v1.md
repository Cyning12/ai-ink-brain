# 独立复检 · Intent Hints Step2 前端 Timeline 可观测 · 2026-06-04

| 字段 | 值 |
|------|-----|
| **task** | `docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md` |
| **task_slug** | `frontend-intent-hints-step2-observability-v1` |
| **freeze_id** | `CHATBI-INTENT-HINTS-FE-OBS@2026-06-04` |
| **hat** | 50-independent-reinspect |
| **git_branch** | `task/frontend-intent-hints-step2-observability-v1` |
| **实现 commit** | `1cc3954` · 50 落盘基线 `203d3dc` |
| **验收清单** | [`CHECKLIST_frontend_intent_hints_step2_observability_v1_acceptance_zh.md`](./CHECKLIST_frontend_intent_hints_step2_observability_v1_acceptance_zh.md) |
| **22 R2** | [`task_frontend_intent_hints_step2_observability_v1_audit_R2_20260604.md`](../../harness/reviews/by-task/frontend-intent-hints-step2-observability-v1/task_frontend_intent_hints_step2_observability_v1_audit_R2_20260604.md) |
| **REINSPECT_MODE** | Fresh Context · **未读** 30 invoke 全文 |

---

## 复检结论摘要

| 维度 | 判定 |
|------|------|
| **实现 / diff** | **pass** — F1–F7 与 SPEC §4–§5 对齐；`debugRouter` 门控 |
| **本仓 VERIFY（50 独立复跑）** | **pass** — lint · test(52) · build 全 exit 0 |
| **浏览器交互（§B）** | **待维护者** — CHECKLIST §A–B 未勾；AC1/B2–B4 须 Preview |
| **合并建议** | **代码层可合并**；**关账 blocked** — HG-REINSPECT pending + §B 人签 |
| **50 总评** | **pass-with-notes**（自动化全绿 · 交互验收待人） |

**不得代签**：`HG-REINSPECT` 仍为 **pending**；禁止 `git mv` → `done/`。

---

## human_gate 追溯

| gate_id | task 文内 status | 50 说明 |
|---------|------------------|---------|
| HG-TASK-DRAFT | pending | kickoff 人 pre-approve 开 30；关账前建议人单独 commit → approved |
| HG-AUDIT-R1 | pending | light + 无 R1 review；R2 post-30/40 已 pass |
| HG-REINSPECT | **pending** | **blocks done** · 50 落盘后须维护者签 CHECKLIST §H |

---

## 独立验证命令（2026-06-04 · 50）

| 命令 | exit | 摘要 |
|------|-----:|------|
| `pnpm lint` | 0 | eslint 无报错 |
| `pnpm test` | 0 | 13 files · **52 passed**（含 `chainEventSelectors.test.ts` ×4） |
| `pnpm build` | 0 | Next.js 16.2.3 · TS 检查通过 |

> Node 引擎 warn（wanted 24.x · current 25.9.0）— 非阻塞，与 40 自检一致。

---

## 验收对照（task §验收标准 + SPEC §6）

| 验收项 | pass/fail | 证据 | 备注 |
|--------|-----------|------|------|
| AC1 Debug **关**零视觉回归 | **pass（代码门控）** | `ChainEventCard` / `ChainTimeline` 新行均 `debugRouter && …`；`useUnifiedChatStream` strip debug 事件 | 浏览器 **待 CHECKLIST §B1 维护者** |
| AC2 Debug **开** agent.intent path/attempt/仲裁 | **pass（代码+单测）** | `buildAgentIntentTitleSuffix` · grid `intent_path`/`intent_attempt` · 仲裁 badge | B2 浏览器留证 |
| AC3 Debug **开** agent.think 软超时 badge | **pass（代码）** | `ChainEventCard` L515 `agent_soft_timeout_v1` badge + path 折叠 | B3 浏览器留证 |
| AC4 router.decision.evidence 路径摘要 | **pass（代码）** | `UnifiedChatRouterDebugPanel` · `IntentEvidenceSummaryBlock` | B4 浏览器留证 |
| AC5 rule:portfolio_* chips | **pass** | R2 确认 `RouterDecisionBlock` rule_hits 未改 | B5 维护者复验 |
| AC6 缺字段旧 payload 不报错 | **pass** | `extractIntentPathObs` 缺键 → null；单测 legacy payload | B6 Agent ☑ · 浏览器可选 |
| AC7 lint · test · build 绿 | **pass** | 见上表 · exit 0 | CHECKLIST §C Agent ☑ |

---

## failure_paths 抽检（F1–F3）

| # | 触发 | 50 判定 | 证据 |
|---|------|---------|------|
| F1 | SSE 无新字段 | **pass** | 缺键显示 `—` / null；单测 `returns null-ish fields` |
| F2 | 未知 `intent_path` 枚举 | **pass** | `formatIntentPathLabel` 原样 monospace fallback |
| F3 | 后端 #111 未 merge | **N/A（本批次）** | mock/staging 验收路径已在 task 说明；未阻塞代码 review |

---

## test_strategy: recommended

| 项 | 结论 |
|----|------|
| 档位 | `recommended` — UI + selector 单测，不强制 E2E |
| 50 覆盖 | `chainEventSelectors.test.ts` ×4（有/缺 optional · legacy） |
| 缺口 | Portfolio Q4 实 SSE / Debug 开关联动 → CHECKLIST §A–B（`acceptance_interaction: required`） |

---

## 阻塞关账项（非阻塞合并）

1. CHECKLIST §A–B 维护者浏览器勾选  
2. CHECKLIST §H 签收  
3. `HG-REINSPECT` → **approved**（仅人）  
4. task 文首 HG-TASK-DRAFT / HG-AUDIT-R1 建议关账前改 approved  
5. CLOSE 帽 + `git mv` → `done/`（50 **不执行**）

---

## Judgment（50）

- **J-exp**: pass — `experience_capture: recommended` 与 light 审计档一致  
- **J-gate**: pass — 未代签 HG-REINSPECT  
- **J-evidence**: pass — 浏览器项标待维护者，未无证据 pass  
- **J-scope**: pass — diff 未扩 scope / 未改 BFF  
- **hat_self**: pass-with-notes

---

## 关联工件

| 工件 | 路径 |
|------|------|
| invoke 50 | `docs/harness/invokes/by-task/frontend-intent-hints-step2-observability-v1/invoke_20260604_50_reinspect-intent-path-obs.md` |
| diff 基线 | `git diff fde33f1..HEAD`（24 files · +1360/-13） |
