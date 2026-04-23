# 前端：Unified Chat UI（v1）— 融合 RAG + Text2SQL + Chain Timeline

状态：pending  
依赖：后端 `POST /api/py/unified/chat`（返回 `events[]`）  
设计：`ai-ink-brain-api-python/docs/UI/v1/UI-02-unified-chat-plan.md`

## 目标

新增一个统一入口页面（建议 `/unified-chat`），在同一 UI 中支持：

- RAG 问答（展示检索来源 sources）
- Text2SQL 查库（展示 SQL 与结果表）
- Chain Timeline（展示 tool events / latency / error）

## 范围

- 新增页面路由：`/unified-chat`（不替换现有 `/chat`）
- 新增 BFF：`/api/py/unified/chat`（转发到 Python 后端）
- Timeline 渲染 `events[]`

## 非范围

- v1 不做流式 events（后端一次性 JSON 即可）
- v1 不做 Graph 链路图（只做 Timeline）

## UI 要求（v1）

- 左栏：消息（从 events 中提取 user/assistant message）
- 中栏：Timeline（按 `ts` 排序，Accordion 展开详情）
- 右栏：
  - 模式切换（prefer：auto/rag/text2sql）
  - 推荐问法（可先静态）

### 特殊事件渲染

- `sql.result`：表格（前 20 行）+ 复制 SQL
- `rag.sources`：sources 卡片（点击跳转或预览 snippet）
- `error`：高亮展示 stage + message
- `latency`：展示 total_ms 与 stages_ms

## 验收

- [ ] `prefer=auto`：
  - 输入查库问题 → UI 展示 sql.result + timeline
  - 输入知识问题 → UI 展示 rag.sources + timeline
- [ ] `prefer=rag|text2sql` 强制生效
- [ ] 错误路径：仍能展示 timeline 并可定位失败阶段

