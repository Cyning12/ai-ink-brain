```mermaid
flowchart TD
  %% 10_flow_route: 路由/页面跳转流程（由真实导航与入口组件驱动）

  subgraph ENTRY[入口]
    ROOT[app/layout.tsx] --> NAV[SiteNav: app/_components/site-nav.tsx]
    ROOT --> HOME["/ : app/page.tsx"]
    ROOT --> META[generateMetadata: app/layout.tsx]
  end

  %% 站点模式（NEXT_PUBLIC_SITE_MODE · lib/site-mode.ts）
  NAV --> SM[getSiteMode(): lib/site-mode.ts]
  HM --> SM
  META --> SM
  SM --> MODE{portfolio?}
  MODE -->|portfolio| NAV_PF[NAV[] portfolio 四链]
  MODE -->|development| NAV_DEV[NAV[] development 8 项]
  MODE -->|portfolio| HM_PF[modules[] portfolio 四卡]
  MODE -->|development| HM_DEV[modules[] development]

  %% Home 卡片入口（真实：HomeModules）
  HOME --> HM[HomeModules: app/_components/home-modules.tsx]
  HM_PF --> P_HOME["/"]
  HM_PF --> P_RESUME["/resume"]
  HM_PF --> P_METH["/methodology"]
  HM_PF --> P_EVID["/evidence"]
  HM_PF --> P_UNI["/unified-chat"]
  HM_DEV --> HOME_LINKS{modules[]}
  HOME_LINKS --> L_BLOG["/blog"]
  HOME_LINKS --> L_LEARNING["/learning"]
  HOME_LINKS --> L_TASKS["/projects (Tasks)"]
  HOME_LINKS --> L_DIARY["/diary"]
  HOME_LINKS --> L_ABOUT["/about"]
  HOME_LINKS --> L_ADMIN_ONLY["admin-only: /chat /text2sql /chain-chat /unified-chat"]

  %% 顶部导航入口（真实：SiteNav）
  NAV_PF --> N_HOME["/"]
  NAV_PF --> N_RESUME["/resume"]
  NAV_PF --> N_METH["/methodology"]
  NAV_PF --> N_UNI_PF["/unified-chat（常显）"]
  NAV_PF --> P_ABOUT_PF["/about → 308 /resume (portfolio)"]

  P_RESUME --> R_RESUME["app/resume/page.tsx"]
  P_METH --> R_METH_IDX["app/methodology/page.tsx"]
  P_METH --> R_METH_SLUG["app/methodology/[...slug]/page.tsx"]
  P_EVID --> R_EVID["app/evidence/page.tsx"]
  NAV_DEV --> NAV_ITEMS{NAV[]}
  NAV_ITEMS --> N_BLOG["/blog"]
  NAV_ITEMS --> N_LEARNING["/learning"]
  NAV_ITEMS --> N_TASKS["/projects"]
  NAV_ITEMS --> N_CHAT["/chat"]
  NAV_ITEMS --> N_T2S["/text2sql"]
  NAV_ITEMS --> N_CHAIN["/chain-chat"]
  NAV_ITEMS --> N_UNIFIED["/unified-chat"]
  NAV_ITEMS --> N_ABOUT["/about"]

  %% 仅 development 控制“可见性”的 admin gating（真实：useAdminSession）
  NAV_DEV --> ADMINS[useAdminSession(): lib/hooks/useAdminSession.ts]
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
