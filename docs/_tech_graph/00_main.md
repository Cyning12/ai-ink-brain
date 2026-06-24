---
graph_id: 00_main
version: 
generated_at: 2026-06-24T12:45:13Z
source: docs/_tech_graph/00_main.graph.yaml
---

# 00_main

## Mermaid

```mermaid
flowchart TD
    ABOUT[/about]
    ADMINS[useAdminSession()]
    APP[APP]
    AUTH[requireAdminApiSecret()]
    BLOG[/blog]
    BLOGSLUG[/blog/[...slug]
    CCP[ChainChatPageClient]
    CHAIN[/chain-chat]
    CHAT[/chat]
    CP[ChatPanel]
    DIARY[/diary]
    G_API[>11_flow_api.md]
    G_AUTH[>12_flow_auth.md]
    G_COMP[>13_flow_components.md]
    G_ROUTE[>10_flow_route.md]
    G_SPEC[>99_spec.md]
    G_STRUCT[>01_struct.md]
    G_VER[>02_version.md]
    HOME[/ Home]
    L[app/layout.tsx]
    LEARNING[/learning]
    NAV[SiteNav]
    NAVFILTER[过滤导航项]
    PROJECTS[/projects]
    PY[(Python FastAPI)]
    PY_CHAIN[PY_CHAIN]
    PY_CHAT[PY_CHAT]
    PY_T2S[PY_T2S]
    PY_UNIFIED[PY_UNIFIED]
    PY_UNIFIED_SSE[PY_UNIFIED_SSE]
    ROUTER[路由匹配]
    T2P[Text2SqlChatPanel]
    T2S[/text2sql]
    UCP[UnifiedChatPageClient]
    UNIFIED[/unified-chat]
    OPS_CHAT[/ops/kimi-code/chat (P1)]
    G_OPS_CHAT[>14_flow_ops_chat.md]

    ADMINS --> NAVFILTER
    APP --"加载"--> G_SPEC
    APP --"加载"--> G_VER
    AUTH --"加载"--> G_AUTH
    AUTH --"~>"--> PY
    // → PY_API_URL
    CHAIN --> CCP
    // → components/chain-chat/ChainChatPageClient.tsx
    CHAT --> CP
    // → components/ChatPanel.tsx
    CP --"加载"--> G_API
    HOME --"加载"--> G_ROUTE
    L --> NAV
    // → app/layout.tsx
    L --> ROUTER
    // → app/**/page.tsx
    NAV --> ADMINS
    // → lib/hooks/useAdminSession.ts
    NAVFILTER --"[admin]"--> ROUTER
    NAVFILTER --"[non-admin]"--> ROUTER
    PY_CHAIN --> AUTH
    PY_CHAT --> AUTH
    // → lib/auth.ts
    PY_T2S --> AUTH
    PY_UNIFIED --> AUTH
    PY_UNIFIED_SSE --> AUTH
    ROUTER --> ABOUT
    // → app/about/page.tsx
    ROUTER --> BLOG
    // → app/blog/page.tsx
    ROUTER --> BLOGSLUG
    // → app/blog/[...slug]/page.tsx
    ROUTER --> CHAIN
    // → app/chain-chat/page.tsx
    ROUTER --> CHAT
    // → app/chat/page.tsx
    ROUTER --> DIARY
    // → app/diary/page.tsx
    ROUTER --"加载"--> G_STRUCT
    ROUTER --> HOME
    // → app/page.tsx
    ROUTER --> LEARNING
    // → app/learning/page.tsx
    ROUTER --> PROJECTS
    // → app/projects/page.tsx
    ROUTER --> T2S
    // → app/text2sql/page.tsx
    ROUTER --> UNIFIED
    // → app/unified-chat/page.tsx
    T2S --> T2P
    // → components/Text2SqlChatPanel.tsx
    UCP --"加载"--> G_COMP
    UNIFIED --> UCP
    // → components/unified-chat/UnifiedChatPageClient.tsx
    // → app/api/auth/session/route.ts
    // → app/api/auth/unlock/route.ts
    // → app/api/py/chat/route.ts
    // → app/api/py/chat/history/route.ts
    // → app/api/py/text2sql/chat/route.ts
    // → app/api/py/chain/chat/route.ts
    // → app/api/py/unified/chat/route.ts
    // → app/api/py/unified/chat/stream/route.ts
    // → app/api/system/status/route.ts
    ROUTER --> OPS_CHAT
    // → app/ops/kimi-code/chat/page.tsx::(P1 · 规划)
    OPS_CHAT --"加载"--> G_OPS_CHAT
    APP --"加载"--> G_OPS_CHAT

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class AUTH infra
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| ABOUT | /about |  |
| ADMINS | useAdminSession() |  |
| APP | APP |  |
| AUTH | requireAdminApiSecret() |  |
| BLOG | /blog |  |
| BLOGSLUG | /blog/[...slug |  |
| CCP | ChainChatPageClient |  |
| CHAIN | /chain-chat |  |
| CHAT | /chat |  |
| CP | ChatPanel |  |
| DIARY | /diary |  |
| G_API | >11_flow_api.md |  |
| G_AUTH | >12_flow_auth.md |  |
| G_COMP | >13_flow_components.md |  |
| G_ROUTE | >10_flow_route.md |  |
| G_SPEC | >99_spec.md |  |
| G_STRUCT | >01_struct.md |  |
| G_VER | >02_version.md |  |
| HOME | / Home |  |
| L | app/layout.tsx |  |
| LEARNING | /learning |  |
| NAV | SiteNav |  |
| NAVFILTER | 过滤导航项 |  |
| PROJECTS | /projects |  |
| PY | (Python FastAPI) |  |
| PY_CHAIN | PY_CHAIN |  |
| PY_CHAT | PY_CHAT |  |
| PY_T2S | PY_T2S |  |
| PY_UNIFIED | PY_UNIFIED |  |
| PY_UNIFIED_SSE | PY_UNIFIED_SSE |  |
| ROUTER | 路由匹配 |  |
| T2P | Text2SqlChatPanel |  |
| T2S | /text2sql |  |
| UCP | UnifiedChatPageClient |  |
| UNIFIED | /unified-chat |  |
| OPS_CHAT | /ops/kimi-code/chat (P1) |  |
| G_OPS_CHAT | >14_flow_ops_chat.md |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| ADMINS | NAVFILTER | -> | depends_on |  |  |
| APP | G_SPEC | -> | depends_on | 加载 |  |
| APP | G_VER | -> | depends_on | 加载 |  |
| AUTH | G_AUTH | -> | depends_on | 加载 |  |
| AUTH | PY | ~> | async_calls |  | 1 anchor(s) |
| CHAIN | CCP | -> | depends_on |  | 1 anchor(s) |
| CHAT | CP | -> | depends_on |  | 1 anchor(s) |
| CP | G_API | -> | depends_on | 加载 |  |
| HOME | G_ROUTE | -> | depends_on | 加载 |  |
| L | NAV | -> | depends_on |  | 1 anchor(s) |
| L | ROUTER | -> | depends_on |  | 1 anchor(s) |
| NAV | ADMINS | -> | depends_on |  | 1 anchor(s) |
| NAVFILTER | ROUTER | [admin] | depends_on |  |  |
| NAVFILTER | ROUTER | [non-admin] | depends_on |  |  |
| PY_CHAIN | AUTH | -> | depends_on |  |  |
| PY_CHAT | AUTH | -> | depends_on |  | 1 anchor(s) |
| PY_T2S | AUTH | -> | depends_on |  |  |
| PY_UNIFIED | AUTH | -> | depends_on |  |  |
| PY_UNIFIED_SSE | AUTH | -> | depends_on |  |  |
| ROUTER | ABOUT | -> | depends_on |  | 1 anchor(s) |
| ROUTER | BLOG | -> | depends_on |  | 1 anchor(s) |
| ROUTER | BLOGSLUG | -> | depends_on |  | 1 anchor(s) |
| ROUTER | CHAIN | -> | depends_on |  | 1 anchor(s) |
| ROUTER | CHAT | -> | depends_on |  | 1 anchor(s) |
| ROUTER | DIARY | -> | depends_on |  | 1 anchor(s) |
| ROUTER | G_STRUCT | -> | depends_on | 加载 |  |
| ROUTER | HOME | -> | depends_on |  | 1 anchor(s) |
| ROUTER | LEARNING | -> | depends_on |  | 1 anchor(s) |
| ROUTER | PROJECTS | -> | depends_on |  | 1 anchor(s) |
| ROUTER | T2S | -> | depends_on |  | 1 anchor(s) |
| ROUTER | UNIFIED | -> | depends_on |  | 1 anchor(s) |
| T2S | T2P | -> | depends_on |  | 1 anchor(s) |
| UCP | G_COMP | -> | depends_on | 加载 |  |
| UNIFIED | UCP | -> | depends_on |  | 10 anchor(s) |
| ROUTER | OPS_CHAT | -> | depends_on |  | 1 anchor(s) |
| OPS_CHAT | G_OPS_CHAT | -> | depends_on | 加载 |  |
| APP | G_OPS_CHAT | -> | depends_on | 加载 |  |

## Sub-graph Links

- `Struct`: [`01_struct.md`](01_struct.md)（手写 · 无 `.graph.yaml`）
- `Version`: [`02_version.md`](02_version.md)（手写 · 无 `.graph.yaml`）
- `Route Flow`: [`10_flow_route.md`](10_flow_route.md)（编辑源：[10_flow_route.graph.yaml](10_flow_route.graph.yaml)）
- `API Flow`: [`11_flow_api.md`](11_flow_api.md)（编辑源：[11_flow_api.graph.yaml](11_flow_api.graph.yaml)）
- `Auth Flow`: [`12_flow_auth.md`](12_flow_auth.md)（编辑源：[12_flow_auth.graph.yaml](12_flow_auth.graph.yaml)）
- `Components Flow`: [`13_flow_components.md`](13_flow_components.md)（编辑源：[13_flow_components.graph.yaml](13_flow_components.graph.yaml)）
- `Spec`: [`99_spec.md`](99_spec.md)
- `Mermaid Protocol`: [`99_mermaid_protocol.md`](99_mermaid_protocol.md) — 拓扑图绘制规范

> **F0 决策备忘**：`00_main.md` 不嵌入 `AUTO:ENDPOINTS_AND_ANCHORS` 块（保持人类友好）；`_manifest.json` 仍由现有工具维护。

