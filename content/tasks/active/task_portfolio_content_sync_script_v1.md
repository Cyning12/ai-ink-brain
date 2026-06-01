# Task：Portfolio 内容目录与 sync 脚本（W5）

> **状态**：`done`（10 帽定稿 · 2026-06-01）  
> **关联图谱**：`docs/_tech_graph/01_struct.md`（content category）· `11_flow_api.md`（`POST /api/admin/sync` 代理）  
> **关联 Issue/PR**：（待开）  
> **后端依赖**：配对 [`SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`](../../../ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md) · `CONTENT_ROOT` · `filesScanned>0` 硬门槛（**本 task 不修改后端代码**；sync **触发说明** + 本地烟测步骤）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `portfolio-content-sync-v1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 脚本幂等与三目录落盘可单测/烟测；`POST /api/py/admin/sync` 全量五问质量归 **W6**；本 task 验收 **filesScanned>0** 本地烟测步骤 + 脚本 `--dry-run` 或清单输出 |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01`（与 Epic · W1 同源） |
| **semi_auto** | `true` |
| **audit_profile** | `full` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE`（**50 完成后由人触发 CLOSE**；LoopTask **不停在 CLOSE**） |
| **git_branch** | `task/portfolio-demo-site-v1`（Epic 分支） |
| **harness_mode** | **`looptask`** |
| **stop_after_hat** | **`50`**（独立复检落盘后 **停止**；**不**自动关账 / `git mv` done） |

- **KPI 真值**：工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md) · [`HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.8  
- **prompts**：`@` 工作区 `Projects/docs/harness/prompts/`  
- **LoopTask 启动 Prompt**：[`content/tasks/specs/PROMPT_looptask_startup_portfolio_w5_v1_zh.md`](../specs/PROMPT_looptask_startup_portfolio_w5_v1_zh.md)  
- **关账前**：正文须有 **`### KPI（00）`**（**50 + 人签 HG-REINSPECT 后** 由 CLOSE 填写）

### Harness LoopTask 帽链（本 task 权威）

> 真值对齐：工作区 [`SDD_HAT_FLOW.md`](../../../docs/harness/SDD_HAT_FLOW.md) §5.3 · [`00-orchestrator.md`](../../../docs/harness/prompts/00-orchestrator.md)

```text
00 总调度（开帽）
  → 10 需求（本 task 草案细化 / 验收·failure_paths·非范围）
  → 22 R1 任务审核（**强制** · 须落盘 reviews）
       ├─ 阻塞 / 疑问 → 10（改 task）→ 22 R1' … 直至 R1 放行
       └─ R1 放行 → HG-AUDIT-R1（人）
  → 30 执行（脚本 + 三目录 + 文档）
  → 40 自检（命令 + ### 自检结论）
  → 22 R2 终轮签收（须落盘 · 签收/关闭节）
  → 50 独立复检（**Task 子代理** · Fresh Context）
  → 【停止】等待 HG-REINSPECT + 人 CLOSE（**半自动不在此会话关账**）
```

| 规则 | 说明 |
|------|------|
| **跳过 20** | 与 Epic R4-5 一致；规格已 **`active`**，短评缺口在 **22 R1** 书面化 |
| **10↔22 回路** | 22 R1 **阻塞**时 **仅** 回 **10** 改 task（或 SPEC 变更请求）；**禁止** 未 R1 放行进 30 |
| **50 派发** | **主会话禁止兼做**；用 `Task` + [`PROMPT_50_invoke_portfolio_content_sync_w5_v1_zh.md`](../specs/PROMPT_50_invoke_portfolio_content_sync_w5_v1_zh.md)（**50 帽完成后创建**） |
| **停止点** | `stop_after_hat: 50` → 产出 `reinspect_results/` 后 **停工**；CLOSE / `done/` / KPI 由 **新会话或人** 触发 |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | `approved` | 22-R1, 30 | 10 帽定稿后人扫 task 改 `approved` |
| HG-AUDIT-R1 | `approved` | 30 | **22 R1 书面**通过后改 `approved`（**本 task 强制 22 · 禁止路径 B 跳过**） |
| HG-REINSPECT | `approved` | done | **50 完成后** merge 前；Agent **不得**代填 |

