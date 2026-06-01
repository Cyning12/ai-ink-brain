```mermaid
flowchart LR
  %% 11_flow_api: API 请求、转发、返回（含 SSE / sources header）

  subgraph CLIENT[Client Components]
    CP["ChatPanel\ncomponents/ChatPanel.tsx"]:::c
    T2S["Text2SqlChatPanel\ncomponents/Text2SqlChatPanel.tsx"]:::c
    CHAIN["ChainChatPageClient\ncomponents/chain-chat/ChainChatPageClient.tsx"]:::c
    UNIFIED["UnifiedChatPageClient\ncomponents/unified-chat/UnifiedChatPageClient.tsx"]:::c
    ADMINHOOK["useAdminSession\nlib/hooks/useAdminSession.ts"]:::c
  end

  subgraph NEXT_API[Next Route Handlers: app/api/**/route.ts]
    AUTH_SESSION["GET /api/auth/session"]:::a
    AUTH_UNLOCK["POST /api/auth/unlock"]:::a
    PY_CHAT["POST /api/py/chat"]:::a
    PY_CHAT_HIS["GET /api/py/chat/history"]:::a
    PY_T2S["POST /api/py/text2sql/chat"]:::a
    PY_CHAIN["POST /api/py/chain/chat"]:::a
    PY_UNIFIED["POST /api/py/unified/chat"]:::a
    PY_UNIFIED_SSE["POST /api/py/unified/chat/stream (SSE)"]:::a
  end

  subgraph AUTH[Auth Gate]
    REQ["requireAdminApiSecret()\nlib/auth.ts"]:::s
    COOKIE["ADMIN_SESSION_COOKIE\n(app/api/auth/unlock sets)\nlib/auth/admin-cookie.ts"]:::s
    BEARER["Ink admin（非 Unified）/ cookie\nUnified：仅 X-ChatBI-Access-Token → Python Bearer"]:::s
  end

  subgraph PY[Python FastAPI (PY_API_URL)]
    P_CHAT["/api/py/chat (stream text/plain)"]:::p
    P_HIS["/api/py/chat/history (json)"]:::p
    P_T2S["/api/py/text2sql/chat (json)"]:::p
    P_CHAIN["/api/py/chain/chat (json events)"]:::p
    P_UNI["/api/py/unified/chat (json events)"]:::p
    P_UNI_SSE["/api/py/unified/chat/stream (text/event-stream)"]:::p
  end

  %% Admin session check (cookie-based)
  ADMINHOOK --> AUTH_SESSION --> COOKIE

  %% Unlock flow (cookie mint)
  UNIFIED --> AUTH_UNLOCK --> COOKIE

  %% RAG chat (stream) + history
  CP -->|fetchChatHistory| PY_CHAT_HIS --> REQ --> P_HIS
  CP -->|streamChat| PY_CHAT --> REQ --> P_CHAT

  %% Text2SQL / Chain / Unified JSON
  T2S --> PY_T2S --> REQ --> P_T2S
  CHAIN --> PY_CHAIN --> REQ --> P_CHAIN
  UNIFIED --> PY_UNIFIED --> REQ --> P_UNI

  %% Unified SSE (preferred)
  UNIFIED -->|fetch POST + ReadableStream| PY_UNIFIED_SSE --> REQ --> P_UNI_SSE
  %% SSE done.data stable keys（cross-repo contract）：ok, mode, run_id, session_id, request_id（v1：request_id == run_id）

  %% sources transport（RAG）
  P_CHAT --> XS["x-sources header (optional)\n+ stream tail marker ---RAG_SOURCES_JSON---\nlib/chat/chatApi.ts parses both"]:::s

  %% auth evidence in gate
  COOKIE --> REQ
  BEARER --> REQ

  classDef c fill:#f9f9f7,stroke:#999,color:#222;
  classDef a fill:#eef6ff,stroke:#4a90e2,color:#123;
  classDef s fill:#fff7e6,stroke:#d89b00,color:#553;
  classDef p fill:#f3f0ff,stroke:#7b61ff,color:#221;
```

## Unified Chat · Ink BFF 与 Python DB Bearer

- **浏览器 → Next**：`Authorization: Bearer <NEXT_PUBLIC_ADMIN_SECRET>`（或 `x-blog-admin-token` / 管理 Cookie）仅用于 `requireAdminApiSecret`。
- **浏览器 → Next（Unified / verify / RAG history BFF）**：**不**再强制 `NEXT_PUBLIC_ADMIN_SECRET`；仅 **`X-ChatBI-Access-Token: <明文>`**（`localStorage`：`chatbi_access_token_plain`）即可由 Python 鉴权；假登录触发点为 **Unified 页「解锁」**（`GET /api/py/chatbi/access/verify`）。
- **兼容**：无 `X-ChatBI-Access-Token` 时 BFF 仍透传客户端 **`Authorization`**（旧 Ink admin 客户端）。

