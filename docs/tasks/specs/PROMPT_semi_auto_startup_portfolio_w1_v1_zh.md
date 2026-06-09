# Prompt · Portfolio W1 semi_auto 启动（30 → 40 → 22 R2 → Task 50 → CLOSE）

> **用途**：`HG-TASK-DRAFT` · `HG-AUDIT-R1` 已 **`approved`** 后，**新开对话**粘贴 **§3 全文** 启动半自动链。  
> **Open Folder**：`ai-ink-brain`  
> **真值**：[`HANDOFF_SEMI_AUTO.md`](../../../../docs/harness/prompts/HANDOFF_SEMI_AUTO.md) · task · [`PROMPT_50_invoke_portfolio_demo_site_v1_zh.md`](./PROMPT_50_invoke_portfolio_demo_site_v1_zh.md)（W1 变体见 §3 内 50 节）

---

## 1. 当前闸口快照（2026-06-01 · 人已批）

| human_gate_id | status | blocks_hats | 对下一棒 |
| --- | --- | --- | --- |
| HG-TASK-DRAFT | **approved** | 22-R1, 30 | ✓ 30 可开 |
| HG-AUDIT-R1 | **approved** | 30 | ✓ 30 可开 |
| HG-REINSPECT | pending | done | 50 后可关账；**不**阻塞派发 50 |

**说明**：无 `reviews/*_audit_R1_*.md` 时，30 须在自检节注明「路径 B · R1 书面审缺位 · 人已 pre-approve HG-AUDIT-R1」。

---

## 2. 帽序（本 Prompt 一次会话）

```text
30 实现 → 40 自检 → 22 R2 签收 → Task 子 Agent · 50 → 主会话 CLOSE
```

| 帽 | 执行者 | invoke 落盘 |
| --- | --- | --- |
| 30 / 40 / 22 | **本会话** · semi_auto | `docs/harness/invokes/by-task/portfolio-site-mode-nav-v1/` |
| **50** | **`Task` 子 Agent**（本会话禁止兼做） | 同上 + `docs/tasks/reinspect_results/` |

---

## 3. 可复制 Prompt 正文（从下一行起 · 新开对话粘贴）

```text
## 角色

你是 **Harness 半自动执行 Agent（Portfolio W1 · site-mode-nav）**，严格遵循：
- ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md（`semi_auto: true`）
- ai-ink-brain/docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.1 · §6.1 · §6.2 · W1）
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md
- docs/harness/prompts/30-execute-code.md · 40-self-check.md · 22-task-audit.md
- ai-ink-brain/docs/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md（50 · W1 真值 · Task 子代理）
- ai-ink-brain/AGENTS.md §8（合并前必绿）

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1（若不在该分支，先创建并切换再改代码）
worktree_root = ai-ink-brain

## 人工闸（开帽前复读 task · 已确认）

- HG-TASK-DRAFT: approved
- HG-AUDIT-R1: approved
- HG-REINSPECT: pending（50 后关账前仍 pending · 不得代填 approved）

## 半自动硬规则

1. **换帽前**：下一棒 TEMPLATE §3 全文 → `docs/harness/invokes/by-task/portfolio-site-mode-nav-v1/invoke_YYYYMMDD_<帽号>_*.md` → **commit** → 再戴帽执行。
2. **禁止**代填任何 `human_gate`；遇新 pending 闸 **停工** 只报 gate_id。
3. **禁止**静默扩大 scope（仅 W1 · SPEC §7 W1 行）。
4. **50 必须**用 **Task 子代理**；主会话只收短报告 + 再 CLOSE。
5. 每帽结束输出 **Judgment**（experience_capture / gate/risk / hat_self）。

---

### 【帽 30 · 执行编码】

真值：docs/harness/prompts/TEMPLATE-execute-invoke.md §3 精神 + 30-execute-code.md

- task：ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md
- SPEC：ai-ink-brain/docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md
- 审查书面：无（HG-AUDIT-R1 已 approved · 无 R1 reviews 文件时须在实现备忘注明）
- freeze_id：PORTFOLIO-RAG-DEMO@2026-06-01

**实现范围（task 范围节）**：
- `lib/site-mode.ts` · `site-nav.tsx` · `home-modules.tsx` · `layout.tsx`（按需）
- `PROJECT_CONFIG` §C · `_tech_graph/10_flow_route*.md` · `graph.json`
- portfolio NAV 四链：`/` · `/resume` · `/methodology` · `/unified-chat`（W2 前 404 可接受 · F6）

**验证（WORKTREE 内全部跑通）**：
```bash
pnpm lint
pnpm test
pnpm build
NEXT_PUBLIC_SITE_MODE=portfolio pnpm build
pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check
```

**test_strategy: recommended** — 不强制新 E2E；有合理单测可补，禁止 trivial assert。

**交付**：代码 + 图谱 + task「实现备忘」回填 + commit（HANDOFF_AUTO_COMMIT · 仅本轮路径）→ **无阻塞则自动进入 40**。

---

### 【帽 40 · 自检】

真值：TEMPLATE-self-check-invoke.md + 40-self-check.md

- 复跑上述验证命令，摘要写入 task **`### 自检结论（执行者）`**
- 对 task **验收标准** 逐条 pass/fail + 证据
- commit task 自检节 → **无阻塞则自动进入 22 R2**

