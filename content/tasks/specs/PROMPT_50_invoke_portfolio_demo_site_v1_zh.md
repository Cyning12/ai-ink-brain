# Prompt 50 · Portfolio Demo Site · 独立复检（子 Agent 专收）

> **用途**：Epic **`task_portfolio_demo_site_epic_v1`** 在 **22 终轮签收** 之后，由 **主会话 Agent** 经 **`Task` 工具** 派发 **独立子 Agent** 执行 **50 帽**；子 Agent **不得** 携带 30 执行长上下文。  
> **真值帽**：工作区 [`docs/harness/prompts/50-independent-reinspect.md`](../../../../docs/harness/prompts/50-independent-reinspect.md) · [`TEMPLATE-independent-reinspect-invoke.md`](../../../../docs/harness/prompts/TEMPLATE-independent-reinspect-invoke.md)。  
> **落盘**：invoke → `content/harness/invokes/by-task/portfolio-demo-site-epic/`；50 结论 → `content/tasks/reinspect_results/`。

---

## 1. 占位符（主 Agent 派发前须全部替换）

| 占位符 | 含义 | 本 Epic 默认值 |
| --- | --- | --- |
| `{{TASK_PATH}}` | Epic task（相对 `Projects/`） | `ai-ink-brain/content/tasks/active/task_portfolio_demo_site_epic_v1.md` |
| `{{SUBPROJECT_ROOT}}` | diff cwd | `ai-ink-brain` |
| `{{GIT_BRANCH}}` | 工作分支 | `task/portfolio-demo-site-epic-v1` |
| `{{REINSPECT_MODE}}` | 三选一 | `两者` |
| `{{DIFF_RANGE}}` | 复检 diff | `git diff origin/main...HEAD`（或 `production...HEAD`，与 PR 基线一致） |
| `{{AUDIT_REVIEW_PATH}}` | 22 终轮签收 | `content/harness/reviews/task_portfolio_demo_site_epic_v1_audit_R2_YYYYMMDD.md`（R2 落盘后填真实文件名；派发前无则 `无` 且 50 须声明风险） |
| `{{FREEZE_ID}}` | task 声明 | `PORTFOLIO-DEMO-SITE@2026-06-09`（与 SPEC 元信息一致；若 task 写后端同源 id 以 task 为准） |
| `{{SPEC_PATH}}` | 冻结 SPEC | `content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` |

---

## 2. 主 Agent：50 开帽前编排（硬）

### 2.1 前置条件（须同时满足）

| # | 条件 |
| --- | --- |
| P1 | Epic task 内 **`### 自检结论（执行者）`** 已存在（40 帽回填） |
| P2 | **22 终轮** `reviews/*` 含 **签收 / 关闭**（或 `human_gate: HG-AUDIT-CLOSE` 已 `approved`） |
| P3 | 合并前必绿在本仓已跑：`pnpm lint` → `pnpm test` → `pnpm build`（日志摘要可附在 task 自检节） |
| P4 | **无** 阻塞 `human_gate`（`HG-REINSPECT` 在 50 **完成后** 才由人改 `approved`；**不** 阻塞派发 50） |

### 2.2 主 Agent 顺序（不可打乱）

```text
22 R2 签收落盘 → commit
→ 将 §4 父侧 Handoff + §5 子 Agent §3 全文写入 invoke（by-task/portfolio-demo-site-epic/）
→ commit invoke
→ Task 子代理（readonly=false）仅携带 §4 Handoff + §5 正文
→ 收子 Agent 短报告（验收表 + Judgment + reinspect 路径）
→ 若 pass：主会话输出 HANDOFF_CLOSE_TRACE + 建议 task → done/
→ 若 fail/block：打回 30，不关账
```

### 2.3 主 Agent 禁止

- 禁止在同一上下文内 **兼做** 50 复检（须 **Task 子代理**）  
- 禁止向子 Agent 粘贴 30 聊天全文、未裁剪 diff 以外过程稿  
- 禁止子 Agent 未落盘 `reinspect_results/` 即标 task `done`

---

## 3. 子 Agent 边界

