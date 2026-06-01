# SPEC：Portfolio 演示模式（Next.js 前端 · 投递冲刺）

| 项 | 内容 |
| --- | --- |
| **状态** | **`active`**（Prompt 00 轮 4 · R4-2=A · 2026-06-01 冻结） |
| **类型** | 规格真值（`content/tasks/specs/`）；实施拆为 `content/tasks/active/task_*.md`（**由 10 帽创建，本 Prompt 00 不创建**） |
| **关联图谱** | `docs/_tech_graph/10_flow_route.md` · `12_flow_auth.md` · `13_flow_components.md`（实施后须增量更新 `.ai.md`） |
| **test_strategy（建议）** | `recommended`（模式开关与导航为关键路径；全量 E2E 五问联调依赖后端 ingest，见 §6） |
| **freeze_id** | **`PORTFOLIO-RAG-DEMO@2026-06-01`**（与配对后端 Epic **同源**；task 正文须引用） |
| **配对 SPEC** | 后端 [`SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`](../../../ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md) **`active`** — 交叉验收以该文为准 |
| **Harness 下一棒（已拍板 · R4-5=B）** | **20 规格短评** → **10 需求帽** → task（W1 起）；**不**跳过 20 |
| **硬 deadline（里程碑，非本回合实施）** | **2026-06-09 上午**：四屏可演示 + RAG 五问（与后端 sync 联调）；**2026-06-06**：简历一次性同步（URL 占位 `[DEMO_URL]` 可后填） |

---

## SDD 过程态（轮 0 / 轮 1 · 本稿已合并为可审 SPEC）

### 轮 0 · 意图卡

| 项 | 内容 |
| --- | --- |
| **完成态一句话** | 见 §0 |
| **非范围** | 见 §3 |
| **依赖** | 见 §9 · 跨仓 `CONTENT_ROOT` · 后端 Portfolio RAG SPEC |
| **验收口径草案** | 见 §6 |
| **Prompt 00** | 已收口（见文末清单）；**冻结** `PORTFOLIO-RAG-DEMO@2026-06-01` |

**方向确认（已拍板，SPEC 不得推翻）**：不新建前端仓；`NEXT_PUBLIC_SITE_MODE=portfolio` 切换演示导航与首页；访客不开放，邮件申请秘钥；内容目录 `content/{methodology,resume,evidence}` 与 RAG ingest 同源；Unified Chat 保留 Text2SQL、裁剪调试 UI。

### 轮 1 · 骨架（章节映射）

| 模块 | SPEC 节 |
| --- | --- |
| 模式与导航 / 根首页 | §4.1 · §4.6 |
| 静态内容页 | §4.2 · §4.6.2–4.6.4 |
| 访客秘钥 | §4.3 |
| Unified Chat 裁剪 | §4.4 |
| 内容同步脚本 | §4.5 |
| RAG 同源 | §5 |
| 验收 / 工作包 | §6 · §7 |

---

## §0 完成态一句话

在 **不新建前端仓** 的前提下，当 `NEXT_PUBLIC_SITE_MODE=portfolio` 时，**站点根路径 `/` 即演示首页**（静态、**无需任何秘钥**）；对外导航为 **首页 `/` · 简历 · 方法论 · 对话** 四链；**`/resume` · `/methodology` · `/evidence` 全程可匿名阅读**；仅 **`/unified-chat` 内发送消息** 需访客秘钥。品牌与文案 **去 Ink 化**，改为 **作者刘新宁（Cyning）** 求职向定制展示；内容与向量 ingest 共用 `content/` 三目录；对话能力邮件申请 **231127227@qq.com**。

---

## §1 背景与目标

### 1.1 背景

- **投递场景**：2026-06-09 上午面向 Moonshot AI Coding Mentor 等岗位的 **portfolio 演示**；简历中 Demo URL 可先占位 `[DEMO_URL]`，**2026-06-06** 前完成简历与站点叙事一次性对齐。
- **技术叙事**：站点基于现有 **Next.js App Router** 仓（代码仓名可保留 `ai-ink-brain`，**对外 UI 不出现 Ink 品牌**）；能力展示集中在 **方法论正文 + 简历 + 证据 + Unified Chat（RAG + Text2SQL）**。
- **访问控制**：演示 **不对外开放**；招聘方通过邮件获取 **限时访客秘钥**（`visitor` 72h / `visitor-admin` 24h），与当前仅 `isAdmin` 布尔门控的 ChatBI/Ink 管理员模型不同，需扩展 `/api/auth/unlock` 与 session 载荷。

### 1.2 目标

| # | 目标 |
| --- | --- |
| G1 | 环境变量 **`NEXT_PUBLIC_SITE_MODE`**：`portfolio` \| `development`（默认 `development`），驱动导航、首页模块、部分文案与调试 UI 可见性 |
| G2 | **演示首页 = `/`（根目录）**，禁止另建 `/demo` 等二级「假首页」；Portfolio 导航四链；Blog / Learning / Tasks 等 **从 NAV 移除**，路由 **不删** |
| G2b | **公开区**（`/`, `/resume`, `/methodology`, `/evidence`）**零鉴权**；**门控区**仅 Unified Chat **发消息**（页壳可进，见 §4.6） |
| G3 | 新增 **`/resume`**、**`/methodology`**、**`/evidence`** 独立页面（证据页已拍板独立路由；顶部 NAV 仍四链） |
| G4 | 访客秘钥体系与 **同源 content + 后端 sync** 可支撑 docs 计划 **五问** 演示（chip 文案就绪，联调在后端 task） |
| G5 | `pnpm run build` 在 portfolio 模式下通过；与配对后端 `CONTENT_ROOT` 指向本仓 `content/` 一致 |