### 下一棒

| 帽 | 条件 | 落盘 |
|----|------|------|
| **50 Task 子代理** | ✅ 30–40 · R2 签收 | `content/tasks/reinspect_results/task_portfolio_content_sync_v1_reinspect_*.md` |
| **STOP** | 50 落盘后 | 人签 `HG-REINSPECT` · CLOSE |

---

## 同步脚本约定（10 帽定稿 · freeze_id 同源）

> **MVP 范围**：首版 **仅同步三文件真值**（满足后端 §6.2 与五问路径前缀）；**不**在本 task 实现卷一～五全量。未来全量另开 task 或脚本 `--sync-all-volumes`（**非本 task**）。

| CLI 参数 | 默认值 | 行为 |
|----------|--------|------|
| `--articles-root` | 工作区 sibling **`../ai-coding-closed-loop-articles`**（相对本仓根解析） | 不存在 → **exit 1**（F1）；stderr 提示克隆或改参 |
| `--docs-root` | **`../ai-coding-closed-loop-articles/assets`**（证据卡粘贴版优先） | 不存在 → **不失败**；`resume`/`evidence` 走 **仓内最小 stub**（见下） |
| `--dry-run` | 关 | 只打印将复制/跳过的路径，**不写** 目标文件 |
| `--force` | 关 | 目标已存在则 **跳过**（幂等）；开则覆盖（须在 README 警告） |

**MVP 映射（30 须实现）**

| 源（相对 `--articles-root`） | 目标（本仓） | 说明 |
|------------------------------|--------------|------|
| `ARTICLE_*_vol3_*.md`（仓根 glob，取最新 1 个） | `content/methodology/vol3_<basename>.md` | 满足 Q1 `methodology/vol3_*` |
| `--docs-root` 下 `PUBLISH_卷三_*` 或 `assets/README.md` 摘要 | 若缺则 **不复制** | 卷三正文以 articles 根 `ARTICLE_*_vol3*` 为准 |
| `--docs-root` 无 `cv-online.md` 时 | `content/resume/cv-online.md` | **最小 stub**（frontmatter + 占位段，30 可内嵌模板） |
| `assets/PUBLISH_卷三_*` 或 `methodology-card` 模板 | `content/evidence/methodology-card.md` | 无源时 **最小 stub**（Q3/Q5 锚点句） |

**禁止 glob**：`content/diary/`、`content/tasks/`、`content/harness/`、`content/learning/` 不得作为 sync 源或目标。

**SPEC §4.5「release 路径」拍板**：sibling 仓 **无** `release/` 子目录；MVP 以仓根 `ARTICLE_*_vol3_*.md` 为卷三真值；全量卷系 **延期**（与 task 非范围一致）。

---

## 本地 admin sync 烟测（10 帽 · 40 回填结果摘要）

**前置**

1. 本仓：`pnpm dev`（或已部署 Preview）可达 BFF。
2. 配对后端：`PY_API_URL` 可达；后端 `.env` 设 **`CONTENT_ROOT=<ai-ink-brain>/content`**（绝对路径由维护者替换）。
3. 已执行 `tools/sync-portfolio-content.sh` 且三目录各 ≥1 `.md`。

**触发（路径 A 直连 Python · 推荐 · 投递计划 §3.3）**

```bash
export ADMIN_TOKEN="$SYNC_ADMIN_SECRET"   # shell 别名 · 与 Python admin 同值

curl -sS -X POST "$PY_API_URL/api/py/admin/sync" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**或路径 B — 经 BFF（`pnpm dev`）**

```bash
curl -sS -X POST "http://localhost:3000/api/admin/sync" \
  -H "Authorization: Bearer $SYNC_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

> **废弃**：`x-admin-token: $NEXT_PUBLIC_ADMIN_SECRET`（见 [`SPEC-portfolio_admin_sync_auth_v1_zh.md`](../specs/SPEC-portfolio_admin_sync_auth_v1_zh.md)）

