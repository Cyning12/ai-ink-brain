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

### 2) sources 通过“流末尾分隔符 + JSON”附加
后端会在流结束前追加一个分隔符与 JSON：

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
      "relativePath": "tasks/task_03_hybrid_search_backend_frontend_contract.md",
      "filename": "task_03_hybrid_search_backend_frontend_contract.md",
      "slug": "task_03_hybrid_search_backend_frontend_contract",
      "original_link": null,
      "category": "tasks",
      "chunk_index": 0,
      "snippet": "……摘要（200~400字符）……",
      "fused_score": 0.0321
    }
  ],
  "retrieval": {
    "top_k": 10,
    "rrf_k": 60
  }
}
```

> 兼容性：如果后端还没上线 sources 输出，前端解析不到分隔符则不展示引用卡片。

---

## 前端解析与 UI 任务

### 1) 解析规则（必须）
在接收流式文本后，对最终完整文本做一次切分：
- 以 `\n---RAG_SOURCES_JSON---\n` 或 `---RAG_SOURCES_JSON---` 为标记
- 标记之前：`answerText`
- 标记之后：尝试 `JSON.parse()` 得到 `{ sources }`
- JSON 解析失败：忽略 sources（避免影响聊天正常显示）

### 2) UI：`<SourceCitation />`（必须）
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

---

## 验收清单
- **流式文本不受影响**：回答仍能逐字输出
- **sources 可选**：有 sources 时显示卡片，无 sources 不显示也不报错
- **点击可用**：至少能打开预览 snippet 或跳到文章页面

---

## 开发任务完成情况（前端）
- **状态**：已完成
- **实现要点**：
  - 流式过程中仅渲染回答正文；检测到分隔符 `---RAG_SOURCES_JSON---` 后停止把后续 JSON 输出到聊天文本中
  - 流结束后解析 sources JSON（解析失败则忽略，不影响聊天）
  - 在每条 AI 回复下方以水墨风卡片渲染 `<SourceCitation />`；点击：
    - `original_link` 存在：新窗口打开
    - 否则：弹层预览 `snippet`
- **涉及文件**：
  - `lib/chat/chatApi.ts`
  - `components/ChatPanel.tsx`
  - `components/SourceCitation.tsx`

