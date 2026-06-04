# Invoke · 帽 50 · 独立复检 + KPI（Intent Step2 前端可观测）

| 项 | 值 |
| --- | --- |
| **hat_code** | 50 |
| **task_slug** | `frontend-intent-hints-step2-observability-v1` |
| **task_path** | `docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md` |
| **git_branch** | `task/frontend-intent-hints-step2-observability-v1` |
| **worktree_root** | `ai-ink-brain` |
| **Open Folder** | `ai-ink-brain` |
| **reinspect_out** | `docs/tasks/reinspect_results/reinspect_frontend_intent_hints_step2_observability_v1_20260604_v1.md` |
| **checklist** | `docs/tasks/reinspect_results/CHECKLIST_frontend_intent_hints_step2_observability_v1_acceptance_zh.md` |
| **audit_review** | `docs/harness/reviews/by-task/frontend-intent-hints-step2-observability-v1/task_frontend_intent_hints_step2_observability_v1_audit_R2_20260604.md` |
| **prev_commit** | R2 落盘 commit（见 git log） |
| **inputs** | task · R2 review · 40 自检 · diff `fde33f1..HEAD` · CHECKLIST（**禁止**读 30 invoke 全文） |

---

## §3 Prompt 正文（50 执行 Agent · Fresh Context 新会话从此粘贴）

```text
## 角色

你是 **Harness 50 独立复检 Agent（Intent Hints Step2 · 前端 Timeline 可观测）**，严格遵循：

- docs/harness/prompts/50-independent-reinspect.md
- docs/harness/prompts/handoff/HANDOFF_SEMI_AUTO.md · HANDOFF_CLOSE_TRACE.md
- 工作区 docs/harness/guides/KPI_RUBRIC_v1_2.md（关账 KPI 打分）
- ai-ink-brain/docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md
- ai-ink-brain/docs/tasks/specs/SPEC-ChatBI-Intent-Hints-Step2-Frontend-Observability-v1_zh.md
- ai-ink-brain/AGENTS.md（pnpm lint · pnpm test · pnpm build）

Open Folder = ai-ink-brain
git_branch = task/frontend-intent-hints-step2-observability-v1
worktree_root = ai-ink-brain
REINSPECT_MODE = 独立复检（Fresh Context · 禁止读 30 invoke 全文）

## 输入（已替换占位符）

- task：docs/tasks/active/task_frontend_intent_hints_step2_observability_v1.md
- 22 R2：docs/harness/reviews/by-task/frontend-intent-hints-step2-observability-v1/task_frontend_intent_hints_step2_observability_v1_audit_R2_20260604.md
- 40 自检：task 内 ### 自检结论（执行者）
- diff：git diff fde33f1..HEAD（或 origin/main...HEAD）
- CHECKLIST：docs/tasks/reinspect_results/CHECKLIST_frontend_intent_hints_step2_observability_v1_acceptance_zh.md
- reinspect 落盘：docs/tasks/reinspect_results/reinspect_frontend_intent_hints_step2_observability_v1_20260604_v1.md

## 人工闸（只读 · 不得代填）

- HG-REINSPECT: pending（blocks done）→ 50 落盘后人签，不得标 task done
- HG-TASK-DRAFT / HG-AUDIT-R1: task 文内 pending 时须在 reinspect 追溯表注明

## 你必须完成

0. Invoke 快照：将本消息全文落盘 invoke_20260604_50_reinspect-intent-path-obs.md（若已存在则跳过重复落盘，直接执行）

1. **Fresh Context 输入裁剪**：以 diff、40 自检表、R2 结论、命令输出为主；**禁止**依赖 30 执行 invoke 全文。

2. **复跑 VERIFY**（ai-ink-brain 仓根）：
   - pnpm lint
   - pnpm test
   - pnpm build
   记录 exit 码与关键行。

3. **对照 task §验收标准 + SPEC §6**：输出表格「验收项 | pass/fail | 证据 | 备注」。
   - AC1 Debug 关零回归：代码门控 pass；浏览器项标 **待 CHECKLIST §B1 维护者** 或你若能 Preview 则留证。
   - AC2–AC6：结合 diff + 单测 + CHECKLIST Agent 已勾列。

4. **CHECKLIST**：在 reinspect 文首链 CHECKLIST；Agent 列已验证项打 ☑；维护者 §B 留 ☐。

5. **落盘 reinspect md**（上路径），含：
   - 复检结论摘要 · human_gate 追溯
   - 独立验证命令表
   - 验收表 · failure_paths 抽检（F1–F3）
   - test_strategy: recommended 专节
   - 阻塞合并项 · 是否建议合并
   - **不代签 HG-REINSPECT**

6. **KPI（00）**：按 KPI_RUBRIC_v1_2 在 task 正文 ### KPI（00） 填写 HatInstance 摘要（D1–D5 要点 + Task_KPI% 若 CLOSE）；**删除占位句**。

7. **commit** 本轮：reinspect + task KPI 段 + CHECKLIST Agent 列更新（若有）。

8. **禁止**：标 task done · git mv done/ · 代填 HG-REINSPECT approved · 扩大 scope。

9. 对话末尾：
   - 输出 **关账前维护者待办**（CHECKLIST §H · HG-REINSPECT 路径）
   - 若全部自动化项 pass：输出 **CLOSE 预备 Prompt 摘要**（HANDOFF_CLOSE_TRACE 提纲，待人签 gate 后执行）
   - 输出 **📋 Harness 状态栏（版本 B）**

## 非范围

- 不修改业务代码（除非发现阻塞 bug 且须单列 commit 说明）
- 不启动 harness parity SPEC task
- 不做 router.evidence Timeline（另 task）
```
