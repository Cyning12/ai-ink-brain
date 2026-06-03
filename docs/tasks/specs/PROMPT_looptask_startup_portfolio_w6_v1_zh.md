# Prompt · Portfolio W6 LoopTask 启动（00 开帽 → 关账 CLOSE + KPI）

> **用途**：**新对话**粘贴 **§3 全文**；由 **00 总调度** 编排 **`looptask`**，**执行至 CLOSE**（五问 E2E · reinspect · KPI）。  
> **Open Folder**：`ai-ink-brain`（跨仓 sync/ingest 时 `@` `Projects/` 或配对后端仓）  
> **task 草案**：[`docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md`](../active/task_portfolio_e2e_demo_qa_v1.md)  
> **分支策略**：**新分支** `task/portfolio-e2e-demo-qa-v1`（基线 `main` @ #50）

---

## 1. LoopTask 帽链（草案）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE
```

| 帽 | 执行者 | 要点 |
|----|--------|------|
| **00** | 主 Chat | 扫 task · gates · **stop_after_hat: CLOSE** |
| **10** | semi_auto | ✅ 定稿 · Preview env · sync · 录屏 · chip 逐字 |
| **22 R1** | 主 Chat | ✅ R1 零阻塞 · **reviews** 已落盘 → **30** |
| **30–40** | semi_auto | ✅ CI 绿 · PROJECT_CONFIG · sync/五问待维护者 |
| **22 R2** | 主 Chat | ✅ R2 签收 |
| **50** | 主 Chat | ✅ pass-with-notes · 验收清单已落盘 |
| **CLOSE** | 维护者 | HG-REINSPECT · KPI 定稿 · `git mv` done |

---

## 2. 前置

| 项 | 状态 |
|----|------|
| W1–W2 | **done**（#47 · #49 · `main`） |
| W3–W4 | **done**（#50 · ChatBI token + 五问 chip） |
| W5 | **done**（#47 · sync 脚本） |
| Epic SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) §6.4 · §6.7 · §7 W6 |
| 五问真值 | [`投递冲刺_20260609_v1_zh.md`](./投递冲刺_20260609_v1_zh.md) §2 |
| **git 分支** | **`task/portfolio-e2e-demo-qa-v1`** |
| **task 状态** | `ready_for_close_prep`（50 完成 · 见 [验收清单](../reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md)） |
| **deadline** | **2026-06-09 上午**（四屏 + 五问 · 投递 P0） |

**本 task 不做**：推翻 W3/W4 · 新建演示仓 · 后端 ingest 算法大改

**预跑基线（本地 diary · 非 Git）**：Q1/Q4 ✅ · Q2 仅降级 · Q3/Q5 sources 待调优 — 见 task §预跑基线

---

## 3. 可复制 Prompt 正文（从下一行起 · 00 开帽）

```text
## 角色

你是 **Harness 00 总调度 + LoopTask 编排 Agent（Portfolio W6 · e2e-demo-qa）**，严格遵循：
- docs/harness/prompts/00-orchestrator.md
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md
- docs/harness/SDD_HAT_FLOW.md §5.3
- docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md（harness_mode: looptask）
- docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§6.4 · §6.7 · §7 W6）
- docs/tasks/specs/投递冲刺_20260609_v1_zh.md（§2 五问 · §3.3 sync）
- docs/tasks/done/task_portfolio_unified_chat_ui_v1.md（W4 · 勿推翻）
- ai-ink-brain/AGENTS.md §8

Open Folder = ai-ink-brain
git_branch = task/portfolio-e2e-demo-qa-v1
task_slug = portfolio-e2e-demo-qa-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01
stop_after_hat = CLOSE

## LoopTask 硬规则

1. 帽序：00 → 10 → 22(R1) → [10↔22] → 30 → 40 → 22(R2) → 50 → CLOSE
2. 30 以 **联调 + 最小 patch** 为主；五问全绿是核心验收
3. 关账前：五问 reinspect + 录屏路径 + KPI

## 本棒（00）

读 task 草案 · 确认 W1–W5 已在 main · 派 10 帽定稿（含 Preview env 与 sync 计划）。
```
