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
    BEARER["Authorization: Bearer <blog_admin_token>\nlocalStorage: blog_admin_token"]:::s
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