| 允许 | 禁止 |
| --- | --- |
| 只读 task、SPEC、reviews、diff、自检节、命令日志 | 改 `app/` 除非用户 **明示** 50 提交 patch |
| 写 `content/tasks/reinspect_results/task_portfolio_demo_site_epic_v1_reinspect_*.md` | 创建/改 task 验收勾选（仅建议） |
| 写 invoke 快照（若开帽时缺失） | 代填 `human_gate: approved` |
| 跑只读验证命令（lint/test/build 复核） | 执行 admin/sync、写真实秘钥 |

---

## 4. 父侧 Task Handoff（主 Agent → Task 子代理 · 复制到 Task `prompt` 顶部）

```text
【Harness 50 · Task 子代理 Handoff · Portfolio Demo Site Epic】

- hat_code: 50
- task_slug: portfolio-demo-site-epic
- Open Folder: ai-ink-brain（子 Agent cwd = {{SUBPROJECT_ROOT}}）
- git_branch: {{GIT_BRANCH}}

- 禁止带入：主 Chat 30 执行史、SPEC 细化轮对话、未替换占位符
- 必读：
  - {{TASK_PATH}}
  - task 内 ### 自检结论（执行者）
  - {{SPEC_PATH}}（§6 验收）
  - {{AUDIT_REVIEW_PATH}}（签收节；无则声明）
- diff：{{DIFF_RANGE}}（在 {{SUBPROJECT_ROOT}} 根执行）
- freeze_id：{{FREEZE_ID}}
- 模式：{{REINSPECT_MODE}}
- 落盘：
  - reinspect → content/tasks/reinspect_results/task_portfolio_demo_site_epic_v1_reinspect_YYYYMMDD.md
  - invoke 若缺 → content/harness/invokes/by-task/portfolio-demo-site-epic/

- 输出形状：验收表 + 阻塞项 + 合并建议 + Judgment（hat_self / gate/risk / experience_capture）
- 完成后：仅返回结构化短报告；**不要**贴长日志全文

（以下为 50 帽 §5 子 Agent 正文 — 占位符须已全部替换）
```

---

## 5. 子 Agent 可复制 Prompt 正文（Task 子代理 · 从下一行起）

```text
你正在扮演工作区 Harness「独立复检 + 全局验收帽（50）」，严格遵循：
- docs/harness/prompts/50-independent-reinspect.md（§一 独立复检；§二 全局验收）
- content/tasks/specs/PROMPT_50_invoke_portfolio_demo_site_v1_zh.md（本 Epic 边界）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy: recommended — 关注 lint/test/build 与验收关系）
- ai-ink-brain/AGENTS.md §8（合并前必绿：pnpm lint → pnpm test → pnpm build）

Open Folder = ai-ink-brain
git_branch = {{GIT_BRANCH}}

## 输入（占位符须已替换；仍见 {{…}} 须先追问，不得开工）

- 主 task（Epic）：
{{TASK_PATH}}
- 冻结 SPEC（验收真值）：
{{SPEC_PATH}}
- 子仓根（diff cwd，相对 Projects/）：
{{SUBPROJECT_ROOT}}
- 模式（须为字面：独立复检 | 全局验收 | 两者）：
{{REINSPECT_MODE}}
- diff 范围：
{{DIFF_RANGE}}
- 22 终轮审查路径（无则写「无」）：
{{AUDIT_REVIEW_PATH}}
- freeze_id：
{{FREEZE_ID}}

## 你必须完成

0. **Invoke 快照**：若 `content/harness/invokes/by-task/portfolio-demo-site-epic/` 下无本次 50 快照，先将 **本消息全文** 落盘 `invoke_YYYYMMDD_50_portfolio-demo-site-epic.md` 后 commit（同一会话追问不重复落盘）。

【§一 独立复检 — 模式为「独立复检」或「两者」】
1. 读取 task **### 自检结论（执行者）**；缺失 → 阻塞首条，hat_self=blocked，建议打回 40。
2. 对照 **SPEC §6** 与 task 验收列表，逐项输出表格：

   | 验收项 | pass/fail | 证据（文件:行 / 测试名 / 日志） | 备注 |

   重点验收（Portfolio 域）：
   - `NEXT_PUBLIC_SITE_MODE=portfolio` 四链导航与 build
   - 简历 / 方法论 / evidence（或 deferred 项是否在 task 标注）
   - 访客秘钥 unlock / session / TTL（若 W3 已交付）
   - Unified Chat：Text2SQL 保留、RouterDebug 等对 visitor 隐藏（§4.4）
   - 五问 chip 文案与 SPEC §6.4 一致（联调项可标 fail+「依赖后端」并非阻塞，须在 task 已 deferred 时注明）

3. 在 {{SUBPROJECT_ROOT}} 复核（若自检未附日志）：`pnpm lint`、`pnpm test`、`pnpm build`；portfolio 模式 build 须 `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`（或 task 指定命令）。
4. 汇总阻塞合并项；给出 **是否建议合并**（供维护者，非代签）。

【§二 全局验收 — 模式为「全局验收」或「两者」】
5. 核对 PR/diff 变更是否在 **{{FREEZE_ID}}** 声明范围内；越界须 fail 并引用 SPEC/task 节。
6. 输出 checklist 表（项 | 状态 pass/fail/warn | 签注「待人工」）；含 AGENTS.md §8 前端必绿项。
7. 不伪造已签核；CI 红灯须如实 fail。

## 落盘交付

- `content/tasks/reinspect_results/task_portfolio_demo_site_epic_v1_reinspect_YYYYMMDD.md`
  - 含：验收表、全局 checklist、阻塞项、合并建议、Judgment
- commit 上述 + invoke（若本轮新建）

## 对话回复（短报告 · 必填）

```text
## 50 短报告 · portfolio-demo-site-epic

