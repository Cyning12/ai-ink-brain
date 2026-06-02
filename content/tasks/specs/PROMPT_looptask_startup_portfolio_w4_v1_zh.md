# Prompt · Portfolio W4 LoopTask 启动（00 开帽 → 关账 CLOSE + KPI）

> **用途**：**新对话**粘贴 **§3 全文**；由 **00 总调度** 编排 **`looptask`**，**执行至 CLOSE**（KPI · `git mv` done）。  
> **Open Folder**：`ai-ink-brain`  
> **task 草案**：[`content/tasks/active/task_portfolio_unified_chat_ui_v1.md`](../active/task_portfolio_unified_chat_ui_v1.md)  
> **分支策略**：**续** `task/portfolio-visitor-auth-v1`（W3 已 commit · **暂不 PR**）

---

## 1. LoopTask 帽链（冻结）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE（KPI · done）
```

| 帽 | 执行者 | 要点 |
|----|--------|------|
| **00** | 主 Chat | 扫 task · gates · **stop_after_hat: CLOSE** |
| **10** | semi_auto | §4.4 · §6.4 chip 逐字 · access_level 档位映射 |
| **22 R1** | 主 Chat | **强制落盘** reviews |
| **30–40** | semi_auto | Unified 裁剪 + 五问 chip + 图谱 |
| **22 R2** | 主 Chat | 签收 → 派 50 |
| **50** | **Task 子代理** | reinspect 落盘 |
| **CLOSE** | 主 Chat | KPI · `git mv` done · `_views/done.md` |

---

## 2. 前置

| 项 | 状态 |
|----|------|
| W2 | **done**（#49 · `main`） |
| W3 | **done**（同分支 · `3d74537` · ChatBI token 主路径 unlock） |
| Epic SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) §4.4 · §6.4 · §6.6 · §7 W4 |
| 五问真值 | [`投递冲刺_20260609_v1_zh.md`](./投递冲刺_20260609_v1_zh.md) §2 |
| **git 分支** | **`task/portfolio-visitor-auth-v1`**（勿 switch 到 main 直推） |

**本 task 不做**：W6 五问 E2E · Python API · sync 五卷 · 撤销 W3 ChatBI unlock

---

## 3. 可复制 Prompt 正文（从下一行起 · 00 开帽）

```text
## 角色

你是 **Harness 00 总调度 + LoopTask 编排 Agent（Portfolio W4 · unified-chat-ui）**，严格遵循：
- docs/harness/prompts/00-orchestrator.md
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md（换帽 invoke + commit；**关账至 CLOSE**）
- docs/harness/SDD_HAT_FLOW.md §5.3
- content/tasks/active/task_portfolio_unified_chat_ui_v1.md（harness_mode: looptask）
- content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.4 · §4.6.5 · §6.4 · §6.6 · §7 W4）
- content/tasks/specs/投递冲刺_20260609_v1_zh.md（§2 五问 · chip 逐字）
- content/tasks/done/task_portfolio_visitor_auth_v1.md（W3 · ChatBI unlock 主路径 · 勿推翻）
- ai-ink-brain/AGENTS.md §8

Open Folder = ai-ink-brain
git_branch = task/portfolio-visitor-auth-v1
task_slug = portfolio-unified-chat-ui-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01
stop_after_hat = CLOSE

## LoopTask 硬规则

1. **帽序**：00 → 10 → 22(R1) → [10↔22] → 30 → 40 → 22(R2) → **Task 50** → **CLOSE**
2. **跳过 20**；禁止无 22 R1 书面进 30
3. **50 必须 Task 子代理**；主会话收短报告后 **继续 CLOSE**
4. **CLOSE 必做**：KPI 表 · `git mv` active→done · 更新 `content/tasks/_views/done.md` · HANDOFF_CLOSE_TRACE
5. 换帽前：invoke §3 → `content/harness/invokes/by-task/portfolio-unified-chat-ui-v1/` → **commit**
6. **同分支续做**：所有 commit 在 `task/portfolio-visitor-auth-v1`；**不要**开 PR（维护者暂不 merge）

## 人工闸（初态 pending · 非 approved 则 STOP 报 gate_id）

- HG-TASK-DRAFT → 10 定稿
- HG-AUDIT-R1 → 22 R1 后
- HG-REINSPECT → 50 后

## W4 业务真值（§4.4 · §6.4 · 不得弱化）

### 鉴权前提（W3 已交付 · 勿改回 PORTFOLIO env 主路径）

- portfolio / development：Unified unlock = **ChatBI 明文 token** + `GET /api/py/chatbi/access/verify`
- 邮件：`231127227@qq.com` 发 **带时效 DB token**（后端 `local_chatbi_access_token_gen.py`）

### 档位 → UI（10 帽可细化 · 默认建议）

