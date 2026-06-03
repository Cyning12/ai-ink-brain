# SPEC：Portfolio admin/sync 鉴权对齐（废弃 admin/sync 链上的 `NEXT_PUBLIC_ADMIN_SECRET`）

> **状态**：`active`  
> **freeze_id**：`PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01`  
> **关联 Epic**：Portfolio 演示站 · W5 内容 sync + ingest 烟测  
> **配对后端 SPEC**：`ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` §2.3 · §4.4  
> **配对前端 SPEC**：[`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) §4.3 · §4.5 · §6.5  
> **投递计划**：[`投递冲刺_20260609_v1_zh.md`](./投递冲刺_20260609_v1_zh.md) §3.3 · §3.4  

---

## §1 背景与结论

### 1.1 分场景结论（已拍板 · 2026-06-01）

| 场景 | `NEXT_PUBLIC_ADMIN_SECRET` | 真值 |
| --- | --- | --- |
| **Unified Chat · 访客 RAG** | **已废弃** | `PORTFOLIO_VISITOR_*` → `/api/auth/unlock` |
| **Legacy Ink**（`ChatPanel`、`/api/chat`） | **仍使用**（另 task 收敛） | `lib/auth/admin-env.ts` |
| **admin/sync · admin/ingest BFF 入站** | **已废弃 NEXT_PUBLIC 示例** | **ChatBI admin Cookie**（`SystemStatus`）· Legacy Ink · Bearer `SYNC_ADMIN_SECRET`（curl） |
| **admin/sync · BFF 出站 → Python** | — | **`SYNC_ADMIN_SECRET`**（服务端 only · `forwardToPyAdmin`） |
| **Portfolio W5 文档 / curl** | **已移除示例** | 路径 A `$ADMIN_TOKEN` · 路径 B `$SYNC_ADMIN_SECRET` |

### 1.2 拍板摘要（原 Q1–Q5）

| # | 决议 |
| --- | --- |
| Q1 | **`SYNC_ADMIN_SECRET`** 为正式 env；fallback `CHAT_API_SECRET` → 废弃 `NEXT_PUBLIC_ADMIN_SECRET`（**2026-06-30 移除 fallback**） |
| Q2 | **保留** `validateAdmin()` Ink Cookie 入站 |
| Q3 | **`x-admin-token` 保留兼容至 2026-06-30**；新文档只写 Bearer |
| Q4 | **`admin/ingest` 同 PR** 改鉴权 |
| Q5 | W5 文档 **默认路径 A**（直连 Python） |

---

## §2 实现真值（2026-06-01）

| 模块 | 路径 | 行为 |
| --- | --- | --- |
| 密钥读取 | `lib/auth/sync-admin-env.ts` | `SYNC_ADMIN_SECRET` → `CHAT_API_SECRET` → `NEXT_PUBLIC_ADMIN_SECRET`（废弃 warn） |
| 入站鉴权 | `lib/auth/require-sync-admin-access.ts` | **ChatBI admin Cookie**（与 `/api/auth/session` · `hasChatbiAdminSession`）· `validateAdmin` Legacy · Bearer / `x-admin-token`（curl · 维护者） |
| 出站转发 | `lib/py-service-proxy.ts` | `Authorization: Bearer ${getSyncAdminSecret()}` |
| 路由 | `app/api/admin/sync/route.ts` · `app/api/admin/ingest/route.ts` | 调用 `requireSyncAdminAccess` |
| 废弃 | `lib/auth/require-next-public-admin-secret.ts` | `@deprecated` · 无新引用 |

**Python 侧**：不变；`admin_secret()` 仍读服务端 `.env`；**值须与 `SYNC_ADMIN_SECRET` 一致**。

---

## §3 维护者 curl（文档真值）

**路径 A — 直连 Python（推荐）**

```bash
export ADMIN_TOKEN="$SYNC_ADMIN_SECRET"

curl -sS -X POST "$PY_API_URL/api/py/admin/sync" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**路径 B — BFF（本地 dev）**

```bash
curl -sS -X POST "http://localhost:3000/api/admin/sync" \
  -H "Authorization: Bearer $SYNC_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

**禁止写入文档**

```bash
-H "x-admin-token: $NEXT_PUBLIC_ADMIN_SECRET"
```

---

## §4 迁移指南

1. 在本仓 `.env.local` 增加 **`SYNC_ADMIN_SECRET=<与 Python admin 同值>`**  
2. Python `.env` 保持 `CHAT_API_SECRET` 或 `NEXT_PUBLIC_ADMIN_SECRET`（**服务端**）同值  
3. 更新维护者 shell：`export ADMIN_TOKEN="$SYNC_ADMIN_SECRET"`  
4. **2026-06-30 前**完成迁移；之后代码移除 `NEXT_PUBLIC_ADMIN_SECRET` fallback 与 `x-admin-token` 兼容  

---

## §5 验收（已实现）

- [x] `tools/README-portfolio-content-sync.md` 无 `NEXT_PUBLIC_ADMIN_SECRET` sync 示例  
- [x] 路径 A + B 文档化；visitor 无 sync 一句  
- [x] BFF 实现 + `.env.example` + `PROJECT_CONFIG`  
- [x] 后端 RUNBOOK §1.3 · §8 · governance SPEC §4.4 同步  
- [x] `11_flow_api.md` admin/sync 节  
- [x] `pnpm lint` / `pnpm test` / `pnpm build`（合并前人跑）  
- [x] **页面验收**（2026-06-01）：`SystemStatus` · ADMIN MODE + ChatBI Cookie → `POST /api/admin/sync` **202**

---

## §6 非范围（仍有效）

- Legacy `ChatPanel` / `/api/chat` middleware  
- Python `api/index.py` env 键名重命名  
- `PORTFOLIO_VISITOR_*` unlock  

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1 draft + Q1–Q5 |
| 2026-06-01 | v2 **active**：实现 + 文档全面废弃 admin/sync 链 NEXT_PUBLIC 示例 · freeze `PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01` |
| 2026-06-01 | 验收关账：BFF 入站改为 ChatBI admin 会话（与 UI ADMIN MODE 一致）；出站仍 `SYNC_ADMIN_SECRET` |
