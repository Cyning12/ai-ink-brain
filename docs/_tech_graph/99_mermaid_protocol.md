# AI-Ink-Brain（前端）— Mermaid 拓扑协议摘要

> **完整协议真值**（边标记全集、元关系、反模式）：配对后端仓  
> `ai-ink-brain-api-python/docs/_tech_graph/99_mermaid_protocol.md`  
> 本文件为 **Next.js / TypeScript** 维护者速查；**flowchart 编辑源为 `*.graph.yaml`**，人类可读版为 `*.md`。

---

## 双轨制

| 后缀 | 用途 | 维护者 |
| --- | --- | --- |
| `.graph.yaml` | **唯一编辑源**（flowchart 结构化数据） | 开发者 / Agent |
| `.md` | 人类友好版（由 `.graph.yaml` 生成） | 开发者（只读对照） |

修改代码后：**先** 改 `*.graph.yaml`，**再** `pnpm tech-graph:yaml-compile` 生成 `*.md`，**再** `pnpm tech-graph:graph-export` 提交 `graph.json`。

> 历史 `.ai.md` 文件已在 G0 删除；如需回溯，见 Git 历史或后端仓归档。

---

## 边标记（TS / Next 常用）

| 标记 | 语义 | 示例 |
| --- | --- | --- |
| `->` | 同步调用 / 渲染 | `page.tsx` → `ChatPanel` |
| `~>` | `await` / 异步 fetch | Client → `fetch('/api/...')` |
| `?>` | 条件分支 | `if (admin)` |
| `[ok]` / `[err]` | 成功 / 错误路径 | BFF 4xx/5xx |
| `::triggers` | 触发副作用 | 导航、打开面板 |

**禁止**：`.graph.yaml` 边中无显式 `mark` 的裸边。锚点用独立注释行：

```text
// → app/api/py/unified/chat/stream/route.ts
```

---

## 子图文件（本仓）

| 文件 | 域 |
| --- | --- |
| `00_main.graph.yaml` | App Router 总图 |
| `10_flow_route.graph.yaml` | 页面路由 |
| `11_flow_api.graph.yaml` | BFF / 代理 |
| `12_flow_auth.graph.yaml` | 鉴权 |
| `13_flow_components.graph.yaml` | 组件数据流 |

---

## 与机器轨关系

- 导出器读取 **本目录 `*.graph.yaml`**，写入 `graph.json`（`graph_v2`）。  
- 等价门禁：锚点覆盖率 ≥95%、边 label ≥90%（见 `graph_v2_schema.md` §6）。

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-20 | 前端摘要落盘；完整协议引用后端仓 |
| 2026-06-17 | **Inform YAML**：编辑源由 `.ai.md` 迁为 `.graph.yaml`；`.ai.md` 标记 deprecated |
| 2026-06-18 | **G0**：删除 5× `.ai.md`，完成 YAML 单源 |