| ChatBI access_level | portfolio 档位 | UI |
|---------------------|------------------|-----|
| **2** | visitor | 隐藏 Router Debug · Timeline · ExecutionTrace；**忽略** `?debug=1` |
| **0 或 1** | visitor-admin | Timeline + ExecutionTrace 可见；`?debug=1` 可开 LLM Prompt/SSE done；**仍隐藏** Router Debug |
| development | — | **保持现状**（全量 debug UI + 3 条通用 chip） |

### 五问 chip（portfolio · 逐字）

| ID | chip 文案 |
|----|-----------|
| Q1 | 《AI 编程可闭环协作》**卷三**讲什么？Harness 和签收是什么？ |
| Q2 | **RAG 混合检索**怎么做的？ |
| Q3 | **冷/温/热** 和 **架构三层** 区别？ |
| Q4 | **11 年经历**里 AI Coding 相关成果？ |
| Q5 | 按需读图相对整图灌入 **token/效果**？**边界**？ |

- 替换现有 3 条通用 chip（Text2SQL/日志/RRF 示例）
- locked 时 chip 可 `setDraft`；send 仍 blocked

### Text2SQL

- portfolio 两档均 **保留** `prefer` auto/rag/text2sql

---

### 【当前棒：00 → 派 10】

输出：task 缺口 · access_level 持久化方案 · 下一棒 10 Prompt · Judgment

---

### 【帽 10】

须补齐/确认：
- unlock 后如何保存 `access_level`（与 clear token 同步清除）
- development chip 是否保持 3 条通用（默认 **是**）
- `/evidence` 是否本 task 做 Q3/Q5 锚点（可选 · 非阻塞）
- failure_paths F1–F4

交付：更新 task → 人改 HG-TASK-DRAFT `approved` → 22 R1

---

### 【帽 22 R1】

落盘 `content/harness/reviews/task_portfolio_unified_chat_ui_v1_audit_R1_YYYYMMDD.md`

---

### 【帽 30 · 执行】

**范围（最小闭环）**
1. portfolio 条件渲染：Router Debug / Timeline / ExecutionTrace / debug URL
2. 五问 chip 常量 + portfolio 分支
3. unlock 流程写入并读取 `access_level`
4. 可选 `lib/unified-chat/portfolio-demo-chips.ts`
5. `docs/_tech_graph/13_flow_components*.md` 增量

**验证（必跑）**
- `pnpm lint` · `pnpm test` · `pnpm build`
- `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`
- 目视或逻辑自检：portfolio visitor 档无 Router Debug；chip 5 条文案

**禁止**：Python 改动 · W6 E2E · 改 W3 unlock 主路径 · 开 PR

---

### 【帽 40 · 自检】

回填 task `### 自检结论`；含双 mode build + chip 逐字对照表

---

### 【帽 22 R2 · 签收】

落盘 `..._audit_R2_YYYYMMDD.md` → 派 Task 50

---

### 【帽 50 · Task 子代理 · Fresh Context】

落盘 `content/tasks/reinspect_results/task_portfolio_unified_chat_ui_v1_reinspect_YYYYMMDD.md`

对照：task 验收 + §6.4 chip 逐字 + §6.6 裁剪表

---

### 【帽 CLOSE】

1. KPI_RUBRIC_v1_2 → task `### KPI（00）`
2. `git mv content/tasks/active/task_portfolio_unified_chat_ui_v1.md content/tasks/done/`
3. 更新 `content/tasks/_views/done.md`
4. **执行路线与 Commit 回溯**（同分支累计 commit · **不写 PR**）

## 给 Cursor

looptask、00、10、22、30、40、50、CLOSE、portfolio-unified-chat-ui-v1、§4.4、五问chip、access_level、task/portfolio-visitor-auth-v1
```

---

## 4. 开跑前人工 1 分钟

| # | 动作 |
|---|------|
| 1 | Open Folder = **`ai-ink-brain`** |
| 2 | `git checkout task/portfolio-visitor-auth-v1 && git pull`（确认含 W3 `3d74537`） |
| 3 | 读 task 草案 + SPEC §4.4 · §6.4 |
| 4 | **新 Chat** 粘贴 **§3 全文** |
| 5 | 10 定稿后改 task 内 `HG-TASK-DRAFT` → `approved`，再让 Agent 链式跑至 CLOSE |

---

## 5. 给维护者（Cyning）

| 项 | 说明 |
|----|------|
| **不 PR** | W4 关账后 commit 仍在 `task/portfolio-visitor-auth-v1`，与 W3 一并 merge 时再开 PR |
| **发码** | 访客用后端 `local_chatbi_access_token_gen.py`；L2=visitor 档 · L0/L1=admin 档（与 W4 UI 对齐） |
| **下一 Epic** | **W6** 五问 E2E + 录屏 |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-02 | v1：W4 LoopTask · 同分支续做 · CLOSE · ChatBI access_level 档位 · 五问 chip |
