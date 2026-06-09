# Prompt 50 · Portfolio W1 · site-mode-nav · 独立复检（Task 子 Agent 专收）

> **用途**：子 task **`task_portfolio_site_mode_nav_v1`**（W1）在 **40 自检** 之后，由 **主会话 Agent** 经 **`Task` 工具** 派发 **50 帽**；子 Agent **不得** 携带 30 执行长上下文。  
> **对照后端样板**：`ai-ink-brain-api-python/docs/harness/invokes/by-task/portfolio-rag-demo/invoke_20260601_50_portfolio-rag-demo.md` · `…/coding-wiki-pilot/PROMPT_50_startup_coding-wiki-pilot-v1.md`  
> **Epic 总规**：[`PROMPT_50_invoke_portfolio_demo_site_v1_zh.md`](./PROMPT_50_invoke_portfolio_demo_site_v1_zh.md)（全 Epic W1–W6；**本文件为 W1 收窄变体**）  
> **真值帽**：工作区 [`docs/harness/prompts/50-independent-reinspect.md`](../../../../docs/harness/prompts/50-independent-reinspect.md) · [`TEMPLATE-independent-reinspect-invoke.md`](../../../../docs/harness/prompts/TEMPLATE-independent-reinspect-invoke.md)  
> **落盘**：invoke → `docs/harness/invokes/by-task/portfolio-site-mode-nav-v1/`；50 结论 → `docs/tasks/reinspect_results/`

---

## 1. 占位符（主 Agent 派发前须全部替换）

| 占位符 | 含义 | W1 当前真值（2026-06-01 · 30/40 已落盘） |
| --- | --- | --- |
| `{{TASK_PATH}}` | 子 task（相对 `Projects/`） | `ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md` |
| `{{SUBPROJECT_ROOT}}` | diff / 命令 cwd | `ai-ink-brain` |
| `{{GIT_BRANCH}}` | 工作分支 | `task/portfolio-demo-site-v1` |
| `{{REINSPECT_MODE}}` | 三选一 | `两者` |
| `{{DIFF_RANGE}}` | 复检 diff | `git diff origin/main...HEAD -- lib/site-mode.ts lib/site-mode.test.ts app/_components/site-nav.tsx app/_components/home-modules.tsx app/layout.tsx docs/_tech_graph/` |
| `{{AUDIT_REVIEW_PATH}}` | 22 终轮 / R2 签收 | **无**（路径 B 跳过 R1 书面 · HG-AUDIT-R1 人 pre-approve；R2 未落盘时 50 **须声明审计缺口**） |
| `{{FREEZE_ID}}` | task 声明 | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| `{{SPEC_PATH}}` | 冻结 SPEC | `ai-ink-brain/docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` |
| `{{IMPL_COMMIT}}` | 40 自检引用的实现 commit | `bed2baf`（以 task 自检节为准） |

---

## 2. 主 Agent：50 开帽前编排（硬）

### 2.1 前置条件（须同时满足）

| # | 条件 |
| --- | --- |
| P1 | task 内 **`### 自检结论（执行者）`** 已存在（40 帽回填） |
| P2 | **22 R2 签收**（`reviews/*_audit_R2_*.md`）**或** task 实现备忘已注明「路径 B · R1/R2 书面审缺位 · 人 pre-approve HG-AUDIT-R1」 |
| P3 | 合并前必绿在本仓已跑：`pnpm lint` → `pnpm test` → 双模式 `pnpm build` + tech-graph 三门禁（日志在 task 自检节） |
| P4 | **HG-REINSPECT** 仍为 `pending`（**不**阻塞派发 50；50 **完成后** 才由人改 `approved`） |

### 2.2 主 Agent 顺序（不可打乱）

```text
40 自检 commit → （可选 22 R2 签收 commit）
→ 将 §4 Handoff + §5 子 Agent §3 全文写入 invoke（by-task/portfolio-site-mode-nav-v1/invoke_YYYYMMDD_50_*.md）
→ commit invoke
→ Task 子代理（readonly=false）仅携带 §4 + §5
→ 收子 Agent 短报告（验收表 + Judgment + reinspect 路径）
→ 若 pass：主会话 HANDOFF_CLOSE_TRACE + 建议 task → done/（人改 HG-REINSPECT 后 merge）
→ 若 fail/block：打回 30，不关账
```

### 2.3 主 Agent 禁止

- 禁止在同一上下文内 **兼做** 50 复检（须 **Task 子代理**）  
- 禁止向子 Agent 粘贴 30 聊天全文  
- 禁止子 Agent 未落盘 `reinspect_results/` 即标 task `done`  
- 禁止代填 `human_gate: approved`

---

## 3. 子 Agent 边界（W1 收窄）

