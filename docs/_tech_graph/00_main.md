```mermaid
flowchart TD
  %% 00_main: Next.js 顶层总图（路由 + 入口 + 渲染）

  subgraph APP[Next.js App Router: app/]
    L[入口: app/layout.tsx] --> NAV[导航: app/_components/site-nav.tsx]
    L --> ROUTER{路由匹配: app/**/page.tsx}
  end

  %% 权限/展示层（仅影响“入口可见性”，不等价于 API 权限）
  NAV --> ADMINS[useAdminSession(): lib/hooks/useAdminSession.ts]
  ADMINS --> NAVFILTER{过滤导航项: /chat /text2sql /chain-chat /unified-chat}
  NAVFILTER -->|admin| ROUTER
  NAVFILTER -->|non-admin| ROUTER

  %% 页面路由（真实存在）
  ROUTER --> HOME["/  (app/page.tsx)"]
  ROUTER --> BLOG["/blog  (app/blog/page.tsx)"]
  ROUTER --> BLOGSLUG["/blog/[...slug]  (app/blog/[...slug]/page.tsx)"]
  ROUTER --> LEARNING["/learning  (app/learning/page.tsx)"]
  ROUTER --> PROJECTS["/projects  (app/projects/page.tsx)"]
  ROUTER --> DIARY["/diary  (app/diary/page.tsx)"]
  ROUTER --> ABOUT["/about  (app/about/page.tsx)"]

  ROUTER --> CHAT["/chat  (app/chat/page.tsx)"]
  ROUTER --> T2S["/text2sql  (app/text2sql/page.tsx)"]
  ROUTER --> CHAIN["/chain-chat  (app/chain-chat/page.tsx)"]
  ROUTER --> UNIFIED["/unified-chat  (app/unified-chat/page.tsx)"]

  %% 关键客户端页面组件（真实存在）
  CHAT --> CP["ChatPanel (components/ChatPanel.tsx)"]
  T2S --> T2P["Text2SqlChatPanel (components/Text2SqlChatPanel.tsx)"]
  CHAIN --> CCP["ChainChatPageClient (components/chain-chat/ChainChatPageClient.tsx)"]
  UNIFIED --> UCP["UnifiedChatPageClient (components/unified-chat/UnifiedChatPageClient.tsx)"]

  %% BFF / API Route Handlers（真实存在）
  subgraph API[Next Route Handlers: app/api/**/route.ts]
    A_SESSION["GET /api/auth/session (app/api/auth/session/route.ts)"]
    A_UNLOCK["POST /api/auth/unlock (app/api/auth/unlock/route.ts)"]
    PY_CHAT["POST /api/py/chat (app/api/py/chat/route.ts)"]
    PY_CHAT_HIS["GET /api/py/chat/history (app/api/py/chat/history/route.ts)"]
    PY_T2S["POST /api/py/text2sql/chat (app/api/py/text2sql/chat/route.ts)"]
    PY_CHAIN["POST /api/py/chain/chat (app/api/py/chain/chat/route.ts)"]
    PY_UNIFIED["POST /api/py/unified/chat (app/api/py/unified/chat/route.ts)"]
    PY_UNIFIED_SSE["POST /api/py/unified/chat/stream (app/api/py/unified/chat/stream/route.ts)"]
    SYS["GET /api/system/status (app/api/system/status/route.ts)"]
  end

  %% 统一鉴权入口（真实存在）
  PY_CHAT --> AUTH[requireAdminApiSecret(): lib/auth.ts]
  PY_T2S --> AUTH
  PY_CHAIN --> AUTH
  PY_UNIFIED --> AUTH
  PY_UNIFIED_SSE --> AUTH

  %% 下游：Python API（外部服务，地址由 PY_API_URL）
  AUTH --> PY[(Python FastAPI: PY_API_URL)]

  %% 图谱按需加载（子流程）
  HOME --> G_ROUTE["加载子图: 10_flow_route.md"]
  CP --> G_API["加载子图: 11_flow_api.md"]
  AUTH --> G_AUTH["加载子图: 12_flow_auth.md"]
  UCP --> G_COMP["加载子图: 13_flow_components.md"]
  ROUTER --> G_STRUCT["加载子图: 01_struct.md"]
  APP --> G_VER["加载子图: 02_version.md"]
  APP --> G_SPEC["加载子图: 99_spec.md"]
```

