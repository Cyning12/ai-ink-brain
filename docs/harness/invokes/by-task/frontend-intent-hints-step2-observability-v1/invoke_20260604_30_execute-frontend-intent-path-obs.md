# Invoke · 帽 30 · Intent Hints Step2 前端 Timeline 可观测

| 项 | 值 |
| --- | --- |
| **task_slug** | `frontend-intent-hints-step2-observability-v1` |
| **帽** | 30 · 执行编码 |
| **日期** | 2026-06-04 |
| **Open Folder** | `ai-ink-brain` |
| **git_branch** | `task/frontend-intent-hints-step2-observability-v1` |
| **SPEC** | `docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md` |
| **task** | `docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md` |

---

## §3 Prompt 正文（执行 Agent 从此处开始）

```text
## 角色

你是 Harness 30 执行 Agent（Intent Hints Step2 · 前端 Timeline 可观测）。

Open Folder = ai-ink-brain
git_branch = task/frontend-intent-hints-step2-observability-v1（不在则 checkout -b 后执行）

## 必读

1. docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md
2. docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md
3. docs/harness/prompts/HANDOFF_SEMI_AUTO.md · 30-execute-code.md

## 人工闸（执行前确认 task 文内）

- HG-TASK-DRAFT: 须 approved 再改代码；若 pending → 停工报 gate_id
- HG-AUDIT-R1: 30 前须 approved 或 task 注明 light + 人 pre-approve

## 实现清单

- chainEventSelectors.ts — IntentPathObs / extractIntentPathObs / 扩展 AgentIntentObs
- ChainEventCard.tsx — agent.intent + agent.think Debug 增强
- UnifiedChatRouterDebugPanel.tsx — evidence 路径摘要
- _contract_manifest.json — optional keys
- 单测 ≥2（有字段 / 缺字段）

## 验证

pnpm lint && pnpm test && pnpm build

## 交付

- task 实现备忘回填
- commit（task 分支 · 勿 push 除非用户要求）
- 无阻塞 → 落盘 40 invoke → semi_auto 续 40

完整帽链见：docs/tasks/specs/PROMPT_semi_auto_startup_intent_hints_step2_frontend_v1_zh.md §3
```
