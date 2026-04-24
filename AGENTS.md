# AI-Ink-Brain（前端）— Agent 导航

> **角色**：Next.js 15 博客 + BFF、页面渲染、AI 对话 UI、Python API 代理转发。  
> **边界**：Embedding、向量检索、分块、写入逻辑 **不在本仓**；所有 AI 能力以 `PY_API_URL` 为唯一入口。

---

## 必读（按顺序）

1. **`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`**：环境变量、目录职责、API 契约摘要
2. **`.cursorrules`**：Next.js 规范、视觉风格、Streaming、API 边界分离
3. **`docs/_tech_graph/`**：技术图谱（架构唯一可信来源）
   - `00_main.md` — 路由 & 渲染流程（[AI 协议版](docs/_tech_graph/00_main.ai.md)）
   - `01_struct.md` — TS 类型 & 数据结构
   - `02_version.md` — 前端版本迭代
   - `10_flow_route.md` — 页面路由流程（[AI 协议版](docs/_tech_graph/10_flow_route.ai.md)）
   - `11_flow_api.md` — API 请求 & 代理流程（[AI 协议版](docs/_tech_graph/11_flow_api.ai.md)）
   - `12_flow_auth.md` — 登录 & 权限 & Session（[AI 协议版](docs/_tech_graph/12_flow_auth.ai.md)）
   - `13_flow_components.md` — 组件渲染 & 数据交互（[AI 协议版](docs/_tech_graph/13_flow_components.ai.md)）
   - `99_spec.md` — 前端实现规约
   - `99_mermaid_protocol.md` — Mermaid 拓扑协议（引用后端仓规范）
4. **`content/tasks/task_*.md`**：任务规格（实现与验收口径）
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
- **任务驱动**：优先阅读对应 `content/tasks/task_*.md`，实现完成后回填验收项
- **图谱同步**：代码变更后自动增量更新 `docs/_tech_graph/` 对应文件
  - flowchart 流程图维护双轨：`.md`（人类版）+ `.ai.md`（AI 协议版）
  - 修改代码后，优先更新 `.ai.md`，再同步 `.md`
  - 拓扑协议规范见工作区根 `Projects/AGENTS.md` §7 或后端仓 `ai-ink-brain-api-python/docs/_tech_graph/99_mermaid_protocol.md`

---

## 安全红线

- **不要**把 `.env` / `.env.local` / API key 提交进 Git。
- service role key **绝不**暴露给浏览器。