### 1.3 AI Coding 验收分工（叙事要求）

| 角色 | 职责 |
| --- | --- |
| **人（Cyning）** | 拍板 SPEC / `freeze_id`；验收四屏与五问；邮件发放秘钥；简历 `[DEMO_URL]` |
| **AI Coding Agent** | 按冻结 SPEC + task 实现；改后跑 `pnpm lint` / `pnpm test` / `pnpm build`；同步 `_tech_graph` |
| **配对后端** | `CONTENT_ROOT`、ingest category、五问检索质量；见脚注依赖 P1-B（**非 6/9 前端范围**） |

---

## §2 现状差距（基于本仓扫描 · 2026-06-01）

### 2.1 模式与环境

| 项 | 现状 | 差距 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_MODE` | **未出现**于 `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` 与代码检索 | 需新增 env 约定、读取工具函数、portfolio 分支 |
| 站点 branding | `SiteNav` 标题 **AI-Ink-Brain · RAG Blog**；`metadata` 为 RAG 博客描述 | Portfolio：**作者向**（§4.6.0）；**禁止** 导航/页脚/首页再出现 Ink / RAG Blog 副标题 |

### 2.2 导航与首页（`site-nav.tsx` · `home-modules.tsx`）

**`app/_components/site-nav.tsx`（扫描）**：

- `NAV` 固定 8 项：`/blog`、`/learning`、`/projects`、`/chat`、`/text2sql`、`/chain-chat`、`/unified-chat`、`/about`。
- `useAdminSession().isAdmin` 为真时才显示 chat / text2sql / chain / **unified**；非 admin 仍可见 Blog、Learning、Tasks、About。
- **无** portfolio 模式分支；**无** 简历/方法论/证据路由。

**`app/_components/home-modules.tsx`（扫描）**：

- 非 admin：`学习日志`、`学习资源`、`任务` 三卡（`/blog`、`/learning`、`/projects`）。
- admin 追加：`对话`、`Text2SQL`、`Chain Chat`、`Unified Chat`。
- **无** 简历/方法论/证据入口；与 portfolio 四屏目标不一致。

**`docs/_tech_graph/10_flow_route.md`**：图谱已记录上述真实 `NAV[]` / `HomeModules` 结构；实施后须更新 `.ai.md` 增加 `SITE_MODE` 分支节点。

### 2.3 鉴权（`useAdminSession` · `/api/auth/*`）

| 项 | 现状 | 差距 |
| --- | --- | --- |
| `lib/hooks/useAdminSession.ts` | 仅 `isAdmin: boolean` + `configured` | 需 **`role`**（至少区分 `none` / `visitor` / `visitor-admin` / `admin`）或等价字段供 UI 裁剪 |
| `GET /api/auth/session` | `admin` 由 Ink Cookie 或 ChatBI Cookie 上游校验 | 需识别访客秘钥 session、TTL 过期 |
| `POST /api/auth/unlock` | `token`→ChatBI；`secret`→Ink **或** ChatBI；Cookie **Max-Age 7 天**（Ink / ChatBI 各一套） | 需 **多秘钥映射**（`visitor` 72h、`visitor-admin` 24h）、env 配置面；与已拍板 TTL 对齐 |
| 无 session UX | Unified Chat 展示 ChatBI DB 明文解锁文案 | **仅** `/unified-chat` 发消息区门控；静态页 **不因** 无 session 整页拦截；Unified 内展示邮件申请 + unlock 表单 |

### 2.4 内容目录与 MDX

| 项 | 现状 | 差距 |
| --- | --- | --- |
| `content/` 顶层 | 存在 `diary/`、`learning/`、`tasks/`、`harness/` 等；**无** `methodology/`、`resume/`、`evidence/` | 需新建目录 + 同步脚本 |
| `lib/content/mdx-posts.ts` | 扫描全 `content/`；`category` = 首段路径；`generateStaticParams` 对 blog 过滤 `diary`/`learning`/`tasks` | 需 **portfolio 页路由** 绑定三分类（或专用 loader），避免与 `/blog` 混用 |
| `app/about/page.tsx` | 占位「后续接入简历」 | **已拍板** canonical **`/resume`**；`/about` 在 portfolio 下宜 **308** → `/resume`（W2 实现） |

### 2.5 Unified Chat（`components/unified-chat/`）

| 项 | 现状 | 差距 |
| --- | --- | --- |
| 解锁 | 依赖 **ChatBI 明文 token** + `localStorage`；文案强调不用 `NEXT_PUBLIC_ADMIN_SECRET` | 招聘访客走 **portfolio unlock API** + 邮件说明；**已拍板** 保留 ChatBI 明文路径作 **维护后门**（仅 admin/内部，默认不对访客展示） |
| 调试 UI | `Router Debug` 开关、`UnifiedChatRouterDebugPanel`（intent router details）、`?debug=1` 下 LLM Prompt / SSE done / Timeline / ExecutionTrace | 已拍板：**隐藏** RouterDebugPanel 等；**保留** Text2SQL 能力（`prefer` 含 `text2sql` / `auto`） |
| 推荐问法 chip | 3 条通用 SQL/RAG 示例（非五问） | 需替换或增补为 docs 计划 **Q1～Q5** 文案（§6.4） |
| `useAdminSession` | 与 SiteNav 门控独立；Unified 页 **不** 用 `isAdmin` 控制入口 | Portfolio 下 `/unified-chat` 为 **公开导航项**，但页内仍须秘钥解锁 |

### 2.6 工具链

| 项 | 现状 | 差距 |
| --- | --- | --- |
| `tools/sync-portfolio-content.sh` | **不存在** | 需新增（§4.5） |
| 后端 ingest | `ingest_pipeline.py`：`CONTENT_ROOT` 指向前端 `content/` 时按 **首段目录名** 为 `category` | 与 §5 一致；依赖后端 sync API |

### 2.7 外部文档可读性（Prompt 00 轮 2 更新）

| 路径 | 结果 |
| --- | --- |
| `content/tasks/specs/投递冲刺_20260609_v1_zh.md` | **可读**（v1.2 · §2 五问真值；原 `Projects/docs/planning/` 路径未 clone 时以本路径为准） |
| `ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` | **可读**（`draft` · category 硬约束与 RUNBOOK 大纲） |

→ 五问 chip **逐字文案** 已自投递计划 §2 粘贴至 §6.4（Prompt 00 轮 2 · 人答复 Q1=A）。

---

## §3 范围 / 非范围

| 分类 | 项 | 说明 |
| --- | --- | --- |
| **范围内** | `NEXT_PUBLIC_SITE_MODE` 与 portfolio 导航/首页 | `site-nav` · `home-modules` · `layout` metadata（按需） |
| **范围内** | 页面 `resume` / `methodology` / `evidence`（或等价路由） | MDX/Markdown 渲染，水墨风一致 |
| **范围内** | 访客秘钥 unlock / session / role / TTL | 扩展 `app/api/auth/unlock` · `session` · hook |
| **范围内** | **`tools/gen-portfolio-secrets.sh`** | 本机生成 `PORTFOLIO_VISITOR_*`（R4-4=A · W3） |
| **范围内** | Unified Chat 展示层裁剪 + 五问 chip | 保留 Text2SQL；隐藏 RouterDebug 等 |
| **范围内** | `content/{methodology,resume,evidence}` + `tools/sync-portfolio-content.sh` | 从 `ai-coding-closed-loop-articles` release + docs 简历 + 证据卡 |
| **范围内** | `PROJECT_CONFIG` · `_tech_graph` 增量 | 非业务逻辑大改 |
| **非范围** | 新建 Vue 仓、ChatBI v3 preview 全 UI、删旧路由 | 路由保留，仅隐藏入口 |
| **非范围** | 静态站另起炉灶、双能力 handoff 完整实现 | 属后端 **P1-B**；本 SPEC 仅 **脚注依赖** |
| **非范围** | 生产级多租户、自助注册、公开匿名 RAG | 演示不对外开放 |
| **非范围** | 本回合创建 `task_*.md`、invoke、实现、PR | 仅 SPEC |

---

## §4 功能需求

### 4.1 Portfolio 模式与导航

**环境变量**

```text
NEXT_PUBLIC_SITE_MODE=portfolio | development   # 默认 development（未设等同 development）
```

**信息架构（已拍板 · 消除「演示首页变二级页」歧义）**

| 概念 | 路由 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| **演示首页** | **`/`（根目录）** | **无** | **即** landing；**不是** `/home`、`/demo` 或任何二级首页 |
| 简历 | `/resume` | **无** | 与 ingest 同源 md |
| 方法论 | `/methodology` | **无** | 目录 + 单篇阅读 |
| 证据 | `/evidence` | **无** | 不进 NAV，首页/方法论内链 |
| 对话 | `/unified-chat` | **发消息需秘钥** | NAV **常显**；无 session 时页内静态说明 + unlock，**不** 403 整页 |

```text
访客打开 [DEMO_URL]/
        │
        ├─► /              静态演示首页（永远可看）
        ├─► /resume        静态 md（永远可看）
        ├─► /methodology   静态 md（永远可看）
        ├─► /evidence      静态 md（永远可看）
        └─► /unified-chat  页壳可看 · 输入框 unlock 后可用
```

**行为**

| 模式 | 顶部 `SiteNav` | 根路径 `/` |
| --- | --- | --- |
| `development` | **保持现状**（8 项 + admin 门控） | 现有 Cyning / 水墨 / 学习模块 |
| `portfolio` | **四链**：`/`（首页）· `/resume` · `/methodology` · `/unified-chat`（对话） | **§4.6.1 作者演示首页**（非 Blog 三卡） |
| `portfolio` | 品牌区 | **§4.6.0**（无 Ink） |

**隐藏规则（已拍板）**

- Blog、Learning、Tasks、Chat、Text2SQL、Chain、**About** 等 **不出现在 NAV/根页**（`/about` → `/resume` 308）。
- **不删除** 旧路由；演示脚本 **不引导** 深链。

**实现提示（供 30 帽）**

- `lib/site-mode.ts` 集中读取 `NEXT_PUBLIC_SITE_MODE`。
- **`useAdminSession` 不得隐藏** portfolio 下 `/unified-chat` **导航项**；门控只在 Chat 组件内。
- **不得** 用 middleware 对 `/resume` 等公开路由做 session 拦截。

### 4.2 页面：resume / methodology / evidence

| 页面 | 路由（**已拍板**） | 内容源 | 说明 |
| --- | --- | --- | --- |
| 简历 | **`/resume`** | `content/resume/**/*.md(x)` | canonical 简历 URL；`app/about` 在 portfolio 下 **308** → `/resume`（W2） |
| 方法论 | `/methodology` | `content/methodology/**/*.md(x)` | 卷一～五 release 后文章 + 本地索引页 |
| 证据 | **`/evidence`**（**独立页 · 已拍板**） | `content/evidence/**/*.md(x)` | 证据卡（如 `methodology-card.md`）；**不进四链 NAV**，由首页/方法论/五问 chip 链入 |

**与投递计划对齐**：公开演示仍称 **四屏/四链**（首页、简历、方法论、对话）；`/evidence` 为第五 **路由** 而非第五 NAV 项（Prompt 00 轮 2 · Q3=A）。

**渲染**

- 复用 `lib/content/mdx-posts.ts` 扫描能力或 **专用** `getPortfolioDoc(category)`，避免把 harness/tasks 目录暴露到 URL。
- 风格：沿用 `#F9F9F7` / `#2C2C2C` 水墨留白（`.cursorrules` / UI 规则）。

