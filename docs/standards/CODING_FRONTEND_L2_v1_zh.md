# 编码规范 L2 — Ink 前端（TypeScript / Next.js · v1）

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` — P2 交付物 |
| **版本** | v1.0 |
| **日期** | 2026-06-09 |
| **栈** | Next **16** App Router · React **19** · TypeScript **strict** · pnpm · Vitest |
| **L1** | 工作区 [`docs/standards/CODING_BASELINE_L1_v1_zh.md`](../../../docs/standards/CODING_BASELINE_L1_v1_zh.md) |
| **配置真值** | [`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`](../meta/PROJECT_CONFIG_AI_INK_BRAIN.md) |
| **图谱** | [`docs/_tech_graph/`](../../docs/_tech_graph/) |

---

## 1. 适用范围

| 路径 | 职责 |
| --- | --- |
| `app/` | 页面、布局、Route Handlers（BFF） |
| `components/` | UI 与展示组件 |
| `lib/` | 领域逻辑、客户端/服务端工具、转发 Python |
| `content/` | MDX/博客内容（非 TS 业务逻辑；改结构须 task 明示） |

**不适用范围**：`node_modules/`、`.next/`、纯 `content/diary` 归档（见 `AGENTS.md` Docs Diary）。

---

## 2. 条文（F-01～F-14）

### F-01 模块边界（遵循 B-01）

| 规则 | 说明 |
| --- | --- |
| Route Handler | **薄**：鉴权、解析请求、调 `lib/`、返回响应；**禁止**在 `route.ts` 堆 >80 行业务 |
| 组件 | 展示组件无 fetch；容器组件可调 hook/数据层 |
| `lib/` | 按领域分目录（`unified-chat/`、`py-service-proxy.ts` 等）；禁止 `lib/` 单文件承担跨域编排 |

软上限与 L1 一致：函数 ~60 行、文件 ~400 行触发审查。

### F-02 早返回与条件（遵循 B-02）

- Route Handler：`if (!authorized) return NextResponse.json(...)` 置于顶部。
- 组件：早 return 空态/错误态；避免 JSX 内三层以上嵌套 ternary。
- **禁止** 用 `&&` 链叠 4 层以上条件渲染；抽子组件或 `switch`。

### F-03 环境变量（遵循 B-03）

| 类型 | 规则 |
| --- | --- |
| 服务端密钥 | `SYNC_ADMIN_SECRET`、`SUPABASE_SERVICE_*` 等 **仅** 服务端模块读取；**禁止** `NEXT_PUBLIC_*` 暴露密钥 |
| 公共配置 | `NEXT_PUBLIC_*` 仅放可公开信息；见 `PROJECT_CONFIG` §C |
| API 基址 | `PY_API_URL` **唯一真值**；通过 `lib/py-service-proxy.ts` / `next.config.mjs` rewrites；**禁止** 业务代码硬编码 `http://127.0.0.1:8000` |
| 站点模式 | `NEXT_PUBLIC_SITE_MODE` 经 `lib/site-mode.ts`；禁止组件内散落字符串比较 |

### F-04 命名与导入（遵循 B-04）

- 组件：`PascalCase`；hook：`useXxx`；工具函数：`camelCase`。
- 路径别名：统一 `@/`（`tsconfig` paths）；禁止深层相对路径 `../../../` 穿越 3 层以上（抽 `@/lib/...`）。
- 与 ChatBI / RAG / Portfolio 术语对齐 `_tech_graph` 与后端契约命名。

### F-05 BFF 错误与日志（遵循 B-05、B-12）

- 转发 Python：使用 `lib/py-service-proxy.ts` 等既有封装；保留 **status + 结构化 body** 转发或映射。
- 客户端：**禁止** 向 UI 暴露堆栈；用户可见错误用统一 toast/文案组件。
- 服务端 `console.error` 须带 **可区分上下文**（route 名、request 片段 id）；**禁止** 打印完整 token/Bearer。

### F-06 分支与策略（遵循 B-06）

- 多 `site-mode` / `access_level` / `intent` 分支：优先 **映射表**（见 `portfolio-chat-tier.ts` 风格）而非 elongate if-else。
- 新 chip / 问法列表：扩展常量表或 API 驱动，避免在组件 COPY 第三份数组。

### F-07 最小 diff（遵循 B-07）

- 禁止全仓 `prettier` 式重格式化；禁止升级无关 `dependencies`（除非 task 明示）。
- 改 `app/api/py/*` 时对照邻域 route 与 `py-service-proxy` 模式。

### F-08 TypeScript strict（遵循 B-08）

| 规则 | 落地 |
| --- | --- |
| `strict: true` | `tsconfig.json` — **禁止** 在 PR 中关闭 |
| 禁止 `any` | 新代码 **禁止** `: any` / `as any`；边界用 `unknown` + 窄化 |
| 类型守卫 | 优先 `typeof` / `in` / Zod（若 task 引入）优于断言 |
| 导出边界 | `lib/` 对外导出须有显式类型；Route Handler 响应 shape 与后端对齐 |

**ESLint**：`eslint-config-next/typescript` + **`@typescript-eslint/no-explicit-any: error`**（`eslint.config.mjs` · P4 · 2026-06-09）。

