# docs/harness（Ink 前端仓 · Harness 产物）

> **目标**：日常读本目录 + `docs/tasks/`。  
> **纪律包钉版本**：仓根 [`harness.pin.json`](../../harness.pin.json) · manifest [`.cyning-harness/manifest.json`](../../.cyning-harness/manifest.json)（当前 **`@cyning/harness@2.19.0`** · preset `harness-only` · `ide=["cursor"]`）。  
> **WikiTrack**：本波 **暂不启用**（`profile.wiki=false`）；对照 [`POINTER_RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`](./POINTER_RUNBOOK_wikitrack_enable_obsidian_v1_zh.md) §0.5。  
> **prompts 双轨**：工作区 `Projects/docs/harness/prompts/` = Ink 扩展帽 / HANDOFF / 链式 PROMPT **真值**；本仓 `docs/harness/prompts/` = `npx @cyning/harness upgrade` 同步的 **starter 帽**（勿手改；upgrade 会覆盖）。  
> **对照基线**：`ai-ink-brain-api-python/docs/harness/README.md` §2.1（taxonomy）。  
> **KPI v1.2**：P0 已于 2026-05-31 落盘；方案见工作区 [`PLAN_frontend_harness_kpi_migration_v1_zh.md`](../../../docs/harness/guides/PLAN_frontend_harness_kpi_migration_v1_zh.md)。

---

## 0. 纪律包接入（2.19.0）

| 项 | 约定 |
|----|------|
| 钉 | `harness.pin.json` · `.cyning-harness/manifest.json` → **2.19.0** · `ide=["cursor"]` |
| 升级 | `npx --yes @cyning/harness@2.19.0 upgrade --yes --target .`（**不带** `--ide`） |
| 字段扫描 | `task lint-wiki-delta --target . --scope all` → missing=0 |
| 关账硬闸 | **`wiki_delta` 缺字段 → close BLOCK**；`task close --file … --yes`（**禁** `--target .`）；勿默认 `--allow-*-gap` |
| 本仓 WikiTrack | **暂不启用**（`profile.wiki=false`）→ 默认 `wiki_delta: n/a` + note；明示启用见 POINTER RUNBOOK |
| overlay | upgrade 后恢复 `06-harness-pointer.mdc` 等本仓定制 |
| 非范围 | 无 `/wiki-graph` Demo；不强制 coding_wiki |

常用：

```bash
npx --yes @cyning/harness@$(node -p "require('./harness.pin.json').version") verify --target . --task docs/tasks/active/<task>.md
# 涉码 / 改图谱时加 --graph（与仓规一致）
```

---

## 1. 日常读什么