**根页 `/`**

- Portfolio 模式下 **重写** `app/page.tsx` 呈现（或 portfolio 专用组件）；**不是** 在 `/demo` 另建二级首页。详见 **§4.6.1**。

### 4.6 演示页示例与作者定制展示（真值 · 30 帽按本节实现）

> 本节为 **页面内容与展示形态** 的权威描述；§4.2 路由表仍有效，此处补 **写什么、用什么组件、演示顺序**。

#### 4.6.0 品牌与文案（去 Ink 化 · 已拍板）

| 位置 | `development`（保持） | `portfolio`（必须） |
| --- | --- | --- |
| `SiteNav` 主标题 | AI-Ink-Brain | **刘新宁** 或 **Cyning · 刘新宁**（二选一，W1 定稿） |
| `SiteNav` 副标题 | RAG Blog | **AI Coding · RAG 演示**（或 **求职演示站**） |
| 根页 `/` 顶栏小字 | 水墨 | **AI 应用工程** 或 **求职向**（去掉「水墨」装饰向文案） |
| 根页主标题 | Cyning | **刘新宁** |
| 根页副文案 | 低密度留白…学习实验 | **§4.6.1 示例文案** |
| 页脚 | © … Cyning · Ink | **© {year} 刘新宁** · 演示站 · [GitHub 连载](外链) |
| `layout` metadata | RAG 博客 | **刘新宁 · AI Coding / Agent 应用**（title/description） |
| 正文叙事 | 可提 Ink 项目 | 用 **「个人全栈 RAG 演示项目」**；**禁止** 对外页写 Ink-Brain 产品名 |
| 五问 Q4 合格要点 | 含 Ink | 改为 **百果园 Cursor + 个人 RAG/ChatBI 项目 + 连载**（§6.4 已同步） |