| 允许 | 禁止 |
| --- | --- |
| 只读 task、SPEC §4.1/§6.1/§6.2、diff、40 自检节 | 改 `app/` 除非用户 **明示** 50 提交 patch |
| 写 `docs/tasks/reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_*.md` | 判 fail W2/W3/W4/W5/W6 未交付项（须标 **defer · 非 W1 阻塞**） |
| 写 invoke 快照（若开帽时缺失） | 代填 `HG-REINSPECT: approved` |
| **独立**重跑 lint/test/build/tech-graph（不得只复述 40） | 执行 admin/sync、写真实秘钥 |

**W1 复检重点（SPEC §6 子集）**

- `NEXT_PUBLIC_SITE_MODE=portfolio` 四链 NAV + 四卡 HomeModules + build  
- `/unified-chat` portfolio 下 **常显**（不经 `isAdmin` 门控）  
- 品牌副标题 **Portfolio Demo** · layout metadata 分支  
- `development` 回归（默认 build 行为与改前一致）  
- `_tech_graph` SITE_MODE 分支 + 三门禁  
- **`/resume` · `/methodology` 404** → **defer**（F6 · W2），非 fail  

**Epic 项（本 task 非范围 · 50 口径）**

- 访客秘钥 / unlock / TTL → **defer**（W3）  
- Unified 裁剪 / 五问 chip → **defer**（W4）  
- sync 脚本 / CONTENT_ROOT 联调 → **defer**（W5/W6）  

---

## 4. 父侧 Task Handoff（主 Agent → Task 子代理 · 复制到 Task `prompt` 顶部）

```text
【Harness 50 · Task 子代理 Handoff · Portfolio W1 site-mode-nav】

- hat_code: 50
- task_slug: portfolio-site-mode-nav-v1
- Open Folder: ai-ink-brain（子 Agent cwd = ai-ink-brain）
- git_branch: task/portfolio-demo-site-v1

- 禁止带入：主 Chat 30 执行史、未裁剪 diff 以外过程稿、30 invoke 全文
- 必读：
  - ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md
  - task 内 ### 自检结论（执行者）
  - ai-ink-brain/docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.1 · §6.1 · §6.2 · §7 W1 行）
  - docs/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md（本 W1 边界）
  - 22 审查：无（路径 B · 须声明风险）
- diff：git diff origin/main...HEAD -- lib/site-mode.ts lib/site-mode.test.ts app/_components/site-nav.tsx app/_components/home-modules.tsx app/layout.tsx docs/_tech_graph/
- freeze_id：PORTFOLIO-RAG-DEMO@2026-06-01
- 模式：两者
- impl_commit：bed2baf
- 落盘：
  - reinspect → docs/tasks/reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md
  - invoke 若缺 → docs/harness/invokes/by-task/portfolio-site-mode-nav-v1/invoke_20260601_50_portfolio-site-mode-nav-v1.md

- 输出形状：验收表 + 全局 checklist + 阻塞项 + 合并建议 + Judgment
- 完成后：仅返回 §6 短报告；不要贴长日志全文

（以下为 50 帽 §5 子 Agent 正文 — 已填 W1 真值）
```

---

## 5. 子 Agent 可复制 Prompt 正文（Task 子代理 · 从下一行起）

