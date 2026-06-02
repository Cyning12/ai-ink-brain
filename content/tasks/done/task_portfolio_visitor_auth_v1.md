# Task：Portfolio 访客秘钥鉴权（W3 · unlock / session / role TTL）

> **状态**：`done（2026-06-02 验收通过）`  
> **关联图谱**：`docs/_tech_graph/12_flow_auth.md`（实施后须增量更新 `.ai.md`）  
> **关联 Issue/PR**：（待开 · 基线 `main` @ `5faf9b1` · W2 #49 已合并）  
> **后端依赖**：无（BFF Cookie 签发；Python SSE Bearer 联调归 **W6**）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `portfolio-visitor-auth-v1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | portfolio-session 单测 + unlock/session API；浏览器 unlock 烟测建议 merge 前人工；五问 E2E 归 **W6** |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01`（与 Epic · W1/W2/W5 同源） |
| **semi_auto** | `true` |
| **audit_profile** | `full` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/portfolio-visitor-auth-v1` |
| **harness_mode** | **`looptask`** |
| **stop_after_hat** | **`CLOSE`**（本 LoopTask **关账至 KPI + git mv done**） |

- **KPI 真值**：工作区 [`docs/harness/guides/KPI_RUBRIC_v1_2.md`](../../../docs/harness/guides/KPI_RUBRIC_v1_2.md)  
- **LoopTask 启动 Prompt**：`content/tasks/specs/PROMPT_looptask_startup_portfolio_w3_v1_zh.md`  
- **关账前**：正文须有 **`### KPI（00）`**（50 + CLOSE 填写）

### Harness LoopTask 帽链（本 task 权威）

```text
00 总调度（开帽）
  → 10 需求（验收·failure_paths·与 W4 边界）
  → 22 R1 任务审核（强制 · reviews 落盘）
       ├─ 阻塞 → 10 → 22 R1' …
       └─ R1 放行 → HG-AUDIT-R1（人）
  → 30 执行（unlock/session/hook/UI 最小集 + gen 脚本 + 单测）
  → 40 自检
  → 22 R2 终轮签收
  → 50 独立复检（Task 子代理 · Fresh Context）
  → CLOSE（KPI · git mv done）
```

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | `approved` | 22-R1, 30 | 10 定稿后人批 |
| HG-AUDIT-R1 | `approved` | 30 | 22 R1 书面通过后 |
| HG-REINSPECT | `approved` | done | 50 后 merge 前 |

---

## 背景与目标

