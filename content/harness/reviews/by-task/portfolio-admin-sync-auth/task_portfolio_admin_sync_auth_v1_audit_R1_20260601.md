# 22 复查 · Portfolio admin/sync 鉴权 · R1

| 字段 | 值 |
| --- | --- |
| freeze_id | PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01 |
| task_slug | portfolio-admin-sync-auth |
| impl_commit | `93fa07c`（HEAD）+ **工作区未提交 diff**（见下） |
| git_branch | `task/portfolio-demo-site-v1`（预期 `task/portfolio-admin-sync-auth-v1` · 见 scope_drift） |
| date | 20260601 |
| prompt_spec | `content/tasks/specs/PROMPT_22_review_portfolio_admin_sync_auth_v1_zh.md` |
| diff_base | `origin/main...HEAD` + `git diff`（工作区） |

### 审查范围说明

- **已提交（相对 origin/main）**：W5 `tools/README` 初版、`task_portfolio_content_sync_script_v1.md` 等 Epic 内容。
- **未提交（工作区 · 本 SPEC 实现）**：`lib/auth/sync-admin-env.ts`、`require-sync-admin-access.ts`（新增）；`app/api/admin/{sync,ingest}/route.ts`、`lib/py-service-proxy.ts`、`require-next-public-admin-secret.ts`、`tools/README-portfolio-content-sync.md`、`task_portfolio_content_sync_script_v1.md`（烟测段）、`docs/_tech_graph/11_flow_api.md`、`SPEC-portfolio_admin_sync_auth_v1_zh.md`（新增）。
- **已在分支 HEAD**：`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`（§C `SYNC_ADMIN_SECRET` 分表）、`.env.example`（L36–38）。

---

## 代码（C1–C6）

| ID | 结果 | 证据 | 备注 |
| --- | --- | --- | --- |
| C1 | **pass** | `lib/auth/sync-admin-env.ts:7–25` | 优先级 `SYNC_ADMIN_SECRET` → `CHAT_API_SECRET` → `NEXT_PUBLIC_ADMIN_SECRET`；非 production dev warn L16–20 |
| C2 | **pass** | `lib/auth/require-sync-admin-access.ts:42–48` | `validateAdmin` Cookie · Bearer L44–45 · 兼容 `x-admin-token` L47–48 |
| C3 | **pass** | `lib/py-service-proxy.ts:5,11–20` | 经 `getSyncAdminSecret()`，不直接读 `NEXT_PUBLIC_ADMIN_SECRET` |
| C4 | **pass** | `app/api/admin/sync/route.ts:21,32` · `app/api/admin/ingest/route.ts:12` | 均调用 `requireSyncAdminAccess` |
| C5 | **pass** | `lib/auth/require-next-public-admin-secret.ts:1–4` `@deprecated`；`rg requireNextPublicAdminSecret app/` → **无命中**（exit 1） | 全仓 `*.ts` 无新引用 |
| C6 | **pass** | `require-sync-admin-access.ts:35–36` · `py-service-proxy.ts:16–17` | 未配置时错误文案首提 **`SYNC_ADMIN_SECRET`**，并说明 admin/sync 不再以 NEXT_PUBLIC 为主配置 |

---

## 文档（D1–D6）

| ID | 结果 | 证据 | 备注 |
| --- | --- | --- | --- |
| D1 | **pass** | `rg NEXT_PUBLIC_ADMIN_SECRET\|x-admin-token tools/` | 仅 **废弃说明段** L64–68 含禁止示例；无活跃 sync curl 示例 |
| D2 | **pass** | `tools/README-portfolio-content-sync.md:42–58` | **路径 A**（`$ADMIN_TOKEN` 直连 Python）+ **路径 B**（`$SYNC_ADMIN_SECRET` BFF） |
| D3 | **pass** | `task_portfolio_content_sync_script_v1.md`「本地 admin sync 烟测」L107–125 vs README | 烟测 procedure 与 README 一致（路径 A/B + Bearer）；40 自检表 L296 仍记历史「403 · x-admin-token」（执行快照 · 非 procedure） |
| D4 | **pass** | `.env.example:36–38` | `SYNC_ADMIN_SECRET` 注释 + 服务端 only 说明 |
| D5 | **pass** | `PROJECT_CONFIG` §C L55–57（Ink vs Sync 分表）；`11_flow_api.md:77–83` admin/sync 节 | **附注**：插入 admin 节后 L85–88 ChatBI 子弹丢失 `## ChatBI V3 · Text2SQL…` 标题（非阻塞 · 建议 doc patch） |
| D6 | **pass** | `rg x-admin-token\|NEXT_PUBLIC .cursor/skills/harness-looptask-handoff/SKILL.md` → 无命中 | |

