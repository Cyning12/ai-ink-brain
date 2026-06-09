# Prompt · Portfolio W6 关账 Loop（验收复核 → CLOSE · KPI）

> **用途**：**历史归档** — W6 已于 2026-06-03 关账（PR #51 · `docs/tasks/done/task_portfolio_e2e_demo_qa_v1.md`）。新对话复用本 Prompt 时须改 task 路径与分支。  
> **Open Folder**：`ai-ink-brain`（读后端留证时 `@` `ai-ink-brain-api-python` **只读**）  
> **task 真值（已 done）**：[`docs/tasks/done/task_portfolio_e2e_demo_qa_v1.md`](../done/task_portfolio_e2e_demo_qa_v1.md)  
> **验收清单**：[`CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md`](../reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md)

---

## 1. 帽链（本 Prompt · 止于 CLOSE）

```text
40′（复核） → 50′（增量复检，可选 Task 子代理） → CLOSE（KPI + 关账回溯 + git mv）
```

| 帽 | 要点 |
|----|------|
| **40′** | 对照 checklist §A–G + task 五问表；汇总 pass/fail/blocked |
| **50′** | 若 40′ 全绿：增量 reinspect 落盘；否则 **STOP** 输出阻塞清单 |
| **CLOSE** | 重算 KPI · HANDOFF_CLOSE_TRACE · **人签或预批后** `git mv` done |

> **与 startup Prompt 差异**：本链 **不重跑** 00→30；假定 invoke `invoke_20260603_*` 已存在。

---

## 2. 开跑前（维护者 1 分钟）

| # | 动作 |
|---|------|
| 1 | Open Folder = **`ai-ink-brain`** |
| 2 | `git branch --show-current` → 须在 **`task/portfolio-e2e-demo-qa-v1`**（勿在 `main` 提交） |
| 3 | 确认 **api-python 已部署/本地可达** · `PY_API_URL` 与 Preview 一致 |
| 4 | 已执行：`./tools/sync-portfolio-content.sh`（新卷后 `--force`）→ **POST admin/sync** → job **done** |
| 5 | 已在 **同一 Preview/生产 URL** 完成 chip **五问** + **录屏**（或本对话附带留证路径） |
| 6 | （可选）对照后端 W5：`ai-ink-brain-api-python/docs/diary/samples/portfolio-rag-demo/five-questions-results.md` |
| 7 | 新 Chat 粘贴 **§3 全文**；若你已验收完毕，对话首句加：**「HG-REINSPECT 预批关账」** |

**后端 W5 协调**：后端 `HG-W5-FIVE-Q` 可与本 task **并行**；W6 关账 **不硬依赖** 后端 task 已 `done`，但五问 corpus 须含 `content/evidence/evidence-card.md`（Q5）。

---

## 3. 可复制 Prompt 正文（从下一行起 · 40′ 开跑）

