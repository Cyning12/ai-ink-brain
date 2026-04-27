```mermaid
flowchart TB
  %% 13_flow_components: 通用组件渲染 & 数据流向（只列真实组件）

  subgraph PAGES[Pages]
    CHAT["/chat\napp/chat/page.tsx"] --> CP["ChatPanel\ncomponents/ChatPanel.tsx"]:::c
    UNIFIED["/unified-chat\napp/unified-chat/page.tsx"] --> UCP["UnifiedChatPageClient\ncomponents/unified-chat/UnifiedChatPageClient.tsx"]:::c
    CHAIN["/chain-chat\napp/chain-chat/page.tsx"] --> CCP["ChainChatPageClient\ncomponents/chain-chat/ChainChatPageClient.tsx"]:::c
    T2S["/text2sql\napp/text2sql/page.tsx"] --> T2P["Text2SqlChatPanel\ncomponents/Text2SqlChatPanel.tsx"]:::c
  end

  %% Unified 3-column layout（消息 / timeline / 控制台）
  subgraph UC_UI[UnifiedChatPageClient UI]
    UCP --> UC_LEFT[左栏: messages + 最终答案]:::u
    UCP --> UC_MID[中栏: ChainTimeline]:::u
    UCP --> UC_RIGHT[右栏: prefer + 推荐问法 + 路由决策(router.decision)]:::u
  end

  UC_MID --> TL["ChainTimeline\ncomponents/chain-chat/ChainTimeline.tsx"]:::c
  TL --> EC["ChainEventCard\ncomponents/chain-chat/ChainEventCard.tsx"]:::c

  %% 特殊事件渲染（在 ChainEventCard 内）
  EC -->|type=sql.result| SQLT["SqlResultTable\ncomponents/chain-chat/SqlResultTable.tsx"]:::c
  EC -->|type=rag.sources| SC["SourceCitations\ncomponents/SourceCitations.tsx"]:::c

  %% RAG ChatPanel 侧：Markdown + Sources
  CP --> STREAM["streamChat()\nlib/chat/chatApi.ts"]:::s
  CP --> HISTORY["fetchChatHistory()\nlib/chat/chatApi.ts"]:::s
  CP --> MD["ReactMarkdown + remark/rehype\n(components/ChatPanel.tsx)"]:::c
  CP -->|sources| SC

  %% SessionId（多页面复用）
  UCP --> SID["useSessionId()\nlib/hooks/useSessionId.ts\nkey=rag_session_id:<scope>"]:::s
  CP --> SID
  CCP --> SID
  T2P --> SID

  classDef c fill:#f9f9f7,stroke:#999,color:#222;
  classDef s fill:#eef6ff,stroke:#4a90e2,color:#123;
  classDef u fill:#f3f0ff,stroke:#7b61ff,color:#221;
```

