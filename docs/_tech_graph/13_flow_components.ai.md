```mermaid
flowchart TB
    %% 13_flow_components: 通用组件渲染 & 数据流向
    %% 拓扑协议 v2-TS/Next.js 适配

    %% === Pages ===
    subgraph PAGES[[Pages]]
        CHAT[[/chat]] --"->"--> CP[[ChatPanel]]
        // → components/ChatPanel.tsx
        UNIFIED[[/unified-chat]] --"->"--> UCP[[UnifiedChatPageClient]]
        // → components/unified-chat/UnifiedChatPageClient.tsx
        CHAIN[[/chain-chat]] --"->"--> CCP[[ChainChatPageClient]]
        // → components/chain-chat/ChainChatPageClient.tsx
        T2S[[/text2sql]] --"->"--> T2P[[Text2SqlChatPanel]]
        // → components/Text2SqlChatPanel.tsx
    end

    %% === Unified：transcript + 当前轮双栏 + 消息区 ===
    subgraph UC_UI[[UnifiedChatPageClient UI]]
        UCP --"->"--> UC_TOP[[顶栏 prefer + 多轮说明 + debug 短前缀]]
        UCP --"->"--> UC_HIST[[历史 transcript 跨轮]]
        UCP --"->"--> UC_MID[[左 ChainTimeline 当前轮]]
        UCP --"->"--> UC_RIGHT[[右 执行链路 当前轮]]
        UCP --"->"--> UC_MSG[[底 消息区 当前轮]]
        UCP --"->"--> UC_DBG[[Router Debug 与输入]]
    end

    UC_MID --"->"--> TL[[ChainTimeline]]
    // → components/chain-chat/ChainTimeline.tsx
    TL --"->"--> EC[[ChainEventCard]]
    // → components/chain-chat/ChainEventCard.tsx

    %% === 特殊事件渲染 ===
    EC --"type=sql.result"--> SQLT[[SqlResultTable]]
    // → components/chain-chat/SqlResultTable.tsx
    EC --"type=rag.sources"--> SC[[SourceCitations]]
    // → components/SourceCitations.tsx

    %% === RAG ChatPanel ===
    CP --"~>"--> STREAM[[streamChat()]]
    // → lib/chat/chatApi.ts
    CP --"~>"--> HISTORY[[fetchChatHistory()]]
    // → lib/chat/chatApi.ts
    CP --"->"--> MD[[ReactMarkdown + remark/rehype]]
    // → components/ChatPanel.tsx
    CP --"sources"--> SC
    // → components/SourceCitations.tsx

    %% === SessionId ===
    UCP --"->"--> SID[[useSessionId()]]
    // → lib/hooks/useSessionId.ts
    CP --"->"--> SID
    // → lib/hooks/useSessionId.ts
    CCP --"->"--> SID
    // → lib/hooks/useSessionId.ts
    T2P --"->"--> SID
    // → lib/hooks/useSessionId.ts

    %% === 样式 ===
    classDef page fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef comp fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef ui fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef lib fill:#f3e5f5,stroke:#4a148c,stroke-width:1px

    class CHAT,UNIFIED,CHAIN,T2S page
    class CP,UCP,CCP,T2P,TL,EC,SQLT,SC,MD comp
    class UC_TOP,UC_HIST,UC_MID,UC_RIGHT,UC_MSG,UC_DBG ui
    class STREAM,HISTORY,SID lib
```