---

### 【帽 22 · R2 任务审核 · 终轮签收】

真值：TEMPLATE-task-audit-invoke.md

- 待审 task：同上
- SPEC：同上
- PREV_REVIEW：无（或若本轮补写了 R1 则填路径）
- 落盘：`docs/harness/reviews/task_portfolio_site_mode_nav_v1_audit_R2_20260601.md`（日期用当日）
- 须含 **签收 / 关闭** 节；无阻塞 → 建议进入 50
- commit reviews → **派发 50 子 Agent（禁止本上下文兼做 50 表）**

---

### 【帽 50 · Task 子 Agent · W1】

**真值 Prompt（已填占位符）**：[`docs/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md`](./PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md) · §4 Handoff + §5 全文  
**invoke 落盘**：`docs/harness/invokes/by-task/portfolio-site-mode-nav-v1/invoke_20260601_50_portfolio-site-mode-nav-v1.md`  
**对照后端**：`ai-ink-brain-api-python/docs/harness/invokes/by-task/portfolio-rag-demo/invoke_20260601_50_portfolio-rag-demo.md`

**主会话动作**：
1. 确认 invoke 50 已 commit（或按 §4/§5 更新日期后 commit）
2. 调用 **Task** 子代理，`description`: `Harness 50 W1 portfolio nav`
3. Task `prompt` = **§4 Handoff** + [`PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md`](./PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md) **§5 全文**

**禁止**：主会话兼做 50 表 · 代填 `HG-REINSPECT`

---
- 若 hat_self pass 且无阻塞 → **CLOSE**（HANDOFF_CLOSE_TRACE）
- 勾选 task 验收项；`git mv` → `docs/tasks/done/task_portfolio_site_mode_nav_v1.md`（**须**人后续改 HG-REINSPECT approved 再 merge，或本 Prompt 仅建议关账路径）
- 填 `### KPI（00）` 占位（kpi_aggregator: CLOSE）

---

## 本回合对人类输出（每阶段）

```text
阶段：{帽} · {pass|blocked}
交付：{路径列表}
commit：{short-hash 列表}
下一棒：{自动继续 | Task 50 | 停—gate_id}
Judgment：…
```

## 给 Cursor

`semi_auto`、`30`、`40`、`22-R2`、`50`、`Task子代理`、`portfolio-site-mode-nav-v1`
```

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1：W1 · gates approved · 30 起 semi_auto 至 Task 50 |

---

## 给 Cursor

`semi_auto startup`、`portfolio W1`、`HG-AUDIT-R1 approved`、`30-40-22-50`
