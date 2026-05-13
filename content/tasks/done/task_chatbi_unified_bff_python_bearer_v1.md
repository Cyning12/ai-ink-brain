# Task：Unified Chat — BFF 与 Python「DB Bearer」解耦（Ink 前端 + Next Route）

> **状态**：`done（2026-05-12 验收通过）`  
> **演进**：已收敛为 Unified **主路径** `Authorization: Bearer <ChatBI DB 明文>`；BFF **不再**对 Unified / verify / py/chat/history 执行 `requireAdminApiSecret`（详见 `content/tasks/done/task_chatbi_fake_login_unlock_401_frontend_v1.md`）。  
> **关联后端任务**：`ai-ink-brain-api-python/docs/tasks/done/task_chatbi_level_gate_v1.md`  
> **关联真值表**：`ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`

---

## 手动验收（DevTools / curl）— 回填真值

1. Python 可达、`PY_API_URL` 已设；Unified 页 **不** 依赖 Next 侧 `requireAdminApiSecret`。  
2. Unified：单框 ChatBI 明文 →「解锁」→ `GET /api/py/chatbi/access/verify`（浏览器 **`Authorization: Bearer <明文>`**）成功后进入主界面。  
3. `unified/chat/stream`：Request Headers 以 **`Authorization: Bearer <明文>`** 为主（与 Python `require_chatbi_principal` 一致）；BFF 仍可兼容 `X-ChatBI-Access-Token` 透传。  
4. 清空 `chatbi_access_token_plain` 后刷新：回到解锁 gate。

---

## 背景与问题（归档摘要）

曾出现 Next 与 Python **争用同一 `Authorization`**（Ink admin vs DB token）导致 401；已通过 **Bearer 明文专用于 ChatBI**、BFF 分层转发解决。

---

## 非范围（本任务不写死）

- Python 鉴权策略以后端任务与 `SPEC` 为准。  
- 不在本任务内实现 OAuth / 管理台签发 UI。

---

## 推荐方案（已实现摘要）

- **Unified**：浏览器 → Next → Python：`Authorization: Bearer <DB 明文>`；探活 `GET /api/py/chatbi/access/verify`。  
- **Ink 管理员**：仍用于其它 BFF（如部分 `/api/py/chat` 等），与 Unified ChatBI 路径解耦。

---

## 验收标准

- [x] 经 BFF 调用 Python Unified 时，**401 不再因「Next 与 Python 争用同一 Authorization」** 而无法联调。  
- [x] `PROJECT_CONFIG` / 任务文档说明生产须配置 `PY_API_URL` 与 ChatBI token 传递方式。  
- [x] `UnifiedChatPageClient` 与 `app/api/py/unified/chat/*.ts` 有手动验收步骤（见上节）。

---

## 依赖与引用

| 路径 | 说明 |
|------|------|
| `app/api/py/unified/chat/route.ts` | BFF POST JSON |
| `app/api/py/unified/chat/stream/route.ts` | BFF POST SSE |
| `components/unified-chat/UnifiedChatPageClient.tsx` | 解锁与 headers |
| `lib/auth.ts` | 其它路由仍可用 `requireAdminApiSecret` |

---

## 给 Cursor 的稳定关键词

`task_chatbi_unified_bff_python_bearer_v1`、`Authorization: Bearer`、`PY_API_URL`、`UnifiedChatPageClient`、`chatbi_access_token_plain`
