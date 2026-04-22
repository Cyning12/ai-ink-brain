# 前端：新增 Text2SQL 专用聊天页面（复用现有 Chat，仅替换接口）

状态：pending  
关联：后端 `ai-ink-brain-api-python` 已提供 `POST /api/py/text2sql/chat`（Text2SQL v1 极简闭环）  

## 背景与目标

当前前端已有 `chat` 页面（流式聊天 + sources 展示等）。Text2SQL v1 需要一个**独立入口**用于“查库类问题”，要求：

- UI/交互尽量复用现有 `chat`
- 仅把请求的 BFF/上游接口从 `/api/py/chat` 切换为 `/api/py/text2sql/chat`
- 保留调试能力：能看到 `sql / rows / retrieved`（用于联调与验收）

## 范围

- 新增一个“Text2SQL Chat”页面路由（独立页面）
- 复用当前 `chat` 的组件/样式/输入框交互
- 调整请求层：调用 Text2SQL 专用接口并渲染返回

## 非范围（v1 不做）

- 不把 Text2SQL 合并进通用 `/chat` 的 functioncall/自动路由（后续版本）
- 不做复杂权限、审计、敏感字段过滤

## 后端接口契约（v1）

### `POST /api/py/text2sql/chat`

请求 JSON：

- `session_id: string`
- `query: string`

响应 JSON（关键字段）：

- `ok: true`
- `mode: "text2sql" | "non_text2sql"`
- `answer: string`
- `sql: string`（调试用，v1 返回）
- `columns: string[]`
- `rows: object[]`
- `retrieved: { doc_type: "ddl"|"example", title: string, content: string, score: number }[]`
- `errors: { generate_sql: string|null, execute_sql: string|null, summarize: string|null }`

鉴权：

- Header `Authorization: Bearer <API_KEY>`（与现有 chat 一致）

## 需求与验收标准

### 1) 新增页面与入口

**要求**

- 新增页面路由（示例命名）：`/text2sql` 或 `/chat/text2sql`
- 页面整体复用现有 chat 布局（消息列表 + 输入框）
- 页面标题/导航明确：Text2SQL（查库）

**验收**

- 能在浏览器直接打开该页面并正常发送消息

### 2) 调用 Text2SQL 接口（非流式）

**要求**

- 前端请求改为调用 BFF（建议新增）：`/api/py/text2sql/chat`
- BFF 再转发到 Python 后端 `/api/py/text2sql/chat`
- 由于 v1 返回为 JSON，前端按“单次请求-一次性渲染”的方式展示即可（不要求流式）

**验收**

- 对问题“统计 agent_info 表里有多少条数据”：
  - 能拿到 `sql` 和 `rows`（例如 `count=0/10`）
  - `answer` 展示为自然语言（例如“共有 0 条。”）

### 3) Debug 展示（最小）

**要求**

- 在页面提供一个可折叠 Debug 区（默认折叠）展示：
  - `sql`
  - `rows`（最多展示前 20 行）
  - `retrieved`（展示 title + score；content 可截断）
  - `errors`（若不为 null）

**验收**

- Debug 区内容可用于定位“生成 SQL 失败 vs DB 执行失败”

## 实现备忘（给前端 Agent）

- 复用现有 chat 的消息渲染组件即可；但 Text2SQL 的响应不是 streaming 文本，而是 JSON。
- 建议新增 BFF：
  - `app/api/py/text2sql/chat/route.ts`
  - 逻辑参考 `app/api/py/chat/route.ts`，仅替换上游路径与响应处理（透传 JSON）
- 如果现有 chat 依赖 `messages[]`（OpenAI 风格），Text2SQL v1 用 `query` 即可：取输入框文本作为 `query`。

## 测试建议

- Case A：命中 Text2SQL 意图（包含“查询/统计/多少/金额”等）→ 返回 `mode=text2sql`
- Case B：非查库问题 → 返回 `mode=non_text2sql`，前端应提示“该问题不像结构化查数问题…”
- Case C：后端 `errors.execute_sql` 非空 → 前端应在 Debug 区明确展示错误信息

