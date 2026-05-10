# AI-Ink-Brain

基于 **Next.js App Router** 的个人知识库与博客前端：Markdown/MDX 内容、水墨风 UI，以及经 BFF 转发的 **Python RAG / 统一对话** 能力。向量存储与生产级检索逻辑以 **配对后端仓库** 为单一事实源；本仓同时保留可选的 **本地 Node RAG** 路径。

## 技术栈（以仓库为准）

| 类别 | 选型 |
|------|------|
| 框架 | Next.js **16**（App Router）、React **19**、TypeScript |
| 样式 | Tailwind CSS **4** |
| 包管理 | **pnpm** 10.x（见 `package.json` 的 `packageManager`） |
| 运行时 | Node **24.x**（见 `engines`） |
| 内容 | MDX（`next-mdx-remote`）、`gray-matter` |
| AI 客户端 | Vercel AI SDK、`@ai-sdk/react` 等 |
| 数据 | Supabase（PostgreSQL + **pgvector**） |
| Embedding | SiliconFlow 或 DashScope/百炼（可切换，见环境变量） |

## 功能概览

- **博客与内容**：`content/` 下的文章、学习笔记、日记等；路由如 `/blog`、`/learning`、`/diary`。
- **对话与 RAG**：`/chat`（经典聊天）、`/unified-chat`（统一对话 UI）、`/chain-chat` 等；默认经 `app/api/py/**` 代理到 **`PY_API_URL`** 指向的 FastAPI。
- **本地 Node RAG（可选）**：`POST /api/chat` 在本仓内完成 embedding → `match_documents` → 流式回复；需配置 Supabase 与相关密钥，并由 middleware 校验管理 Token。
- **其他页面**：`/about`、`/projects`、`/text2sql`（与后端 Text2SQL 能力配合时的入口，以实际实现为准）。

## 仓库边界

| 本仓负责 | 不在本仓（见配对仓库） |
|----------|------------------------|
| 页面、布局、组件、水墨视觉 | Python：**ingest / sync、生产 RAG 主链路** |
| `app/api/*` BFF、Python 代理、`/api/ingest` 等 | 全量 content → 向量 CI 管线（可参考 `.github/workflows/rag_ingest_supabase.yml` 拉取后端仓执行） |
| 服务端 Supabase 客户端、内容解析与展示 | Embedding 维度与表结构须与 `supabase/sql/init.sql` 一致 |

配对后端：**[ai-ink-brain-api-python](https://github.com/Cyning12/ai-ink-brain-api-python)**（环境变量 `PY_API_URL`，本地默认常为 `http://127.0.0.1:8000`）。

## 本地开发

**前置**：Node 24、pnpm 10；若使用 Python 对话，需另起后端并设置 `PY_API_URL`。

```bash
pnpm install
cp .env.example .env.local   # 按需填写，勿提交密钥
pnpm dev                      # next dev --webpack
```

常用脚本：

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发（Webpack 模式，与当前 `package.json` 一致） |
| `pnpm dev:turbo` | 开发（Turbopack） |
| `pnpm build` / `pnpm start` | 生产构建与启动 |
| `pnpm lint` | ESLint |

**环境变量**：完整表、别名与「谁读取」见 **[`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`](docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md)**；模板见根目录 `.env.example`。

**部署**：Vercel 等行为见 `vercel.json`（如 `pnpm install --frozen-lockfile`）。

## 文档与协作

| 文档 | 用途 |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Agent 阅读顺序、关键入口文件、任务与图谱约定 |
| [`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`](docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md) | 环境变量、目录职责、API 契约摘要（**配置真值表**） |
| [`docs/_tech_graph/`](docs/_tech_graph/) | 路由、API、鉴权等流程图与规约（与子流程 `.ai.md` 双轨维护） |
| [`content/tasks/`](content/tasks/) | 任务规格：`active/`、`done/`、`README.md` |

多子仓总览与工作区约定见上级目录 **`Projects/AGENTS.md`**。

## 安全提示

- 勿将 `.env`、`.env.local`、**service role**、各厂商 API Key 提交到 Git。
- `NEXT_PUBLIC_ADMIN_SECRET` 等会参与浏览器或 BFF 鉴权的设计仅适合**私有/受控**环境；生产环境请按威胁模型收紧。

## 许可证与作者

私有项目；具体许可证以仓库内 `LICENSE` 为准（若存在）。个人实践与知识沉淀向 **AI 应用开发** 方向的持续迭代。
