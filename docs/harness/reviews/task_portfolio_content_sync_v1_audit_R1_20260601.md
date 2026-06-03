# 任务审核报告：portfolio-content-sync-v1 · R1

| 字段 | 值 |
|------|-----|
| task | `docs/tasks/active/task_portfolio_content_sync_script_v1.md` |
| SPEC | `docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md`（§4.5 · §5 · §6.5 · §7 W5） |
| 配对 SPEC | `ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` |
| audit_round | R1 |
| freeze_id | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| audit_profile | `full` |
| test_strategy | `recommended` |
| harness_mode | `looptask` · `stop_after_hat: 50` |
| invoke_snapshot | `docs/harness/invokes/by-task/portfolio-content-sync-v1/invoke_20260601_10_portfolio-content-sync-v1.md` |
| prev_review | 无 |
| reviewer | Agent（22 帽） |
| date | 2026-06-01 |

---

## 审查结论摘要

**文档层零阻塞 · R1 通过（pass-with-notes）**

task 已与冻结 SPEC §4.5/§6.5、配对后端 §4.2.3/§6.2、投递计划 §3.2 对齐；**同步脚本约定**、**烟测步骤**、**failure_paths**、**W2/W6 非范围** 均可供 30 执行。`HG-TASK-DRAFT` 已 **approved**。

**30 开工条件（Agent 不得代批）**：人将 **`HG-AUDIT-R1`** 置为 `approved`（本 R1 供签字依据）。

---

## HARNESS_V2_PLAN §5 核对

| # | 字段 / 小节 | 结论 |
|---|-------------|------|
| 1 | `test_strategy: recommended` + note | ☑ 脚本烟测 + W6 分工清晰 |
| 2 | `failure_paths` | ☑ F1–F6 + F1b；可操作 |
| 3 | `freeze_id` | ☑ 与 Epic 同源 |
| 4 | `harness_mode` / `stop_after_hat: 50` | ☑ 不关账纪律明确 |
| 5 | `human_gate` | ☑ `HG-AUDIT-R1` **pending** → **阻塞 30** |
| 6 | 非范围（W2/W6/后端/CI 自动 sync） | ☑ |
| 7 | LoopTask 强制 22 | ☑ R1 本文 |

---

## SPEC / 后端交叉核对

| 项 | 结论 |
|----|------|
| 三 category 目录 | ☑ 与 §5 / 后端 §4.1 一致 |
| 目标文件 `vol3_*` · `cv-online.md` · `methodology-card.md` | ☑ 与后端 §6.2、投递 §3.2 一致 |
| `filesScanned=0` 硬 FAIL | ☑ task 烟测节 + F2 |
| articles 无 `release/` | ☑ task 已拍板 MVP 仓根 glob；**不** 与 SPEC §4.5 全文复制冲突（实现层子集） |
| Q3 evidence-only | ☑ W6 验；本 task 仅路径 |

---

## pass-with-notes（非阻塞）

| # | 说明 | 30 建议 |
|---|------|---------|
| N1 | 工作区可能尚无 `cv-online` 真值源 | 按 task 用 **最小 stub** 生成 `content/resume/cv-online.md` |
| N2 | `methodology-card.md` 源可能仅 `assets/PUBLISH_*` | stub 须含 Q3/Q5 **可检索** 关键词句 |
| N3 | shellcheck | 脚本 `#!/usr/bin/env bash` + `set -euo pipefail`；README 给示例命令 |

---

## 阻塞项

**无**（文档层）。

---

## 是否建议执行帽开工

| 帽 | 建议 |
|----|------|
| **30** | **待 `HG-AUDIT-R1` approved** 后开工 |
| **22 R2** | 30–40 完成后 |

---

## 签收 / 关闭（R1）

- **R1 结论**：**放行**（文档可执行）。
- **须继续**：30 → 40 → 22 R2 → Task 50 → 人签 `HG-REINSPECT` → CLOSE。
- **本 task 未结束**。

---

## 下一棒可复制 Prompt（30 执行帽 · `HG-AUDIT-R1` 通过后粘贴）

```text
你正在扮演 Harness「执行帽（30）」，严格遵循：
- Projects/docs/harness/prompts/30-execute.md
- docs/tasks/active/task_portfolio_content_sync_script_v1.md（全文 · 尤其「同步脚本约定」「本地 admin sync 烟测」）
- docs/harness/reviews/task_portfolio_content_sync_v1_audit_R1_20260601.md（R1 放行 · notes N1–N3）

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01

你必须完成：
1. 开帽 invoke → docs/harness/invokes/by-task/portfolio-content-sync-v1/invoke_20260601_30_portfolio-content-sync-v1.md
2. 实现 tools/sync-portfolio-content.sh（CLI 与 MVP 映射表一致）
3. 落盘 content/methodology|resume|evidence 三文件（vol3 + cv-online + methodology-card）
4. tools/README-portfolio-content-sync.md + PROJECT_CONFIG 或 README 中 CONTENT_ROOT 一句
5. 运行脚本烟测（两次幂等）· pnpm lint · pnpm test · pnpm build
6. 不修改后端 · 不实现 W2 路由 · 不自动化 POST sync
7. semi_auto 进入 40；按 HANDOFF_AUTO_COMMIT 提交

禁止：兼做 50；改 human_gate；无 R1 记录开工。

Judgment（30）：experience_capture / gate/risk / hat_self
```

---

## Judgment（22 R1）

- experience_capture: 维持 `recommended`（stub 策略可在 tools README 留 3 行范例）
- gate/risk: 建议维护者 **HG-AUDIT-R1 → approved** 后派 30
- hat_self: pass
