---
graph_id: 10_flow_route
version: 
generated_at: 2026-06-23T10:30:01Z
source: docs/_tech_graph/10_flow_route.graph.yaml
---

# 10_flow_route

## Mermaid

```mermaid
flowchart TD
    BB[BackButton]
    CC[/chain-chat]
    CH[/chat]
    FILTER[isAdmin?]
    HIDE[隐藏入口]
    HM[HomeModules]
    HM_DEV[modules[] development]
    HM_PF[modules[] portfolio]
    L_ABOUT[/about]
    L_ADMIN[/chat /text2sql /chain-chat /unified-chat]
    L_BLOG[/blog]
    L_DIARY[/diary]
    L_LEARNING[/learning]
    L_TASKS[/projects]
    META[generateMetadata]
    MODE[portfolio?]
    NAV_DEV[NAV[] development]
    NAV_PF[NAV[] portfolio]
    N_ABOUT[/about]
    N_BLOG[/blog]
    N_CHAIN[/chain-chat]
    N_CHAT[/chat]
    N_HOME[/]
    N_LEARNING[/learning]
    N_METH[/methodology]
    N_RESUME[/resume]
    N_T2S[/text2sql]
    N_TASKS[/projects]
    N_UNIFIED[/unified-chat]
    N_UNI_PF[/unified-chat]
    P_HOME[/]
    P_METH[/methodology]
    P_RESUME[/resume]
    P_UNI[/unified-chat]
    ROOT[app/layout.tsx]
    SM[getSiteMode()]
    T2[/text2sql]
    UC[/unified-chat]
    OPS_HOME[/ops/kimi-code]
    OPS_LOGIN[/ops/login]
    OPS_LAYOUT[app/ops/kimi-code/layout.tsx]
    OPS_NAV[OpsSidebar]

    ADMINS --> FILTER
    BB --> HOME
    // → app/page.tsx
    CC --> BB
    // → app/chain-chat/page.tsx
    CH --> BB
    // → app/chat/page.tsx
    FILTER --"[false]"--> HIDE
    FILTER --"[true]"--> N_CHAIN
    // → app/chain-chat/page.tsx
    FILTER --"[true]"--> N_CHAT
    // → app/chat/page.tsx（导航可见）
    FILTER --"[true]"--> N_T2S
    // → app/text2sql/page.tsx
    FILTER --"[true]"--> N_UNIFIED
    // → app/unified-chat/page.tsx
    HM --> SM
    // → lib/site-mode.ts
    HM_DEV --> L_ABOUT
    // → app/about/page.tsx
    HM_DEV --> L_ADMIN
    HM_DEV --> L_BLOG
    // → app/blog/page.tsx
    HM_DEV --> L_DIARY
    // → app/diary/page.tsx
    HM_DEV --> L_LEARNING
    // → app/learning/page.tsx
    HM_DEV --> L_TASKS
    // → app/projects/page.tsx
    HM_PF --> P_HOME
    // → app/page.tsx
    HM_PF --> P_METH
    // → app/methodology/page.tsx（W2）
    HM_PF --> P_RESUME
    // → app/resume/page.tsx（W2）
    HM_PF --> P_UNI
    // → app/unified-chat/page.tsx
    HOME --> HM
    // → app/_components/home-modules.tsx
    META --> SM
    // → app/layout.tsx
    MODE --"[development]"--> HM_DEV
    MODE --"[portfolio]"--> HM_PF
    MODE --"[development]"--> NAV_DEV
    MODE --"[portfolio]"--> NAV_PF
    NAV --> SM
    // → lib/site-mode.ts
    NAV_DEV --> ADMINS
    // → lib/hooks/useAdminSession.ts
    NAV_DEV --> N_ABOUT
    // → app/about/page.tsx
    NAV_DEV --> N_BLOG
    // → app/blog/page.tsx
    NAV_DEV --> N_CHAIN
    // → app/chain-chat/page.tsx
    NAV_DEV --> N_CHAT
    // → app/chat/page.tsx
    NAV_DEV --> N_LEARNING
    // → app/learning/page.tsx
    NAV_DEV --> N_T2S
    // → app/text2sql/page.tsx
    NAV_DEV --> N_TASKS
    // → app/projects/page.tsx
    NAV_DEV --> N_UNIFIED
    // → app/unified-chat/page.tsx
    NAV_PF --> N_HOME
    // → app/page.tsx
    NAV_PF --> N_METH
    // → app/methodology/page.tsx（W2）
    NAV_PF --> N_RESUME
    // → app/resume/page.tsx（W2）
    NAV_PF --> N_UNI_PF
    ROOT --> HOME
    // → app/page.tsx
    ROOT --> META
    // → app/layout.tsx
    ROOT --> NAV
    // → app/_components/site-nav.tsx
    SM --> MODE
    T2 --> BB
    // → app/text2sql/page.tsx
    UC --> BB
    // → app/_components/back-button.tsx
    MODE --"[ops]"--> OPS_HOME
    // → middleware.ts
    // → app/ops/kimi-code/page.tsx
    MODE --"[ops]"--> OPS_LOGIN
    // → middleware.ts
    // → app/ops/login/page.tsx
    OPS_HOME --> OPS_LAYOUT
    // → app/ops/kimi-code/layout.tsx
    OPS_LAYOUT --> OPS_NAV
    // → components/ops/ops-logout-button.tsx

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| BB | BackButton |  |
| CC | /chain-chat |  |
| CH | /chat |  |
| FILTER | isAdmin? |  |
| HIDE | 隐藏入口 |  |
| HM | HomeModules |  |
| HM_DEV | modules[] development |  |
| HM_PF | modules[] portfolio |  |
| L_ABOUT | /about |  |
| L_ADMIN | /chat /text2sql /chain-chat /unified-chat |  |
| L_BLOG | /blog |  |
| L_DIARY | /diary |  |
| L_LEARNING | /learning |  |
| L_TASKS | /projects |  |
| META | generateMetadata |  |
| MODE | portfolio? |  |
| NAV_DEV | NAV[] development |  |
| NAV_PF | NAV[] portfolio |  |
| N_ABOUT | /about |  |
| N_BLOG | /blog |  |
| N_CHAIN | /chain-chat |  |
| N_CHAT | /chat |  |
| N_HOME | / |  |
| N_LEARNING | /learning |  |
| N_METH | /methodology |  |
| N_RESUME | /resume |  |
| N_T2S | /text2sql |  |
| N_TASKS | /projects |  |
| N_UNIFIED | /unified-chat |  |
| N_UNI_PF | /unified-chat |  |
| P_HOME | / |  |
| P_METH | /methodology |  |
| P_RESUME | /resume |  |
| P_UNI | /unified-chat |  |
| ROOT | app/layout.tsx |  |
| SM | getSiteMode() |  |
| T2 | /text2sql |  |
| UC | /unified-chat |  |
| OPS_HOME | /ops/kimi-code |  |
| OPS_LOGIN | /ops/login |  |
| OPS_LAYOUT | app/ops/kimi-code/layout.tsx |  |
| OPS_NAV | OpsSidebar |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| ADMINS | FILTER | -> | depends_on |  |  |
| BB | HOME | -> | depends_on |  | 1 anchor(s) |
| CC | BB | -> | depends_on |  | 1 anchor(s) |
| CH | BB | -> | depends_on |  | 1 anchor(s) |
| FILTER | HIDE | [false] | depends_on |  |  |
| FILTER | N_CHAIN | [true] | depends_on |  | 1 anchor(s) |
| FILTER | N_CHAT | [true] | depends_on |  | 1 anchor(s) |
| FILTER | N_T2S | [true] | depends_on |  | 1 anchor(s) |
| FILTER | N_UNIFIED | [true] | depends_on |  | 1 anchor(s) |
| HM | SM | -> | depends_on |  | 1 anchor(s) |
| HM_DEV | L_ABOUT | -> | depends_on |  | 1 anchor(s) |
| HM_DEV | L_ADMIN | -> | depends_on |  |  |
| HM_DEV | L_BLOG | -> | depends_on |  | 1 anchor(s) |
| HM_DEV | L_DIARY | -> | depends_on |  | 1 anchor(s) |
| HM_DEV | L_LEARNING | -> | depends_on |  | 1 anchor(s) |
| HM_DEV | L_TASKS | -> | depends_on |  | 1 anchor(s) |
| HM_PF | P_HOME | -> | depends_on |  | 1 anchor(s) |
| HM_PF | P_METH | -> | depends_on |  | 1 anchor(s) |
| HM_PF | P_RESUME | -> | depends_on |  | 1 anchor(s) |
| HM_PF | P_UNI | -> | depends_on |  | 1 anchor(s) |
| HOME | HM | -> | depends_on |  | 1 anchor(s) |
| META | SM | -> | depends_on |  | 1 anchor(s) |
| MODE | HM_DEV | [development] | depends_on |  |  |
| MODE | HM_PF | [portfolio] | depends_on |  |  |
| MODE | NAV_DEV | [development] | depends_on |  |  |
| MODE | NAV_PF | [portfolio] | depends_on |  |  |
| NAV | SM | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | ADMINS | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_ABOUT | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_BLOG | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_CHAIN | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_CHAT | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_LEARNING | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_T2S | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_TASKS | -> | depends_on |  | 1 anchor(s) |
| NAV_DEV | N_UNIFIED | -> | depends_on |  | 1 anchor(s) |
| NAV_PF | N_HOME | -> | depends_on |  | 1 anchor(s) |
| NAV_PF | N_METH | -> | depends_on |  | 1 anchor(s) |
| NAV_PF | N_RESUME | -> | depends_on |  | 1 anchor(s) |
| NAV_PF | N_UNI_PF | -> | depends_on |  |  |
| ROOT | HOME | -> | depends_on |  | 1 anchor(s) |
| ROOT | META | -> | depends_on |  | 1 anchor(s) |
| ROOT | NAV | -> | depends_on |  | 1 anchor(s) |
| SM | MODE | -> | depends_on |  |  |
| T2 | BB | -> | depends_on |  | 1 anchor(s) |
| UC | BB | -> | depends_on |  | 1 anchor(s) |
| MODE | OPS_HOME | [ops] | depends_on |  | 2 anchor(s) |
| MODE | OPS_LOGIN | [ops] | depends_on |  | 2 anchor(s) |
| OPS_HOME | OPS_LAYOUT | -> | depends_on |  | 1 anchor(s) |
| OPS_LAYOUT | OPS_NAV | -> | depends_on |  | 1 anchor(s) |
