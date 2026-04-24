```mermaid
flowchart TD
    %% 10_flow_route: 路由/页面跳转流程
    %% 拓扑协议 v2-TS/Next.js 适配

    %% === 入口 ===
    subgraph ENTRY[[入口]]
        ROOT[[app/layout.tsx]] --"->"--> NAV[[SiteNav]]
        // → app/_components/site-nav.tsx
        ROOT --"->"--> HOME[[/ Home]]
        // → app/page.tsx
    end

    %% === Home 模块 ===
    HOME --"->"--> HM[[HomeModules]]
    // → app/_components/home-modules.tsx
    HM --"->"--> HOME_LINKS{modules[]}
    HOME_LINKS --"->"--> L_BLOG[[/blog]]
    HOME_LINKS --"->"--> L_LEARNING[[/learning]]
    HOME_LINKS --"->"--> L_TASKS[[/projects]]
    HOME_LINKS --"->"--> L_DIARY[[/diary]]
    HOME_LINKS --"->"--> L_ABOUT[[/about]]
    HOME_LINKS --"->"--> L_ADMIN[[/chat /text2sql /chain-chat /unified-chat]]

    %% === 导航 ===
    NAV --"->"--> NAV_ITEMS{NAV[]}
    NAV_ITEMS --"->"--> N_BLOG[[/blog]]
    NAV_ITEMS --"->"--> N_LEARNING[[/learning]]
    NAV_ITEMS --"->"--> N_TASKS[[/projects]]
    NAV_ITEMS --"->"--> N_CHAT[[/chat]]
    NAV_ITEMS --"->"--> N_T2S[[/text2sql]]
    NAV_ITEMS --"->"--> N_CHAIN[[/chain-chat]]
    NAV_ITEMS --"->"--> N_UNIFIED[[/unified-chat]]
    NAV_ITEMS --"->"--> N_ABOUT[[/about]]

    %% === Admin 过滤 ===
    NAV --"->"--> ADMINS[[useAdminSession()]]
    // → lib/hooks/useAdminSession.ts
    ADMINS --"->"--> FILTER{isAdmin?}
    FILTER --"[true]"--> N_CHAT
    FILTER --"[true]"--> N_T2S
    FILTER --"[true]"--> N_CHAIN
    FILTER --"[true]"--> N_UNIFIED
    FILTER --"[false]"--> HIDE[[隐藏入口]]

    %% === 页面返回 ===
    subgraph PAGE[[业务页面]]
        UC[[/unified-chat]] --"->"--> BB[[BackButton]]
        // → app/_components/back-button.tsx
        CC[[/chain-chat]] --"->"--> BB
        T2[[/text2sql]] --"->"--> BB
        CH[[/chat]] --"->"--> BB
    end
    BB --"->"--> HOME

    %% === 样式 ===
    classDef entry fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef nav fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef page fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef auth fill:#f3e5f5,stroke:#4a148c,stroke-width:1px

    class ROOT,NAV,HOME,HM entry
    class L_BLOG,L_LEARNING,L_TASKS,L_DIARY,L_ABOUT,L_ADMIN,N_BLOG,N_LEARNING,N_TASKS,N_CHAT,N_T2S,N_CHAIN,N_UNIFIED,N_ABOUT nav
    class UC,CC,T2,CH,BB page
    class ADMINS,FILTER,HIDE auth
```
