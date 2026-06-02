# Prompt · Portfolio W2 LoopTask 启动（00 开帽 → 止于 50）

> **用途**：**新对话**粘贴 **§3 全文**；由 **00 总调度** 编排 **`looptask`** 帽链，**停止于 50**（不关账）。  
> **Open Folder**：`ai-ink-brain`（跨仓读 docs / articles 时 `@` `Projects/`）  
> **task 草案**：[`content/tasks/active/task_portfolio_content_pages_v1.md`](../active/task_portfolio_content_pages_v1.md)  
> **优先级**：**当前阻塞链第一棒**（后端 RUNBOOK 已 ready · 等 W2 静态页 + 后续 W3 秘钥后再 W6 五问）

---

## 1. LoopTask 帽链（冻结）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → STOP
```

| 帽 | 执行者 | 要点 |
|----|--------|------|
| **00** | 主 Chat | 扫 task `harness_mode`/`stop_after_hat`/gates；派 10 |
| **10** | 主 Chat semi_auto | 细化验收·failure_paths·§4.6 范围；**HG-TASK-DRAFT** 后人批 |
| **22 R1** | 主 Chat | **强制落盘** reviews；阻塞 → **仅回 10** |
| **30–40** | 主 Chat semi_auto | 三路由 + loader + 根页 §4.6 + 308；40 回填自检 |
| **22 R2** | 主 Chat | 签收/关闭节 |
| **50** | **Task 子代理** | Fresh Context · reinspect 落盘 |
| **STOP** | — | **不 CLOSE** · **不** `git mv` done · 等人 `HG-REINSPECT` |

---

## 2. 前置

| 项 | 状态 |
|----|------|
| W1 | `task_portfolio_site_mode_nav_v1` **done**（#47 · `main` @ `3d23698`） |
| W5 | `task_portfolio_content_sync_script_v1` **done**（三目录 MVP · 当前仅 vol3 + stub） |
| Epic SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) **active** · `PORTFOLIO-RAG-DEMO@2026-06-01` · **§4.6 演示页真值** |
| 分支 | **`task/portfolio-content-pages-v1`**（从 `main` 拉 · 勿在 `main` 直推） |
| 投递计划 | `docs/planning/投递冲刺_20260609_v1_zh.md` §1 P0-B · §3.1（根 `/` · 公开区零鉴权） |

**本 task 不做的后续包（勿扩 scope）**：W3 访客秘钥 · W4 Unified 裁剪 · W6 五问/录屏 · sync 脚本扩五卷（可另开 W5 补丁 · 非 W2 硬门槛）

---

## 3. 可复制 Prompt 正文（从下一行起 · 00 开帽）

```text
## 角色

你是 **Harness 00 总调度 + LoopTask 编排 Agent（Portfolio W2 · content-pages）**，严格遵循：
- docs/harness/prompts/00-orchestrator.md
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md（换帽 invoke + commit；**stop_after_hat: 50** 时不 CLOSE）
- docs/harness/SDD_HAT_FLOW.md §5.3（10↔22 打回）
- content/tasks/active/task_portfolio_content_pages_v1.md（harness_mode: looptask）
- content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.2 · §4.6 · §6.2 · §6.2.1 · §7 W2）
- ai-ink-brain/AGENTS.md §8

Open Folder = ai-ink-brain
git_branch = task/portfolio-content-pages-v1
task_slug = portfolio-content-pages-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01
stop_after_hat = 50

## LoopTask 硬规则

1. **帽序**：00 → 10 → 22(R1) → [10↔22 直至 R1 放行] → 30 → 40 → 22(R2) → **Task 50** → **STOP**
2. **跳过 20**；**禁止** 无 22 R1 书面进 30
3. **22 R1 阻塞**：只回 **10** 改 task（或 SPEC 变更请求），输出 blocking 清单 + 下一棒 10 Prompt
4. **50 必须 Task 子代理**；主会话只收短报告
5. **到达 50 且 reinspect 落盘后 STOP**：**不** 输出 CLOSE · **不** `git mv` done · **不**代填 HG-REINSPECT
6. 换帽前：invoke §3 全文 → `content/harness/invokes/by-task/portfolio-content-pages-v1/` → commit

## 人工闸（初态全 pending）

- HG-TASK-DRAFT → 10 定稿后人批 → 才派 22 R1
- HG-AUDIT-R1 → 22 R1 书面通过后人批 → 才进 30
- HG-REINSPECT → 50 后人批（Agent 不停在关账）

## W2 业务真值（SPEC §4.6 · 不得弱化）

| 路由 | 鉴权 | 交付 |
|------|------|------|
| `/` | 无 | **根演示首页**（§4.6.1 四卡 + 作者文案 · **非** redirect 到 /methodology） |
| `/resume` `/methodology` `/evidence` | 无 | MD 渲染 · F1 语料缺失时页内说明非 500 |
| `/unified-chat` | W1 已有 NAV | **本 task 不改** unlock 逻辑 |

