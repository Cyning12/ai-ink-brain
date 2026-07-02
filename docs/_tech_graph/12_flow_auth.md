---
graph_id: 12_flow_auth
version: 
generated_at: 2026-07-02T11:26:38Z
source: docs/_tech_graph/12_flow_auth.graph.yaml
---

# 12_flow_auth

## Mermaid

```mermaid
flowchart TD
    API_PY[API_PY]
    API_SESSION[API_SESSION]
    API_UNLOCK[API_UNLOCK]
    DENY[Unauthorized]
    ENV[ENV]
    LS[LS]
    PARSE[PARSE]
    PFENV[PFENV]
    PFSESS[PFSESS]
    SESSION_UI[SESSION_UI]
    TOKEN[TOKEN]
    TSE[TSE]
    UNLOCK_UI[UNLOCK_UI]
    UPSTREAM[(Python FastAPI)]
    VALIDATE[VALIDATE]
    OPS_ENV[OPS_DESK_SECRET]
    OPS_LOGIN_API[/api/ops/login]
    OPS_SESSION_API[/api/ops/auth/session]
    OPS_COOKIE[ops_desk_token]
    OPS_LOGIN_UI[/ops/login]
    OPS_MW[middleware.ts /ops/*]
    OPS_BFF[/api/ops/*]
    OPS_DENY[Unauthorized]

    API_PY --> REQ
    API_SESSION --> COOKIE
    // → lib/auth/admin-cookie.ts
    API_SESSION --> ENV
    API_SESSION --> PFSESS
    // → lib/auth/portfolio-session.ts
    API_UNLOCK --> ENV
    API_UNLOCK --"[secret]"--> PFENV
    // → lib/auth/portfolio-env.ts
    COOKIE --"Set-Cookie HttpOnly"--> SESSION_UI
    ENV --"[Ink secret configured]"--> TSE
    LS --> TOKEN
    PARSE --> TSE
    PFENV --"[visitor|visitor-admin]"--> PFSESS
    // → lib/auth/portfolio-session.ts
    PFSESS --"Set-Cookie HttpOnly"--> SESSION_UI
    // → lib/hooks/useAdminSession.ts
    REQ --"[401]"--> DENY
    // → lib/auth.ts
    REQ --"[pass]"--> UPSTREAM
    // → PY_API_URL
    REQ --> VALIDATE
    SESSION_UI --"~>"--> API_SESSION
    TOKEN --> API_PY
    // → app/api/py/**/route.ts
    TSE --"[ok]"--> COOKIE
    TSE --"[match]"--> ENV
    // → lib/auth/parse-admin-token.ts
    UNLOCK_UI --"~>"--> API_UNLOCK
    // → components/ChatPanel.tsx
    // → app/api/auth/unlock/route.ts
    // → app/api/auth/session/route.ts
    // → app/api/py/**/route.ts
    // → lib/auth/admin-env.ts
    // → lib/auth/portfolio-env.ts
    // → lib/auth/portfolio-session.ts
    // → lib/auth/parse-admin-token.ts
    // → lib/auth/admin-cookie.ts
    // → lib/auth.ts
    // → lib/auth.ts
    // → node:crypto
    VALIDATE --"[cookie ok]"--> COOKIE
    // → lib/auth/admin-cookie.ts
    VALIDATE --"[else]"--> PARSE
    OPS_LOGIN_API --> OPS_ENV
    // → lib/auth/ops-env.ts
    OPS_LOGIN_API --"Set-Cookie HttpOnly"--> OPS_COOKIE
    // → lib/auth/ops-session.ts
    OPS_SESSION_API --> OPS_ENV
    // → lib/auth/ops-env.ts
    // → lib/auth/ops-session.ts
    OPS_SESSION_API --> OPS_COOKIE
    // → lib/auth/ops-session.ts
    OPS_COOKIE --> OPS_MW
    // → lib/auth/ops-session.ts
    OPS_MW --"[401]"--> OPS_DENY
    // → middleware.ts
    OPS_MW --"[pass]"--> OPS_BFF
    // → middleware.ts
    // → app/api/ops/[...slug]/route.ts
    OPS_BFF --> OPS_ENV
    // → lib/auth/ops-session.ts
    OPS_BFF --"[401]"--> OPS_DENY
    // → lib/auth/ops-session.ts
    OPS_LOGIN_UI --"~>"--> OPS_LOGIN_API
    // → app/ops/login/page.tsx

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| API_PY | API_PY |  |
| API_SESSION | API_SESSION |  |
| API_UNLOCK | API_UNLOCK |  |
| DENY | Unauthorized |  |
| ENV | ENV |  |
| LS | LS |  |
| PARSE | PARSE |  |
| PFENV | PFENV |  |
| PFSESS | PFSESS |  |
| SESSION_UI | SESSION_UI |  |
| TOKEN | TOKEN |  |
| TSE | TSE |  |
| UNLOCK_UI | UNLOCK_UI |  |
| UPSTREAM | (Python FastAPI) |  |
| VALIDATE | VALIDATE |  |
| OPS_ENV | OPS_DESK_SECRET |  |
| OPS_LOGIN_API | /api/ops/login |  |
| OPS_SESSION_API | /api/ops/auth/session |  |
| OPS_COOKIE | ops_desk_token |  |
| OPS_LOGIN_UI | /ops/login |  |
| OPS_MW | middleware.ts /ops/* |  |
| OPS_BFF | /api/ops/* |  |
| OPS_DENY | Unauthorized |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| API_PY | REQ | -> | depends_on |  |  |
| API_SESSION | COOKIE | -> | depends_on |  | 1 anchor(s) |
| API_SESSION | ENV | -> | depends_on |  |  |
| API_SESSION | PFSESS | -> | depends_on |  | 1 anchor(s) |
| API_UNLOCK | ENV | -> | depends_on |  |  |
| API_UNLOCK | PFENV | [secret] | depends_on |  | 1 anchor(s) |
| COOKIE | SESSION_UI | -> | depends_on | Set-Cookie HttpOnly |  |
| ENV | TSE | [Ink secret configured] | depends_on |  |  |
| LS | TOKEN | -> | depends_on |  |  |
| PARSE | TSE | -> | depends_on |  |  |
| PFENV | PFSESS | [visitor|visitor-admin] | depends_on |  | 1 anchor(s) |
| PFSESS | SESSION_UI | -> | depends_on | Set-Cookie HttpOnly | 1 anchor(s) |
| REQ | DENY | [401] | depends_on |  | 1 anchor(s) |
| REQ | UPSTREAM | [pass] | depends_on |  | 1 anchor(s) |
| REQ | VALIDATE | -> | depends_on |  |  |
| SESSION_UI | API_SESSION | ~> | async_calls |  |  |
| TOKEN | API_PY | -> | depends_on |  | 1 anchor(s) |
| TSE | COOKIE | [ok] | depends_on |  |  |
| TSE | ENV | [match] | depends_on |  | 1 anchor(s) |
| UNLOCK_UI | API_UNLOCK | ~> | async_calls |  | 12 anchor(s) |
| VALIDATE | COOKIE | [cookie ok] | depends_on |  | 1 anchor(s) |
| VALIDATE | PARSE | [else] | depends_on |  |  |
| OPS_LOGIN_API | OPS_ENV | -> | depends_on |  | 1 anchor(s) |
| OPS_LOGIN_API | OPS_COOKIE | -> | depends_on | Set-Cookie HttpOnly | 1 anchor(s) |
| OPS_SESSION_API | OPS_ENV | -> | depends_on |  | 2 anchor(s) |
| OPS_SESSION_API | OPS_COOKIE | -> | depends_on |  | 1 anchor(s) |
| OPS_COOKIE | OPS_MW | -> | depends_on |  | 1 anchor(s) |
| OPS_MW | OPS_DENY | [401] | depends_on |  | 1 anchor(s) |
| OPS_MW | OPS_BFF | [pass] | depends_on |  | 2 anchor(s) |
| OPS_BFF | OPS_ENV | -> | depends_on |  | 1 anchor(s) |
| OPS_BFF | OPS_DENY | [401] | depends_on |  | 1 anchor(s) |
| OPS_LOGIN_UI | OPS_LOGIN_API | ~> | async_calls |  | 1 anchor(s) |
