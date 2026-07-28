# Task：ChatBI 假登录（解锁 / 持久化 / 401 自动登出 / 首页会话）— 前端验收归档

> **状态**：`done（2026-05-12 验收通过）`  
> **关联图谱**：`ai-ink-brain/docs/_tech_graph/11_flow_api.md`（及 `.ai.md`）  
> **关联任务**：`docs/tasks/done/task_chatbi_unified_bff_python_bearer_v1.md`  
> **关联后端**：`ai-ink-brain-api-python` — `GET /api/py/chatbi/access/verify`、`GET /api/py/chat/history`；401 体 `detail.code === "CHATBI_UNAUTHORIZED"`  
> **真值表**：`ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`

---

## Harness 元信息（2.18 迁移补录）

| 字段 | 值 |
|------|-----|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |

## 1. 产品目标（权威口径）

1. **假登录（Unified）**：单框填入 **ChatBI DB 明文** →「解锁」→ `requestChatbiAccessVerify`（`GET /api/py/chatbi/access/verify`，**`Authorization: Bearer <明文>`**）→ 成功写入 **`localStorage` 键 `chatbi_access_token_plain`**。  
2. **默认携带**：访问需 ChatBI 的 BFF（Unified、`py/chat/history` 等）时，主路径为 **`Authorization: Bearer <明文>`**（与 Python `require_chatbi_principal` 一致）；`X-ChatBI-Access-Token` 为兼容/覆盖用法。  
3. **401 自动登出（仅 ChatBI）**：响应 401 且 `isChatbiUnauthorizedBody` 命中时，**仅** `clearChatbiToken` + 回 gate；不误清 Ink（Unified BFF 已不再强制 Ink gate）。  
4. **首页「解锁 / 退出管理」**（`SystemStatus`）：  
   - 输入明文 → `POST /api/auth/unlock`：服务端 **`verifyChatbiPlainUpstream`**（直连 Python verify）；成功写 HttpOnly **`chatbi_site_bearer`**（`lib/auth/chatbi-site-cookie.ts`）；若 `mode === "chatbi"` 则客户端 **`writeChatbiToken`**。  
   - **`GET /api/auth/session`**：`blog_admin_verified`（Ink）**或** `chatbi_site_bearer` 解码后上游仍 verify 成功 → **`admin: true`**，供 **`SiteNav` / `HomeModules`** 显示 Chat / Unified 等入口。  
   - **解锁成功**与 **退出管理**后 **`window.location.assign("/")`** 整页回首页刷新。  
   - **`POST /api/auth/logout`**：清除 Ink + ChatBI 站点 Cookie；客户端 **`clearChatbiToken`** 后同上跳转。  
5. **与 Ink**：`unlock` 仍支持 **`secret` 与 Ink 密钥 timingSafe 匹配** 时走 Ink Cookie（同步向量库等）；否则同一字段再尝试 ChatBI verify（兼容单框）。

---

## 2. 涉及文件（实现备忘）

| 路径 | 说明 |
|------|------|
| `lib/chatbi-client.ts` | `LS_CHATBI_KEY`、`read/write/clear`、`isChatbiUnauthorizedBody`、`requestChatbiAccessVerify` |
| `app/api/py/chatbi/access/verify/route.ts` | BFF 转发 Python；无 Ink gate；`Authorization` 或 `X-ChatBI-Access-Token` |
| `app/api/py/unified/chat/route.ts`、`stream/route.ts` | 无 `requireAdminApiSecret`；透传 ChatBI Bearer |
| `app/api/py/chat/history/route.ts` | 透传 `Authorization` + ChatBI 相关头 |
| `app/api/auth/unlock/route.ts` | ChatBI / Ink 双轨解锁 + ChatBI Cookie |
| `app/api/auth/session/route.ts` | Ink Cookie 或 ChatBI Cookie + 上游仍有效 → `admin` |
| `app/api/auth/logout/route.ts` | 双 Cookie 清除 |
| `lib/auth/chatbi-site-cookie.ts` | ChatBI 站点 HttpOnly Cookie 编解码 |
| `lib/server/chatbi-access-verify-upstream.ts` | 服务端直连 Python verify |
| `components/unified-chat/UnifiedChatPageClient.tsx` | Unified 单框解锁、Bearer、401 清 token、文案 |
| `components/SystemStatus.tsx` | 首页解锁/退出、写 LS、整页 `/` |

---

## 3. 验收标准（已勾选）

- [x] Unified：明文解锁 → **localStorage** 正确；无需整页刷新即可进主界面（与首页挂件行为区分）。  
- [x] Network：`GET /api/py/chatbi/access/verify` 带 **`Authorization: Bearer <明文>`**（`requestChatbiAccessVerify`）。  
- [x] `unified/chat/stream`（及 JSON 路径）上游 Bearer 为 DB token。  
- [x] 失效 token：401 + `CHATBI_UNAUTHORIZED` → 仅清 ChatBI token / 回 gate。  
- [x] `pnpm exec tsc --noEmit`、`pnpm lint` 通过；人工验收 2026-05-12 通过。  
- [x] 首页：`POST /api/auth/unlock` + session 扩展 + 解锁/退出后 **`/` 整页跳转**；二级入口（导航 / 首页模块）随 `admin` 刷新。

---

## 4. 非范围

- 不改 Python「仅 DB Bearer」核心策略（跨仓另任务）。  
- 不在本任务内 OAuth 替代 localStorage（见 OpenItems）。

---

## 5. 依赖与引用

- Python：`GET {PY_API_URL}/api/py/chatbi/access/verify`  
- Next：`GET /api/py/chatbi/access/verify`、`POST /api/auth/unlock`、`GET /api/auth/session`  
- 401：`isChatbiUnauthorizedBody` 与 FastAPI `detail.code === "CHATBI_UNAUTHORIZED"` 对齐。

---

## 6. 给 Cursor 的稳定关键词

`假登录`、`chatbi_access_token_plain`、`Authorization: Bearer`、`CHATBI_UNAUTHORIZED`、`chatbi_site_bearer`、`SystemStatus`、`/api/auth/unlock`、`/api/auth/session`
