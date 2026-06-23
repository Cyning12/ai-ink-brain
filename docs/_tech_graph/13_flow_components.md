---
graph_id: 13_flow_components
version: 
generated_at: 2026-06-23T12:10:34Z
source: docs/_tech_graph/13_flow_components.graph.yaml
---

# 13_flow_components

## Mermaid

```mermaid
flowchart TD
    EC[ChainEventCard]
    HISTORY[fetchChatHistory()]
    MD[ReactMarkdown + remark/rehype]
    SC[SourceCitations]
    SID[useSessionId()]
    SQLT[SqlResultTable]
    STREAM[streamChat()]
    TL[ChainTimeline]
    UC_DBG[Router Debug 与输入]
    UC_HIDE[隐藏 Router Debug Timeline debug URL]
    UC_HIST[历史 transcript 跨轮]
    UC_MID[左 ChainTimeline 当前轮]
    UC_MSG[底 消息区 当前轮]
    UC_PART[Timeline + debug URL 可见]
    UC_PORT[portfolio access_level 档位]
    UC_RIGHT[右 执行链路 当前轮]
    UC_TOP[顶栏 prefer + 多轮说明 + debug 短前缀]

    CCP --> SID
    // → lib/hooks/useSessionId.ts
    CHAIN --> CCP
    // → components/chain-chat/ChainChatPageClient.tsx
    CHAT --> CP
    // → components/ChatPanel.tsx
    CP --"~>"--> HISTORY
    // → lib/chat/chatApi.ts
    CP --> MD
    // → components/ChatPanel.tsx
    CP --"sources"--> SC
    // → components/SourceCitations.tsx
    CP --> SID
    // → lib/hooks/useSessionId.ts
    CP --"~>"--> STREAM
    // → lib/chat/chatApi.ts
    EC --"type=rag.sources"--> SC
    // → components/SourceCitations.tsx
    EC --"type=sql.result"--> SQLT
    // → components/chain-chat/SqlResultTable.tsx
    T2P --> SID
    // → lib/hooks/useSessionId.ts
    T2S --> T2P
    // → components/Text2SqlChatPanel.tsx
    TL --> EC
    // → components/chain-chat/ChainEventCard.tsx
    UCP --> SID
    // → lib/hooks/useSessionId.ts
    UCP --> UC_DBG
    UCP --> UC_HIST
    UCP --> UC_MID
    UCP --> UC_MSG
    UCP --"?>"--> UC_PORT
    // → lib/unified-chat/portfolio-chat-tier.ts
    UCP --> UC_RIGHT
    UCP --> UC_TOP
    UC_MID --> TL
    // → components/chain-chat/ChainTimeline.tsx
    UC_PORT --"[visitor]"--> UC_HIDE
    UC_PORT --"[visitor-admin]"--> UC_PART
    UNIFIED --> UCP
    // → components/unified-chat/UnifiedChatPageClient.tsx

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| EC | ChainEventCard |  |
| HISTORY | fetchChatHistory() |  |
| MD | ReactMarkdown + remark/rehype |  |
| SC | SourceCitations |  |
| SID | useSessionId() |  |
| SQLT | SqlResultTable |  |
| STREAM | streamChat() |  |
| TL | ChainTimeline |  |
| UC_DBG | Router Debug 与输入 |  |
| UC_HIDE | 隐藏 Router Debug Timeline debug URL |  |
| UC_HIST | 历史 transcript 跨轮 |  |
| UC_MID | 左 ChainTimeline 当前轮 |  |
| UC_MSG | 底 消息区 当前轮 |  |
| UC_PART | Timeline + debug URL 可见 |  |
| UC_PORT | portfolio access_level 档位 |  |
| UC_RIGHT | 右 执行链路 当前轮 |  |
| UC_TOP | 顶栏 prefer + 多轮说明 + debug 短前缀 |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| CCP | SID | -> | depends_on |  | 1 anchor(s) |
| CHAIN | CCP | -> | depends_on |  | 1 anchor(s) |
| CHAT | CP | -> | depends_on |  | 1 anchor(s) |
| CP | HISTORY | ~> | async_calls |  | 1 anchor(s) |
| CP | MD | -> | depends_on |  | 1 anchor(s) |
| CP | SC | -> | depends_on | sources | 1 anchor(s) |
| CP | SID | -> | depends_on |  | 1 anchor(s) |
| CP | STREAM | ~> | async_calls |  | 1 anchor(s) |
| EC | SC | -> | depends_on | type=rag.sources | 1 anchor(s) |
| EC | SQLT | -> | depends_on | type=sql.result | 1 anchor(s) |
| T2P | SID | -> | depends_on |  | 1 anchor(s) |
| T2S | T2P | -> | depends_on |  | 1 anchor(s) |
| TL | EC | -> | depends_on |  | 1 anchor(s) |
| UCP | SID | -> | depends_on |  | 1 anchor(s) |
| UCP | UC_DBG | -> | depends_on |  |  |
| UCP | UC_HIST | -> | depends_on |  |  |
| UCP | UC_MID | -> | depends_on |  |  |
| UCP | UC_MSG | -> | depends_on |  |  |
| UCP | UC_PORT | ?> | condition |  | 1 anchor(s) |
| UCP | UC_RIGHT | -> | depends_on |  |  |
| UCP | UC_TOP | -> | depends_on |  |  |
| UC_MID | TL | -> | depends_on |  | 1 anchor(s) |
| UC_PORT | UC_HIDE | [visitor] | depends_on |  |  |
| UC_PORT | UC_PART | [visitor-admin] | depends_on |  |  |
| UNIFIED | UCP | -> | depends_on |  | 1 anchor(s) |
