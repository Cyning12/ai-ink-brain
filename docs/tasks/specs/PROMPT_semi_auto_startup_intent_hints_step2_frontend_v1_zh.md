# Prompt · Intent Hints Step2 前端可观测 semi_auto 启动（30 → 40 → 22 R2 → 50 → CLOSE）

> **用途**：`HG-TASK-DRAFT` · `HG-AUDIT-R1` 已 **`approved`** 后，**新开对话 · Open Folder = `ai-ink-brain`**，粘贴 **§3 全文** 启动半自动链。  
> **真值**：`docs/harness/README.md` · `docs/harness/prompts/HANDOFF_SEMI_AUTO.md`  
> **task**：[`task_frontend_intent_hints_step2_observability_v1.md`](../active/task_frontend_intent_hints_step2_observability_v1.md)  
> **SPEC**：[`SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md`](./SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md)

---

## 1. 当前闸口快照（开跑前由人更新）

| human_gate_id | status | blocks_hats | 对下一棒 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | **pending** → 人批 **approved** | 22-R1, 30 | 30 可开 |
| HG-AUDIT-R1 | pending | 30 | 22 R1 后 |
| HG-REINSPECT | pending | done | 50 后关账 |

**首次开跑**：若两闸仍为 pending，Agent **仅**执行 10 需求整理或停等人批；**不得**代填 gate。

---

## 2. 帽序

```text
30 实现 → 40 自检 → 22 R2 → 50 复检 → CLOSE
```

| 帽 | invoke 落盘 |
| --- | --- |
| 30 / 40 / 22 / 50 | `docs/harness/invokes/by-task/frontend-intent-hints-step2-observability-v1/` |
| 50 正文 | `docs/tasks/reinspect_results/reinspect_frontend_intent_hints_step2_observability_v1_YYYYMMDD_v1.md` |

---

## 3. 可复制 Prompt 正文（从下一行起 · 新开对话粘贴）