## admin/sync · admin/ingest（维护者 · 服务端密钥）

- **维护者 → Python（推荐）**：`Authorization: Bearer <ADMIN_TOKEN>` → `POST /api/py/admin/sync`（投递计划 §3.3；`ADMIN_TOKEN` 为 shell 别名，值 = `SYNC_ADMIN_SECRET`）。
- **维护者 → BFF（curl）**：`Authorization: Bearer <SYNC_ADMIN_SECRET>` → `POST /api/admin/sync`。
- **页面 → BFF（SystemStatus）**：`chatbi_site_bearer` HttpOnly Cookie + 上游 verify 有效（与 `session.admin`）→ `POST /api/admin/sync`；`credentials: include`。
- **入站还可**：Ink admin session Cookie（`validateAdmin` · Legacy）。
- **出站 BFF → Python**：`forwardToPyAdmin` 注入 `SYNC_ADMIN_SECRET` Bearer（与 curl 路径分离）。
- **已废弃**：`x-admin-token` + 文档示例 `NEXT_PUBLIC_ADMIN_SECRET`（admin/sync 链 · 2026-06-30 移除 `x-admin-token` 兼容）。
- **真值**：`lib/auth/sync-admin-env.ts` · `require-sync-admin-access.ts` · [`SPEC-portfolio_admin_sync_auth_v1_zh.md`](../../content/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md)

## ChatBI V3 · Text2SQL 子阶段 SSE（Unified 增量路径）

- **消费入口**：`UnifiedChatPageClient` → `POST /api/py/unified/chat/stream`（`X-ChatBI-Sse-Contract: 2`）。  
- **契约帧**：`text2sql.phase.start` / `text2sql.phase.end`；终态汇总 **`tool.call.end` → `output.text2sql_phases_ms`**。  
- **任务与真值**：`content/tasks/active/task_chatbi_v3_text2sql_phase_sse_timeline_frontend_v1.md`（§V1 交付、§数据源与 UI 策略）；后端 L1 摘要见配对仓 `SPEC-ChatBI-V3-Observability-Text2SQL.md` §5.1。

## ChatBI V3 · 多轮澄清 SSE（`agent.clarify`）

- **消费入口**：同上 `UnifiedChatPageClient` SSE 路径。  
- **契约帧**：`agent.clarify`，payload 最小键 `step_number` / `message` / `prompt_for_user`（真值：`Projects/ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`；语义见 `SPEC-ChatBI-V2-Events.md` §3.2.1）。  
- **UI**：Timeline / `ChainEventCard` 与 `agent.think` 分开展示；未知 `chain.type` 走策略 B 丢弃。  
- **SSE 文本样例**：`Projects/ai-ink-brain-api-python/docs/spec/v3-agent/P0/SSE-sample-agent-clarify.md`。

## ChatBI V3 · 低置信方案预览与 `plan_execution_token`（Unified）

- **消费入口**：`UnifiedChatPageClient` 解析 SSE `agent.plan.preview`（最小键见 manifest：`plan_id`、`tool`、`sql_draft`、`warnings`、`plan_execution_token`、`expires_in_sec`）。  
- **放行请求**：用户点击「按预览执行」后，下一轮 `POST /api/py/unified/chat/stream` 的 JSON body 在 **与预览当轮相同的 `query` + `session_id`** 前提下附带 **`plan_execution_token`**（BFF 整段透传至 Python）。  
- **状态**：改写输入并发送与绑定问句不同的问题时丢弃令牌；「取消」丢弃并记录令牌以免同帧重复弹出。  
- **语义真值**：`Projects/ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md`；事件字段见 `SPEC-ChatBI-V2-Events.md` §3.2.2。

## 跨仓契约门禁（P6 · manifest 真值在后端）

| 角色 | 路径 |
| --- | --- |
| 契约真值 | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` |
| SSE 消费锚点 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| BFF 透传锚点 | `app/api/py/unified/chat/stream/route.ts` |
| 校验脚本 | `ai-ink-brain-api-python/tools/tech_graph_contract_check.py` |

工作区 sibling 布局下本地执行：`python3 ../ai-ink-brain-api-python/tools/tech_graph_contract_check.py`。前端 **quality** 默认不阻塞本脚本；详见 `99_spec.md` § 跨仓契约。