---

## 命令（T1–T4）

| ID | 结果 | 证据 | 备注 |
| --- | --- | --- | --- |
| T1 | **pass** | `pnpm lint` exit 0 | 2026-06-01 审查会话 |
| T2 | **pass** | `pnpm test` · 11 files · 43/43 pass | |
| T3 | **pass** | `pnpm build` exit 0 | Next.js 16.2.3 webpack |
| T4 | **pass** | `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` exit 0 | portfolio 模式 build 绿 |

---

## 烟测（S1–S2）

| ID | 结果 | 证据 | 备注 |
| --- | --- | --- | --- |
| S1 | **defer** | 审查环境未设 `SYNC_ADMIN_SECRET` + 未启配对 Python `CONTENT_ROOT` | **环境阻塞** · 合法 defer |
| S2 | **defer** | 未执行 `curl POST localhost:3000/api/admin/sync` | 待 S1 配置后由维护者验证；期望非 403 |

---

## 跨仓（X1–X2 · 只读）

| ID | 结果 | 证据 | 备注 |
| --- | --- | --- | --- |
| X1 | **pass** | `ai-ink-brain-api-python/docs/harness/guides/RUNBOOK_portfolio_rag_five_questions_v1_zh.md` §1.3 L38–41 · §2.1 L52–55 · §8 L172–173 | Bearer + `ADMIN_TOKEN`/`SYNC_ADMIN_SECRET`；**禁止** Portfolio 文档写 NEXT_PUBLIC |
| X2 | **pass** | `SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` §4.4 L184–185 | 前端 `SYNC_ADMIN_SECRET` 与 Python admin **同值** |

---

## 结论

### 阻塞（fail 且不可 defer）

**无**（代码与 SPEC §2 对齐；命令全绿）。

### defer

| 项 | 说明 |
| --- | --- |
| S1 / S2 | 无本地 `SYNC_ADMIN_SECRET` · 烟测 defer |
| **Git 落盘** | 鉴权实现仍在**工作区未提交**；合并前须 `git add` + commit（含新增 `sync-admin-env.ts`、`require-sync-admin-access.ts`、`SPEC-portfolio_admin_sync_auth_v1_zh.md`） |

### 非阻塞建议（doc patch · ≤1 处）

| 文件 | 改什么 |
| --- | --- |
| `docs/_tech_graph/11_flow_api.md` L85 前 | 恢复 `## ChatBI V3 · Text2SQL 子阶段 SSE（Unified 增量路径）` 标题（插入 admin 节时误删） |

### Legacy 范围确认（SPEC §6）

- `ChatPanel` / `/api/chat` middleware 仍用 `NEXT_PUBLIC_ADMIN_SECRET` → **不计 fail** ✓
- 未扩大改 Python `api/` ✓

### merge_recommendation

**yes-with-doc-patch**

- 实现与冻结 SPEC 一致，lint/test/build（含 portfolio）全绿。
- 合并前：**commit 工作区鉴权 diff** + 可选修复 `11_flow_api.md` ChatBI 标题。
- 分支名与 task 预期 slug 不一致（见 Judgment），不阻塞代码合并至 Epic PR。

---

## Judgment

- **scope_drift**: **有** — (1) 当前分支 `task/portfolio-demo-site-v1` 非 prompt 声明的 `task/portfolio-admin-sync-auth-v1`；(2) 鉴权实现未 commit，审查基于 HEAD + 工作区；(3) `11_flow_api.md` ChatBI 小节标题缺失（doc 笔误）。
- **merge_recommendation**: **yes-with-doc-patch**
- **hat_self**: **pass-with-notes**

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | R1 Fresh Context 复查 · C/D/T/S/X 全表 · freeze PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01 |