```text
## 角色

你是 **Harness 关账复核 Agent（Portfolio W6 · e2e-demo-qa · 40′→CLOSE）**，严格遵循：
- docs/harness/prompts/00-orchestrator.md（CLOSE 节）
- docs/harness/prompts/handoff/HANDOFF_SEMI_AUTO.md（invoke 落盘 + commit）
- docs/harness/prompts/handoff/HANDOFF_CLOSE_TRACE.md（关账回溯）
- docs/harness/guides/KPI_RUBRIC_v1_2.md
- docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md
- docs/tasks/reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md
- docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§6.4 · §6.7 · §7 W6）
- docs/tasks/specs/投递冲刺_20260609_v1_zh.md（§2 五问 · §3.3 sync）
- lib/unified-chat/portfolio-demo-chips.ts（chip 逐字 **唯一真值**）
- lib/unified-chat/portfolio-chat-tier.ts
- tools/README-portfolio-content-sync.md
- AGENTS.md · .cursor/rules/07-git-workflow.mdc

Open Folder = ai-ink-brain
git_branch = task/portfolio-e2e-demo-qa-v1
task_slug = portfolio-e2e-demo-qa-v1
task_path = docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01
semi_auto = true
kpi_rubric = KPI_RUBRIC_v1_2
kpi_aggregator = CLOSE
stop_after_hat = CLOSE

## 关账硬规则

1. **chip 逐字**：以 `portfolio-demo-chips.ts` 的 `label` 为准（**非** task 表 Markdown `**` 版）
2. **Q3 sources**：**仅** `evidence/*` 计 pass（vol3 **不计** Q3）
3. **Q2**：不得仅 `direct_answer` 通识降级（F3）
4. **全绿**：5/5 能答 · sources **≥4/5** 满足 task「sources 判定」列 · 单问重试 **≤3**
5. **sync（F1）**：`filesScanned>0` 且 `chunksUpserted>0` · jobId 写入 checklist/reinspect
6. **录屏（F5）**：3–5 min 路径写入 checklist §E；缺失 → **不得 CLOSE**
7. **禁止**代填 `human_gate` 为 `approved`，**除非** 用户在**同对话**明示「HG-REINSPECT 预批关账」或等价授权；若代填，commit message **须注明预批**
8. **禁止**无复核证据宣称五问全绿（须 Timeline/sources JSON 或 checklist 维护者列已填）
9. 换帽/关账前：invoke → `docs/harness/invokes/by-task/portfolio-e2e-demo-qa-v1/invoke_YYYYMMDD_40prime_portfolio-e2e-demo-qa-v1.md`（及 CLOSE invoke）→ **commit**（任务分支）
10. **`git mv` → done/**：仅当 §A–G 全绿 + HG-REINSPECT **approved** + 50′ pass

## 文档矛盾真值（W6 · 不得用错口径）

| 项 | 真值 |
|----|------|
| 解锁 | ChatBI 明文 token + `GET /api/py/chatbi/access/verify`（W4 主路径） |
| Q3 目录 | **evidence only** |
| Q5 corpus | 须 ingest `content/evidence/evidence-card.md`（sync 后可见） |
| Preview env | 与生产 **同 Supabase** · 同 `EMBEDDING_DIM` · 不混 localhost API（除非 checklist §A 标注本地联调） |

---

### 【帽 40′ · 验收复核 · 立即执行】

**Step 0 — 读现状**

1. task + 最新 `docs/harness/invokes/by-task/portfolio-e2e-demo-qa-v1/` invoke
2. `CHECKLIST_*_acceptance_zh.md` §A–G 当前勾选
3. `task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md`（50 基线）
4. （只读）后端 `docs/diary/samples/portfolio-rag-demo/` 若维护者已 W5 留证

**Step 1 — 本仓静态检查（Agent 可自证）**

| 检查 | 命令/路径 | 期望 |
|------|-----------|------|
| 分支 | `git branch --show-current` | `task/portfolio-e2e-demo-qa-v1` |
| content 三目录 | `content/methodology/` · `resume/` · `evidence/` | 各 ≥1 `.md`；**含** `evidence-card.md` |
| chip 冻结 | `portfolio-demo-chips.ts` | Q1–Q5 label 与 task 表「UI 逐字」一致 |
| CI | `pnpm lint` · `pnpm test` · `pnpm build` · `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | 全 exit 0（失败则 **STOP** 先修） |

**Step 2 — 演示层检查（须维护者留证或对话提供）**

对 checklist **逐项**填「Agent 复核列」并判定：

| 节 | 关键 pass 条件 |
|----|----------------|
| **§A** | Preview URL · portfolio mode · 同 Supabase · PY_API_URL 可达 · ChatBI unlock 200 |
| **§B** | sync job **done** · jobId · filesScanned/chunksUpserted >0 |
| **§C** | 五路由 200（含 `/unified-chat`） |
| **§D** | Q1–Q5 表全勾；Q2 非纯降级；Q3 evidence-only；Q5 evidence 主命中 |
| **§E** | 录屏路径非空 |
| **§F** | CI（Step 1 已覆盖则标 ✅） |
| **§G** | 22/50 已存在；HG-REINSPECT 状态 |

**Step 3 — 输出《复核报告》**

Markdown 表格：**节 · 项 · 判定（pass/fail/blocked）· 证据路径 · 备注**

- 任一 **F1/F3/F5/F7** → 总判 **blocked** → **STOP**（输出维护者待办，**不** CLOSE）
- 全部 pass → 进入 **50′**

---

### 【帽 50′ · 增量复检】

落盘：`docs/tasks/reinspect_results/task_portfolio_e2e_demo_qa_v1_reinspect_YYYYMMDD.md`

- 引用 checklist §A–G 勾选结果 · sync jobId · 五问 run_id/sources 摘要 · 录屏路径
- 总评：**pass**（可关账）或 **pass-with-notes**（有豁免须人签说明）或 **fail**
- **fail / blocked** → **STOP**，不 CLOSE

（可选）Task 子代理 Fresh Context 执行本帽；主会话只收短报告。

---

### 【帽 CLOSE · KPI + 关账】

**前置**：50′ = pass（或 pass-with-notes 且豁免已人签）

1. 更新 checklist §H「可关账」勾选 · 维护者签字行（预批则写「预批 YYYY-MM-DD」）
2. 更新 task：
   - `status` → `done` 或 `closed`
   - `human_gate` · **HG-REINSPECT** → `approved`（**仅**用户预批或已 approved）
   - 回填实现备忘：联调 URL · sync jobId · 五问 run_id · 录屏路径
   - 验收标准 §A–D 勾选为 `[x]`
   - **`### KPI（00）`** 按 KPI_RUBRIC_v1_2 **重算** Task_KPI%（D5 演示层应 ≥90；去掉 blocked 说明）
   - **`### 自检结论`** 更新为关账态
3. invoke 落盘：`invoke_YYYYMMDD_CLOSE_portfolio-e2e-demo-qa-v1.md`
4. **commit**（任务分支）：`docs(task): 关账 portfolio-e2e-demo-qa-v1 W6 E2E`
5. `git mv docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md docs/tasks/done/`
6. 更新 `docs/tasks/_views/done.md` 条目
7. 输出 **HANDOFF_CLOSE_TRACE**（执行路线 · commit 回溯 · 是否仍待人动作）

**仍禁止**：push / merge PR（除非用户另嘱）

---

## 阻塞时 Agent 须输出的最小待办（COPY 给维护者）

| 阻塞 | 动作 |
|------|------|
| sync 未跑 / filesScanned=0 | `./tools/sync-portfolio-content.sh` → POST admin/sync → 轮询 done |
| Q2 降级 | 查 `content/resume/cv-online.md` 是否 stub；re-sync |
| Q3 无 evidence | 查 ingest 是否仅 methodology；重问 |
| Q5 无 evidence | 确认 `evidence-card.md` 已 sync |
| 录屏空 | 按 task §录屏 checklist 录制并填 §E 路径 |
| HG-REINSPECT pending | 复核通过后对话授权或人工改 task gate 表 |

## 给 Cursor

CLOSE、portfolio-e2e-demo-qa-v1、W6、五问、checklist、HG-REINSPECT、evidence-card、admin/sync、semi_auto、KPI
```

---

## 4. 与后端 W5 对照（非阻塞）

| 维度 | 后端 W5（api-python） | 本 Prompt（ai-ink-brain） |
|------|------------------------|---------------------------|
| 验收面 | RUNBOOK curl + diary 留证 | Preview URL + chip + 录屏 |
| Q5 corpus | `evidence-card.md` ingest | 同源 `content/evidence/` + sync |
| 关账闸 | HG-W5-FIVE-Q | HG-REINSPECT |
| 可并行 | ✅ | ✅ |

### 维护者 P1 决策（2026-06-03 · 后端 diary）

| ID | 决策 | 本 Prompt 动作 |
|----|------|----------------|
| P1-1 R7 curl | 已结束 | 不验 curl |
| P1-2 真简历 | defer | Q2/Q4 不阻塞关账 |
| P1-3 diary 噪音 | 保留 | 不要求清库 |
| **P1-4 跨仓 commit** | **本 Agent** | CLOSE 前 **须** commit：`content/evidence/evidence-card.md` · `tools/sync-portfolio-content.sh` · `tools/README-portfolio-content-sync.md`（若尚未在分支） |

---

## 5. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-03 | v1：W6 关账复核 40′→50′→CLOSE · checklist 驱动 · 预批 gate 条款 |
| 2026-06-03 | v1.1：纳入后端 P1 维护者决策 · P1-4 跨仓 commit 归本 Agent |