**允许保留**：代码仓目录名 `ai-ink-brain`、内部 `PROJECT_CONFIG` 文件名 — **仅对内**。

#### 4.6.1 根路径 `/` · 演示首页（静态 · 无需授权）

**演示目的（10～20 秒）**：你是谁、投什么向、下面四入口是什么。

**展示内容（示例文案 · W1/W2 可微调，结构不可删）**

| 区块 | 内容 | 展示形式 |
| --- | --- | --- |
| 身份 | 刘新宁 · 11 年软件开发 · 北京 · AI Coding / Agent 应用 | 标题 + 1 行 |
| 定位 | 腾讯云架构师同盟；连载《AI 编程可闭环协作》卷一～五；个人 **RAG + 对话** 全栈演示 | 2～3 行 prose |
| 叙事 | **AI 主导编码、人负责架构与验收**（Next.js 由 Agent 实现，本人验收 SSE/RAG 契约） | 1 段短句 |
| 入口卡片 ×4 | 见下表 | 与 `SiteNav` **同目标** 的四卡 grid |
| 证据 | 链 `/evidence`「方法论证据卡（1 页）」 | 文本链，非第五 NAV |
| 对话说明 | 「RAG 对话需 **邮件 231127227@qq.com** 申请临时秘钥」 | 卡片角标或页脚提示 |
| 外链 | GitHub 连载 · `[DEMO_URL]` 占位 · 简历 PDF（6/6 后） | 小字链接 |

**四卡（与 NAV 对齐 · 均需无秘钥可点进静态页）**

| 卡片 | href | 卡片说明（hint） |
| --- | --- | --- |
| 简历 | `/resume` | 在线简历 · 与 RAG 同源 |
| 方法论 | `/methodology` | 连载卷一～五 |
| 证据 | `/evidence` | 1 页证据 · 五问参考 |
| 对话 | `/unified-chat` | RAG + 流式 · 需秘钥发消息 |

**禁止**：Blog / Learning / Tasks 卡片；「Ink」字样；把根页做成跳转到 `/methodology` 的 redirect。

#### 4.6.2 `/resume` · 简历（静态 · 无需授权）

| 项 | 规格 |
| --- | --- |
| 数据源 | `content/resume/cv-online.md`（与 docs 仓 6/6 同步） |
| 展示 | **Markdown 渲染**（prose）；不用 PDF iframe |
| 页头 | 「在线简历」+ 一句「与下方对话 RAG 语料同源」 |
| 可选 | 折叠「技术面详述」区块 |
| 外链 | Boss/猎聘说明、GitHub 连载 |

#### 4.6.3 `/methodology` · 方法论（静态 · 无需授权）

| 项 | 规格 |
| --- | --- |
| 索引页 | 卷一～五列表：标题 · 卷内版 · **已发表** 标签 · 链 `[...slug]` |
| 单篇 | `content/methodology/*.md` → Markdown 阅读（与 blog 路由 **分离**） |
| 页顶 | 系列 **v1.3.0** 一句 + 链 GitHub 公众仓 |
| 内链 | 置顶或侧边 **→ /evidence** 证据卡 |
| 禁止 | 测评稿 / OUTLINE / harness 路径 |

