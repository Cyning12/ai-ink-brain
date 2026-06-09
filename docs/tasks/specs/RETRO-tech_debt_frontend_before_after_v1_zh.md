> **落盘位置**：自 `docs/diary/` 复制至 `docs/tasks/specs/`（diary 树 gitignore · 长期引用用本路径）

# 前端 L2 tech-debt 规整前后对比（M01–M06 + content-md-html）

> **日期**：2026-06-09  
> **基线 commit**：`1e87434^`（规整前）→ `19c9bc7` / `e58f9f2`（规整后 main）  
> **PR**：[#60 production](https://github.com/Cyning12/ai-ink-brain/pull/60) · [#61 main merge](https://github.com/Cyning12/ai-ink-brain/pull/61) · [#59 content](https://github.com/Cyning12/ai-ink-brain/pull/59) · [#62 L2 规范](https://github.com/Cyning12/ai-ink-brain/pull/62)  
> **性质**：一次性验收 / 复盘快照；实现真值以 `docs/_tech_graph/`、`lib/py-service-proxy.ts`、`docs/standards/CODING_FRONTEND_L2_v1_zh.md` 为准。

---

## 总览

| 模块 | 核心动作 | 规整前痛点 | 规整后收益 |
|------|----------|------------|------------|
| **M01** | `lib/py-service-proxy` 单点 | 8+ 处散落 `PY_API_URL` + `fetch` + 错误文案 | 统一 URL / Header / 503 语义；RAG 特例独立 |
| **M02** | `app/api/py/**` BFF 薄化 | 单 route 70–113 行重复转发 | 多数 route ≤30 行，只调 proxy helper |
| **M03** | Unified Chat 栈拆分 | `UnifiedChatPageClient` 972 行巨石 | Hook + 子组件；页面 ~840 行 |
| **M04** | Chat / RAG 客户端 | Bearer 头 inline 重复 | `buildChatAuthHeaders` 共享 |
| **M05** | Auth / env | env 判断、上游校验各写一套 | `isPyApiUrlConfigured()` + `forwardToPyApi` |
| **M06** | 杂项组件 | 纯函数嵌在 `.tsx` 内 | `chain-event-card-utils.ts` 可测纯函数 |
| **content** | Markdown HTML | GFM 表格/引用渲染受限 | rehype-raw/sanitize + 批量 HTML 语义化 |

---

## M01 · py-service-proxy 单点

### 1) PY_API_URL 解析 — 从散落 env 到唯一入口

**规整前** — 每个 BFF route 各自解析：

```typescript
const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const url = `${pyBase}/api/py/chat`;
```

**规整后** — `lib/py-service-proxy.ts` 单点（F-03）：

```typescript
export function getPyApiBaseUrl(): string {
  return (process.env.PY_API_URL ?? DEFAULT_PY_API_URL).replace(/\/$/, "");
}

export function buildPyApiUrl(pathAndQuery: string): string {
  const base = getPyApiBaseUrl();
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  return `${base}${path}`;
}
```

### 2) ChatBI 鉴权 Header — 从 copy-paste 到 `buildChatbiAuthHeaders`

**规整前** — `unified/chat/stream/route.ts` 内联 15 行：

```typescript
const auth = request.headers.get("authorization");
const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";
if (chatbiAccess) {
  const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
  if (plain) upstreamHeaders.Authorization = `Bearer ${plain}`;
  else if (auth?.trim()) upstreamHeaders.Authorization = auth.trim();
} else if (auth?.trim()) {
  upstreamHeaders.Authorization = auth.trim();
}
```

**规整后** — 一行构建 + 透传：

```typescript
const headers = buildChatbiAuthHeaders(request, contentType);
headers.Accept = "text/event-stream";
return forwardToPyApiAsStreamResponse("/api/py/unified/chat/stream", { method: "POST", headers, body }, …);
```

### 3) RAG chat 特例 — 保留 x-sources 与 502 语义

**规整前** — 113 行全写在 `app/api/py/chat/route.ts`（含 UND_ERR_HEADERS_OVERFLOW 长文案）。

**规整后** — route 14 行；特例逻辑进 `lib/server/forward-py-rag-chat.ts`：

```typescript
// app/api/py/chat/route.ts
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;
  return forwardPyRagChat(request);
}
```

```typescript
// lib/server/forward-py-rag-chat.ts（节选）
const xSources = upstream.headers.get("x-sources");
return new Response(upstream.body, {
  status: upstream.status,
  headers: {
    "Content-Type": upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
    ...(xSources ? { "x-sources": xSources } : null),
  },
});
```

**单测** — `lib/py-service-proxy.test.ts` 覆盖 URL 解析、Header 构建、headers overflow 检测（64 tests on main）。

---

## M02 · BFF Route 薄化

### 1) RAG chat — 113 行 → 14 行

见 M01 §3。

### 2) chat/history — 71 行 → 22 行

**规整前**：

```typescript
export async function GET(request: Request): Promise<Response> {
  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const url = `${pyBase}/api/py/chat/history${qs ? `?${qs}` : ""}`;
  // … 20+ 行 header 拼装 + fetch + catch 错误文案 …
}
```

**规整后**：

```typescript
export async function GET(request: Request): Promise<Response> {
  const qs = extractRequestQueryString(request);
  return forwardToPyApiAsTextResponse(
    `/api/py/chat/history${qs}`,
    { method: "GET", headers: buildChatbiGetPassthroughHeaders(request) },
    { serviceLabel: "RAG history" },
  );
}
```

### 3) unified/chat/stream — SSE 透传标准化

**规整前**：56 行（env + header + fetch + 手动设置 Cache-Control）。

**规整后**：28 行，流式响应由 `forwardToPyApiAsStreamResponse` 统一设置 `Content-Type` / `Cache-Control` / `Connection`。

---

## M03 · Unified Chat 栈

### 1) 页面巨石拆分 — credential 状态进 Hook

**规整前** — `UnifiedChatPageClient.tsx` 内 6 个 useState + inline headers：

```typescript
const [credentialInput, setCredentialInput] = useState("");
const [chatbiToken, setChatbiToken] = useState("");
const headers = useMemo(() => {
  const c = chatbiToken.replace(/^bearer\s+/i, "").trim();
  if (!c) return {};
  return { Authorization: `Bearer ${c}` };
}, [chatbiToken]);
```

**规整后** — `useUnifiedChatCredential()` 一行解构：

```typescript
const {
  mounted, locked, credentialInput, setCredentialInput,
  unlockBusy, unlockError, tokenInputRef, headers, handleUnlock,
} = useUnifiedChatCredential();
```

### 2) 历史 transcript — 从页面内联到 `useUnifiedChatTranscript`

**规整前** — 页面顶部定义 `mapHistoryRowsToTranscript` + 50 行 `useEffect` 拉 history。

**规整后**：

```typescript
const { transcript, setTranscript, historyReady, historyError } = useUnifiedChatTranscript({
  mounted, locked, sessionId, headers,
});
```

### 3) 解锁 UI — 从 80 行 inline JSX 到独立组件

**规整前** — `locked ? (<section>…80 行表单 + onClick async IIFE…</section>)` 嵌在主 return 内。

**规整后**：

```tsx
{locked ? (
  <UnifiedChatUnlockPanel
    credentialInput={credentialInput}
    unlockBusy={unlockBusy}
    unlockError={unlockError}
    tokenInputRef={tokenInputRef}
    onCredentialChange={(v) => { setCredentialInput(v); setUnlockError(null); }}
    onUnlock={handleUnlock}
  />
) : ( … )}
```

---

## M04 · Chat / RAG 客户端

### 1) ChatPanel Bearer 头 — 共享 builder

**规整前**：

```typescript
const headers = useMemo(() => {
  const t = token.trim();
  return t ? { Authorization: `Bearer ${t}` } : ({} as Record<string, string>);
}, [token]);
```

**规整后**：

```typescript
const headers = useMemo(() => buildChatbiBearerHeaders(token), [token]);
```

### 2) 双轨 Ink + ChatBI — `buildInkAndChatbiHeaders`

**规整后新增** `lib/chat/buildChatAuthHeaders.ts`，统一 ChatBI 优先、fallback Ink admin、附带 `x-blog-admin-token` 的规则。

### 3) Unified Chat credential Hook 复用同一 builder

`useUnifiedChatCredential` 直接调用 `buildChatbiBearerHeaders(chatbiToken)`，与 ChatPanel 语义一致。

---

## M05 · Auth / Env

### 1) session 路由 — env 判断单点

**规整前**：

```typescript
const configured =
  Boolean(ink) ||
  Boolean((process.env.PY_API_URL ?? "").trim()) ||
  process.env.NODE_ENV === "development";
```

**规整后**：

```typescript
const configured =
  Boolean(ink) ||
  isPyApiUrlConfigured() ||
  process.env.NODE_ENV === "development";
```

### 2) 服务端 ChatBI 校验 — 去掉私有 `pyBaseUrl()`

**规整前**：

```typescript
function pyBaseUrl(): string {
  return (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}
const url = `${pyBaseUrl()}/api/py/chatbi/access/verify`;
upstream = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${t}` } });
```

**规整后**：

```typescript
const upstream = await forwardToPyApi("/api/py/chatbi/access/verify", {
  method: "GET",
  headers: { Accept: "application/json", Authorization: `Bearer ${t}` },
}, { serviceLabel: "ChatBI 校验" });
```

### 3) admin 转发 — secret 读取对齐 `getAdminApiSecret()`

规整后 `forwardToPyAdmin` 与 `lib/auth/admin-env` 对齐，避免 `NEXT_PUBLIC_ADMIN_SECRET` 散落两处。

---

## M06 · Components 杂项

### 1) ChainEventCard — 纯函数外提

**规整前** — `ChainEventCard.tsx` 顶部 80+ 行工具函数与 UI 混写（`fmtTs`、`safeStringify`、`copyToClipboard`…）。

**规整后** — `components/chain-chat/chain-event-card-utils.ts`：

```typescript
export function extractTextFromChainPayload(payload: Record<string, unknown>): string { … }
export async function copyChainTextToClipboard(text: string): Promise<boolean> { … }
```

### 2) ChainEventCard 组件瘦身

diff 删除 79 行重复 util，改为 import `@/components/chain-chat/chain-event-card-utils`。

### 3) fetch 错误 hint 统一

**规整后** — `formatPyFetchErrorHint` 从 RAG route 重复逻辑提升为 proxy 模块导出，503 文案含 cause code / errno / hostname。

---

## content-md-html-optimize（PR #59）

### 1) rehype 插件 — 受控 HTML 管道

**规整前** — `rich-markdown.tsx` 仅 KaTeX：

```typescript
const REHYPE_PLUGINS = [rehypeKatex];
```

**规整后** — 独立 `rehype-plugins.ts`，raw → sanitize → katex：

```typescript
export const CONTENT_REHYPE_PLUGINS = [
  rehypeRaw,
  [rehypeSanitize, sanitizeSchema],
  rehypeKatex,
] as ReactMarkdownOptions["rehypePlugins"];
```

### 2) 内容语料 — GFM 表格 → 语义 HTML

**规整前**（`content/evidence/evidence-card.md`）：

```markdown
| 层 | 一句话 |
| --- | --- |
| **冷层** | 不常变的结构地图… |
```

**规整后**：

```html
<div class="md-table-wrap">
<table>
<thead><tr><th>层</th><th>一句话</th></tr></thead>
<tbody>
<tr><td><strong>冷层</strong></td><td>不常变的结构地图…</td></tr>
</tbody></table></div>
```

### 3) frontmatter / 引用块 — 渲染一致性

**规整前**：YAML `---` frontmatter + `>` blockquote 混用。

**规整后**：`<hr />` 分隔 + `<blockquote><p>…</p></blockquote>`，配合 `md-table-wrap` 统一 Portfolio 视觉。

批量脚本：`tools/content_md_html_optimize.py`（16 篇 content md）。

---

## L2 规范落盘（PR #62 · 文档轨）

| 项 | 规整前 | 规整后 |
|----|--------|--------|
| 编码规范 | 散落 AGENTS.md 段落 | `docs/standards/CODING_FRONTEND_L2_v1_zh.md` active v1.2 |
| Cursor 规则 | 无 L2 专章 | `.cursor/rules/07-coding-standards-l2.mdc` |
| ESLint | 无 explicit-any 门禁 | `@typescript-eslint/no-explicit-any: error` |

---

## 量化摘要

| 文件 | 规整前 | 规整后 | Δ |
|------|--------|--------|---|
| `app/api/py/chat/route.ts` | 113 行 | 14 行 | −99 |
| `app/api/py/chat/history/route.ts` | 71 行 | 22 行 | −49 |
| `UnifiedChatPageClient.tsx` | 972 行 | 840 行 | −132 |
| `lib/py-service-proxy.ts` | ~40 行 | ~240 行 | +200 |
| PR #60 合计 | — | — | +893 / −626 |

---

## 回归验证

合并前每棒 40 自检：`pnpm lint` → `pnpm test` → `pnpm build`。  
PR #60/#61 CI：`lint-and-build` · `verify` 全绿。