| 场景 | 路径 |
|------|------|
| 本仓 Harness 索引 | 本文件 |
| 纪律包钉 / QUICKREF | `harness.pin.json` · `.cyning-harness/` |
| 写 / 审 task | `docs/tasks/templates/TASK_TEMPLATE.md` · `docs/tasks/README.md` |
| 帽子 / 模板 / HANDOFF | 工作区 `Projects/docs/harness/prompts/`（`@` 或 Open `Projects/`）；starter 见本仓 `docs/harness/prompts/` |
| **10/22 · 思考轮 R0–R5** | 工作区 `10-requirements` v1.5 · `22-task-audit` v1.8；高复杂度 task 见 [`docs/tasks/templates/TASK_TEMPLATE.md`](../tasks/templates/TASK_TEMPLATE.md) §思考轮次 |
| KPI 评分 | 工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md) |
| 字段细则 | 工作区 [`docs/harness/HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.7–§5.8 |
| 帽序 | 工作区 [`docs/harness/SDD_HAT_FLOW.md`](../../../docs/harness/SDD_HAT_FLOW.md) |
| 任务审核 22 | [`reviews/README.md`](reviews/README.md) · 工作区 `22-task-audit` |
| 独立复检 50 | [`../tasks/reinspect_results/README.md`](../tasks/reinspect_results/README.md) |
| 半自动 / 关账 | 工作区 `HANDOFF_SEMI_AUTO` · `HANDOFF_CLOSE_TRACE` |
| LoopTask 止于 50 · 50 Prompt / 人改 gate 清单 | [`.cursor/skills/harness-looptask-handoff/SKILL.md`](../.cursor/skills/harness-looptask-handoff/SKILL.md) |
| 关账前 · 前端交互验收清单 | [`.cursor/skills/harness-close-acceptance-checklist/SKILL.md`](../.cursor/skills/harness-close-acceptance-checklist/SKILL.md) · [`CHECKLIST_TEMPLATE`](../tasks/templates/CHECKLIST_TEMPLATE_acceptance_zh.md) |
| 跨子仓 Harness task | 工作区 `docs/harness/tasks/`（Open **`Projects/`**） |

**Cursor**：`.cursor/rules/05-harness-semi-auto.mdc`、`.cursor/rules/06-harness-content.mdc`、`.cursor/rules/06-harness-pointer.mdc`（产品包 sync）。

**Agent 禁止**：

- **禁止**把手改产物当「扩展帽真值」写进本仓 `docs/harness/prompts/`（会被 `upgrade` 覆盖）；扩展帽仍以工作区 `Projects/docs/harness/prompts/` 为准。
- **禁止**将工作区 prompts **整包手工复制**到本仓（与产品包 sync 的 starter 区分：后者仅由 `init`/`upgrade` 写入）。
- **禁止**在未 Open `Projects/` 时，默认改工作区 `docs/harness/tasks/` 或 `invokes/` 根下扁平历史索引（除非 task 显式授权）。

---

## 2. 目录结构

```text
docs/harness/
  README.md                 # 本文件
  invokes/
    README.md
    MIGRATION_flat_invoke_index.md   # 扁平 → by-task 索引（2026-06-02）
    by-task/<task_slug>/             # invoke 唯一合法路径
  reviews/
    README.md
    task_*_audit_*.md       # 22 审查结论
```

---

## 3. 落盘 taxonomy（与后端 §2.1 对齐 · 2026-05-31）

| 树 | 目标路径 | 内容 |
|----|----------|------|
| **prompts** | 工作区 `Projects/docs/harness/prompts/` | `hats/` · `templates/` · `handoff/` |
| **invokes** | `invokes/by-task/<task_slug>/` | `invoke_YYYYMMDD_<帽号>_<slug>.md` |
| **reviews** | `reviews/` 或 `reviews/by-task/<task_slug>/` | `task_<slug>_audit_R<轮次>_YYYYMMDD.md` |
| **50** | `docs/tasks/reinspect_results/` | `reinspect_<slug>_YYYYMMDD_vN.md` |
| **验收清单** | `docs/tasks/reinspect_results/` | `CHECKLIST_<task_basename>_acceptance_zh.md`（`acceptance_interaction: required` 时关账前必有） |

**新落盘（2026-05-31 起 · 2026-06-02 迁移完成）**：invoke **必须**进 `invokes/by-task/<task_slug>/`。根目录 **禁止** 新增 `invoke_*.md`；历史见 [`invokes/MIGRATION_flat_invoke_index.md`](invokes/MIGRATION_flat_invoke_index.md)。

**当前 pilot slug**（5-3）：`chatbi-v3-lowconf-rag-preview-frontend` · 见 `docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md`。

**Portfolio W1**（2026-06-01 · done）：`portfolio-site-mode-nav-v1` · [`../tasks/done/task_portfolio_site_mode_nav_v1.md`](../tasks/done/task_portfolio_site_mode_nav_v1.md)

**Portfolio W5**（2026-06-01 · active）：`portfolio-content-sync-v1` · LoopTask · [`../tasks/specs/PROMPT_looptask_startup_portfolio_w5_v1_zh.md`](../tasks/specs/PROMPT_looptask_startup_portfolio_w5_v1_zh.md)

---

## 4. 新建 task 必填（KPI v1.2 · + wiki_delta 2.18）

| 字段 | 约定 |
|------|------|
| `test_strategy` | `required` \| `recommended` \| `not_applicable` |
| `kpi_rubric` | `KPI_RUBRIC_v1_2` |
| `kpi_aggregator` | 默认 **`CLOSE`**（长链单窗口试点可用 `00`） |
| `wiki_delta` | 路径 / `none` / `n/a`（**缺字段 close BLOCK**） |
| `wiki_delta_note` | `none` / `n/a` 时 **必填**；本仓无 WikiTrack 时用 `n/a` + note |
| 关账前 | 正文 **`### KPI（00）`**（节名保留；由 `kpi_aggregator` 填写） |
| `failure_paths` | 建议独立表（见 `TASK_TEMPLATE.md`） |
| 经验晋升 | `experience_capture=required` 且 `wiki_delta=path` 时，经验节须含 `Wiki:` / `wiki_promoted:` / `coding_wiki` 指针 |

模板真值：`docs/tasks/templates/TASK_TEMPLATE.md`。

---

## 5. 关账最低要求（前端 · 摘要）

> `test_strategy: required` 的实现类 task：**40 之后默认跑 50** 并落盘 `reinspect_results/`。

1. **22**：`docs/harness/reviews/`（或 `reviews/by-task/<slug>/`）无阻塞，或 task 内书面结论  
2. task **`### 自检结论（执行者）`**（40）  
3. **`docs/tasks/reinspect_results/reinspect_*.md`**（50 · Fresh Context）  
4. **`human_gate`** → `approved`（仅人改）  
5. **CI 绿**（根 `AGENTS.md` §8 / 工作区 `Projects/AGENTS.md` §8）：  
   `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test` → `pnpm build`  
6. **`### KPI（00）`** 已填且含 Task_KPI% 与语义状态  
7. **`acceptance_interaction: required`** 时：[`CHECKLIST_*_acceptance_zh.md`](../tasks/reinspect_results/) 已落盘 · 维护者 §H 已签（或 task 载明豁免）  

---

## 6. 前后端 taxonomy 对照（P1-4 + KPI P0）

| 维度 | 前端仓（本目录） | 后端仓基线 | parity |
| --- | --- | --- | --- |
| prompts | 工作区单源（消费） | `docs/harness/prompts/`（rsync 真值） | ✅ 前端不复制 |
| invokes | `invokes/by-task/<slug>/` | 同左 | ✅ P0 已约定 |
| reviews | `docs/harness/reviews/` | `docs/harness/reviews/by-task/` | ✅ |
| 50 复检 | `docs/tasks/reinspect_results/` | `docs/tasks/reinspect_results/` | ✅ |
| KPI 字段 | `TASK_TEMPLATE` + task 元信息表 | `docs/tasks` + §5.8 | ✅ P0 |
| 工作区 task | `docs/harness/tasks/` | 同左 | 跨仓时 Open `Projects/` |

---

## 7. 前端基准 slug（已锁定）

> `HG-FRONTEND-GOLD-SLUGS` **approved**（2026-05-27）· 工作区 `task_harness_frontend_p1_4_wiki_parity_v1` 已关账。

- `frontend-tech-graph-v2-manifest`
- `frontend-vercel-ai-sdk-main-stream`
- `frontend-unified-chat-typewriter-v0`

---

## 8. 约束重申

- 不修改 `ai-ink-brain-api-python/api/`。
- 不新增或改写后端 `docs/coding_wiki/syntheses/`。
- 关账 PR 描述需引用 AB-REP scorecard（若 task 要求）：`60.8%–77.3%` 与 `5/6 W 4/4`。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-05-27 | P1-4 parity 对照表 |
| 2026-05-31 | KPI v1.2 P0：§1–§5、by-task invoke、关账与 VERIFY |
| 2026-06-02 | invokes 扁平 → by-task 迁移完成 · MIGRATION 索引 |
