# AI-Ink-Brain（本仓库）项目配置清单

> **用途**：供子 Agent 填全、总 Agent 汇总；与 `docs/tasks/task_*.md` 配合使用。  
> **范围**：仅本仓库（Next 博客 + BFF + 本地 RAG/入库）；**不含** Python API 仓库实现细节（见「关联仓库」）。  
> **更新**：修改契约、环境变量或目录职责后请同步更新本文件。

---

## A. 仓库身份与边界

| 项 | 值 |
|----|-----|
| 仓库用途 | RAG 驱动的个人博客：内容在 `content/`，向量在 Supabase，聊天经 Python BFF 或本地 Node RAG |
| 远程与分支 | 以实际 `git remote` 为准；常见工作分支：`production` |
| 技术栈（以 `package.json` 为准） | Next **16**.x（App Router）、React 19、TypeScript、Tailwind 4、pnpm；**注意**：`.cursorrules` 文中写「Next.js 15」为历史描述，以依赖版本为准 |
| 包管理器 / Node | `pnpm@10.x`（见 `packageManager`）；Node **24.x**（见 `engines`） |
| **本仓负责** | 页面与布局、`app/api/*` Route Handlers、Supabase 服务端客户端、内容解析与展示、**转发** `PY_API_URL`、本地 `POST /api/chat` RAG、文件上传入库（Node）、水墨风 UI |
| **本仓不负责（单一事实源在外部）** | 全量 content → 向量同步的 Python ingest 管线、生产级 RAG 对话主逻辑：在 **`Cyning12/ai-ink-brain-api-python`**（见 `.github/workflows/rag_ingest_supabase.yml`）；`.cursorrules` 中提到的根目录 `api/` 指该后端形态，**本 monorepo 根下可无 `api/`** |
| 向量与维度 | `supabase/sql/init.sql` 中 `embedding vector(1024)`；须与 `EMBEDDING_DIM` 及所选 embedding 模型一致 |

---

## B. Cursor / Agent 规则（本仓）

| 文件 | 作用 | 备注 |
|------|------|------|
| `.cursorrules` | 全仓 AI 规则：RAG 元数据、向量余弦、分块、Python vs TS 分工、水墨视觉、错误处理 | 与后端仓库分工以文中「Python vs TypeScript」为准 |
| `AGENTS.md` | 指向 `@AGENTS.md`，提醒 Next 与训练数据差异 | 极短 |
| `CLAUDE.md` | 同 `AGENTS.md` | 若有 |
| `.cursor/rules/` | **当前无**；若新增请在本表追加一行并写清 `globs` | — |

---

## C. 环境变量（与代码读取处对齐）

> 模板见根目录 `.env.example`。本地可复制为 `.env` / `.env.local`（**勿提交密钥**）。

