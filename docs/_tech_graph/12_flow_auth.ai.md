```mermaid
flowchart TD
    %% 12_flow_auth: 登录、权限、Session、Bearer
    %% 拓扑协议 v2-TS/Next.js 适配

    %% === UI 层 ===
    subgraph UI[[Client/UI]]
        LS[[localStorage: blog_admin_token]]
        // → components/ChatPanel.tsx
        TOKEN[[Authorization: Bearer]]
        UNLOCK_UI[[输入 secret]]
        // → POST /api/auth/unlock
        SESSION_UI[[useAdminSession()]]
        // → GET /api/auth/session
    end

    %% === Next API ===
    subgraph NEXT[[Next Route Handlers]]
        API_UNLOCK[[POST /api/auth/unlock]]
        // → app/api/auth/unlock/route.ts
        API_SESSION[[GET /api/auth/session]]
        // → app/api/auth/session/route.ts
        API_PY[[/api/py/*]]
        // → app/api/py/**/route.ts
    end

    %% === Auth Core ===
    subgraph AUTH_CORE[[Auth Core]]
        ENV[[getAdminApiSecret()]]
        // → lib/auth/admin-env.ts
        PARSE[[getAdminTokenFromRequest()]]
        // → lib/auth/parse-admin-token.ts
        COOKIE[[ADMIN_SESSION_COOKIE]]
        // → lib/auth/admin-cookie.ts
        VALIDATE[[validateAdmin()]]
        // → lib/auth.ts
        REQ[[requireAdminApiSecret()]]
        // → lib/auth.ts
        TSE[[timingSafeEqual()]]
        // → node:crypto
    end

    %% === Unlock 流程 ===
    UNLOCK_UI --"~>"--> API_UNLOCK --"->"--> ENV
    ENV --"[secret configured]"--> TSE
    TSE --"[ok]"--> COOKIE
    COOKIE --"Set-Cookie HttpOnly"--> SESSION_UI

    %% === Session 检查 ===
    SESSION_UI --"~>"--> API_SESSION --"->"--> ENV
    API_SESSION --"->"--> COOKIE

    %% === Bearer 路径 ===
    LS --"->"--> TOKEN --"->"--> API_PY

    %% === Request Gate ===
    API_PY --"->"--> REQ --"->"--> VALIDATE
    VALIDATE --"[cookie ok]"--> COOKIE
    VALIDATE --"[else]"--> PARSE --"->"--> TSE --"[match]"--> ENV

    %% === 结果 ===
    REQ --"[401]"--> DENY[[Unauthorized]]
    REQ --"[pass]"--> UPSTREAM[(Python FastAPI)]
    // → PY_API_URL

    %% === 样式 ===
    classDef ui fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef api fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef core fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef err fill:#ffebee,stroke:#b71c1c,stroke-width:1px
    classDef infra fill:#f3e5f5,stroke:#4a148c,stroke-width:1px

    class LS,TOKEN,UNLOCK_UI,SESSION_UI ui
    class API_UNLOCK,API_SESSION,API_PY api
    class ENV,PARSE,COOKIE,VALIDATE,REQ,TSE core
    class DENY err
    class UPSTREAM infra
```