### F-09 Server / Client 组件（遵循 B-01、REF-NEXT-DATA）

| 规则 | 说明 |
| --- | --- |
| 默认 Server Component | `app/` 页面无交互则不加 `'use client'` |
| Client 最小化 | 仅交互叶子加 `'use client'`；禁止整页 Client 仅为用一个 hook |
| 数据获取 | Server：async 组件 / Route Handler；Client：不直接持 service role |
| **禁止** | 在 Client 组件读 `process.env` 非 `NEXT_PUBLIC_*` |

### F-10 Hooks 纪律（遵循 B-02、REF-REACT-HOOKS）

- Hook 仅顶层调用；`useEffect` 依赖数组完整。
- **禁止** 链式 `useEffect` 互相触发；复杂流用 **reducer** 或有限状态机（Unified Chat 等）。
- 自定义 hook 放 `lib/` 或 `components/*/hooks/`，单职责。

### F-11 重复与共享（遵循 B-09）

- 相同 fetch/转发逻辑 ≥2 处 → 抽 `lib/` 函数。
- UI 重复 ≥3 处 → 抽组件或 `components/ui/`（shadcn 体系内扩展）。

### F-12 测试（遵循 B-10）

| 层级 | 工具 | 范围 |
| --- | --- | --- |
| 单元 | Vitest | `lib/` 纯函数、mapper、tier 逻辑 |
| Hook | Vitest + `@testing-library/react`（按需） | 复杂 hook |
| Route | 优先测 `lib/` 层；E2E 仅 task 明示关键路径 |

`test_strategy: required` → 先红测试再实现；命令 `pnpm test`。

### F-13 安全（遵循 B-11）

- Admin/sync：`require-sync-admin-access` / `SYNC_ADMIN_SECRET` 路径；禁止绕过鉴权 helper。
- 用户输入进 MDX/HTML：走 `rehype-sanitize` 等既有管线；禁止 `dangerouslySetInnerHTML` 裸插用户串。
- **禁止** 将 `blog_admin_token` 等写入日志或 commit。

### F-14 CI 与合并前（遵循 L1 §4、B-10）

合并前 **在本仓根** 依次：

```bash
pnpm lint
pnpm test
pnpm build
```

与 `.github/workflows/quality.yml` 及根 `AGENTS.md` §8 一致。图谱变更时另跑 `pnpm tech-graph:*`（见 `PROJECT_CONFIG` §D）。

---

## 3. 前端反模式（节选）

| ID | 反模式 | 改法 | 条文 |
| --- | --- | --- | --- |
| AF-01 | Route Handler 内直接 `fetch(PY_API_URL + '/...')` | `lib/py-service-proxy` | F-03, F-05 |
| AF-02 | 页面 `'use client'` + 顶部大段 `useEffect` 拉数 | Server 组件或 Route Handler | F-09, F-10 |
| AF-03 | props 下钻 5 层 | context / 组合组件 / hook | F-01 |
| AF-04 | `eslint-disable` 整块文件 | 修代码或 task 级例外 | F-08, B-08 |
| AF-05 | `console.log` 代替错误处理 | 结构化返回 + F-05 | F-05 |

全表规划：工作区 `ANTI_PATTERNS_v1_zh.md`（P2 工作区 · 含 notebook 场景）。

---

## 4. PR 自检（前端增量 · 叠加 L1 §4）

在 [`CODING_BASELINE_L1_v1_zh.md`](../../../docs/standards/CODING_BASELINE_L1_v1_zh.md) §4 基础上追加：

- [ ] 新/改 Route Handler 经既有 proxy/鉴权（F-03, F-05, F-13）
- [ ] 无新增 `any`；`pnpm lint` 绿（F-08）
- [ ] Client/Server 边界合理（F-09）
- [ ] 无硬编码 `PY_API_URL` / 密钥 env（F-03, F-13）

`code_quality_bar: strict` 时 22 审查须逐项引用上表 + L1 §4。

---

## 5. 工具与 REF 映射

| REF | 本仓落地 |
| --- | --- |
| REF-GOOG-TS | `tsconfig.json` strict；`eslint-config-next/typescript` |
| REF-REACT-HOOKS | `eslint-config-next/core-web-vitals`；F-10 |
| REF-NEXT-DATA | F-09；`PROJECT_CONFIG` §C |
| REF-OWASP-API | F-13；BFF 鉴权与 sanitize |
| REF-GOOG-CL | PR Test plan + `pnpm test` |

---

## 6. 与 L3 的关系（P3 ✅）

- Cursor 规则：[``.cursor/rules/07-coding-standards-l2.mdc`](../../.cursor/rules/07-coding-standards-l2.mdc)（`globs: **/*.{ts,tsx}` · 短链至本文件）。
- `AGENTS.md` → `docs/standards/README.md`。
- **禁止** 在 rules 内复制 F-01～F-14 全文。

---

## 7. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-06-09 | P2 初稿：F-01～F-14 + AF 节选 + PR 自检 |
| v1.1 | 2026-06-09 | P3 `07-coding-standards-l2.mdc`；P4 ESLint `no-explicit-any` |
