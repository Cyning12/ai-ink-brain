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
    // → app/blog/page.tsx
    HOME_LINKS --"->"--> L_LEARNING[[/learning]]
    // → app/learning/page.tsx
    HOME_LINKS --"->"--> L_TASKS[[/projects]]
    // → app/projects/page.tsx
    HOME_LINKS --"->"--> L_DIARY[[/diary]]
    // → app/diary/page.tsx
    HOME_LINKS --"->"--> L_ABOUT[[/about]]
    // → app/about/page.tsx
    HOME_LINKS --"->"--> L_ADMIN[[/chat /text2sql /chain-chat /unified-chat]]
    // → app/chat/page.tsx（admin-only 入口簇）

    %% === 导航 ===
    NAV --"->"--> NAV_ITEMS{NAV[]}
    NAV_ITEMS --"->"--> N_BLOG[[/blog]]
    // → app/blog/page.tsx
    NAV_ITEMS --"->"--> N_LEARNING[[/learning]]
    // → app/learning/page.tsx
    NAV_ITEMS --"->"--> N_TASKS[[/projects]]
    // → app/projects/page.tsx
    NAV_ITEMS --"->"--> N_CHAT[[/chat]]
    // → app/chat/page.tsx
    NAV_ITEMS --"->"--> N_T2S[[/text2sql]]
    // → app/text2sql/page.tsx
    NAV_ITEMS --"->"--> N_CHAIN[[/chain-chat]]
    // → app/chain-chat/page.tsx
    NAV_ITEMS --"->"--> N_UNIFIED[[/unified-chat]]
    // → app/unified-chat/page.tsx
    NAV_ITEMS --"->"--> N_ABOUT[[/about]]
    // → app/about/page.tsx

    %% === Admin 过滤 ===
    NAV --"->"--> ADMINS[[useAdminSession()]]
    // → lib/hooks/useAdminSession.ts
    ADMINS --"->"--> FILTER{isAdmin?}
    FILTER --"[true]"--> N_CHAT
    // → app/chat/page.tsx（导航可见）
    FILTER --"[true]"--> N_T2S
    // → app/text2sql/page.tsx
    FILTER --"[true]"--> N_CHAIN
    // → app/chain-chat/page.tsx
    FILTER --"[true]"--> N_UNIFIED
    // → app/unified-chat/page.tsx
    FILTER --"[false]"--> HIDE[[隐藏入口]]
    // → lib/hooks/useAdminSession.ts（仅隐藏 nav，URL 仍可直达）

    %% === 页面返回 ===
    subgraph PAGE[[业务页面]]
        UC[[/unified-chat]] --"->"--> BB[[BackButton]]
        // → app/_components/back-button.tsx
        CC[[/chain-chat]] --"->"--> BB
        // → app/chain-chat/page.tsx
        T2[[/text2sql]] --"->"--> BB
        // → app/text2sql/page.tsx
        CH[[/chat]] --"->"--> BB
        // → app/chat/page.tsx
    end
    BB --"->"--> HOME
    // → app/page.tsx

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
