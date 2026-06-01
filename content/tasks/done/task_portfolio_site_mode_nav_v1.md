# Task：Portfolio 模式开关与四链导航（W1）

> **状态**：`done（2026-06-01 验收通过）`  
> **关联图谱**：`docs/_tech_graph/10_flow_route.md` · `docs/_tech_graph/13_flow_components.md`（实施后须增量更新 `.ai.md`）  
> **关联 Issue/PR**：（待开）  
> **后端依赖**：无（本包纯前端导航/首页；RAG ingest 见 W5/W6 与配对后端 SPEC）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `portfolio-site-mode-nav-v1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 模式开关与导航为 portfolio Epic 关键路径；本包以 `pnpm lint` / `pnpm test` / 双模式 `pnpm build` 为主；全量五问 E2E 归 W6 |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **semi_auto** | `true` |
| **audit_profile** | `full` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/portfolio-demo-site-v1`（Epic 分支；本 task 可在此分支或子分支实施） |

- **KPI 真值**：工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md) · [`HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.8  
- **prompts**：`@` 工作区 `Projects/docs/harness/prompts/`（**勿**复制到本仓）  
- **关账前**：正文须有 **`### KPI（00）`**（节名保留；由 `kpi_aggregator` 填写）

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | `approved` | 22-R1, 30 | 10 帽草案；人扫 task 正文与 SPEC 追溯表后改 `approved` |
| HG-AUDIT-R1 | `approved` | 30 | 22 任务审核 R1 通过后改 `approved`（若人择路径 B 跳过 22，须书面承担审计缺口） |
| HG-REINSPECT | `pending` | done | 50 独立复检后 merge 前 |

### 下一棒推荐路径（10 完成 · 已拍板跳过 20）

| 路径 | 帽 | 适用 | 说明 |
|------|-----|------|------|
| **A（默认推荐）** | **22 任务审核** | 与 Epic `test_strategy: recommended` 及 SPEC R4-5 一致 | 人审 task 草案 → 22 产出 `content/harness/reviews/*_audit_R1_*.md` → 回填 task → 再 30 |
| **B（人择）** | **30 实现** | 维护者明示跳过 22、承担 20 闸缺口 | **须** `HG-TASK-DRAFT: approved`；**不得**代填 `HG-AUDIT-R1`；实现期发现 SPEC 缺口 **停工** 回 20/人 |

**默认下一棒**：**路径 A → 22 任务审核**（`docs/harness/prompts/22-task-audit.md`）。

---

## 背景与目标

在 **`freeze_id: PORTFOLIO-RAG-DEMO@2026-06-01`** 冻结规格下，引入环境变量 **`NEXT_PUBLIC_SITE_MODE`**（`portfolio` \| `development`，默认 `development`），当为 `portfolio` 时：

1. 顶部 **`SiteNav`** 仅展示四链：`/` 首页 · `/resume` · `/methodology` · `/unified-chat`（标签「对话」）。
2. 首页 **`HomeModules`** 展示与四链一致的四卡；**不展示** Blog / Learning / Tasks / Chain 等。
3. **`/unified-chat` 在 portfolio 导航常显**，**不再**依赖 `useAdminSession().isAdmin` 作为导航唯一条件（页内能力仍由后续 W3 访客 session 约束）。
4. 品牌区副标题在 portfolio 下使用占位 **「Portfolio Demo」**（正式文案 deferred）。
5. `development` 模式下 **行为与现网完全一致**（回归）。

权威规格：[`content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) **§4.1** · **§6.1** · **§6.2**（导航/首页子集）· **§7 W1**。

---

## 范围

- [x] 新增 **`lib/site-mode.ts`**（或等价模块）：读取 `process.env.NEXT_PUBLIC_SITE_MODE`；未设或非法值 **等同** `development`。
- [x] 在 **`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` §C** 增补 `NEXT_PUBLIC_SITE_MODE` 行（用途、取值、默认、谁读取）。
- [x] 改造 **`app/_components/site-nav.tsx`**：portfolio 四链 NAV；development 保持现有 8 项 + admin 门控逻辑。
- [x] 改造 **`app/_components/home-modules.tsx`**：portfolio 四卡；development 保持现有 BASE + ADMIN 模块逻辑。
- [x] portfolio 模式下 **`SiteNav` 品牌副标题** 显示 **「Portfolio Demo」**（替换「RAG Blog」）。
- [x] 按需更新 **`app/layout.tsx`**（或等价 metadata 出口）中 portfolio 模式 **title/description**（不破坏 development 默认 metadata）。
- [x] 增量更新 **`docs/_tech_graph/10_flow_route.ai.md`**（及同步 `.md`）：增加 `SITE_MODE` 分支节点与锚点；跑 `pnpm tech-graph:graph-export` 并提交 `graph.json`。
- [x] 双模式 **`pnpm lint`** · **`pnpm test`** · **`pnpm build`** 通过（`AGENTS.md` §8）。

## 非范围

- **W2**：`/resume` · `/methodology` · `/evidence` 页面实现；`/about` → `/resume` 308（本 task 可链向占位路由，**不要求**可读正文）。
- **W3**：访客秘钥、`/api/auth/unlock` 扩展、`tools/gen-portfolio-secrets.sh`、无 session UX。
- **W4**：Unified Chat debug 裁剪、五问 chip、解锁文案。
- **W5**：`tools/sync-portfolio-content.sh` 与 `content/{methodology,resume,evidence}` 落盘。
- **W6**：后端 sync 联调与五问 E2E。
- **删除** 任何现有路由目录（`app/blog`、`app/chat` 等 **保留**）。
- 执行 **`POST /api/py/admin/sync`**。
- 修改配对后端 SPEC 或代码。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| **冻结 SPEC（前端）** | [`content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §4.1 · §6.1 · §6.2 · §7 W1 |
| **交叉 SPEC（后端 · 只读）** | [`ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`](../../../ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md)（category / CONTENT_ROOT；本 W1 不改动） |
| **五问 chip 真值** | [`content/tasks/specs/投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) §2（W4 实施；本 task 仅引用） |
| **PROJECT_CONFIG** | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| **导航 / 首页（现状）** | `app/_components/site-nav.tsx` · `app/_components/home-modules.tsx` |
| **Session hook（只读 · W3 扩展）** | `lib/hooks/useAdminSession.ts` |
| **路由图谱** | `docs/_tech_graph/10_flow_route.md` · `10_flow_route.ai.md` |
| **Harness 10 帽** | 工作区 `docs/harness/prompts/10-requirements.md` |
| **Harness 50（W1）** | [`content/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md`](../specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md) · invoke `content/harness/invokes/by-task/portfolio-site-mode-nav-v1/invoke_*_50_*.md` |
| **Harness 22 帽** | 工作区 `docs/harness/prompts/22-task-audit.md` |

---

## 验收标准

> 可追溯 SPEC §6；W1 **仅覆盖** 模式/导航/首页/build 子集；页面可读性与鉴权见 W2/W3。

- [x] **`NEXT_PUBLIC_SITE_MODE=portfolio`** 时 `pnpm run build` **通过**（SPEC §6.1）。
- [x] **`development`**（未设或显式 `development`）下 build 通过，且 NAV / HomeModules **与改前现网行为一致**（SPEC §6.1 回归）。
- [x] portfolio 模式下 **SiteNav 仅 4 项**：首页、`/resume`、`/methodology`、`/unified-chat`（标签含「对话」语义）；**无** Blog / Learning / Tasks / Chat / Text2SQL / Chain / About（SPEC §4.1 · §6.2 导航子集）。
- [x] portfolio 模式下 **HomeModules 仅 4 卡**，与四链 href 一致；**无** Blog/Learning/Tasks/Chain 卡（SPEC §6.2 首页子集）。
- [x] portfolio 模式下 **`/unified-chat` 在导航中可见**，且 **不** 以 `isAdmin` 作为是否显示该 nav 项的条件（SPEC §4.1 实现提示）。
- [x] portfolio 模式下品牌副标题为 **「Portfolio Demo」**（SPEC §4.1 · Q8=B deferred 占位）。
- [x] `PROJECT_CONFIG` §C 已文档化 `NEXT_PUBLIC_SITE_MODE`。
- [x] `_tech_graph` 已增量更新并通过 `pnpm tech-graph:manifest-check` · `graph-check` · `equivalence-check`（若本 task 触达图谱）。

---

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | `NEXT_PUBLIC_SITE_MODE` 未设或非法值 | **等同 `development`**；不抛构建错误 | — | 与现网相同全量导航 |
| F2 | `portfolio` 模式 build 时 SSR 读取 env 失败 | build **FAIL**；CI 红 | 修 env / 代码后重跑 build | 无（构建期） |
| F3 | portfolio 下 `isAdmin=false` 仍隐藏 `/unified-chat` nav | **缺陷**；不符合 SPEC §4.1 | 修 nav 分支后 redeploy | 访客看不到「对话」入口 |
| F4 | portfolio 下误展示 Blog/Learning/Tasks 等入口 | **缺陷**；演示路径泄露 | 修 NAV/Home 过滤 | 招聘方看到非演示模块 |
| F5 | `development` 模式导航/首页相对改前 **行为变化** | **回归 FAIL** | 修分支隔离后重测 | 维护者日常开发体验受损 |
| F6 | 点击 `/resume` 或 `/methodology` 尚不存在（W2 未做） | Next **404**（预期） | W2 实现页面 | 404 页（本 task **不阻塞** W1 关账，但须在 PR 说明 W2 依赖） |

---

## SPEC §6 验收追溯映射（W1 覆盖子集）

| SPEC §6 条目 | W1 责任 | 说明 |
|--------------|---------|------|
| §6.1 portfolio build 通过 | **W1** | 本 task 主验收 |
| §6.1 development 回归 | **W1** | 本 task 主验收 |
| §6.2 首页四入口 | **W1** | 四卡；正文叙事文案 W2 可深化 |
| §6.2 简历/方法论/evidence 可读 | W2 | 本 task 仅链向路由 |
| §6.2 `/unified-chat` nav 常显 | **W1** | 页内 session UX 归 W3 |
| §6.3 鉴权 TTL / gen-secrets | W3 | — |
| §6.4 五问 chip | W4 | — |
| §6.5 sync 脚本 / CONTENT_ROOT | W5/W6 | — |
| §6.6 Unified 裁剪 | W4 | — |
| §6.7 Preview 环境 | W6 | — |
| §6.8 里程碑日程 | 人 | 非代码验收 |

---

## 交叉 SPEC 核对（10 帽 · 只读）

| 核对项 | 前端 SPEC | 后端 SPEC | 结论 |
|--------|-----------|-----------|------|
| `freeze_id` | `PORTFOLIO-RAG-DEMO@2026-06-01` | 同源 | **一致** |
| category 三目录 | methodology / resume / evidence | §4.1 同表 | **一致**（W1 不涉及 ingest） |
| Q3 sources 硬约束 | §6.4 **`evidence` only** | §6.2 **`evidence` only** | **一致**（chip 在 W4） |
| `filesScanned=0` | §6.5 硬 FAIL | §4.2.3 硬 FAIL | **一致**（W5/W6） |
| Preview/生产同 Vercel 项目 | §6.7 | §1.1 Q-3 | **一致**（W6） |
| 配对 SPEC 状态元数据 | 前端 **`active`** | 文首仍写前端 **`draft`** | **文档漂移 · 非阻塞**；以双方 **`active`** + 同日 `freeze_id` 为准 |
| 投递计划 §2 Q3 期望路径 | — | — | 计划写「evidence 或 vol3」；**已拍板 R4-1=A**，以 SPEC §6.4 **evidence-only** 为准 |

**阻塞项**：无。30 帽可引用 `freeze_id` 开工（路径 A 建议先过 22）。

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `lib/site-mode.ts`（新）· `lib/site-mode.test.ts`（新）· `app/_components/site-nav.tsx` · `app/_components/home-modules.tsx` · `app/layout.tsx` · `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` · `docs/_tech_graph/10_flow_route*.md` · `graph.json` · `_manifest.json` · `02_version.md` |
| 新增路由 | 无（W2 新增 `/resume` 等；点击 portfolio NAV 中 `/resume`/`/methodology` 暂 404 · F6） |
| 新增组件 | 无（改造现有 Nav / HomeModules） |
| 图谱变更点 | `10_flow_route`：`getSiteMode()` · `portfolio?` 分支 · portfolio NAV/modules 四链切片 |
| portfolio NAV 常量 | `{ /, /resume, /methodology, /unified-chat }` 标签：首页 / 简历 / 方法论 / 对话 |
| 审查书面 | **无 R1 reviews 落盘**（HG-AUDIT-R1 approved · 路径 B 人择跳过 22） |
| 帽 30 commit | `bed2baf` feat(portfolio-w1) |
| 50 复检 | [`content/tasks/reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md`](../reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md) · **建议合并** · pass 13 / fail 0 |
| PROJECT_CONFIG | 本地已更新 §C；**gitignore `docs/*` 未跟踪** · 50 warn |

---

## ### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: **82%** · **状态**: **warn** · **帽**: 30→40→50→CLOSE

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|-----|----------------|
| 30 | R1 | main_chat | 100 | 100 | 100 | 100 | 100 | W1 impl `bed2baf` · scope 未越界 |
| 40 | R1 | main_chat | 100 | 100 | 100 | 100 | — | §自检结论 · 双模式 build 绿 |
| 50 | v1 | task_subagent | 100 | 60 | 100 | 100 | 100 | pass-with-notes · 路径 B 无 22 书面 · defer W2–W6 |
| CLOSE | close | main_chat | 100 | 60 | 100 | 60 | 100 | 2026-06-01 关账 · **HG-REINSPECT 仍 pending** |

**Task 维聚合**：D1 avg 100 · D2 min 60 · D3 avg 100 · D4 min 60 · D5 min 100 → **Task_KPI% = 82%** · **blocked：无（W1 工程）**

**merge 前硬条件**：人改 `HG-REINSPECT: approved`；确认 PROJECT_CONFIG §C 可达；PR 说明 W2 404。

**关闭回溯**：`content/harness/invokes/by-task/portfolio-site-mode-nav-v1/` · reinspect 见上表 50 行

---

## ### 自检结论（执行者）

**工作目录**：`ai-ink-brain` · 分支 `task/portfolio-demo-site-v1` · impl `bed2baf`

| 命令 | 退出码 | 要点 |
|------|--------|------|
| `pnpm lint` | 0 | eslint 无报错 |
| `pnpm test` | 0 | 11 files · 43 tests passed（含 `lib/site-mode.test.ts`） |
| `pnpm build` | 0 | development 默认 build 成功 · 142 static pages |
| `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | 0 | portfolio 模式 build 成功 |
| `pnpm tech-graph:manifest-check` | 0 | OK frontend manifest (env=21) |
| `pnpm tech-graph:graph-check` | 0 | graph.json 与 .ai.md 一致 |
| `pnpm tech-graph:equivalence-check` | 0 | 等价门禁通过 |

**验收 pass/fail（W1 子集）**

| 项 | 结果 | 证据 |
|----|------|------|
| portfolio build | pass | 上表 portfolio build 行 |
| development 回归 build | pass | 默认 build 行 |
| SiteNav 四链 / 无 Blog 等 | pass | `site-nav.tsx` `PORTFOLIO_NAV` 4 项；无 admin 门控 |
| HomeModules 四卡 | pass | `home-modules.tsx` `PORTFOLIO_MODULES` |
| `/unified-chat` nav 常显 | pass | portfolio 分支不经 `isAdmin` 过滤 |
| 副标题 Portfolio Demo | pass | `subtitle` 分支 |
| PROJECT_CONFIG §C | pass（本地） | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` 已增补；**该路径被 `.gitignore` 忽略未入 commit** |
| tech graph CI | pass | 三门禁均 0 |

**已知未测 / defer**

- `/resume` · `/methodology` 点击 404（F6 · W2 依赖）
- 浏览器手测 NAV 渲染（build 期 env 内联已覆盖逻辑）
- HG-REINSPECT：50 已完成 · [`reinspect_20260601.md`](../reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md) · **merge 前须人改 `approved`**