Epic **Portfolio 演示**（[`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) **§4.3** · **§7 W3**）在 W2 三内容页已合并 `main` 后，本 task 交付 **访客秘钥 unlock + HttpOnly session + role/TTL**，使 portfolio 模式下 **`/unified-chat` 发消息区** 可通过邮件发放的演示口令解锁；**公开静态页零 gate**。

**完成态一句话**：W3 交付 portfolio session/unlock 基础设施 + session API **`role`**；**运维主路径（2026-06-02 拍板）**：portfolio 与 development 均在 `/unified-chat` 用 **ChatBI DB 明文 token**（后端 `local_chatbi_access_token_gen.py` + INSERT，邮件发带时效明文）解锁，对话/历史/SSE 同源 Python verify；`PORTFOLIO_VISITOR_*` 为 **可选 legacy**。

---

## 范围

- [x] **`lib/auth/portfolio-session.ts`**：HMAC 签名 payload（role + exp）；HttpOnly Cookie 名 `portfolio_visitor_session`；**禁止**秘钥明文入 Cookie。
- [x] **`lib/auth/portfolio-env.ts`**：`matchPortfolioSecret()` · `isPortfolioAuthConfigured()`（`timingSafeEqual`）。
- [x] **扩展 `POST /api/auth/unlock`**：`secret` 分支 **优先** portfolio → Ink admin → ChatBI verify（`token` 路径不变）。
- [x] **扩展 `GET /api/auth/session`**：返回 `{ ok, role, admin, configured, expiresAt? }`；role ∈ `none|visitor|visitor-admin|admin`。
- [x] **扩展 `useAdminSession`**：`role` · `expiresAt` · `canSendUnifiedChat`。
- [x] **Unified Chat portfolio UX**：邮件 `231127227@qq.com` + **ChatBI 明文 token** unlock（与 development 同 verify 路径）；`locked` 基于 **localStorage Bearer**；`PORTFOLIO_*` env 解锁为 legacy API 保留。
- [x] **`tools/gen-portfolio-secrets.sh`**：本机生成双 env 输出 stdout（可执行 · 不写仓库）。
- [x] **`.env.example`**：登记 `PORTFOLIO_VISITOR_SECRET` / `PORTFOLIO_VISITOR_ADMIN_SECRET`（已在分支首 commit）。
- [x] **单测** `lib/auth/portfolio-session.test.ts`。
- [x] 增量 **`docs/_tech_graph/12_flow_auth*.md`**。
- [x] **`pnpm lint`** · **`pnpm test`** · **`pnpm build`** 绿。

## 非范围

- **W4**：Router Debug / Timeline 按 role 裁剪、五问 chip 替换、visitor-admin `?debug=1` 行为。
- **W6**：Python SSE 以 portfolio Cookie 代 Bearer、五问 5/5、录屏。
- **middleware** 对 `/resume` 等公开路由 session 拦截（**禁止**）。
- **ChatBI 库表 token** 与 portfolio 秘钥混用（SPEC §4.3 已拍板独立 secret）。
- **PROJECT_CONFIG** 大段改写（可选一行 gen 脚本示例 · 非阻塞）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| **冻结 SPEC** | [`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §4.3 · §4.6.5 · §6.3 · §7 W3 |
| **Epic W2（done）** | [`content/tasks/done/task_portfolio_content_pages_v1.md`](../done/task_portfolio_content_pages_v1.md) |
| **Unlock / Session** | `app/api/auth/unlock/route.ts` · `app/api/auth/session/route.ts` |
| **站点模式** | `lib/site-mode.ts` · `isPortfolioMode()` |

---

## 验收标准

- [x] `tools/gen-portfolio-secrets.sh` 可执行；stdout 含两变量名与值及 Vercel 粘贴指引。
- [x] 配置 env 后 `POST /api/auth/unlock` `{ "secret": "<visitor>" }` → 200 + `Set-Cookie: portfolio_visitor_session=...` + `{ ok, mode: "portfolio", role }`。
- [x] 错误秘钥 → 401（或落入后续路径失败）；未配置 env → 503 结构化错误。
- [x] `GET /api/auth/session` 在有效 Cookie 下返回 `role: visitor|visitor-admin` 与 `expiresAt` ISO 字符串。
- [x] portfolio + 无 token：`/unified-chat` **200** · 输入 locked · 展示邮件 + **ChatBI token** 解锁文案。
- [x] portfolio + 有效 ChatBI token：unlock 后 **Bearer 对话/历史/SSE 可通**（与 development 一致）。
- [x] development 模式：ChatBI 明文 unlock UI **不变**。
- [x] 单测覆盖 build/parse + 篡改签名拒绝。
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 通过。

---

## 失败路径（SPEC 级）

| # | 触发 | 期望行为 |
| --- | --- | --- |
| F1 | `PORTFOLIO_VISITOR_*` 均未配置 | unlock 503 · session `configured` 仍可为 true（其他 auth 源） |
| F2 | Cookie 过期或签名无效 | session `role: none` · Unified locked |
| F3 | portfolio 模式误展示 ChatBI DB 明文 unlock | **缺陷** |
| F4 | 公开静态页被全局 gate | **缺陷**（middleware 不得拦截 `/resume` 等） |

---

## 实现备忘（30 帽回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `lib/auth/portfolio-session.ts` · `portfolio-env.ts` · `portfolio-session.test.ts` · `app/api/auth/unlock/route.ts` · `app/api/auth/session/route.ts` · `lib/hooks/useAdminSession.ts` · `components/unified-chat/UnifiedChatPageClient.tsx` · `tools/gen-portfolio-secrets.sh` · `.env.example` |
| 新增 Cookie | `portfolio_visitor_session`（HttpOnly · SameSite=Lax） |
| 图谱变更点 | `docs/_tech_graph/12_flow_auth.md` · `12_flow_auth.ai.md` |

---

## ### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: **90%** · **状态**: **pass** · **帽**: 10→22→30→40→22→50→CLOSE

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|-----|----------------|
| 10 | R1 | looptask | 100 | 100 | 100 | 100 | — | §4.3 验收 + W4 边界复述 |
| 22 | R1/R2 | looptask | 100 | 100 | 100 | 100 | — | reviews 落盘 · 零阻塞 |
| 30 | R1 | looptask | 100 | 100 | 100 | 100 | 100 | unlock/session/hook/UI + gen 脚本 + 单测 |
| 40 | R1 | looptask | 100 | 100 | 100 | 100 | — | lint/test/build 绿（45 tests） |
| 50 | R1 | task_subagent | 100 | 70 | 100 | 100 | 100 | warn: unlock 未浏览器 curl 留证；portfolio unlock 后 SSE 仍缺 Bearer（W6 非本 task） |
| CLOSE | close | main_chat | 100 | 100 | 100 | 100 | 100 | HG-REINSPECT approved · git mv done |

**blocked 原因**：（无）

**关闭回溯**：见 `content/harness/reviews/task_portfolio_visitor_auth_v1_audit_R2_20260602.md` §执行路线与 Commit 回溯

---

## ### 自检结论（执行者）

**40 帽 · 2026-06-02**

| 命令 | 结果 |
|------|------|
| `pnpm lint` | pass |
| `pnpm test` | pass（45 tests · 含 `portfolio-session.test.ts`） |
| `pnpm build` | pass |

**API**：unlock 优先 portfolio secret；session 返回四档 role；Cookie HMAC + exp 校验。

**UI**：portfolio / development 均走 ChatBI token + Python verify；portfolio 文案强调邮件申请时效 token。

**边界**：未改 W4 debug/chip；Python SSE 仍 Bearer（portfolio 已对齐）；`portfolio_visitor_session` API 保留 optional legacy；公开静态路由无 middleware gate。

**建议 merge 前**：本地设 `PORTFOLIO_VISITOR_*` + `NEXT_PUBLIC_SITE_MODE=portfolio`，浏览器 unlock 一次留证。
