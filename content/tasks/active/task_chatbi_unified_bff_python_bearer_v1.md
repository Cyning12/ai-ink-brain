# Task：Unified Chat — BFF 与 Python「DB Bearer」解耦（Ink 前端 + Next Route）

> **状态**：`done`（方案 A：双凭证）  
> **关联后端任务**：`ai-ink-brain-api-python/docs/tasks/active/task_chatbi_level_gate_v1.md`（Unified **仅** `chatbi_access_tokens` 校验）  
> **关联真值表**：`ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`

---

## 手动验收（DevTools / curl）

1. 部署或本地：`NEXT_PUBLIC_ADMIN_SECRET`、Python 可达、`PY_API_URL` 已设。  
2. 浏览器打开 Unified Chat：解锁时 **Ink 密钥** 与 **ChatBI DB 明文** 填不同字符串；发送一问。  
3. Network → `unified/chat/stream`：**Request Headers** 应有 `Authorization: Bearer <admin>` 与 `X-ChatBI-Access-Token: <db>`；Python 侧应收到上游 `Authorization: Bearer <db>`（不经 Next 时可用后端日志核对）。  
4. 清空 `chatbi_access_token_plain` 后重试：无 `X-ChatBI-Access-Token` 时行为与旧版一致（仅透传 `Authorization`）。

---

## 背景与问题（当前行为）

1. **Python**（`ai-ink-brain-api-python`）：`POST /api/py/unified/chat` 与 `/stream` 仅接受 **`Authorization: Bearer <明文 DB token>`**，与 Supabase `chatbi_access_tokens.key_hash` 对应。  
2. **Next BFF**（本仓）：`app/api/py/unified/chat/route.ts`、`app/api/py/unified/chat/stream/route.ts` 先执行 **`requireAdminApiSecret(request)`**，要求浏览器请求里的凭证与 **`NEXT_PUBLIC_ADMIN_SECRET`（或 CHAT_API_SECRET）** 一致；通过后再把 **同一** `Authorization` 头转发给 Python。  
3. **前端**（`components/unified-chat/UnifiedChatPageClient.tsx`）：用户输入保存在 `localStorage` 键 **`blog_admin_token`**，作为 **`Authorization: Bearer …`** 发给本仓 `/api/py/unified/...`。

因此：运维在 DB 里插入的 **ChatBI token** 与 Ink 的 **admin secret** 若不是同一字符串，**经 BFF 必挂**（要么 401 在 Next，要么 401 在 Python）。

---

## 非范围（本任务不写死）

- 不在本任务内改 Python 鉴权策略（仍以后端任务单为准）。  
- 不强制实现「管理台签发 UI」；个人项目可继续 **手工 token + localStorage**。

---

## 推荐方案（拍板其一即可实现）

### 方案 A（推荐）：双凭证 — Ink 入口 + ChatBI 上游

| 方向 | 头 / 存储 | 含义 |
|------|-----------|------|
| 浏览器 → Next | `Authorization: Bearer <NEXT_PUBLIC_ADMIN_SECRET 或既有 admin 口令>` | 仅满足 **`requireAdminApiSecret`**，保护 BFF 不被匿名滥用。 |
| 浏览器 → Next | **`X-ChatBI-Access-Token: <明文 DB token>`**（或等价 body 字段，二选一） | **仅**转发给 Python 的 `Authorization: Bearer <DB token>`。 |

**BFF 改动要点**：若存在 `x-chatbi-access-token`（或约定字段），则转发 Python 时使用其值构造 `Authorization`；否则可回退为当前行为（与旧版兼容，但 Python 侧会 401）。

**前端改动要点**：

- Unified 页：在现有「解锁」输入框外，增加 **「ChatBI / Python 访问令牌」** 输入框（或把文案拆成两行：Ink 管理员密钥 vs ChatBI DB Token）；`blog_admin_token` 继续存 **admin**；新增 `localStorage` 键（例：`chatbi_access_token_plain`）存 **DB 明文 token**（用户已知风险：XSS 可窃取，与 OpenItems 个人项目拍板一致）。  
- `fetch` 时：`headers.Authorization` = admin；`headers["X-ChatBI-Access-Token"]` = DB token（仅当有值时发送）。

### 方案 B：服务端代填 Python Bearer

- 在 **Vercel/部署环境** 配置 **`CHATBI_PYTHON_UPSTREAM_BEARER`**（或同名），值为 **明文 DB token**（或仅 CI 用）。  
- BFF 在校验 `requireAdminApiSecret` 通过后，**忽略**客户端对 Python 的 Bearer，统一用服务端 env 注入 `Authorization` 转发 Python。  
- **前端**：可不改或仅保留 admin 解锁；**缺点**：所有通过 BFF 的会话共用同一 Python 主体，无法按用户区分 `access_level`/`subject_user_id`。

### 方案 C：仅本地/联调直连 Python

- 不经 Next，用 `curl`/Bruno 打 `PY_API_URL`（见下文「如何测试」）。**无前端改动**，不适合最终用户从 Ink 页面访问。

---

## 验收标准

- [x] 从 Ink Unified Chat 页面经 BFF 调用 Python 时，**401 不再因「Next 与 Python 争用同一 Authorization」** 而无法联调（实现方案 A 或 B 之一并有文档说明）。  
- [x] `PROJECT_CONFIG` 或 Ink README 补充：**生产须同时配置** `NEXT_PUBLIC_ADMIN_SECRET`（BFF）与 **ChatBI DB token 的传递方式**（header 或服务端 env）。  
- [x] 若采用方案 A：`UnifiedChatPageClient` 与 `app/api/py/unified/chat/*.ts` 有对应 E2E 或手动验收步骤。

---

## 依赖与引用

| 路径 | 说明 |
|------|------|
| `app/api/py/unified/chat/route.ts` | BFF POST JSON |
| `app/api/py/unified/chat/stream/route.ts` | BFF POST SSE |
| `components/unified-chat/UnifiedChatPageClient.tsx` | 解锁与 `fetch` headers |
| `lib/auth.ts` | `requireAdminApiSecret` / `validateAdmin`（勿破坏其它路由） |

---

## 给 Cursor 的稳定关键词

`task_chatbi_unified_bff_python_bearer_v1`、`X-ChatBI-Access-Token`、`requireAdminApiSecret`、`blog_admin_token`、`PY_API_URL`
