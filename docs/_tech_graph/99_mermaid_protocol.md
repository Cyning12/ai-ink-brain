# AI-Ink-Brain（前端）— Mermaid 拓扑协议摘要

> **完整协议真值**（边标记全集、元关系、反模式）：配对后端仓  
> `ai-ink-brain-api-python/docs/_tech_graph/99_mermaid_protocol.md`  
> 本文件为 **Next.js / TypeScript** 维护者速查；导出与 CI **以 `.ai.md` 为准**。

---

## 双轨制

| 后缀 | 用途 | 维护者 |
| --- | --- | --- |
| `.md` | 人类友好版 | 开发者（裸边允许） |
| `.ai.md` | AI 协议版 | LLM / 导出器（**零裸边**） |

修改代码后：**先** `.ai.md`，**再** 同步 `.md` 语义，**再** `pnpm tech-graph:graph-export` 提交 `graph.json`。

---

## 边标记（TS / Next 常用）

| 标记 | 语义 | 示例 |
| --- | --- | --- |
| `->` | 同步调用 / 渲染 | `page.tsx` → `ChatPanel` |
| `~>` | `await` / 异步 fetch | Client → `fetch('/api/...')` |
| `?>` | 条件分支 | `if (admin)` |
| `[ok]` / `[err]` | 成功 / 错误路径 | BFF 4xx/5xx |
| `::triggers` | 触发副作用 | 导航、打开面板 |

**禁止**：`.ai.md` 中无标记的 `-->`（裸边）。锚点用独立注释行：

```text
// → app/api/py/unified/chat/stream/route.ts
```

---

## 子图文件（本仓）

| 文件 | 域 |
| --- | --- |
| `00_main.ai.md` | App Router 总图 |
| `10_flow_route.ai.md` | 页面路由 |
| `11_flow_api.ai.md` | BFF / 代理 |
| `12_flow_auth.ai.md` | 鉴权 |
| `13_flow_components.ai.md` | 组件数据流 |

---

## 与机器轨关系

- 导出器读取 **本目录 `*.ai.md`**（flowchart），写入 `graph.json`（`graph_v2`）。  
- 等价门禁：锚点覆盖率 ≥95%、边 label ≥90%（见 `graph_v2_schema.md` §6）。

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-20 | 前端摘要落盘；完整协议引用后端仓 |
