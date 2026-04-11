# 前端任务：RAG 对话对接（流式 + session 长记忆 + 历史恢复）

> **给前端 Agent**：按本文实现即可对接当前 Python 后端。本文档位于后端仓库 `tasks/` 目录，**不随业务代码强绑定**；完成后请在下文「完成标记」处勾选并注明日期/PR。

---

## 角色与目标

你是 **Senior Front-end Engineer**。在现有前端项目中对接 **AI-Ink-Brain RAG 后端**（FastAPI，可部署在 Vercel），实现：

- **流式对话**（`text/plain` 流）
- **`session_id` 长记忆**（每轮写入由后端完成；前端负责稳定传递 `session_id`）
- **刷新/重新打开页面后恢复聊天记录**（调用历史接口）

---

## 1. 环境与鉴权

- **不要**在前端使用 `SUPABASE_SERVICE_ROLE_KEY` 或直连 Supabase 读写 `rag_conversation_logs`；持久化由后端完成。
- 受保护接口的鉴权与后端 `_require_auth` 一致，Header **任选其一**：

  - `Authorization: Bearer <ADMIN_SECRET>`
  - 或 `x-blog-admin-token: <ADMIN_SECRET>`
  - 或 `x-admin-token: <ADMIN_SECRET>`（若项目已用）

- Secret 来自前端环境变量（按框架规范，例如 Next.js：`NEXT_PUBLIC_ADMIN_SECRET`），**禁止**硬编码进仓库。

---

## 2. `session_id` 策略（必须）

- 每个对话会话绑定一个 **`session_id: string`**（建议 `crypto.randomUUID()`）。
- **同一对话**在刷新、路由切换后仍应保持同一 `session_id`（例如 `localStorage`，key 建议：`ink_brain_rag_session:<可选 scope>`；本仓库实现为 **`rag_session_id:<scope>`**）。
- **新对话**按钮：生成新 `session_id`、清空 UI 消息列表。

---

## 3. 接口一：流式聊天

- **方法 / 路径**：`POST /api/py/chat`
- **Content-Type**：`application/json`
- **Body（JSON）**：

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | `session_id` | string | 是 | 不能为空；与历史接口一致 |
  | `messages` | array | 是 | `{ role, content }`；后端取**最后一条 user** 作为本轮 `query` |

- **响应**：

  - `Content-Type: text/plain; charset=utf-8`
  - **流式正文**（非 SSE）：按 chunk 解码 UTF-8 并追加到当前 assistant 气泡

- **前端行为**：

  - `fetch` + `ReadableStream` + `TextDecoder`
  - `AbortController` 支持「停止生成」
  - 发送前校验 `session_id`，否则后端 **400** `Missing session_id`

---

## 4. 接口二：历史恢复（必须对接）

- **方法 / 路径**：`GET /api/py/chat/history`
- **Query**：

  | 参数 | 必填 | 说明 |
  |------|------|------|
  | `session_id` | 是 | 与 `POST /api/py/chat` 相同 |
  | `limit` | 否 | 默认 `100`，范围 `1`–`200`（最近多少轮日志再按时间正序展开） |

- **鉴权**：与 `POST /api/py/chat` 完全相同。

- **成功响应（JSON）**：

```json
{
  "ok": true,
  "session_id": "uuid-string",
  "messages": [
    { "role": "user", "content": "...", "created_at": "..." },
    { "role": "assistant", "content": "...", "created_at": "..." }
  ]
}
```

- **错误**：401 鉴权失败；400 `session_id` 缺失；500 可能含 `error_type: "DATABASE_DISCONNECT"`（按后端约定展示友好文案）。

---

## 5. 页面生命周期（必须）

1. **挂载时**：若本地已有 `session_id`，先 `GET /api/py/chat/history?session_id=...`，用返回的 `messages` 初始化 UI。
2. **发送消息**：追加 user 消息 → `POST /api/py/chat` 流式渲染 assistant。
3. **新会话**：新 `session_id` + 清空 `messages`。

---

## 6. 建议交付结构

- `lib/ragApi.ts`（或项目等价路径）  
  - `fetchChatHistory({ sessionId, limit?, signal? })`  
  - `streamChat({ sessionId, messages, signal, onToken })`
- `hooks/useRagSession.ts`：`sessionId` 持久化 + `resetSession()`
- `components/RagChat.tsx`（或接入现有 Chat）：历史加载 + 流式 + 停止 + 新会话

**本仓库实际路径（已完成）**：

- `lib/chat/chatApi.ts`：`streamChat`、`fetchChatHistory`
- `lib/hooks/useSessionId.ts`：`sessionId` + `resetSession()`
- `app/api/py/chat/route.ts`、`app/api/py/chat/history/route.ts`：Next BFF 转发 `PY_API_URL`
- `components/ChatPanel.tsx`：解锁后拉历史、流式、中止、新会话

---

## 7. 验收自检

- [x] 同一 `session_id` 连续多轮对话，刷新后历史接口能还原 user/assistant 交替列表  
- [x] 新会话后历史与旧会话隔离  
- [x] 流式可被中止；错误态不泄漏密钥  
- [x] TypeScript 严格类型，避免 `any`

---

## 8. 明确不做

- 不直连 Supabase 读 `rag_conversation_logs`  
- 不擅自改后端路径与鉴权约定（若与产品文档冲突，先对齐再改）

---

## 自测（可选）

数据库中已有 **`session_id`** = `1e01381d-bbf2-4aff-846d-0872dc8ceede` 的会话数据时，可在浏览器控制台执行：

```js
localStorage.setItem("rag_session_id:floating", "1e01381d-bbf2-4aff-846d-0872dc8ceede");
```

刷新页面 → 打开右下角 Chat → 输入 `NEXT_PUBLIC_ADMIN_SECRET` 解锁 → 应看到该 session 的持久化消息列表。

---

## 完成标记（人工 / Agent 回填）

执行完成后请勾选并补充信息（便于后端仓库追踪，**本文件可不提交或随 tasks 一起提交，由团队约定**）。

| 项 | 状态 |
|----|------|
| 任务已完成 | [x] 是 |
| 完成日期 | 2026-04-11 |
| 前端 PR / 分支 | 含 `fetchChatHistory` + `app/api/py/chat/history` + `ChatPanel` 挂载恢复 |
| 对接的后端部署环境 | （按实际 Vercel / 自建填写） |
| 备注 | `localStorage` key：`rag_session_id:<scope>`；历史加载完成前禁用发送，避免与首包竞态。 |

**文件名约定**：本任务已完成，原文件重命名为 `content/tasks/frontend-rag-chat-integration-完成.md`。