**卷目录示例（release 后文件名以 sync 为准）**

| 卷 | 列表标题示例 |
| --- | --- |
| 卷一 | 怎样才算「做完」 |
| 卷二 | 技术图谱 |
| 卷三 | Harness 与 SDD |
| 卷四 | 闭环交付与经验沉淀 |
| 卷五 | 存量项目怎么落地 |

#### 4.6.4 `/evidence` · 证据卡（静态 · 无需授权 · 不进 NAV）

| 项 | 规格 |
| --- | --- |
| 数据源 | `content/evidence/methodology-card.md` |
| 结构 | 问题 → Harness×图谱 → 数字 → **边界**（小样本） |
| 附加 | **五问 chip 文案列表**（Q1～Q5 逐字，供面试官扫一眼） |
| 入口 | 首页、方法论页、Unified 页脚链入 |

#### 4.6.5 `/unified-chat` · 对话（页壳公开 · 发消息需秘钥）

| 态 | 展示什么 | 用什么 |
| --- | --- | --- |
| **无 session** | 页标题 + **邮件申请说明** + unlock 输入框 + **五问 chip 仅展示不可发送** 或 chip 点击提示先 unlock | 静态 + 表单 |
| **visitor** | SSE 流式回答 + **sources** + Timeline **隐藏** + Text2SQL **保留** | 现有 Unified 裁剪版 |
| **visitor-admin** | 上 + Timeline / ExecutionTrace；`?debug=1` 可开 | §4.4 |

**录屏推荐（3～5 min · 写入 W6 checklist）**

```text
0:00  /           作者首页 + 四卡
0:30  /methodology 卷目录 + /evidence 扫一眼
1:00  /resume     「个人 RAG 项目」叙事口述
1:30  口播秘钥    （录屏可剪）
2:00  /unified-chat  Q1 + sources
3:00  Q5 边界句
3:30  （可选 visitor-admin Timeline）
```

#### 4.6.6 公开区 vs 门控区（验收用）

| 路由 | 无秘钥时 HTTP | 无秘钥时 UX |
| --- | --- | --- |
| `/` | 200 | 完整静态首页 |
| `/resume` | 200 | 完整 md |
| `/methodology` | 200 | 完整目录/文章 |
| `/evidence` | 200 | 完整证据卡 |
| `/unified-chat` | 200 | **页可见**；输入/send **禁用或仅 unlock** |

### 4.3 访客秘钥与 `/api/auth/unlock` 扩展

**已拍板角色**

| role | TTL | 能力边界（SPEC 级） |
| --- | --- | --- |
| `visitor` | 72h | Unified Chat 对话 + RAG/Text2SQL；**无** RouterDebug / LLM prompt 全量 / Timeline 导出等 debug |
| `visitor-admin` | 24h | 在 visitor 基础上开放 **Timeline + ExecutionTrace**；且允许 **`?debug=1`** 展示 LLM Prompt / SSE done 等（**仍隐藏** Router Debug 面板与开关，见 §4.4） |

**秘钥性质（已拍板 · Prompt 00 轮 3 · Q7）**

- Portfolio 访客秘钥 **不是** ChatBI 库表 `chatbi_access_tokens` 的 **数据库明文 token**；与招聘邮件发放的「演示口令」为 **本机生成的独立 secret**。
- **生成策略**：仅负责人在 **本机** 生成；**已拍板（R4-4=A）** 须提供 **`tools/gen-portfolio-secrets.sh`**（封装 `openssl` 等）；写入 Vercel/平台 **Secrets**；**禁止** 提交 Git、禁止写入 SPEC/task/录屏。
- unlock 校验：BFF 将用户输入与 env 中 secret **常量时间比对** 后签发 **HttpOnly Cookie**（Cookie 内 **禁止** 存放秘钥明文）。

**环境配置面（已拍板 · 双变量 · 非 JSON）**

```text
PORTFOLIO_VISITOR_SECRET=<本机生成>           # role=visitor · TTL 72h
PORTFOLIO_VISITOR_ADMIN_SECRET=<本机生成>     # role=visitor-admin · TTL 24h
```

**不采用** `PORTFOLIO_UNLOCK_KEYS` JSON 映射表。

**`tools/gen-portfolio-secrets.sh`（已拍板 · R4-4=A · W3 必交付）**

| 项 | 说明 |
| --- | --- |
| **用途** | 在 **本机** 生成 `visitor` / `visitor-admin` 两枚 **随机 secret**（推荐 `openssl rand -hex 32`），**stdout** 输出变量名与值，并打印「粘贴到 Vercel Environment Variables」指引。 |
| **禁止** | 连接数据库；导出 ChatBI token；默认 **不写** 仓库内文件（若写则仅 `.gitignore` 覆盖的本地路径，且脚本须 `--force` 显式开启）。 |
| **验收（SPEC 级）** | 脚本可执行、幂等可重复运行（每次生成新值并提示旧值作废）；`PROJECT_CONFIG` §C 或 W3 README 含一行调用示例。 |

**API 行为（相对现状 `unlock/route.ts` 的扩展）**

