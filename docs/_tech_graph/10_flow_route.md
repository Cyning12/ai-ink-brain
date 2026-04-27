```mermaid
flowchart TD
  %% 10_flow_route: 路由/页面跳转流程（由真实导航与入口组件驱动）

  subgraph ENTRY[入口]
    ROOT[app/layout.tsx] --> NAV[SiteNav: app/_components/site-nav.tsx]
    ROOT --> HOME["/ : app/page.tsx"]
  end

  %% Home 卡片入口（真实：HomeModules）
  HOME --> HM[HomeModules: app/_components/home-modules.tsx]
  HM --> HOME_LINKS{modules[]}
  HOME_LINKS --> L_BLOG["/blog"]
  HOME_LINKS --> L_LEARNING["/learning"]
  HOME_LINKS --> L_TASKS["/projects (Tasks)"]
  HOME_LINKS --> L_DIARY["/diary"]
  HOME_LINKS --> L_ABOUT["/about"]
  HOME_LINKS --> L_ADMIN_ONLY["admin-only: /chat /text2sql /chain-chat /unified-chat"]

  %% 顶部导航入口（真实：SiteNav）
  NAV --> NAV_ITEMS{NAV[]}
  NAV_ITEMS --> N_BLOG["/blog"]
  NAV_ITEMS --> N_LEARNING["/learning"]
  NAV_ITEMS --> N_TASKS["/projects"]
  NAV_ITEMS --> N_CHAT["/chat"]
  NAV_ITEMS --> N_T2S["/text2sql"]
  NAV_ITEMS --> N_CHAIN["/chain-chat"]
  NAV_ITEMS --> N_UNIFIED["/unified-chat"]
  NAV_ITEMS --> N_ABOUT["/about"]

  %% 仅控制“可见性”的 admin gating（真实：useAdminSession）
  NAV --> ADMINS[useAdminSession(): lib/hooks/useAdminSession.ts]
  ADMINS --> FILTER{isAdmin?}
  FILTER -->|true| N_CHAT
  FILTER -->|true| N_T2S
  FILTER -->|true| N_CHAIN
  FILTER -->|true| N_UNIFIED
  FILTER -->|false| HIDE[隐藏上述入口（仍可手动输入 URL）]

  %% 页面内返回（真实：BackButton）
  subgraph PAGE[业务页面（部分）]
    UC["/unified-chat: app/unified-chat/page.tsx"] --> BB[BackButton: app/_components/back-button.tsx]
    CC["/chain-chat: app/chain-chat/page.tsx"] --> BB
    T2["/text2sql: app/text2sql/page.tsx"] --> BB
    CH["/chat: app/chat/page.tsx"] --> BB
  end
  BB --> HOME
```

