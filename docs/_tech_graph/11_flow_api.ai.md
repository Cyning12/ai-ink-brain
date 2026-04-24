```mermaid
flowchart LR
    %% 11_flow_api: API 请求、转发、返回（含 SSE / sources header）
    %% 拓扑协议 v2-TS/Next.js 适配

    %% === 客户端 ===
    subgraph CLIENT[[Client Components]]
        CP[[ChatPanel]]
        // → components/ChatPanel.tsx
        T2S[[Text2SqlChatPanel]]
        // → components/Text2SqlChatPanel.tsx
        CHAIN[[ChainChatPageClient]]
        // → components/chain-chat/ChainChatPageClient.tsx
        UNIFIED[[UnifiedChatPageClient]]
        // → components/unified-chat/UnifiedChatPageClient.tsx
        ADMINHOOK[[useAdminSession]]
        // → lib/hooks/useAdminSession.ts
    end

    %% === Next API ===
    subgraph NEXT_API[[Next Route Handlers]]
        AUTH_SESSION[[GET /api/auth/session]]
        // → app/api/auth/session/route.ts
        AUTH_UNLOCK[[POST /api/auth/unlock]]
        // → app/api/auth/unlock/route.ts
        PY_CHAT[[POST /api/py/chat]]
        // → app/api/py/chat/route.ts
        PY_CHAT_HIS[[GET /api/py/chat/history]]
        // → app/api/py/chat/history/route.ts
        PY_T2S[[POST /api/py/text2sql/chat]]
        // → app/api/py/text2sql/chat/route.ts
        PY_CHAIN[[POST /api/py/chain/chat]]
        // → app/api/py/chain/chat/route.ts
        PY_UNIFIED[[POST /api/py/unified/chat]]
        // → app/api/py/unified/chat/route.ts
        PY_UNIFIED_SSE[[POST /api/py/unified/chat/stream]]
        // → app/api/py/unified/chat/stream/route.ts
    end

    %% === Auth Gate ===
    subgraph AUTH[[Auth Gate]]
        REQ[[requireAdminApiSecret()]]
        // → lib/auth.ts
        COOKIE[[ADMIN_SESSION_COOKIE]]
        // → lib/auth/admin-cookie.ts
        BEARER[[Authorization: Bearer]]
        // → localStorage: blog_admin_token
    end

    %% === Python 后端 ===
    subgraph PY[[Python FastAPI]]
        P_CHAT[[/api/py/chat]]
        P_HIS[[/api/py/chat/history]]
        P_T2S[[/api/py/text2sql/chat]]
        P_CHAIN[[/api/py/chain/chat]]
        P_UNI[[/api/py/unified/chat]]
        P_UNI_SSE[[/api/py/unified/chat/stream]]
    end

    %% === Session 检查 ===
    ADMINHOOK --"~>"--> AUTH_SESSION --"->"--> COOKIE

    %% === Unlock ===
    UNIFIED --"~>"--> AUTH_UNLOCK --"->"--> COOKIE

    %% === RAG Chat ===
    CP --"fetchChatHistory"--> PY_CHAT_HIS --"->"--> REQ --"~>"--> P_HIS
    CP --"streamChat"--> PY_CHAT --"->"--> REQ --"~>"--> P_CHAT

    %% === Text2SQL / Chain / Unified ===
    T2S --"~>"--> PY_T2S --"->"--> REQ --"~>"--> P_T2S
    CHAIN --"~>"--> PY_CHAIN --"->"--> REQ --"~>"--> P_CHAIN
    UNIFIED --"~>"--> PY_UNIFIED --"->"--> REQ --"~>"--> P_UNI

    %% === Unified SSE ===
    UNIFIED --"fetch POST + ReadableStream"--> PY_UNIFIED_SSE --"->"--> REQ --"~>"--> P_UNI_SSE

    %% === Sources 传输 ===
    P_CHAT --"::yields"--> XS[[x-sources header]]
    // → lib/chat/chatApi.ts

    %% === Auth 证据 ===
    COOKIE --"->"--> REQ
    BEARER --"->"--> REQ

    %% === 样式 ===
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef api fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef auth fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef py fill:#f3e5f5,stroke:#4a148c,stroke-width:1px

    class CP,T2S,CHAIN,UNIFIED,ADMINHOOK client
    class AUTH_SESSION,AUTH_UNLOCK,PY_CHAT,PY_CHAT_HIS,PY_T2S,PY_CHAIN,PY_UNIFIED,PY_UNIFIED_SSE api
    class REQ,COOKIE,BEARER auth
    class P_CHAT,P_HIS,P_T2S,P_CHAIN,P_UNI,P_UNI_SSE,XS py
```