- reinspect 路径：（相对 ai-ink-brain）
- 验收：pass X / fail Y / 证据不足 Z
- 合并建议：建议合并 | 阻塞（列表）
- Judgment：
  - experience_capture: …
  - gate/risk: …
  - hat_self: pass | pass-with-notes | blocked
```

## 禁止

- 不顺杆爬扩 scope；缺口打回 10/22/30
- 不代填 human_gate approved
- 不在未 pass 且无维护者明示时输出 CLOSE 关账全文（关账由 **主会话** 在收报告后执行）

## 给 Cursor

`50`、`独立复检`、`portfolio-demo-site-epic`、`reinspect_results`、`freeze_id`
```

---

## 6. 主 Agent 收 50 后关账（不在子 Agent 内）

子 Agent `hat_self: pass | pass-with-notes` 且无阻塞合并项时，**主会话**继续：

1. 将 reinspect 路径写入 task **修订记录** 或 **实现备忘**  
2. 输出 [`HANDOFF_CLOSE_TRACE.md`](../../../../docs/harness/prompts/HANDOFF_CLOSE_TRACE.md) 形状  
3. 勾选 task 验收；`git mv` → `content/tasks/done/`（若 policy 允许且 HG-AUDIT-CLOSE 已 approved）  
4. 填 **`### KPI（00）`** 或 `kpi_aggregator: CLOSE` 节（按 task 元信息）

---

## 7. 关联引用

| 用途 | 路径 |
| --- | --- |
| Epic 编排 / semi_auto | [`PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md`](./PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md) §7 |
| **W1 子 task 50** | [`PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md`](./PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md) |
| 目标 SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) |
| 50 帽真值 | 工作区 `docs/harness/prompts/50-independent-reinspect.md` |
| 50 模板 | 工作区 `docs/harness/prompts/TEMPLATE-independent-reinspect-invoke.md` |
| reinspect 目录 | [`content/tasks/reinspect_results/README.md`](../../tasks/reinspect_results/README.md) |

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1：Portfolio Epic · 50 子 Agent Handoff + §5 可复制正文 |
| 2026-06-01 | v1.1：链 W1 收窄变体 `PROMPT_50_invoke_portfolio_site_mode_nav_w1_v1_zh.md` |

---

## 给 Cursor

`Prompt 50`、`Task 子代理`、`独立复检`、`portfolio-demo-site-epic`、`reinspect_results`、`HANDOFF_CLOSE_TRACE`
