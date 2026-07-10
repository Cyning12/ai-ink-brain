---
graph_id: 11_flow_api
version: 
generated_at: 2026-07-10T03:06:11Z
source: docs/_tech_graph/11_flow_api.graph.yaml
---

# 11_flow_api

## Mermaid

```mermaid
flowchart TD
    ADMINHOOK[ADMINHOOK]
    AUTH_SESSION[AUTH_SESSION]
    AUTH_UNLOCK[AUTH_UNLOCK]
    BEARER[BEARER]
    COOKIE[COOKIE]
    FRAG[FRAG]
    PSP[PSP]
    PY_CHAT_HIS[PY_CHAT_HIS]
    P_CHAIN[P_CHAIN]
    P_CHAT[P_CHAT]
    P_HIS[P_HIS]
    P_T2S[P_T2S]
    P_UNI_SSE[P_UNI_SSE]
    REQ[REQ]
    XS[x-sources header]

    ADMINHOOK --"~>"--> AUTH_SESSION
    // → components/ChatPanel.tsx
    // → components/Text2SqlChatPanel.tsx
    // → components/chain-chat/ChainChatPageClient.tsx
    // → components/unified-chat/UnifiedChatPageClient.tsx
    // → lib/hooks/useAdminSession.ts
    // → app/api/auth/session/route.ts
    // → app/api/auth/unlock/route.ts
    // → app/api/py/chat/route.ts
    // → app/api/py/chat/history/route.ts
    // → app/api/py/text2sql/chat/route.ts
    // → app/api/py/chain/chat/route.ts
    // → app/api/py/unified/chat/route.ts
    // → app/api/py/unified/chat/stream/route.ts
    // → lib/auth.ts
    // → lib/auth/admin-cookie.ts
    // → lib/py-service-proxy.ts
    // → lib/server/forward-py-rag-chat.ts
    AUTH_SESSION --> COOKIE
    AUTH_UNLOCK --> COOKIE
    BEARER --> REQ
    CHAIN --"~>"--> PY_CHAIN
    COOKIE --> REQ
    CP --"streamChat"--> PY_CHAT
    CP --"fetchChatHistory"--> PY_CHAT_HIS
    FRAG --> PSP
    PSP --"~>"--> P_CHAIN
    PSP --"~>"--> P_CHAT
    PSP --"~>"--> P_HIS
    PSP --"~>"--> P_T2S
    PSP --"~>"--> P_UNI
    PSP --"~>"--> P_UNI_SSE
    PY_CHAIN --> PSP
    PY_CHAT --> REQ
    PY_CHAT_HIS --> PSP
    PY_T2S --> PSP
    PY_UNIFIED --> PSP
    PY_UNIFIED_SSE --> PSP
    P_CHAT --"::yields"--> XS
    // → lib/chat/chatApi.ts
    REQ --> FRAG
    T2S --"~>"--> PY_T2S
    UNIFIED --"~>"--> AUTH_UNLOCK
    UNIFIED --"~>"--> PY_UNIFIED
    UNIFIED --"fetch POST + ReadableStream"--> PY_UNIFIED_SSE

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| ADMINHOOK | ADMINHOOK |  |
| AUTH_SESSION | AUTH_SESSION |  |
| AUTH_UNLOCK | AUTH_UNLOCK |  |
| BEARER | BEARER |  |
| COOKIE | COOKIE |  |
| FRAG | FRAG |  |
| PSP | PSP |  |
| PY_CHAT_HIS | PY_CHAT_HIS |  |
| P_CHAIN | P_CHAIN |  |
| P_CHAT | P_CHAT |  |
| P_HIS | P_HIS |  |
| P_T2S | P_T2S |  |
| P_UNI_SSE | P_UNI_SSE |  |
| REQ | REQ |  |
| XS | x-sources header |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| ADMINHOOK | AUTH_SESSION | ~> | async_calls |  | 17 anchor(s) |
| AUTH_SESSION | COOKIE | -> | depends_on |  |  |
| AUTH_UNLOCK | COOKIE | -> | depends_on |  |  |
| BEARER | REQ | -> | depends_on |  |  |
| CHAIN | PY_CHAIN | ~> | async_calls |  |  |
| COOKIE | REQ | -> | depends_on |  |  |
| CP | PY_CHAT | -> | depends_on | streamChat |  |
| CP | PY_CHAT_HIS | -> | depends_on | fetchChatHistory |  |
| FRAG | PSP | -> | depends_on |  |  |
| PSP | P_CHAIN | ~> | async_calls |  |  |
| PSP | P_CHAT | ~> | async_calls |  |  |
| PSP | P_HIS | ~> | async_calls |  |  |
| PSP | P_T2S | ~> | async_calls |  |  |
| PSP | P_UNI | ~> | async_calls |  |  |
| PSP | P_UNI_SSE | ~> | async_calls |  |  |
| PY_CHAIN | PSP | -> | depends_on |  |  |
| PY_CHAT | REQ | -> | depends_on |  |  |
| PY_CHAT_HIS | PSP | -> | depends_on |  |  |
| PY_T2S | PSP | -> | depends_on |  |  |
| PY_UNIFIED | PSP | -> | depends_on |  |  |
| PY_UNIFIED_SSE | PSP | -> | depends_on |  |  |
| P_CHAT | XS | ::yields | yields |  | 1 anchor(s) |
| REQ | FRAG | -> | depends_on |  |  |
| T2S | PY_T2S | ~> | async_calls |  |  |
| UNIFIED | AUTH_UNLOCK | ~> | async_calls |  |  |
| UNIFIED | PY_UNIFIED | ~> | async_calls |  |  |
| UNIFIED | PY_UNIFIED_SSE | -> | depends_on | fetch POST + ReadableStream |  |
