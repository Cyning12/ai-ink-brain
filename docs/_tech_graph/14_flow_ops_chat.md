---
graph_id: 14_flow_ops_chat
version: 2026-06-22
generated_at: 2026-07-02T12:27:51Z
source: docs/_tech_graph/14_flow_ops_chat.graph.yaml
---

# Ops Desk Chat 前端 / BFF 子流程

P1 Chat UI · 复用 unified-chat trace 壳 · 数据源 ops_run_events · 不复用 Unified Chat API

## Mermaid

```mermaid
flowchart TD
    USER[/ops/kimi-code/chat]
    MW[middleware.ts /ops/*]
    LOGIN[/ops/login · OPS_DESK_SECRET]
    PAGE[Ops Chat page · trace 壳]
    TRACE[ops run events 时间线 UI]
    BFF_POST[POST /api/ops/chat/messages]
    BFF_MODELS[GET /api/ops/chat/models]
    BFF_RUN[GET /api/ops/runs/{id}]
    BFF_EVT[GET /api/ops/runs/{id}/events]
    POLL[after_seq 增量轮询]
    OPS_PY[Python /ops/* (api-python)]
    REF_UC[借鉴 UnifiedChatPageClient 壳]
    NOT_UC[≠ /api/py/unified/chat]

    USER --> MW
    // → app/ops/kimi-code/chat/page.tsx::OpsKimiCodeChatPage
    MW --"[err] 无 cookie"--> LOGIN
    // → middleware.ts::ops desk guard
    MW --"[ok] session"--> PAGE
    PAGE --> TRACE
    PAGE --"trace 壳复用"--> REF_UC
    PAGE --"发送消息"--> BFF_POST
    PAGE --"加载模型列表"--> BFF_MODELS
    BFF_MODELS --> OPS_PY
    // → app/api/ops/chat/models/route.ts::GET handler
    BFF_POST --> OPS_PY
    // → app/api/ops/chat/messages/route.ts::POST handler
    BFF_POST --"::gates"--> NOT_UC
    PAGE --"~>"--> BFF_RUN
    PAGE --"~>"--> BFF_EVT
    BFF_RUN --> OPS_PY
    // → app/api/ops/runs/[id]/route.ts::GET handler
    BFF_EVT --> OPS_PY
    // → app/api/ops/runs/[id]/events/route.ts::GET handler
    BFF_EVT --"断联续看"--> POLL
    POLL --> TRACE
    TRACE --"after_seq""--> BFF_EVT

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| USER | /ops/kimi-code/chat |  |
| MW | middleware.ts /ops/* |  |
| LOGIN | /ops/login · OPS_DESK_SECRET |  |
| PAGE | Ops Chat page · trace 壳 |  |
| TRACE | ops run events 时间线 UI |  |
| BFF_POST | POST /api/ops/chat/messages |  |
| BFF_MODELS | GET /api/ops/chat/models |  |
| BFF_RUN | GET /api/ops/runs/{id} |  |
| BFF_EVT | GET /api/ops/runs/{id}/events |  |
| POLL | after_seq 增量轮询 |  |
| OPS_PY | Python /ops/* (api-python) |  |
| REF_UC | 借鉴 UnifiedChatPageClient 壳 |  |
| NOT_UC | ≠ /api/py/unified/chat |  |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| USER | MW | -> | depends_on |  | 1 anchor(s) |
| MW | LOGIN | ?> | condition | [err] 无 cookie | 1 anchor(s) |
| MW | PAGE | ?> | condition | [ok] session |  |
| PAGE | TRACE | -> | depends_on |  |  |
| PAGE | REF_UC | ::merges | merges | trace 壳复用 |  |
| PAGE | BFF_POST | ~> | async_calls | 发送消息 |  |
| PAGE | BFF_MODELS | ~> | async_calls | 加载模型列表 |  |
| BFF_MODELS | OPS_PY | -> | depends_on |  | 1 anchor(s) |
| BFF_POST | OPS_PY | -> | depends_on |  | 1 anchor(s) |
| BFF_POST | NOT_UC | ::gates | gates |  |  |
| PAGE | BFF_RUN | ~> | async_calls |  |  |
| PAGE | BFF_EVT | ~> | async_calls |  |  |
| BFF_RUN | OPS_PY | -> | depends_on |  | 1 anchor(s) |
| BFF_EVT | OPS_PY | -> | depends_on |  | 1 anchor(s) |
| BFF_EVT | POLL | ~> | async_calls | 断联续看 |  |
| POLL | TRACE | -> | depends_on |  |  |
| TRACE | BFF_EVT | ~> | async_calls | after_seq" |  |

## Notes

### 边界

- BFF 校验 `OPS_DESK_SECRET` / ops cookie（见 `12_flow_auth`）
- Python 信任 BFF · 不在浏览器暴露 service role
- **禁止**走 `/api/py/unified/chat` 或 `UnifiedChatPageClient` 数据源

### 跨仓

- 后端 Orchestrator 真值：`../ai-ink-brain-api-python/docs/_tech_graph/16_flow_ops_chat.md`
- E2E 契约增量：`15_e2e_boundary`（P1 实施时补 SSE/JSON 键名）