| 变量名 | 必填 | 用途 | 谁读取（主要） | 留空或未设时的行为 |
|--------|------|------|----------------|---------------------|
| `EMBEDDING_PROVIDER` | 否 | `siliconflow` \| `dashscope` \| `bailian`（后两者等价 dashscope） | `lib/ai/embeddings/index.ts` | 默认 `siliconflow` |
| `EMBEDDING_DIM` | 建议 | 向量维度，须与 `init.sql` 中 `vector(N)` 一致 | `lib/ai/embeddings/dimension.ts`、`lib/ingest*.ts` 等 | 可回退读 `SILICONFLOW_EMBEDDING_DIM` |
| `SILICONFLOW_EMBEDDING_DIM` | 否 | `EMBEDDING_DIM` 兼容旧名 | `lib/ai/embeddings/dimension.ts` | — |
| `SILICONFLOW_API_KEY` | Embedding/部分调用必填 | SiliconFlow API Key | `lib/ai/embeddings/siliconflow-provider.ts`、`lib/siliconflow.ts`、`app/api/chat/route.ts` 等 | 缺失时相关请求报错 |
| `SILICONFLOW_EMBEDDING_ENDPOINT` | 否 | Embedding HTTP 端点 | `lib/ai/embeddings/siliconflow-provider.ts`、`lib/siliconflow.ts` | 默认 `https://api.siliconflow.cn/v1/embeddings` |
| `SILICONFLOW_EMBEDDING_MODEL` | 否 | Embedding 模型 id | 同上 | 默认 `BAAI/bge-m3` |
| `SILICONFLOW_BASE_URL` | 否 | Chat Completions 基址（OpenAI 兼容） | `app/api/chat/route.ts` | 默认 `https://api.siliconflow.cn/v1` |
| `SILICONFLOW_CHAT_MODEL` | 否 | 对话模型 id | `app/api/chat/route.ts` | 默认 `deepseek-ai/DeepSeek-V3` |
| `DASHSCOPE_API_KEY` | 当 `EMBEDDING_PROVIDER=dashscope\|bailian` 时必填 | 百炼 / DashScope | `lib/ai/embeddings/dashscope-provider.ts` | 缺失则 embedding 失败 |
| `DASHSCOPE_EMBEDDING_BASE_URL` | 否 | 兼容模式 Base URL | `dashscope-provider.ts` | 有默认中国大陆地址 |
| `DASHSCOPE_EMBEDDING_MODEL` | 否 | 模型名 | `dashscope-provider.ts` | 默认 `text-embedding-v3` |
| `NEXT_PUBLIC_SUPABASE_URL` | 服务端必填其一 | Supabase Project URL | `lib/supabase/server.ts` | 可与 `SUPABASE_URL` 二选一（见代码优先级） |
| `SUPABASE_URL` | 否 | 与上一项兼容别名 | `lib/supabase/server.ts` | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 必填其一 | **service_role**（非 anon） | `lib/supabase/server.ts` | 可与 `SUPABASE_SERVICE_KEY` 二选一 |
| `SUPABASE_SERVICE_KEY` | 否 | 兼容别名 | 同上 | — |
| `NEXT_PUBLIC_ADMIN_SECRET` | Legacy Ink 管理/聊天鉴权建议配置 | **Ink** 管理员密钥；`ChatPanel` 等存 `blog_admin_token` 作 BFF Bearer；**Unified Chat BFF 不再强制**；**admin/sync · admin/ingest 已废弃此项**（见 `SYNC_ADMIN_SECRET`） | `lib/auth/admin-env.ts`、非 Unified 的解锁 API、`middleware.ts` | 与 `CHAT_API_SECRET` 二选一（优先前者） |
| `CHAT_API_SECRET` | 否 | `NEXT_PUBLIC_ADMIN_SECRET` 兼容旧名 | `lib/auth/admin-env.ts` | 同上 |
| **`SYNC_ADMIN_SECRET`** | **admin/sync 必填其一** | **服务端 only** · BFF `/api/admin/sync`、`/api/admin/ingest` 入站 Bearer + `forwardToPyAdmin` 出站；与 Python `admin_secret()` **同值**；文档 shell 别名 **`ADMIN_TOKEN`** | `lib/auth/sync-admin-env.ts`、`lib/py-service-proxy.ts`、`require-sync-admin-access.ts` | 未设时回退 `CHAT_API_SECRET` → 废弃回退 `NEXT_PUBLIC_ADMIN_SECRET`（2026-06-30 移除）；**禁止**写入 Portfolio W5 curl 示例 |
| `RAG_MATCH_THRESHOLD` | 否 | 向量检索相似度阈值 | `app/api/chat/route.ts` | 仅影响 **本地 Node** `POST /api/chat` |
| `PY_API_URL` | 否 | Python FastAPI 基址 | `next.config.mjs` rewrites、`app/api/py/**/route.ts`、`lib/py-service-proxy.ts` | 默认 `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_SITE_MODE` | 否 | 站点模式：`portfolio`（投递演示四链导航/首页）\| `development`（现网全量 NAV） | `lib/site-mode.ts` → `app/_components/site-nav.tsx`、`home-modules.tsx`、`app/layout.tsx`（`generateMetadata`） | 未设或非法值 **等同** `development`；portfolio build 须显式 `NEXT_PUBLIC_SITE_MODE=portfolio` |

**Portfolio 演示 · 后端 ingest（非本仓 env，配对 api-python 进程）**

| 变量 | 说明 |
|------|------|
| `CONTENT_ROOT` | 本地/预发须指向 **本仓** `content/` 绝对路径，使 `methodology/`、`resume/`、`evidence/` 与 RAG ingest 同源；**勿**指向 `docs/tasks` 或 `docs/harness`；同步脚本见 `tools/sync-portfolio-content.sh` · `tools/README-portfolio-content-sync.md` |