**轮询**（若响应含 `jobId`）：`GET "http://localhost:3000/api/admin/sync?jobId=<id>"` 至 `status=succeeded` 或失败。

**硬 FAIL（不得放宽）**

| 条件 | 判定 |
|------|------|
| `result.filesScanned === 0` | **FAIL**（F2） |
| 后端不可达 / 未配置 `CONTENT_ROOT` | 40 记 **环境阻塞**，task 验收项 **不** 勾「烟测通过」 |

**通过（本 task 烟测子集）**

- `filesScanned > 0` 且 `chunksUpserted > 0`（语料非空）。
- 五问 **sources 质量**、**5/5 全绿** → **W6**，非本 task。

---

## W2 / W6 边界（10 复述）

| 包 | 本 task | 说明 |
|----|---------|------|
| **W2** | **不实现** `/resume` `/methodology` `/evidence` 路由与 MDX 页 | 仅保证 `content/{methodology,resume,evidence}/` 路径落盘；W2 只读这些路径 |
| **W6** | **不实现** 五问 E2E、自动化 POST、Preview 全绿 | 本 task 只 **文档化** 烟测 curl；W6 负责联调与 sources ≥4/5 |

---

## 背景与目标

Epic **Portfolio 演示**（[`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §4.5 · §6.5 · **§7 W5**）在 **W1 导航** 已交付后，须在本仓 `content/` 建立 **`methodology/` · `resume/` · `evidence/`** 三顶层目录，并提供 **`tools/sync-portfolio-content.sh`** 从 sibling 内容仓 **幂等同步** 演示语料。

**完成态一句话**：维护者执行一条 documented 命令后，三目录各 **≥1** 个目标态 `.md` 文件就绪；后端在 `CONTENT_ROOT=<本仓>/content` 下 **`POST /api/py/admin/sync`** 时 **`filesScanned>0`** 且三 **category** 均可 ingest（**chunksUpserted>0** 依赖语料非空 · 本地烟测步骤见验收）。

**与 W2 关系**：W5 **可先交付 stub/同步真值**；W2 页面渲染依赖本 task 落盘路径，但 **不要求** 本 task 实现 `/resume` 等路由。

---

## 范围

- [x] 新建 **`content/methodology/`** · **`content/resume/`** · **`content/evidence/`**（空目录不入库时须 **≥1 `.md`** 占位或真值）。
- [x] **首版 stub 或 sync 真值**（至少满足后端门禁文件名建议，见下表）：

  | 路径（建议） | category | 五问关联 |
  |--------------|----------|----------|
  | `content/methodology/vol3_*.md`（或等价卷三 stub） | `methodology` | Q1 |
  | `content/resume/cv-online.md` | `resume` | Q2 · Q4 |
  | `content/evidence/methodology-card.md` | `evidence` | Q3 · Q5 |

- [x] 新增 **`tools/sync-portfolio-content.sh`**：幂等；CLI 见 **「同步脚本约定」**（`--articles-root` / `--docs-root` / `--dry-run` / `--force`）；stdout 输出同步文件清单；**禁止** 脚本内嵌 API Key。
- [x] 新增 **`tools/README-portfolio-content-sync.md`**（或 `tools/README.md` 一节）：用法、前置目录、sync 后 **人工/脚本** 触发 `POST /api/py/admin/sync` 说明（BFF `app/api/admin/sync`）。
- [x] 在 **`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`**（或 task 引用的 tools README）文档化：`CONTENT_ROOT` 指向本仓 `content/` 的本地演示约定（**若 gitignore 则须在 tools README 重复真值**）。
- [ ] **不** 修改 `lib/content/mdx-posts.ts` /blog 扫描逻辑（portfolio 目录与 `diary/`/`tasks/` 命名空间隔离，靠 **首段路径 category**）。
- [ ] 增量更新 **`docs/_tech_graph/`**（若触达 ingest/管理代理流程）：如 `11_flow_api` admin sync 锚点；跑 graph 三门禁（若改 `.ai.md`）。
- [ ] **`pnpm lint`** · **`pnpm test`** · **`pnpm build`** 仍绿（`AGENTS.md` §8）；新增脚本须有 **shellcheck 级** 自检或 task 所列最小烟测。

## 非范围

- **W2**：`/resume` · `/methodology` · `/evidence` 页面与 MDX 渲染路由。
- **W3/W4**：访客秘钥 · Unified chip/debug 裁剪。
- **W6**：五问 E2E · Preview 环境 · sources ≥4/5 全绿判定。
- **修改** 配对后端 `ingest_pipeline.py` 或 category 规则。
- **CI 自动** 调用 admin sync（仅文档化本地/预发步骤）。
- **卷一～五全文** 一次性全部入库（可分期；MVP 须 **vol3 stub + 简历 + 证据卡** 三文件路径可追踪）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| **冻结 SPEC（前端）** | [`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §4.5 · §5 · §6.5 · §7 W5 |
| **Epic W1（done）** | [`content/tasks/done/task_portfolio_site_mode_nav_v1.md`](../done/task_portfolio_site_mode_nav_v1.md) |
| **配对 SPEC（后端）** | [`SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`](../../../ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md) §4.1 · §4.2.3 · §6.2 |
| **RUNBOOK（后端）** | `ai-ink-brain-api-python/docs/harness/guides/RUNBOOK_portfolio_rag_five_questions_v1_zh.md`（只读 · sync 硬检查） |
| **五问真值** | [`投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) §2 · §3.2 |
| **内容源（默认 sibling）** | `../ai-coding-closed-loop-articles` · MVP 卷三仓根 glob（见 **同步脚本约定**） |
| **BFF sync** | `app/api/admin/sync/route.ts` · 鉴权 SPEC [`SPEC-portfolio_admin_sync_auth_v1_zh.md`](../specs/SPEC-portfolio_admin_sync_auth_v1_zh.md) |
| **Harness LoopTask 启动** | [`PROMPT_looptask_startup_portfolio_w5_v1_zh.md`](../specs/PROMPT_looptask_startup_portfolio_w5_v1_zh.md) |

---

## 验收标准

> 可追溯 SPEC §6.5；**W5 子集**；五问答通归 W6。

- [x] **`tools/sync-portfolio-content.sh`** 存在、可执行、**幂等**（连续两次运行不破坏已存在真值；stdout 有文件清单）。
- [x] 执行脚本后 **`content/methodology/` · `content/resume/` · `content/evidence/` 各 ≥1 `.md`**（与后端 SPEC §6.2 目标路径一致或 task 实现备忘列出的等价路径）。
- [x] **tools README** 含：依赖 sibling 路径、示例命令、sync 后 **`POST /api/py/admin/sync`** 触发说明（**不** 要求本 task 自动化 POST）。
- [ ] **本地烟测步骤**（见 **「本地 admin sync 烟测」** + tools README）：`CONTENT_ROOT` + BFF `POST /api/admin/sync`；**`filesScanned > 0`** 且 **`chunksUpserted > 0`**（**40：环境阻塞** · 403 Forbidden 未带 admin token）。
- [x] **`filesScanned=0`** 场景在文档中标注为 **硬 FAIL**（对齐前后端 SPEC · 不得放宽）。
- [x] **`pnpm lint` · `pnpm test` · `pnpm build`** 通过；portfolio 模式 build 不因新 `content/` 路径破坏（W1 回归）。
- [x] **22 R1/R2** 书面审查落盘 · **50** `reinspect_results/` 落盘（LoopTask 停止点后由人 CLOSE）。

---

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | `--articles-root` 不存在或不可读 | 脚本 **非 0 退出** + stderr 提示 `--articles-root` | 克隆/改路径后重跑 | 终端错误信息 |
| F1b | `--articles-root` 内无 `ARTICLE_*_vol3_*.md` | **非 0 退出** + stderr「缺卷三源」 | 补 articles 或手建 stub | 终端错误信息 |
| F2 | 三目录任一无 `.md` 即跑 admin sync | 后端 **`filesScanned=0` · FAIL** | 补文件 / 跑脚本后重 sync | 无（API JSON） |
| F3 | 脚本覆盖用户手改且未 `--dry-run` | **缺陷**；须文档说明幂等策略 | 从 backup 或 git 恢复 | 内容丢失 |
| F4 | 误将 `tasks/`/`harness/` 同步进 portfolio 目录 | **缺陷**；演示路径泄露 | 修脚本 glob | RAG 命中错误 category |
| F5 | 22 R1 阻塞仍进 30 | **Harness 违规** | 回 10 改 task 再 22 | — |
| F6 | 主会话兼做 50 | **Harness 违规** | 用 Task 子代理重跑 50 | — |

---

## SPEC §6.5 追溯（W5 覆盖）

| SPEC §6.5 条目 | W5 | 说明 |
|----------------|-----|------|
| sync 脚本存在且文档化 | **W5** | 本 task |
| 三目录各 ≥1 `.md` | **W5** | stub 或真值 |
| `filesScanned=0` 硬 FAIL | **W5** | 文档 + 烟测步骤 |
| 五问 sources 质量 | W6 | 非本 task |
| W2 页面可读 | W2 | 仅依赖路径落盘 |

---

## 交叉 SPEC 核对（10 帽 · R1 待签收）

| 核对项 | 前端 SPEC | 后端 SPEC | 结论 |
|--------|-----------|-----------|------|
| category 三目录 | §5 表 | §4.1 同表 | **一致** |
| `filesScanned=0` | §6.5 | §4.2.3 | **一致** |
| Q3 evidence-only | §6.4 | §6.2 | **一致**（W6 验） |
| release / articles 源 | §4.5 | §6.2 目标路径 | **resolved**：sibling 仓根 vol3 glob + MVP 三文件；无 `release/` 子目录 |
| 目标文件名 | §6.4 Q1–Q5 | §6.2 | **一致**：`vol3_*` · `cv-online.md` · `methodology-card.md` |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `tools/sync-portfolio-content.sh` · `tools/README-portfolio-content-sync.md` · `content/methodology/vol3_*` · `content/resume/cv-online.md` · `content/evidence/methodology-card.md` · `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 同步源默认路径 | vol3 真值复制；resume **stub**；evidence 来自 `assets/PUBLISH_卷三_*` |
| admin sync 烟测 | **环境阻塞**：`POST /api/admin/sync` → HTTP 403（未配置 curl token） |
| 22 R1 审查 | `content/harness/reviews/task_portfolio_content_sync_v1_audit_R1_20260601.md` |
| 22 R2 审查 | `content/harness/reviews/task_portfolio_content_sync_v1_audit_R2_20260601.md` |
| 50 复检 | `content/tasks/reinspect_results/task_portfolio_content_sync_v1_reinspect_20260601.md`（**pass**） |

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-01 | 10 帽：同步脚本约定 · 烟测步骤 · W2/W6 边界 · 交叉 SPEC resolved（按审查 R1 待签收） |
| 2026-06-01 | 30–40：脚本 + 三目录 + README · R2 签收 · 派 50 |

---

## ### KPI（00）

> **由 `kpi_aggregator` 填写**（**50 + HG-REINSPECT 后 CLOSE**）；LoopTask **不在 50 自动填写**。

（CLOSE 帽 / 新会话）

---

## ### 自检结论（执行者）

**40 帽 · 2026-06-01**

| 命令 | 结果 |
|------|------|
| `./tools/sync-portfolio-content.sh` ×2 | 第 2 次三路径 **SKIP**（幂等） |
| `pnpm lint` | pass |
| `pnpm test` | 43/43 pass |
| `pnpm build` | pass（development） |
| `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | pass |
| `POST /api/admin/sync`（localhost:3000） | **环境阻塞** · HTTP 403 · 未带 `x-admin-token`；**未** 验证 `filesScanned` |

**说明**：W5 脚本与三目录已就绪；ingest 烟测待维护者配置 **`SYNC_ADMIN_SECRET`**（或 Python 侧同值 `ADMIN_TOKEN`）+ 后端 `CONTENT_ROOT` 后重试（**W6** 可全量五问）。