```text
## 角色

你是 **Harness 半自动执行 Agent（Intent Hints Step2 · 前端 Timeline 可观测）**，严格遵循：

- ai-ink-brain/docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md（semi_auto: true）
- ai-ink-brain/docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md
- docs/harness/prompts/30-execute-code.md · 40-self-check.md · 22-task-audit.md · 50-reinspect.md
- ai-ink-brain/AGENTS.md（合并前必绿：pnpm lint · pnpm test · pnpm build）

Open Folder = ai-ink-brain
git_branch = task/frontend-intent-hints-step2-observability-v1
（若不在该分支：从 origin/main 拉出并切换后再改代码；禁止在 main 上日常 commit）
worktree_root = ai-ink-brain

## 后端依赖（只读 · 勿改 api-python 除非 task 显式授权）

- ai-ink-brain-api-python PR #111（Step2 + intent_path / hints_arbitration / agent_step_routing）
- 后端 diary（按需）：ai-ink-brain-api-python/docs/diary/2026-06-04-chatbi-q4-timeline-intent-path-observability.md

## 人工闸（开 30 前复读 task · 须已 approved）

- HG-TASK-DRAFT: approved（若仍 pending → 停工报 gate_id）
- HG-AUDIT-R1: approved（首次可跳过 R1 文件 · 30 自检注明「light audit · 人已 pre-approve」仅当 task 已写 approved）
- HG-REINSPECT: pending（50 后可关账 · 不得代填）

## 半自动硬规则

1. 换帽前：下一棒 invoke §3 全文 → docs/harness/invokes/by-task/frontend-intent-hints-step2-observability-v1/invoke_YYYYMMDD_<帽>_*.md → commit → 再执行。
2. 禁止代填 human_gate；遇 pending 停工只报 gate_id + 文件路径。
3. 禁止扩大 scope（仅 SPEC §2.1 F1–F7；router.evidence 另 task）。
4. 每帽结束输出 Harness 状态栏（版本 B，见 HANDOFF_SEMI_AUTO §3.4）。

---

### 【帽 30 · 执行编码】

真值：docs/harness/prompts/30-execute-code.md

**实现范围（SPEC §4–§5）**：

1. lib/unified-chat/chainEventSelectors.ts
   - 新增 IntentPathObs 类型与 extractIntentPathObs(payload)
   - 扩展 extractAgentIntentObs：intent_path / intent_attempt / hints_arbitration
   - 新增 extractAgentThinkRouting(events) → agent_step_routing + path obs（step_number===1）

2. components/chain-chat/ChainEventCard.tsx
   - agent.intent：Debug 开时标题增强 + grid 增行（见 SPEC §4.2）
   - agent.think step-1：agent_soft_timeout_v1 badge（SPEC §4.3）
   - 从 UnifiedChatPageClient 传入 debugRouter prop（若尚未传入则最小接线）

3. components/unified-chat/UnifiedChatRouterDebugPanel.tsx
   - evidence 上方 Intent 路径摘要条（SPEC §4.4）
   - AgentIntentBlock 增 path / attempt / arbitration 行

4. docs/_tech_graph/_contract_manifest.json
   - 为 agent.intent / agent.think / router.decision.evidence 登记 payload_optional_keys（或项目等价段）

5. （可选）lib/unified-chat/executionTrace.ts — intent 段 path 摘要

6. 单测：lib/unified-chat/chainEventSelectors.test.ts 或同级（≥2 case）

**常量**：INTENT_PATH_LABEL（llm / llm_retry / v1_fallback / heuristic）

**验证（WORKTREE 内全部跑通）**：

pnpm lint
pnpm test
pnpm build

**test_strategy: recommended** — selector/fixture 单测优先；禁止 trivial assert。

**交付**：代码 + manifest + task 实现备忘回填 + commit（仅本轮路径）→ 无阻塞则自动 40。

---

### 【帽 40 · 自检】

真值：40-self-check.md

- 复跑 pnpm lint · pnpm test · pnpm build
- 写入 task ### 自检结论（执行者）
- 对验收标准逐条 pass/fail + 证据（Debug 开/关截图或文字步骤）
- commit → 无阻塞则 22 R2

---

### 【帽 22 · R2 任务审核】

真值：22-task-audit.md

- 落盘：docs/harness/reviews/by-task/frontend-intent-hints-step2-observability-v1/task_frontend_intent_hints_step2_observability_v1_audit_R2_YYYYMMDD.md
- 须含签收/关闭节；无阻塞 → 建议 50
- commit → 派发 50（同会话若 semi_auto 允许则继续）

---

### 【帽 50 · 独立复检】

真值：50-reinspect.md

- 落盘：docs/tasks/reinspect_results/reinspect_frontend_intent_hints_step2_observability_v1_YYYYMMDD_v1.md
- Fresh context 口径：对照 SPEC §6 验收 + task 勾选
- acceptance_interaction: required → 关账前创建 CHECKLIST_frontend_intent_hints_step2_observability_v1_acceptance_zh.md
- HG-REINSPECT 仍 pending → 报告 gate_id，不得标 task done

---

### 【关账 CLOSE】

HANDOFF_CLOSE_TRACE：执行路线 + commit 回溯；task 仍 active 直至 HG-REINSPECT 人签 + PR merge 后 git mv → done/。
```

---

## 4. 快速启动（gates 已批 · 仅 30）

若 **HG-TASK-DRAFT** 与 **HG-AUDIT-R1** 已为 `approved`，可直接对新会话说：

> 按 semi_auto 继续 Intent Hints Step2 前端可观测 task；读  
> `docs/tasks/specs/PROMPT_semi_auto_startup_intent_hints_step2_frontend_v1_zh.md` §3，从 **帽 30** 执行。

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-04 | 初版：后端 Step2 前端可观测 semi_auto Prompt |