| 端点 | 扩展 |
| --- | --- |
| `POST /api/auth/unlock` | 在现有 `token` / `secret` 分支 **之前或之后** 匹配 portfolio 秘钥；成功 Set-Cookie 带 **role + exp**（新 Cookie 名或签名 payload，**禁止** 明文秘钥入 Cookie） |
| `GET /api/auth/session` | 返回 `{ ok, role, admin?, configured, expiresAt? }`；`admin` 可与 legacy 管理员 Cookie 兼容 |
| 无 session | **仅** `/unified-chat` 发消息区展示申请说明 + 邮箱 + unlock；**公开静态页不得** 被全局 gate 替换成「请先解锁」 |

**与 ChatBI token 路径关系（已拍板 · Prompt 00 轮 2 · Q4=B）**

- **招聘访客默认 UX**：邮件申请 + `POST /api/auth/unlock` portfolio 秘钥；Unified **主解锁区** 不展示 ChatBI DB 明文语义。
- **维护后门（已拍板 · Q9=B）**：保留 ChatBI 明文 token 与 Ink admin 校验路径，供本机/预发排障；Unified **ChatBI DB 明文解锁 UI 仅当** `NEXT_PUBLIC_SITE_MODE=development` **展示**；**`portfolio` 模式下完全不展示**（访客仅见邮件申请 + portfolio unlock）。
- **优先级（建议实现序）**：portfolio 秘钥 Cookie → Ink admin Cookie → ChatBI 站点 Cookie（与现 `unlock/route.ts` 扩展并存）。

### 4.4 Unified Chat 展示层裁剪

| 项 | portfolio + `visitor` | portfolio + `visitor-admin` | 备注 |
| --- | --- | --- | --- |
| Text2SQL / `prefer` auto·rag·text2sql | **保留** | **保留** | 已拍板 |
| `UnifiedChatRouterDebugPanel` + Router Debug 开关 | **隐藏** | **隐藏** | 两档访客均不展示 Router Debug |
| Timeline 面板 + ExecutionTrace 复制 | **隐藏** | **可见** | 与投递计划「timeline / 部分 debug」一致 |
| `?debug=1` · LLM Prompt · SSE done 折叠区 | **忽略 URL**（强制关） | **尊重 URL**（可开） | Prompt 00 轮 2 · Q5=B |
| 解锁文案（主路径） | 邮件 `231127227@qq.com` + portfolio unlock 表单 | 同左 | 不暗示站点公开 |
| ChatBI DB 明文解锁 UI | **不展示**（`portfolio`） | **不展示** | 仅 `development` 见 §4.3 · Q9=B |
| 推荐 chip | **五问**（§6.4 逐字） | 同左 | 替换现有 3 条通用 chip |

**不涉及**：后端 intent router、SSE 契约变更（除非后端 SPEC 要求新 header）。

### 4.5 `tools/sync-portfolio-content.sh` 与 content 目录约定

**目录（本仓 `content/`）**

```text
content/
├── methodology/     # 方法论正文（sync 自 closed-loop-articles release）
├── resume/          # 简历 MD（sync 自 docs 仓或本地真值）
├── evidence/        # 证据卡
├── diary/           # 保留；portfolio 导航不指向
├── learning/        # 保留
└── tasks/           # 保留；不参与 portfolio 公开展示
```

**脚本职责（SPEC 级）**

1. 入参：可选 `--articles-root`（默认 sibling `ai-coding-closed-loop-articles`）、`--docs-root`（简历源）。
2. 将 **卷一～五 release 后** 文章复制/链接到 `content/methodology/`（具体 release 路径 **待确认**）。
3. 复制简历与证据到 `content/resume/`、`content/evidence/`。
4. **幂等**、可重复执行；输出同步文件清单（stdout）。
5. 文档化：执行后须 **`POST /api/py/admin/sync`**（BFF `app/api/admin/sync` 或直连 Python）由人/脚本触发 ingest；鉴权见 [`SPEC-portfolio_admin_sync_auth_v1_zh.md`](./SPEC-portfolio_admin_sync_auth_v1_zh.md)（**`SYNC_ADMIN_SECRET` / `ADMIN_TOKEN`**，**禁止** `NEXT_PUBLIC_ADMIN_SECRET`）。

**禁止**：脚本内嵌 API Key；秘钥仅 env。

---

## §5 内容与 RAG 同源

| category（ingest 首段路径） | 目录 | 展示 | ingest |
| --- | --- | --- | --- |
| `methodology` | `content/methodology/` | `/methodology` | `ingest_pipeline._walk_markdown` → metadata.category |
| `resume` | `content/resume/` | `/resume` | 同上 |
| `evidence` | `content/evidence/` | **`/evidence`**（独立页）+ chip | 同上 |

**后端约定（只读对照 `ingest_pipeline.py`）**

- `CONTENT_ROOT` 未设时后端用自有 `content/`；本地/CI 演示应设 **`CONTENT_ROOT=<ai-ink-brain>/content`**。
- category = `relative_path.split("/")[0]`，与 blog `diary` 等 **命名空间隔离**。

**五问与检索**

- 演示问题须命中上述 category 内 chunk；chip 文案与 [`投递冲刺_20260609_v1_zh.md`](./投递冲刺_20260609_v1_zh.md) §2 **提问列逐字一致**（§6.4）。
- ingest 质量、hybrid 参数归 **后端 SPEC**；前端保证 **同源路径 + sync 触发说明**。

---

## §6 验收标准（SPEC 级 · 可勾选）

### 6.1 构建与模式

- [ ] `NEXT_PUBLIC_SITE_MODE=portfolio` 时 `pnpm run build` **通过**（与 `AGENTS.md` §8 一致）。
- [ ] `development`（默认）下 build 通过且导航 **与现网行为一致**（回归）。

### 6.2 Portfolio 四链 + 公开区（6/9 前）