**Portfolio 演示 · 前端联调（W6 · `NEXT_PUBLIC_SITE_MODE=portfolio`）**

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SITE_MODE` | 须为 `portfolio`（Preview/生产演示与关账 `pnpm build`） |
| `PY_API_URL` | Unified Chat / verify / admin/sync 转发目标 |
| `SYNC_ADMIN_SECRET` | `POST /api/admin/sync` Bearer；与 Python admin 同值 |
| **解锁主路径** | **ChatBI DB 明文 token** → `GET /api/py/chatbi/access/verify` → `access_level` 映射 visitor / visitor-admin（见 `lib/unified-chat/portfolio-chat-tier.ts`） |
| `PORTFOLIO_VISITOR_SECRET` / `PORTFOLIO_VISITOR_ADMIN_SECRET` | **可选后门**（`POST /api/auth/unlock` `secret` 分支）；**非** W4 主路径 |
| 五问 chip | 运行时 `GET /api/py/chat/suggested-questions`（BFF 转发 Python）；静态降级 `lib/unified-chat/portfolio-demo-chips.ts` 须与 api-python PR #114 列表一致 · task `task_frontend_suggested_questions_api_v1.md` |

---

## D. 运行与脚本

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | `next dev --webpack` |
| `pnpm dev:turbo` | `next dev`（Turbopack） |
| `pnpm build` / `pnpm start` | 生产构建与启动 |
| `pnpm lint` | ESLint |
| `pnpm tech-graph:graph-export` | 自 `docs/_tech_graph/*.ai.md` 重生成 `graph.json`（需 sibling `ai-ink-brain-api-python`） |
| `pnpm tech-graph:manifest-check` | 前端 BFF/pages 与 `_manifest.json` 一致（CI **quality** job） |
| `pnpm tech-graph:graph-check` | `graph.json` 漂移校验（CI 同源） |
| `pnpm tech-graph:equivalence-check` | graph_v2 等价门禁（锚点/label 阈值） |
| `pnpm tech-graph:schema-check` | `graph.json` 结构校验（可选本地） |
| `pnpm tech-graph:query <op> …` | 图查询（`downstream` / `describe-impact` 等；见 `graph_v2_schema.md` §9） |

**Tech Graph**：图谱目录 `docs/_tech_graph/`；迁移手册 `docs/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md`；规格 `docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md`。

**Vercel**：`vercel.json` 指定 `pnpm install --frozen-lockfile` 与 `pnpm run build`。

**Python**：本仓库不内置 FastAPI 源码时，无需在本仓 `uvicorn`；仅需部署或本地启动 **api-python** 并配置 `PY_API_URL`。

---

## E. 目录与职责速查（总 Agent「去哪改」）

| 路径 | 职责 |
|------|------|
| `app/` | App Router 页面、布局、`app/api/**/route.ts` |
| `app/api/chat/route.ts` | **本地 Node RAG**：Embedding → Supabase `match_documents` → SiliconFlow Chat 流式（UIMessage） |
| `app/api/py/chat/route.ts`、`app/api/py/chat/history/route.ts`、`app/api/py/chat/suggested-questions/route.ts` | **BFF**：转发到 `{PY_API_URL}/api/py/chat` 等（含推荐问法 GET） |
| `app/api/admin/sync/route.ts`、`app/api/admin/ingest/route.ts` | 管理动作转发到 Python |
| `app/api/ingest/route.ts` | 文件上传入库（Node） |
| `app/api/auth/*` | 解锁 / session / logout（HttpOnly Cookie 等） |
| `app/api/system/status/route.ts` | 系统状态 |
| `lib/chat/chatApi.ts` | 前端 `fetch` `/api/py/chat`、流解析、`x-sources` header + 流尾 `---RAG_SOURCES_JSON---` |
| `lib/py-service-proxy.ts` | Python 管理接口转发辅助 |
| `lib/supabase/server.ts` | 服务端 Supabase 客户端（强制 service role） |
| `lib/content/`、`lib/ingest*.ts` | 内容扫描、分块、入库相关 |
| `lib/ai/embeddings/` | 统一 embedding 入口与厂商实现 |
| `lib/auth*.ts`、`lib/auth/` | 管理员密钥解析、API 鉴权 |
| `components/ChatPanel.tsx` | 浮窗聊天 UI |
| `components/SourceCitation.tsx`、`components/SourceCitations.tsx` | 来源引用展示（以实际引用为准） |
| `content/` | 博客/日记/学习等 Markdown/MDX 源文件；Portfolio RAG 语料为 `methodology/`、`resume/`、`evidence/`（`tools/sync-portfolio-content.sh`）；**不含** `docs/tasks/`、`docs/harness/`（已迁出，不参与 ingest） |
| `tools/sync-portfolio-content.sh` | Portfolio MVP 三文件同步（W5）；见 `tools/README-portfolio-content-sync.md` |
| `docs/tasks/` | **任务驱动**：`task_*.md` 描述需求与验收（Harness 落盘，**不**进 RAG） |
| `docs/harness/` | Harness invoke / review 产物（**不**进 RAG） |
| `docs/meta/` | **本文件**：项目级配置清单（非任务） |
| `supabase/sql/` | `init.sql` 及补丁 SQL（RPC、混合检索等） |
| `.github/workflows/` | 如 `rag_ingest_supabase.yml`：checkout 本仓 + 后端仓跑 ingest |
| `middleware.ts` | 仅匹配 **`/api/chat`**（及子路径）：校验管理员 Token |
| `next.config.mjs` | `outputFileTracingRoot`、`/api/py/*` → `PY_API_URL` rewrites 等 |

---

## F. 对外契约（摘要）

### 聊天（Python 路线，前端默认）

| 项 | 说明 |
|----|------|
| `POST /api/py/chat` | 请求体：`{ session_id, messages[] }`；鉴权：`Authorization: Bearer` 或 `x-blog-admin-token`（与 `NEXT_PUBLIC_ADMIN_SECRET` / `CHAT_API_SECRET` 一致，由 BFF 与 Python 约定） |
| 响应 | `text/plain; charset=utf-8` 流式正文 |
| **来源引用（Task 04）** | **优先**响应头 `x-sources`：`decodeURIComponent` 后 `JSON.parse`；**兜底**流末尾 `---RAG_SOURCES_JSON---` + JSON。实现见 `lib/chat/chatApi.ts`；合并策略：`header.sources ?? streamParsed.sources` |
| `GET /api/py/chat/history` | Query：`session_id`、`limit`；JSON 恢复会话 |

### Unified Chat（Ink BFF → Python）

| 项 | 说明 |
|----|------|
| `POST /api/py/unified/chat`、`POST /api/py/unified/chat/stream` | BFF：**不**再执行 `requireAdminApiSecret`；透传 `Authorization` / `x-blog-admin-token`；若含 **`X-ChatBI-Access-Token`** 则对 Python 写入 **`Authorization: Bearer <DB token>`**（否则透传浏览器 `Authorization`，兼容旧客户端） |
| 前端 | `components/unified-chat/UnifiedChatPageClient.tsx`：**假登录**仅在「解锁」输入 **ChatBI 明文** → `GET /api/py/chatbi/access/verify`；请求仅带 **`X-ChatBI-Access-Token`**（`localStorage`：`chatbi_access_token_plain`），**不依赖** `blog_admin_token` |
| `GET /api/py/chatbi/access/verify`（BFF） | 同上：不校验 Ink env，仅转发 Python |
| `GET /api/py/chat/history`（BFF） | 同上：不校验 Ink env；透传 **`X-ChatBI-Access-Token`** 供 Python 与 Ink admin 二轨鉴权 |

### 聊天（本地 Node 路线）

| 项 | 说明 |
|----|------|
| `POST /api/chat` | 走 `app/api/chat/route.ts`；**middleware** 强制携带与管理员一致的 Token |
| 检索阈值 | `RAG_MATCH_THRESHOLD` |

### 管理 / 入库

| 路径 | 说明 |
|------|------|
| `POST /api/admin/sync`、`/api/admin/ingest` | 转发 Python（见各 `route.ts`） |
| `POST /api/ingest` | 本仓文件上传分块入库 |

### Supabase

| 项 | 说明 |
|----|------|
| 表 `public.documents` | `content` + `metadata` jsonb + `embedding vector(1024)` |
| RPC | 如 `match_documents`；混合检索等以 `supabase/sql/` 内脚本为准 |

---

## G. 安全与 CI

| 项 | 说明 |
|----|------|
| 禁止提交 | `.env`、含 `SUPABASE_SERVICE_ROLE_KEY` 的明文、SiliconFlow `sk-*` 等 |
| GitHub Actions | `rag_ingest_supabase.yml` 使用 Secrets：`NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`SILICONFLOW_API_KEY`、`SILICONFLOW_BASE_URL` 等；拉取后端 `Cyning12/ai-ink-brain-api-python` 后设置 `CONTENT_ROOT=${{ github.workspace }}/content` |
| 前端 Token 存储 | `ChatPanel` 等使用 `localStorage` 存 Ink 管理 Token；`UnifiedChatPageClient` 另可存 **`chatbi_access_token_plain`**（个人环境、XSS 风险自担） |

---

## H. 任务驱动流程（与总 Agent 协作）

1. 新需求在本仓落地时，优先在 `docs/tasks/` 新增或更新 `task_xx_*.md`（目标、接口、验收、涉及路径）。
2. 总 Agent 调度到本仓库时，应 **先读本文件** + 相关 `task_*.md` + 涉及的 `AGENTS.md` / `.cursorrules`。
3. 子 Agent 完成实施后，在对应 **任务文件末尾** 回填「完成情况」；本清单 **不替代** 任务验收，仅描述仓库静态配置。

---

## 关联仓库（不在本 Git 树内）

| 仓库 | 用途 |
|------|------|
| `Cyning12/ai-ink-brain-api-python` | FastAPI：RAG 对话、ingest/sync、与 Supabase/SiliconFlow 深度集成；CI ingest 默认拉取此仓库 |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-12 | Unified BFF：Ink `Authorization` 与 Python DB Bearer 解耦；**同日后续**：Unified/verify/RAG history BFF **移除** `requireAdminApiSecret`，假登录仅 **`X-ChatBI-Access-Token`**；Python `GET /api/py/chat/history` 支持 **`X-ChatBI-Access-Token`** 优先轨 |
| 2026-04-15 | 首版：基于 `.env.example`、`package.json`、主要 `lib/` / `app/api` / workflow 扫描生成 |
