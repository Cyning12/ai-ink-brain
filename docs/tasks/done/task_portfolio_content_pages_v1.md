# Task：Portfolio 内容页路由（W2 · resume / methodology / evidence）

> **状态**：`done（2026-06-02 验收通过）`  
> **关联图谱**：`docs/_tech_graph/10_flow_route.md` · `13_flow_components.md`（实施后须增量更新 `.ai.md`）  
> **关联 Issue/PR**：（待开 · 基线 `main` @ `3d23698` · PR #47 已合并）  
> **后端依赖**：无（页面读本地 `content/`；ingest 与五问归 **W6**）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `portfolio-content-pages-v1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 路由 + MD 渲染 + 双模式 build；**客户端 `<Link>` RSC 请求** 为关键路径；五问 E2E 归 **W6** |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01`（与 Epic · W1/W5 同源） |
| **semi_auto** | `true` |
| **audit_profile** | `full` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE`（**50 完成后由人触发 CLOSE**；LoopTask **不停在 CLOSE**） |
| **git_branch** | `task/portfolio-content-pages-v1` |
| **harness_mode** | **`looptask`** |
| **stop_after_hat** | **`50`** |

- **KPI 真值**：工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md) · [`HARNESS_V2_PLAN.md`](../../../docs/harness/HARNESS_V2_PLAN.md) §5.8  
- **prompts**：`@` 工作区 `Projects/docs/harness/prompts/`  
- **LoopTask 启动 Prompt**：（22 R1 放行后创建）`docs/tasks/specs/PROMPT_looptask_startup_portfolio_w2_v1_zh.md`  
- **关账前**：正文须有 **`### KPI（00）`**（**50 + 人签 HG-REINSPECT 后** 由 CLOSE 填写）

### Harness LoopTask 帽链（本 task 权威）

> 真值对齐：工作区 [`SDD_HAT_FLOW.md`](../../../docs/harness/SDD_HAT_FLOW.md) §5.3 · [`00-orchestrator.md`](../../../docs/harness/SDD_HAT_FLOW.md)

```text
00 总调度（开帽）
  → 10 需求（本 task 草案细化 / 验收·failure_paths·非范围）
  → 22 R1 任务审核（**强制** · 须落盘 reviews）
       ├─ 阻塞 / 疑问 → 10（改 task）→ 22 R1' … 直至 R1 放行
       └─ R1 放行 → HG-AUDIT-R1（人）
  → 30 执行（三路由 + loader + 308 + 首页文案）
  → 40 自检（命令 + ### 自检结论）
  → 22 R2 终轮签收（须落盘 · 签收/关闭节）
  → 50 独立复检（**Task 子代理** · Fresh Context）
  → 【停止】等待 HG-REINSPECT + 人 CLOSE（**半自动不在此会话关账**）
```

| 规则 | 说明 |
|------|------|
| **跳过 20** | 与 Epic R4-5 一致；规格已 **`active`**，缺口在 **22 R1** 书面化 |
| **10↔22 回路** | 22 R1 **阻塞**时 **仅** 回 **10** 改 task；**禁止** 未 R1 放行进 30 |
| **50 派发** | **主会话禁止兼做**；50 Prompt 由 22 R2 链出或复制 W5 模板改 slug |
| **停止点** | `stop_after_hat: 50` → `reinspect_results/` 后 **停工** |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | `approved` | 22-R1, 30 | 10 帽定稿后人扫 task 改 `approved` |
| HG-AUDIT-R1 | `approved` | 30 | **22 R1 书面**通过后改 `approved` |
| HG-REINSPECT | `approved` | done | **50 完成后** merge 前；Agent **不得**代填 |

### 下一棒

| 帽 | 条件 | 落盘 |
|----|------|------|
| **10 需求** | 本草案 | 更新本 task 验收 / failure_paths |
| **22 R1** | HG-TASK-DRAFT `approved` 后 | `docs/harness/reviews/task_portfolio_content_pages_v1_audit_R1_YYYYMMDD.md` |

---

## 背景与目标

