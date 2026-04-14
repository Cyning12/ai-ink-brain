Task 04：来源引用（Source Citations）前后端对接任务

## 背景与目标
聊天功能需要让用户在每次回答后看到“引用来源”，用于：
- 提升可信度：每句回答可追溯
- 便于纠错：用户能点开原文核对
- 便于调试：知道模型依据了哪些片段

本任务要求：
- 后端在不破坏流式输出的前提下，把 `sources[]` 传给前端
- 前端以水墨风卡片展示并支持点击预览/跳转

---

## 后端（FastAPI / `/api/py/chat`）输出约定

### 1) 流式输出保持不变
响应仍为 `text/plain; charset=utf-8` 的 StreamingResponse，前端继续按“打字机/墨迹”方式渲染文本。

### 2) sources 输出方式（Header 优先 + 流末尾兜底）
后端会同时提供两种方式，前端按优先级解析：

#### A. 优先：`x-sources` Header（推荐）
- Header 名：`x-sources`
- 值：对 JSON 做 **percent-encoding**（因为 Header 需要 ASCII），前端用 `decodeURIComponent()` 还原后再 `JSON.parse()`。

#### B. 兜底：流末尾分隔符 + JSON（兼容）
当代理/中间层丢弃自定义 header 或旧客户端不读 header 时，后端会在流末尾追加一个分隔符与 JSON：

- 分隔符（固定字符串）：

```text
---RAG_SOURCES_JSON---
```

- 分隔符之后紧跟一段 JSON（单行或多行均可），结构示例：

```json
{
  "sources": [
    {
      "id": 123,
      "content": "……摘要（200~400字符）……",
      "filename": "task_03_hybrid_search_backend_frontend_contract.md",
      "score": 0.0321,
      "path": "tasks/task_03_hybrid_search_backend_frontend_contract.md",
      "url": null,

      "relativePath": "tasks/task_03_hybrid_search_backend_frontend_contract.md",
      "slug": "task_03_hybrid_search_backend_frontend_contract",
      "original_link": null,
      "category": "tasks",
      "chunk_index": 0,
      "snippet": "……摘要（200~400字符）……",
      "fused_score": 0.0321
    }
  ],
  "retrieval": {
    "top_k": 5,
    "rrf_k": 60
  }
}
```

> 兼容性：如果后端还没上线 sources 输出，前端解析不到分隔符则不展示引用卡片。

---

## 前端解析与 UI 任务

### 1) 解析规则（必须）
解析优先级：
- **优先**从响应头 `x-sources` 解析 sources JSON
- 若 header 不存在/解析失败，再从流末尾 `---RAG_SOURCES_JSON---` 解析

流末尾解析方式：在接收流式文本后，对最终完整文本做一次切分：
- 以 `\n---RAG_SOURCES_JSON---\n` 或 `---RAG_SOURCES_JSON---` 为标记
- 标记之前：`answerText`
- 标记之后：尝试 `JSON.parse()` 得到 `{ sources }`
- JSON 解析失败：忽略 sources（避免影响聊天正常显示）

### 2) UI：`<SourceCitations />`（必须）
在每条 AI 回复下方展示 sources（若存在）。

视觉规范（水墨风）：
- 背景：`#F9F9F7`
- 边框：1px 极浅灰
- 字体：Serif（衬线）
- 极简布局，大量留白

### 3) 交互（必须）
点击来源卡片：
- 若 `original_link` 存在：打开新窗口或弹层预览（由前端决定）
- 否则基于 `relativePath` 做站内跳转或弹层展示 `snippet`

悬浮预览：
- hover 卡片显示该 chunk 的 `content/snippet`（不打断点击行为）

---

## 验收清单
- **流式文本不受影响**：回答仍能逐字输出
- **sources 可选**：有 sources 时显示卡片，无 sources 不显示也不报错
- **点击可用**：至少能打开预览 snippet 或跳到文章页面

