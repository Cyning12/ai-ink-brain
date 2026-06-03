# 任务审核 · Portfolio W6 E2E · R1

| 字段 | 值 |
|------|-----|
| **task** | `docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md` |
| **task_slug** | `portfolio-e2e-demo-qa-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **audit_round** | R1 |
| **date** | 2026-06-03 |
| **invoke_snapshot** | `docs/harness/invokes/by-task/portfolio-e2e-demo-qa-v1/invoke_20260603_22_r1_portfolio-e2e-demo-qa-v1.md` |
| **关联 SPEC** | `docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` §6.4–6.7 · `投递冲刺_20260609_v1_zh.md` §2–§3.3 |

---

## 审查结论摘要

**结论**：**零阻塞** — 可进入 **30 执行帽**（联调 + 可选最小 patch）。  
**experience_capture**：维持 task `recommended`。  
**test_strategy**：`recommended` 合理；五问人工留证 + 关账 `pnpm lint/test/build` 已可操作化。

---

## 已核对项

| 项 | 结果 |
|----|------|
| 验收标准可观测 | ✅ Preview URL · sync jobId · 五问表 · 录屏路径 · CI 命令均已写明 |
| failure_paths | ✅ F1–F7 与验收/§预跑基线对齐 |
| human_gate | ✅ HG-TASK-DRAFT `approved`；HG-AUDIT-R1 已 `approved`（维护者预签 · 本 R1 书面补齐） |
| W3/W4 非范围 | ✅ 未要求推翻 ChatBI 主路径 |
| chip 逐字 | ✅ task 已以 `portfolio-demo-chips.ts` 为 UI 真值 |
| 跨仓依赖 | ✅ `CONTENT_ROOT` · admin/sync · 后端 governance SPEC 已链 |

---

## 风险（非阻塞 · 30/40 须留证）

| ID | 风险 | 缓解 |
|----|------|------|
| R1-1 | **Q2** 预跑仅 `direct_answer`（F3） | sync 后重跑；必要时后端 ingest/rewrite（非本 task 实现） |
| R1-2 | **Q3/Q5** sources category 偏松 | 严格按表「sources 判定」；F7 |
| R1-3 | Preview/生产 Supabase 分叉（F4） | 联调前核对 Vercel env 面板 |
| R1-4 | `filesScanned=0`（F1） | 先 CONTENT_ROOT + sync 脚本 |
| R1-5 | SPEC `draft` + §4.3 与实现分叉 | task §文档矛盾 已冻结 W6 真值 |
| R1-6 | deadline 2026-06-09 上午 | 40 须留 Timeline + reinspect 时间戳 |

---

## 阻塞 / 非阻塞

- **阻塞**：无  
- **非阻塞**：上表 R1-1～R1-6  

## 需任务帽回填清单

无（10 帽已回填）。

---

## 是否建议执行帽开工

**是** — **30** 可在 `task/portfolio-e2e-demo-qa-v1` 执行 sync 联调；**HG-AUDIT-R1** 已 `approved`，不阻塞 30。

---

## 签收 / 关闭（R1）

- 本 task **文档层** R1 **通过**；**不**等于五问全绿（属 40/50）。  
- **下一棒**：**30 执行帽** → 其后 **40 自检** → **22 R2** → **50** → **CLOSE**。

---

## 下一棒可复制 Prompt（30 · 执行）

```text
你正在扮演 Harness「执行帽（30）」，严格遵循：
- docs/harness/prompts/30-execute.md（或本仓等价执行规范）
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md
- docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md（ready_for_execute）
- docs/harness/reviews/task_portfolio_e2e_demo_qa_v1_audit_R1_20260603.md（R1 零阻塞）

Open Folder = ai-ink-brain
git_branch = task/portfolio-e2e-demo-qa-v1
task_slug = portfolio-e2e-demo-qa-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01

【本棒目标】
1. 按 task §sync 执行计划 完成 content 同步 + admin/sync + jobId 留证（filesScanned>0）。
2. 在 Preview 或维护者指定 URL 上跑五问联调（最小 patch 仅：可选 `/evidence` 锚点 · PROJECT_CONFIG env 登记）。
3. 禁止推翻 ChatBI unlock 主路径；禁止大规模 UI 重构。
4. 落盘 invoke → docs/harness/invokes/by-task/portfolio-e2e-demo-qa-v1/invoke_YYYYMMDD_30_*.md
5. 回填 task「实现备忘」：联调 URL · jobId · 涉及文件。

Judgment（30）：
- hat_self: pass | pass-with-notes | blocked
```