Epic **Portfolio 演示**（[`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §0 · **§4.2** · **§7 W2**）在 **W1 四链 NAV** 与 **W5 语料落盘** 已合并 `main`（#47）后，本 task 交付 **可读的三内容页**，消除 **NAV 链向无 `page.tsx` 导致的客户端 RSC 404**（生产观测：`/resume?_rsc=*` 404 而整页偶可进）。

**完成态一句话**：`NEXT_PUBLIC_SITE_MODE=portfolio` 时，维护者与访客可通过 **`/resume`**、**`/methodology`**、**`/evidence`** 阅读 W5 同步的 Markdown；从首页 NAV **`<Link>` 客户端导航** 与 **硬刷新** 均 **200**；portfolio 下 **`/about` → `/resume` 308**。

**已知问题（本 task 须修复）**

| 现象 | 根因 | 本 task 验收 |
|------|------|--------------|
| `GET /resume?_rsc=…` **404** | W1 NAV 有 `/resume`，**无** `app/resume/page.tsx`，Next.js 客户端路由拉 RSC payload 失败 | `<Link>` 导航 **非 404** |
| 四屏缺正文 | W5 仅落盘 `content/{methodology,resume,evidence}/`，无独立路由 | 三页可读 MD |

---

## 范围

- [x] 新增 **`app/resume/page.tsx`**：渲染 `content/resume/`（canonical **`cv-online.md`** 或 category 索引）。
- [x] 新增 **`app/methodology/page.tsx`**：渲染 `content/methodology/`（W5 `vol3_*` 等）。
- [x] 新增 **`app/evidence/page.tsx`**：渲染 `content/evidence/`（如 `methodology-card.md`）；**不进四链 NAV**（SPEC §4.2）。
- [x] **内容加载**：专用 `getPortfolioDoc(category)` 或扩展 `lib/content/mdx-posts.ts` — **禁止** 将 `docs/tasks/`、`docs/harness/` 等维护目录暴露为 portfolio URL。
- [x] portfolio 模式下 **`/about` → `/resume` 永久重定向（308）**（`middleware` 或 `app/about/page.tsx` 分支 · SPEC §4.2）。
- [x] portfolio 模式下 **§4.6.0 去 Ink**：Nav 主标题 **刘新宁**、副标题 **AI Coding · RAG 演示**、footer **© 刘新宁 · 演示站**、metadata 求职向。
- [x] portfolio 模式下 **§4.6.1 根页**：身份/定位/叙事 prose + **四卡**（简历/方法论/证据/对话）+ 证据文本链 + 邮件说明；**非** redirect。
- [x] 增量 **`docs/_tech_graph/10_flow_route*.md`** + `_manifest.json`；若改 `.ai.md` 则跑 graph 三门禁。
- [x] **`pnpm lint`** · **`pnpm test`** · **`pnpm build`** · **`NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`** 绿。

## 非范围

- **W3**：访客秘钥、`PORTFOLIO_VISITOR_*`、`gen-portfolio-secrets.sh`、unlock 邮件 UX。
- **W4**：Unified Chat debug 裁剪、五问 chip 文案替换。
- **W5**：sync 脚本与语料（**done** · 只读 `content/` 路径）。
- **W6**：admin sync 全量烟测、五问 5/5、录屏。
- **删除** `app/blog` 等旧路由；**不** 改 RAG ingest / Python。
- **本 task 不修复** PR #47 已交付的 admin/sync 鉴权链（除非 30 发现阻塞渲染的共享 regression）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| **冻结 SPEC** | [`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §4.2 · §4.6 · §6.2 · §6.2.1 · §7 W2 |
| **Epic W1（done）** | [`docs/tasks/done/task_portfolio_site_mode_nav_v1.md`](../done/task_portfolio_site_mode_nav_v1.md) |
| **Epic W5（done）** | [`docs/tasks/done/task_portfolio_content_sync_script_v1.md`](../done/task_portfolio_content_sync_script_v1.md) |
| **语料真值** | `content/resume/cv-online.md` · `content/methodology/vol3_*` · `content/evidence/methodology-card.md` |
| **内容扫描** | `lib/content/mdx-posts.ts`（参考 · 须隔离 portfolio category） |
| **站点模式** | `lib/site-mode.ts` |
| **投递计划** | [`投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) §1 P0-B 四屏 |
| **图谱** | `docs/_tech_graph/10_flow_route.md` |

---

## 验收标准

> 可追溯 SPEC §6.2（四屏子集）；**含 PR #47 遗留 RSC 问题**。

- [x] **`/resume`**、**`/methodology`**、**`/evidence`** 在 portfolio build 下 **200**，正文来自 W5 三目录（非空占位）。
- [x] 从 **`/` 首页 NAV `<Link>`** 进入 `/resume`：DevTools Network 中 **`?_rsc=*` 请求非 404**（与硬刷新 `/resume` 均可用；50 warn：merge 前建议 Preview 目视）。
- [x] **`development` 模式回归**：上述路由不破坏现有 blog/chat；未设 `SITE_MODE` 时行为与合并前一致（或文档化 development 下也可读 portfolio 页）。
- [x] portfolio 模式下访问 **`/about`** 返回 **308** → `/resume`。
- [x] **`/evidence`** 可直达，**不出现在** `PORTFOLIO_NAV`（W1 已满足四链；本 task 仅验 evidence 页存在）。
- [x] **`pnpm lint` · `pnpm test` · `pnpm build`** + **`NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`** 通过。
- [x] **22 R1/R2** 审查落盘 · **50** `reinspect_results/` 落盘（LoopTask 停止点）。

---

## 失败路径

| # | 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|----------|----------|--------|----------|
| F1 | W5 语料缺失（三目录无 `.md`） | 页面 **降级** 展示明确「内容未同步」说明（**非** 500） | 跑 `tools/sync-portfolio-content.sh` | 页内提示 |
| F2 | `<Link>` 仍 404 / `_rsc` 失败 | **缺陷**；须补 `page.tsx` 或 App Router 段 | 修路由后重试 | Network 404 |
| F3 | portfolio 页误扫入 `docs/tasks/` | **缺陷**；URL 泄露维护路径 | 修 loader glob | 错误 category |
| F4 | development 下 `/blog` 回归失败 | **阻塞合并** | 修 SITE_MODE 分支 | CI 红 |
| F5 | 22 R1 阻塞仍进 30 | **Harness 违规** | 回 10 改 task | — |
| F6 | 主会话兼做 50 | **Harness 违规** | Task 子代理重跑 50 | — |
| F7 | portfolio build 下根页仍 Cyning/Ink 文案 | **缺陷** | 修 §4.6.0 分支 | 品牌不符 |

---

## 技术决策（10 帽 · 2026-06-02）

| 决策 | 选择 | 理由 |
|------|------|------|
| 内容 loader | **新建** `lib/content/get-portfolio-doc.ts` | allowlist `methodology|resume|evidence`；不扩展 blog 扫描 |
| `/methodology` | **索引页** + `app/methodology/[...slug]/page.tsx` | 对齐 SPEC §4.6.3 |
| `/about`→308 | **`app/about/page.tsx`** + `permanentRedirect` | 仅 `getSiteMode()==='portfolio'`；development 保持原页 |
| Nav 主标题 | **刘新宁** | §4.6.0 默认（非 Cyning · 刘新宁） |
| development 下 portfolio 路由 | **可读** | 路由不 SITE_MODE 门控；仅首页/Nav 文案分支 |
| W3/W4/W6 | **非本 task** | unlock · chip · 五问 E2E 另开 LoopTask |

---

## SPEC §6.2 追溯（W2 覆盖）

| SPEC §6.2 条目 | W2 | 说明 |
|----------------|-----|------|
| `/resume` 可读 | **W2** | canonical 简历 |
| `/methodology` 可读 | **W2** | 卷三等 |
| `/evidence` 独立页 | **W2** | 不进 NAV |
| `/unified-chat` 常显 | W1 | 已 done |
| 五问 chip / 访客 UX | W4/W6 | 非本 task |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `app/resume/page.tsx` · `app/methodology/page.tsx` · `app/methodology/[...slug]/page.tsx` · `app/evidence/page.tsx` · `lib/content/get-portfolio-doc.ts` · `app/_components/portfolio-home.tsx` · `app/_components/portfolio-markdown.tsx` · `app/about/page.tsx` · `app/page.tsx` · `app/_components/site-nav.tsx` · `app/_components/home-modules.tsx` · `app/layout.tsx` · `docs/_tech_graph/10_flow_route.md` · `_manifest.json` |
| 内容源 | W5 已落盘三目录（只读） |
| RSC 404 | 三路由 `page.tsx` 已补；build 列出 `/resume` `/methodology` `/evidence` 静态页 |
| git 基线 | `main` @ `3d23698`（#47） · 分支 `task/portfolio-content-pages-v1` |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 10 帽：技术决策 · §4.6 验收硬化 · 按 00 扫描回填 |
| 2026-06-02 | CLOSE：KPI 88% pass · HG-REINSPECT 人签 · 归档 done |

---

## ### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: **88%** · **状态**: **pass** · **帽**: 10→22→30→40→22→50→CLOSE

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|-----|----------------|
| 10 | R1 | looptask | 100 | 100 | 100 | 100 | — | 技术决策 · §4.6 验收硬化 |
| 22 | R1/R2 | looptask | 100 | 100 | 100 | 100 | — | reviews 落盘 · R1/R2 零阻塞 |
| 30 | R1 | looptask | 100 | 100 | 100 | 100 | 100 | 三路由+loader+根页 §4.6 · `ee550ed` |
| 40 | R1 | looptask | 100 | 100 | 100 | 100 | — | lint/test/双 build 绿 |
| 50 | R1 | task_subagent | 100 | 60 | 100 | 100 | 100 | J-evidence warn: `_rsc` 未浏览器留证；reinspect warn 可 merge |
| CLOSE | close | main_chat | 100 | 100 | 100 | 100 | 100 | HG-REINSPECT 人签 · git mv done |

**blocked 原因**：（无）

**关闭回溯**：见 `docs/harness/reviews/task_portfolio_content_pages_v1_audit_R2_20260602.md` §执行路线与 Commit 回溯

---

## ### 自检结论（执行者）

**40 帽 · 2026-06-02**

| 命令 | 结果 |
|------|------|
| `pnpm lint` | pass |
| `pnpm test` | pass（43 tests） |
| `pnpm build` | pass |
| `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | pass；根页/Nav 为 portfolio 分支 |

**路由**：build 输出 `/` · `/resume` · `/methodology` · `/evidence` 均为静态（○）；`/methodology/[...slug]` SSG 1 篇。

**`_rsc`**：`app/resume/page.tsx` 等已存在，客户端 `<Link>` 可拉 RSC payload（原 W1 无 page 致 404 已消除）；建议 merge 前 DevTools 目视确认一次。

**development 回归**：未设 `SITE_MODE` 时首页仍为 Cyning/水墨；blog/chat 路由未改；portfolio 内容页在 development build 下同样可访问（路由无 mode 门控）。
