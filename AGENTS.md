# AI-Ink-Brain（前端）— Agent 导航

> **角色**：Next.js 15 博客 + BFF、页面渲染、AI 对话 UI、Python API 代理转发。  
> **边界**：Embedding、向量检索、分块、写入逻辑 **不在本仓**；所有 AI 能力以 `PY_API_URL` 为唯一入口。

---

## 必读（按顺序）

1. **`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`**：环境变量、目录职责、API 契约摘要
2. **规则文件**（`.cursor/rules/*.mdc`）：Next.js 规范、视觉风格、Streaming、API 边界分离
3. **`docs/_tech_graph/`**：技术图谱（架构唯一可信来源）
   - `00_main.md` — 路由 & 渲染流程（[AI 协议版](docs/_tech_graph/00_main.ai.md)）
   - `01_struct.md` — TS 类型 & 数据结构
   - `02_version.md` — 前端版本迭代
   - `10_flow_route.md` — 页面路由流程（[AI 协议版](docs/_tech_graph/10_flow_route.ai.md)）
   - `11_flow_api.md` — API 请求 & 代理流程（[AI 协议版](docs/_tech_graph/11_flow_api.ai.md)）
   - `12_flow_auth.md` — 登录 & 权限 & Session（[AI 协议版](docs/_tech_graph/12_flow_auth.ai.md)）
   - `13_flow_components.md` — 组件渲染 & 数据交互（[AI 协议版](docs/_tech_graph/13_flow_components.ai.md)）
   - `99_spec.md` — 前端实现规约（含 graph_v2 CI、跨仓契约指针）
   - `graph_v2_schema.md` — `graph.json` 字段与失败码
   - `99_mermaid_protocol.md` — Mermaid 拓扑协议摘要（完整版见配对后端仓同名文件）
   - **迁移实践**：`content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`
4. **`content/tasks/README.md`** + **`content/tasks/active/`**、**`content/tasks/done/`**：任务规格与归档规则（与后端 `docs/tasks/` 分类一致）
5. **多子仓协作**（总设职责、任务单规范与落盘路径）见工作区根 `Projects/AGENTS.md` **§2**，跨仓任务按该约定先写任务初稿再分派子 Agent 丰富。
6. **日记/日志规则**（含截图占位、引用 ≤ 300 字、禁止本地路径）见工作区根 `DIARY_GUIDE.md`；前端"知识总结"素材写在 `docs/diary/`（按日期命名）。

---

## 关键入口文件（改代码从这里开始）

| 文件 | 职责 |
|------|------|
| `app/layout.tsx` | 根布局、全局导航 |
| `app/page.tsx` | 首页 |
| `app/chat/page.tsx` | RAG 对话页面 |
| `app/unified-chat/page.tsx` | Unified Chat 页面 |
| `app/api/py/chat/route.ts` | Python API 代理（chat） |
| `app/api/py/unified/chat/route.ts` | Python API 代理（unified） |
| `app/api/py/unified/chat/stream/route.ts` | SSE 流式代理 |
| `lib/auth.ts` | 统一鉴权入口 |
| `lib/chat/chatApi.ts` | Chat API 封装 |
| `components/ChatPanel.tsx` | 对话面板组件 |
| `components/unified-chat/UnifiedChatPageClient.tsx` | Unified Chat 客户端 |

---

## 技术栈

- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **AI Stack**: SiliconFlow API, Vercel AI SDK, LangChain.js
- **Database**: Supabase (PostgreSQL + pgvector)
- **Visual Style**: 水墨风格（低饱和、大量留白）
  - 背景：`#F9F9F7`
  - 文字：`#2C2C2C`
  - 强调色：低饱和靛蓝 / 石墨色

---

## 交付物约定

- **配置真值表**：`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`（随代码演进持续更新）
- **任务驱动**：优先阅读对应 `content/tasks/active/task_*.md`，实现完成后回填验收项；**验收通过后**须按 `content/tasks/README.md` 将任务单 **`git mv`** 至 `content/tasks/done/` 并更新 `content/tasks/_views/done.md`
- **图谱同步**：代码变更后自动增量更新 `docs/_tech_graph/` 对应文件
  - flowchart 流程图维护双轨：`.md`（人类版）+ `.ai.md`（AI 协议版）
  - 修改代码后，优先更新 `.ai.md`，再同步 `.md`
  - 拓扑协议见本仓 `docs/_tech_graph/99_mermaid_protocol.md`（摘要）与后端仓完整版
  - 变更 `.ai.md` 后：`pnpm tech-graph:graph-export` 并提交 `graph.json`；PR 前 `pnpm tech-graph:graph-check` 与 `pnpm tech-graph:equivalence-check`
  - 影响分析：`pnpm tech-graph:query describe-impact <node_id> 2`（机器轨默认，见后端闸口 B 结论）

---

## 安全红线

- **不要**把 `.env` / `.env.local` / API key 提交进 Git。
- service role key **绝不**暴露给浏览器。
