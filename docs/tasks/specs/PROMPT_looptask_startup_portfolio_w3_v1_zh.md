# Prompt · Portfolio W3 LoopTask 启动（00 开帽 → 关账 CLOSE + KPI）

> **用途**：**新对话**粘贴 **§3 全文**；由 **00 总调度** 编排 **`looptask`** 帽链，**执行至 CLOSE**（含 KPI · `git mv` done）。  
> **Open Folder**：`ai-ink-brain`  
> **task 真值**：[`docs/tasks/active/task_portfolio_visitor_auth_v1.md`](../active/task_portfolio_visitor_auth_v1.md)  
> **优先级**：Epic **W3**（W2 #49 已 merge）

---

## 1. LoopTask 帽链（冻结）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE（KPI · done）
```

| 帽 | 执行者 | 要点 |
|----|--------|------|
| **00** | 主 Chat | 扫 task · gates · **stop_after_hat: CLOSE** |
| **10** | semi_auto | 细化 §4.3 验收 · failure_paths · **与 W4 边界** |
| **22 R1** | 主 Chat | **强制落盘** reviews |
| **30–40** | semi_auto | unlock/session/hook/UI + gen 脚本 + 单测 + 图谱 |
| **22 R2** | 主 Chat | 签收 → 派 50 |
| **50** | **Task 子代理** | reinspect 落盘 |
| **CLOSE** | 主 Chat | **KPI 表** · **`git mv` done** · 更新 `_views/done.md` |

---

## 2. 前置

| 项 | 状态 |
|----|------|
| W2 | `task_portfolio_content_pages_v1` **done**（#49 · `main` @ `5faf9b1`） |
| Epic SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) §4.3 · §7 W3 |
| 分支 | **`task/portfolio-visitor-auth-v1`**（从 `main` 拉） |
| `.env.example` | 分支已有 W3 变量说明 commit `03ea5c6` |

**本 task 不做（勿扩 scope）**：W4 debug/chip 裁剪 · W6 SSE Bearer/五问 · sync 五卷

---

## 3. 可复制 Prompt 正文（从下一行起 · 00 开帽）

```text
## 角色

你是 **Harness 00 总调度 + LoopTask 编排 Agent（Portfolio W3 · visitor-auth）**，严格遵循：
- docs/harness/prompts/00-orchestrator.md
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md（换帽 invoke + commit；**本 task 关账至 CLOSE**）
- docs/harness/SDD_HAT_FLOW.md §5.3
- docs/tasks/active/task_portfolio_visitor_auth_v1.md（harness_mode: looptask）
- docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.3 · §4.6.5 · §6.3 · §7 W3）
- ai-ink-brain/AGENTS.md §8

Open Folder = ai-ink-brain
git_branch = task/portfolio-visitor-auth-v1
task_slug = portfolio-visitor-auth-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01
stop_after_hat = CLOSE

## LoopTask 硬规则

1. **帽序**：00 → 10 → 22(R1) → [10↔22] → 30 → 40 → 22(R2) → **Task 50** → **CLOSE**
2. **跳过 20**；禁止无 22 R1 书面进 30
3. **50 必须 Task 子代理**（Fresh Context）；主会话收短报告后 **继续 CLOSE**
4. **CLOSE 必做**：填 task `### KPI（00）` · `git mv` → `docs/tasks/done/` · 更新 `docs/tasks/_views/done.md`
5. 换帽前：invoke §3 → `docs/harness/invokes/by-task/portfolio-visitor-auth-v1/` → commit

## 人工闸（执行前须 approved · 否则 STOP 报 gate_id）

- HG-TASK-DRAFT → 10 定稿
- HG-AUDIT-R1 → 22 R1 后
- HG-REINSPECT → 50 后（CLOSE 前）

## W3 业务真值（SPEC §4.3 · 不得弱化）

| 项 | 要求 |
|----|------|
| env | `PORTFOLIO_VISITOR_SECRET` · `PORTFOLIO_VISITOR_ADMIN_SECRET`（双变量 · 非 JSON） |
| TTL | visitor 72h · visitor-admin 24h（Cookie Max-Age） |
| unlock | `secret` 分支：**portfolio 优先** → Ink admin → ChatBI verify |
| Cookie | `portfolio_visitor_session` · HMAC(role+exp) · **禁止**秘钥明文 |
| session API | `{ ok, role, admin?, configured, expiresAt? }` |
| hook | `useAdminSession` 增 `role` · `canSendUnifiedChat` |
| Unified UI | portfolio：**邮件 231127227@qq.com + 演示秘钥**；**隐藏** ChatBI DB 明文 UI |
| 公开页 | `/` `/resume` `/methodology` `/evidence` **零 gate** |
| 脚本 | `tools/gen-portfolio-secrets.sh` 可执行 · stdout 指引 |

**已知非本 task**：portfolio unlock 后 Unified SSE 仍可能缺 Python Bearer（**W6**）；W4 负责 debug/chip。

---

### 【当前棒：00 → 派 10】

输出：task 缺口扫描 · 下一棒 10 Prompt · Judgment

---

### 【帽 10】

补齐：failure_paths F1–F4 · W4/W6 边界 · 验收勾选

交付：更新 task → HG-TASK-DRAFT approved → **22 R1**

---

### 【帽 22 R1】

落盘 `docs/harness/reviews/task_portfolio_visitor_auth_v1_audit_R1_YYYYMMDD.md`

---

### 【帽 30 · 执行】

1. `lib/auth/portfolio-session.ts` · `portfolio-env.ts`
2. 扩展 unlock/session · `useAdminSession`
3. UnifiedChatPageClient portfolio unlock UX
4. `tools/gen-portfolio-secrets.sh` + 单测
5. `docs/_tech_graph/12_flow_auth*.md`

**验证**：`pnpm lint` · `pnpm test` · `pnpm build`

**禁止**：W4 debug 裁剪 · 五问 chip · Python 改动

---

### 【帽 40 · 自检】

回填 task `### 自检结论`

---

### 【帽 22 R2 · 签收】

落盘 `..._audit_R2_YYYYMMDD.md` → 派 Task 50

---

### 【帽 50 · Task 子代理】

落盘 `docs/tasks/reinspect_results/task_portfolio_visitor_auth_v1_reinspect_YYYYMMDD.md`

---

### 【帽 CLOSE】

1. KPI_RUBRIC_v1_2 打分 → task `### KPI（00）`
2. `git mv docs/tasks/active/task_portfolio_visitor_auth_v1.md docs/tasks/done/`
3. 更新 `docs/tasks/_views/done.md`
4. 输出 **执行路线与 Commit 回溯**（HANDOFF_CLOSE_TRACE）

## 给 Cursor

looptask、00、10、22、30、40、50、CLOSE、portfolio-visitor-auth-v1、§4.3、gen-portfolio-secrets
```

---

## 4. 开跑前人工 1 分钟

| # | 动作 |
|---|------|
| 1 | Open Folder = **`ai-ink-brain`** |
| 2 | `git checkout main && git pull` → `git checkout -B task/portfolio-visitor-auth-v1` |
| 3 | 确认 W2 三路由已在 `main` |
| 4 | 新 Chat 粘贴 **§3 全文** |
| 5 | gates **approved** 后 Agent 可链式跑至 CLOSE |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-02 | v1：W3 LoopTask · **关账至 CLOSE+KPI**（区别于 W2 止于 50） |