```text
你正在扮演工作区 Harness「独立复检 + 全局验收帽（50）」，严格遵循：
- docs/harness/prompts/50-independent-reinspect.md（§一 独立复检；§二 全局验收 · Fresh Context P1）
- docs/tasks/specs/PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md（W1 边界 · defer 口径）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy: recommended）
- ai-ink-brain/AGENTS.md §8（pnpm lint → pnpm test → pnpm build）

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1

## 输入

- 主 task：
ai-ink-brain/docs/tasks/active/task_portfolio_site_mode_nav_v1.md
- 冻结 SPEC：
ai-ink-brain/docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md
- 子仓根：
ai-ink-brain
- 模式：两者
- diff：
git diff origin/main...HEAD -- lib/site-mode.ts lib/site-mode.test.ts app/_components/site-nav.tsx app/_components/home-modules.tsx app/layout.tsx docs/_tech_graph/
- 22 审查路径：无（路径 B · HG-AUDIT-R1 人 pre-approve · 50 须 human_gate diff 审查 task 文件并声明书面审缺位风险）
- freeze_id：PORTFOLIO-RAG-DEMO@2026-06-01
- impl_commit：bed2baf

## 你必须完成

0. **Invoke 快照**：若 `docs/harness/invokes/by-task/portfolio-site-mode-nav-v1/` 下无本次 50 快照，先将 **本消息全文** 落盘 `invoke_20260601_50_portfolio-site-mode-nav-v1.md` 后 commit。

【§一 独立复检】
1. 读取 task **### 自检结论（执行者）**；缺失 → blocked，建议打回 40。
2. **禁止**阅读 30 invoke 全文（Fresh Context）。
3. **独立**重跑（不得只复述 40）：
   pnpm lint && pnpm test && pnpm build && NEXT_PUBLIC_SITE_MODE=portfolio pnpm build
   pnpm tech-graph:manifest-check && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check
4. 对照 task 验收标准 + SPEC §6.1/§6.2 **W1 子集**，逐项表格：

   | 验收项 | pass/fail/defer | 证据（文件:行 / 测试名 / 日志） | 备注 |

   硬重点：
   - portfolio 四链 NAV（/ · /resume · /methodology · /unified-chat「对话」）
   - portfolio 四卡 HomeModules；无 Blog/Learning/Tasks/Chain
   - unified-chat nav 不经 isAdmin（site-nav.tsx portfolio 分支）
   - 副标题 Portfolio Demo；generateMetadata portfolio 分支
   - parseSiteMode 非法值 → development（lib/site-mode.test.ts）
   - development 回归：DEVELOPMENT_NAV / BASE_MODULES 逻辑未破坏
   - tech graph SITE_MODE 节点 + graph.json 导出

   defer（非 W1 fail）：
   - /resume · /methodology 404（F6 · W2）
   - PROJECT_CONFIG §C 若 gitignore 未跟踪 → warn + 本地文件证据
   - W3–W6 Epic 项

5. human_gate diff 审查：对 task 内 HG-* 行做 git log -p / blame，确认 Agent 未代填 approved。

【§二 全局验收】
6. 核对 diff 是否在 freeze_id W1 范围；越界 fail 并引用 SPEC §7 W1 行。
7. AGENTS.md §8 checklist（项 | pass/fail/warn | 签注待人工）。
8. 汇总阻塞合并项 + **是否建议合并**。

## 落盘

- `docs/tasks/reinspect_results/task_portfolio_site_mode_nav_v1_reinspect_20260601.md`
  - 元信息表 · 开帽检查 · 验收矩阵 · 全局 checklist · 阻塞项 · Judgment
- commit reinspect + invoke（若新建）；禁止 git add -A

## 对话回复（短报告 · 必填）

## 50 短报告 · portfolio-site-mode-nav-v1

- reinspect 路径：（相对 ai-ink-brain）
- 验收：pass X / fail Y / defer Z
- 合并建议：建议合并 | 阻塞（列表）
- Judgment：
  - experience_capture: …
  - gate/risk: …
  - hat_self: pass | pass-with-notes | blocked

## 禁止

- 不顺杆爬扩 scope；缺口打回 10/22/30
- 不代填 human_gate approved
- 不在未 pass 时输出 CLOSE 全文（关账由主会话执行）

Fresh Context（P1）：输入限于 task、SPEC W1 节、diff、40 自检、命令输出；禁止 30 invoke 全文。
```

---

## 6. 主 Agent 收 50 后关账（不在子 Agent 内）

子 Agent `hat_self: pass | pass-with-notes` 且无阻塞合并项时，**主会话**继续：

1. reinspect 路径写入 task **实现备忘**  
2. 输出 [`HANDOFF_CLOSE_TRACE.md`](../../../../docs/harness/prompts/HANDOFF_CLOSE_TRACE.md)  
3. 勾选 task 验收；`git mv` → `docs/tasks/done/`（**须**人改 `HG-REINSPECT: approved` 再 merge）  
4. 填 **`### KPI（00）`**（`kpi_aggregator: CLOSE`）

---

## 7. 关联引用

| 用途 | 路径 |
| --- | --- |
| W1 task | [`task_portfolio_site_mode_nav_v1.md`](../active/task_portfolio_site_mode_nav_v1.md) |
| semi_auto 启动 | [`PROMPT_semi_auto_startup_portfolio_w1_v1_zh.md`](./PROMPT_semi_auto_startup_portfolio_w1_v1_zh.md) |
| Epic 50 总规 | [`PROMPT_50_invoke_portfolio_demo_site_v1_zh.md`](./PROMPT_50_invoke_portfolio_demo_site_v1_zh.md) |
| 后端 50 样板 | `ai-ink-brain-api-python/docs/harness/invokes/by-task/portfolio-rag-demo/invoke_20260601_50_portfolio-rag-demo.md` |
| reinspect 目录 | [`docs/tasks/reinspect_results/README.md`](../../tasks/reinspect_results/README.md) |

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1：W1 收窄 · 对齐后端 PROMPT_50_startup + portfolio-rag-demo invoke · 占位符填真值 |

---

## 给 Cursor

`Prompt 50 W1`、`Task 子代理`、`portfolio-site-mode-nav-v1`、`reinspect_results`、`Fresh Context`、`defer W2`