**§4.6.0 去 Ink（W2 必含 W1 余量）**
- Nav 主标题：**刘新宁**（默认；若 task 已拍板「Cyning · 刘新宁」则一致）
- 副标题：**AI Coding · RAG 演示** 或 **求职演示站**
- 根页：去掉「水墨 / Cyning / Ink」对外叙事 → §4.6.1 示例结构
- 页脚：**© {year} 刘新宁** · 演示站
- metadata：刘新宁 · AI Coding / Agent 应用

**§2.8 必修复**
- 从 `/` NAV `<Link>` 进 `/resume`：`GET /resume?_rsc=*` **非 404**

---

### 【当前棒：00 → 派 10】

输出：
1. 扫描 task 草案缺口（验收 / failure_paths / §4.6 与 task 范围是否一致）
2. Nav 主标题待确认项（§4.6.0 二选一）写入待确认 ≤1 条
3. 下一棒 **10 需求帽** 可复制 Prompt（含必读 SPEC 节）
4. Judgment（experience_capture / gate/risk / hat_self）

**禁止**：直接写 `app/resume/page.tsx`（属 30）

---

### 【帽 10 · 模板精神】

真值：docs/harness/prompts/10-requirements.md · TEMPLATE-requirements-invoke.md

须补齐/确认：
- `getPortfolioDoc(category)` vs 扩展 `mdx-posts.ts` 的隔离策略（**禁止** 暴露 `content/tasks/`、`content/harness/`）
- `/methodology` 索引页 vs 单篇 slug 路由（SPEC §4.6.3）
- portfolio 下 `/about` → `/resume` **308** 实现位（middleware vs page 分支）
- development 模式回归：blog/chat 不受影响；portfolio 路由在 development 下是否可读（task F4）
- 与 W3/W4/W6 边界复述

交付：更新 task 正文 → 建议人改 HG-TASK-DRAFT → **自动进入 22 R1**（若 gate 仍 pending 则 STOP 报 gate_id）

---

### 【帽 22 R1 · 强制】

真值：22-task-audit.md · 落盘 `content/harness/reviews/task_portfolio_content_pages_v1_audit_R1_YYYYMMDD.md`

- **阻塞** → 回填清单 → **下一棒 10**（LoopTask 回路）
- **放行** → 建议 HG-AUDIT-R1 → 下一棒 30

---

### 【帽 30 · 执行】

**范围（最小闭环）**
1. `app/resume/page.tsx` · `app/methodology/page.tsx`（+ 可选 `[...slug]`）· `app/evidence/page.tsx`
2. `lib/content/get-portfolio-doc.ts`（或等价 loader）
3. portfolio 根页：`app/page.tsx` + `site-nav.tsx` + `home-modules.tsx`（§4.6.0/§4.6.1）
4. `/about` → `/resume` 308
5. 增量 `docs/_tech_graph/10_flow_route*.md` + `_manifest.json`

**验证（必跑）**
- `pnpm lint` · `pnpm test` · `pnpm build`
- `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`
- 目视或 curl：`/` · `/resume` · `/methodology` · `/evidence` 200
- DevTools：从 `/` `<Link>` → `/resume`，`?_rsc` 非 404

**禁止**：W3 unlock · W4 chip · Python API 改动 · 删旧路由

---

### 【帽 40 · 自检】

回填 task `### 自检结论`；含 portfolio build 摘要 + `_rsc` 验收结论 + development 回归一句

---

### 【帽 22 R2 · 签收】

落盘 `content/harness/reviews/task_portfolio_content_pages_v1_audit_R2_YYYYMMDD.md` · 签收/关闭节 → 派 Task 50

---

### 【帽 50 · Task 子代理 · STOP】

Fresh Context · 对照 task 验收 + SPEC §6.2 子集 · 只读为主

落盘：`content/tasks/reinspect_results/task_portfolio_content_pages_v1_reinspect_YYYYMMDD.md`

**STOP 输出**：
```text
LoopTask 已止于 50
reinspect:（路径）
合并建议：（来自 50 短报告 · 目标 merge → main）
待人工：HG-REINSPECT · CLOSE · git mv done
下一 Epic：W3 visitor-auth（另开 LoopTask）
```

## 给 Cursor

looptask、00、10、22、30、40、50、stop_after_hat、portfolio-content-pages-v1、§4.6、根首页
```

---

## 4. 开跑前人工 1 分钟

| # | 动作 |
|---|------|
| 1 | Open Folder = **`ai-ink-brain`** |
| 2 | `git checkout main && git pull` → `git checkout -B task/portfolio-content-pages-v1` |
| 3 | 确认 `content/resume/` · `methodology/` · `evidence/` 有 W5 文件（缺则先 `tools/sync-portfolio-content.sh`） |
| 4 | 新 Chat 粘贴 **§3 全文** |
| 5 | **10 定稿后** 你改 task 内 `HG-TASK-DRAFT` → `approved`，再让 Agent 进 22 R1 |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-01 | v1：W2 LoopTask · 含 §4.6 根页/去 Ink · `_rsc` 验收 · 止于 50 |
