```mermaid
flowchart TD
    %% 00_main: Next.js 顶层总图（路由 + 入口 + 渲染）
    %% 拓扑协议 v2-TS/Next.js 适配

    %% === App 入口 ===
    subgraph APP[[Next.js App Router]]
        L[[app/layout.tsx]] --"->"--> NAV[[SiteNav]]
        // → app/layout.tsx
        L --"->"--> ROUTER{路由匹配}
        // → app/**/page.tsx
    end

    %% === 权限过滤 ===
    NAV --"->"--> ADMINS[[useAdminSession()]]
    // → lib/hooks/useAdminSession.ts
    ADMINS --"->"--> NAVFILTER{过滤导航项}
    NAVFILTER --"[admin]"--> ROUTER
    NAVFILTER --"[non-admin]"--> ROUTER

    %% === 页面路由 ===
    ROUTER --"->"--> HOME[[/ Home]]
    // → app/page.tsx
    ROUTER --"->"--> BLOG[[/blog]]
    // → app/blog/page.tsx
    ROUTER --"->"--> BLOGSLUG[[/blog/[...slug]]]
    // → app/blog/[...slug]/page.tsx
    ROUTER --"->"--> LEARNING[[/learning]]
    // → app/learning/page.tsx
    ROUTER --"->"--> PROJECTS[[/projects]]
    // → app/projects/page.tsx
    ROUTER --"->"--> DIARY[[/diary]]
    // → app/diary/page.tsx
    ROUTER --"->"--> ABOUT[[/about]]
    // → app/about/page.tsx

    ROUTER --"->"--> CHAT[[/chat]]
    // → app/chat/page.tsx
    ROUTER --"->"--> T2S[[/text2sql]]
    // → app/text2sql/page.tsx
    ROUTER --"->"--> CHAIN[[/chain-chat]]
    // → app/chain-chat/page.tsx
    ROUTER --"->"--> UNIFIED[[/unified-chat]]
    // → app/unified-chat/page.tsx

    %% === 客户端组件 ===
    CHAT --"->"--> CP[[ChatPanel]]
    // → components/ChatPanel.tsx
    T2S --"->"--> T2P[[Text2SqlChatPanel]]
    // → components/Text2SqlChatPanel.tsx
    CHAIN --"->"--> CCP[[ChainChatPageClient]]
    // → components/chain-chat/ChainChatPageClient.tsx
    UNIFIED --"->"--> UCP[[UnifiedChatPageClient]]
    // → components/unified-chat/UnifiedChatPageClient.tsx

    %% === API 路由 ===
    subgraph API[[Next Route Handlers]]
        A_SESSION[[GET /api/auth/session]]
        // → app/api/auth/session/route.ts
        A_UNLOCK[[POST /api/auth/unlock]]
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
        SYS[[GET /api/system/status]]
        // → app/api/system/status/route.ts
    end

    %% === 鉴权 ===
    PY_CHAT --"->"--> AUTH[[requireAdminApiSecret()]]
    // → lib/auth.ts
    PY_T2S --"->"--> AUTH
    PY_CHAIN --"->"--> AUTH
    PY_UNIFIED --"->"--> AUTH
    PY_UNIFIED_SSE --"->"--> AUTH

    %% === 下游 Python ===
    AUTH --"~>"--> PY[(Python FastAPI)]
    // → PY_API_URL

    %% === 子流程链接 ===
    HOME --"加载"--> G_ROUTE[>10_flow_route.md]
    CP --"加载"--> G_API[>11_flow_api.md]
    AUTH --"加载"--> G_AUTH[>12_flow_auth.md]
    UCP --"加载"--> G_COMP[>13_flow_components.md]
    ROUTER --"加载"--> G_STRUCT[>01_struct.md]
    APP --"加载"--> G_VER[>02_version.md]
    APP --"加载"--> G_SPEC[>99_spec.md]

    %% === 样式 ===
    classDef app fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef page fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef comp fill:#f3e5f5,stroke:#4a148c,stroke-width:1px
    classDef api fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#eceff1,stroke:#455a64,stroke-width:1px

    class L,NAV,ROUTER,ADMINS,NAVFILTER app
    class HOME,BLOG,BLOGSLUG,LEARNING,PROJECTS,DIARY,ABOUT,CHAT,T2S,CHAIN,UNIFIED page
    class CP,T2P,CCP,UCP comp
    class A_SESSION,A_UNLOCK,PY_CHAT,PY_CHAT_HIS,PY_T2S,PY_CHAIN,PY_UNIFIED,PY_UNIFIED_SSE,SYS,AUTH api
    class PY,G_ROUTE,G_API,G_AUTH,G_COMP,G_STRUCT,G_VER,G_SPEC infra
```