- [ ] **`/` 为根演示首页**（非二级路由）；无秘钥 **200** 且见 §4.6.1 四卡 + 作者文案。
- [ ] **无 Ink 品牌**：Nav / 根页 / footer / metadata 符合 §4.6.0。
- [ ] `/resume` · `/methodology` · `/evidence` **无秘钥** 可完整阅读 md。
- [ ] 根页 **无** Blog/Learning/Tasks 卡片。
- [ ] `/unified-chat` 导航常显；无 session 时 **页壳 200** + 邮件文案 + unlock；解锁后可发消息。

### 6.3 鉴权

- [ ] `visitor` 秘钥解锁后会话 **72h** 内有效（过期后需重新 unlock）。
- [ ] `visitor-admin` **24h**；debug/timeline 可见性符合 §4.4 冻结表。
- [ ] 无 session **不** 出现「站点公开」暗示；邮箱 `231127227@qq.com` 可见。
- [ ] `tools/gen-portfolio-secrets.sh` 存在；本机执行后 stdout 含 `PORTFOLIO_VISITOR_SECRET` / `PORTFOLIO_VISITOR_ADMIN_SECRET` 指引（**禁止** 将输出提交 Git）。

### 6.4 五问 chip 文案就绪

> **权威（已拍板）**：[`content/tasks/specs/投递冲刺_20260609_v1_zh.md`](./投递冲刺_20260609_v1_zh.md) **§2**（Prompt 00 轮 2 · Q1=A）。下表 **chip 展示文案** 与计划 **提问列逐字一致**。

| ID | chip 展示文案（逐字） | 期望命中 `content/` | 合格回答要点（验收参照） |
| --- | --- | --- | --- |
| Q1 | 《AI 编程可闭环协作》**卷三**讲什么？Harness 和签收是什么？ | `methodology/vol3_*` | 任务单 + 书面签收 + 合并前 CI；sources 含 vol3 |
| Q2 | **RAG 混合检索**怎么做的？ | `resume/*` 或项目段 | 向量 + 混合检索 + rerank 至少两项 |
| Q3 | **冷/温/热** 和 **架构三层** 区别？ | **`evidence/*` only**（sources 主 category **仅 `evidence`**；`methodology/vol3` **不计** Q3 通过 · R4-1=A · 对齐后端 SPEC） | 记忆分层 ≠ 架构分层 |
| Q4 | **11 年经历**里 AI Coding 相关成果？ | `resume/*` | 百果园 Cursor + **个人 RAG/ChatBI 项目** + 连载；不虚构 |
| Q5 | 按需读图相对整图灌入 **token/效果**？**边界**？ | `evidence/*` | 约 1/9 或「约十分之一」+ **小样本、非全行业** |

**全绿判定（联调/W6）**：5/5 能答；sources **≥4/5** 指向正确 category；单问重试 **≤3** 次（见投递计划 §2）。

- [ ] Unified Chat 展示 **5 条** chip，文案与上表 **逐字一致**（人审）。
- [ ] `/evidence` 页可展示与 Q3/Q5 相关的证据卡锚点（W2 可选增强）。
- [ ] 五问 **端到端答通** 依赖后端 sync + ingest（**不在前端 SPEC 本回合验收**，联调 task 勾选）。

### 6.5 内容与脚本

- [ ] `tools/sync-portfolio-content.sh` 存在且文档化用法；执行后三目录有预期文件。
- [ ] `CONTENT_ROOT` 指向本仓 `content/` 时，后端 sync 可 ingest 三 category；`methodology/`、`resume/`、`evidence/` **各 ≥1** `.md`（与后端 SPEC、投递计划 §3.2 一致）。
- [ ] 联调时 `filesScanned=0` 视为 **硬 FAIL**（对齐后端 SPEC §4.2.3 · 不以前端单独放宽）。

### 6.6 Unified Chat 裁剪

- [ ] portfolio + `visitor`：**无** Router Debug；**无** Timeline/ExecutionTrace；**忽略** `?debug=1`。
- [ ] portfolio + `visitor-admin`：Timeline + ExecutionTrace **可见**；`?debug=1` 可开 LLM Prompt / SSE done；**仍无** Router Debug。
- [ ] Text2SQL 路径仍可通过自然语言或 `prefer` 触发（**待确认** 默认 `prefer` 值，建议维持 `auto`）。

### 6.7 五问执行环境（对齐后端 SPEC · 已拍板）

- [ ] 五问预检在 **同一 Vercel 项目** 的 **Preview Deployment** 或生产 URL 执行（R4-3=A）：Preview 须配置 `NEXT_PUBLIC_SITE_MODE=portfolio` 与 `PORTFOLIO_VISITOR_*`（与生产 **同** Supabase 项目、**同** `EMBEDDING_DIM`、**同** `CONTENT_ROOT` 挂载语义）。
- [ ] 简历 `[DEMO_URL]` 与演示预检 **同一项目** 的正式域或 Preview 链接（占位可后填，但 **不** 另起第二套前后端）。

### 6.8 里程碑（非代码验收 · 日程）

- [ ] **2026-06-06**：简历与站点叙事同步；`[DEMO_URL]` 可仍占位。
- [ ] **2026-06-09 上午**：四屏 + 五问演示完成（含后端配合）。

---

## §7 工作包拆分建议（→ 未来 task slug · 本回合不创建 task）

| 包 | 建议 slug | 范围摘要 |
| --- | --- | --- |
| **W1** | `task_portfolio_site_mode_nav_v1` | `site-mode` · Nav 四链 · **根页 `/` 演示首页组件** · §4.6.0 去 Ink 品牌 · metadata |
| **W2** | `task_portfolio_content_pages_v1` | `/resume` `/methodology` `/evidence` · `/about`→308 · **§4.6.2–4.6.4 内容结构** |
| **W3** | `task_portfolio_visitor_auth_v1` | unlock/session Cookie · role TTL · **`tools/gen-portfolio-secrets.sh`（必交）** · `PROJECT_CONFIG` 用法 · 无 session UX |
| **W4** | `task_portfolio_unified_chat_ui_v1` | 裁剪 debug · 五问 chip · 解锁文案 |
| **W5** | `task_portfolio_content_sync_script_v1` | `tools/sync-portfolio-content.sh` · README 用法 |
| **W6** | `task_portfolio_e2e_demo_qa_v1` | 与后端 sync 联调五问 · 演示 checklist（可 `test_strategy: recommended`） |

**建议实施顺序**：W1 → W5（内容可先落盘）→ W2 → W3 → W4 → W6。

---

## §8 风险与残余项（冻结后）

1. **Vercel Secrets 轮换**：`PORTFOLIO_VISITOR_*` 泄露时须本机重生成并更新平台 env；**禁止** 写进 Git（见 §4.3）。
2. **Nav 主标题**「刘新宁」vs「Cyning · 刘新宁」：W1 定稿（§4.6.0）。
3. **ingest / 五问质量**：以配对后端 **`active`** SPEC + RUNBOOK 为准；前端 W6 仅保证同源路径与 chip 文案。
4. **实现期发现 SPEC 缺口**：30 帽 **停工** 回 20/人，**禁止** 在 PR 内偷偷改 SPEC。

**Prompt 00 轮 4 已对齐后端 `active` SPEC**：Q3 evidence-only · Preview/生产同项目 · `freeze_id` 同日 · 交叉项已写入 §6.4–§6.7。

---

## §9 关联引用

| 引用 | 路径 |
| --- | --- |
| 前端 AGENTS | `AGENTS.md` |
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 导航 / 首页 | `app/_components/site-nav.tsx` · `app/_components/home-modules.tsx` |
| Session hook | `lib/hooks/useAdminSession.ts` |
| Unlock / Session API | `app/api/auth/unlock/route.ts` · `app/api/auth/session/route.ts` |
| Unified Chat | `components/unified-chat/UnifiedChatPageClient.tsx` · `UnifiedChatRouterDebugPanel.tsx` |
| 内容扫描 | `lib/content/mdx-posts.ts` |
| 路由图谱 | `docs/_tech_graph/10_flow_route.md` |
| 后端 CONTENT_ROOT | `ai-ink-brain-api-python/api/ingest_pipeline.py` |
| 后端 Portfolio RAG SPEC（**active** · 交叉真值） | `ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` |
| 20 规格短评（下一棒） | 工作区 `docs/harness/prompts/hats/20-review-spec-task.md` |
| docs 投递计划（五问 §2 真值） | [`content/tasks/specs/投递冲刺_20260609_v1_zh.md`](./投递冲刺_20260609_v1_zh.md) |
| SDD 多轮精神 | `ai-ink-brain-api-python/docs/spec/SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md` |
| 参考 SPEC 结构 | `content/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md` |
| **Prompt 00（细化本 SPEC）** | `content/tasks/specs/PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md` |
| Harness test_strategy | 工作区 `docs/harness/HARNESS_V2_PLAN.md` §5 |

**脚注 · 跨仓非范围依赖**

- **双能力 handoff（后端 P1-B）**：6/9 前不阻塞前端四屏；五问质量依赖后端 ingest/RAG，见后端 SPEC。

---

## 修订记录

| 日期 | 版本 | 说明 |
| --- | --- | --- |
| 2026-06-01 | v0.1 draft | Harness 10 需求帽：轮 0/1 合并 SPEC；基于本仓代码扫描 |
| 2026-06-01 | v0.2 draft | Prompt 00 轮 2：人答复 Q1～Q5 → §4/§6.4/§8 已拍板；五问逐字自投递计划 §2 |
| 2026-06-01 | v0.3 draft | Prompt 00 轮 3：Q6～Q10 → `freeze_id` 同源、本机秘钥、Q8/Q9 已拍板 |
| 2026-06-01 | **v1.0 active** | Prompt 00 轮 4：R4-1～R4-3、R4-5 已拍板；对齐后端 `active` SPEC；`PORTFOLIO-RAG-DEMO@2026-06-01` |
| 2026-06-01 | v1.0.1 active | 人补拍板 R4-4=A：`gen-portfolio-secrets.sh` 由 deferred 改为 W3 **必交付** |
| 2026-06-01 | v1.1 active | §4.6 演示页示例；**`/`=根演示首页**；公开区零鉴权；**去 Ink 化**作者定制 |

---

## SPEC 待确认清单（Prompt 00 已收口）

| # | 决策点 | 状态 |
| --- | --- | --- |
| 1～9 | 轮 2～3 决策点 | **resolved** / **deferred**（#8 → W1） |
| 10 | 冻结时机 | **resolved**（R4-2=A） |
| R4-1～R4-3 | 后端交叉 | **resolved** |
| R4-4 | `gen-portfolio-secrets.sh` | **resolved**（R4-4=A · W3 必交付 · §4.3 · §6.3） |
| R4-5 | Harness 路径 | **resolved** · **20 → 10** |

**无 `pending`**。30 帽须在 task 引用 **`freeze_id`** 后开工。
