---
title: RunnableWithMessageHistory 速查
source_url: https://python.langchain.com/
captured_at_utc: 2026-04-23T00:00:00Z
category: learning
---

## 什么是 `RunnableWithMessageHistory`

`RunnableWithMessageHistory` 是 LangChain 的一个包装器（wrapper），常见用途是：**把对话历史（chat history）接入到一个 Runnable 链路里**，让同一个 chain 在多轮对话中能读取/写入历史消息。

它通常用于“同一个用户 session_id 的多轮对话”，例如：你希望每次调用 chain 时都自动把历史消息注入 prompt。

## 关键词（用于检索/验收）

- `RunnableWithMessageHistory`
- `runnable with message history`
- `langchain_core.runnables.history`
- `session_id`
- `get_session_history`
- `chat history`
- `MessagesPlaceholder`

## 最小示例（示意）

> 说明：下面代码是为了展示概念与关键参数命名，具体 API 可能因 LangChain 版本有所差异。

```python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 伪代码：你的历史存储实现
def get_session_history(session_id: str):
    # return ChatMessageHistory(...)
    ...

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个中文助手。"),
    MessagesPlaceholder("history"),
    ("human", "{input}"),
])

# runnable 可以是 LLM / chain / graph 等
runnable = prompt  # placeholder

with_history = RunnableWithMessageHistory(
    runnable,
    get_session_history=get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

# 调用时通过 config 传 session_id
result = with_history.invoke(
    {"input": "你好"},
    config={"configurable": {"session_id": "u-123"}},
)
print(result)
```

## 常见问题

### 1) 为什么搜不到 `RunnableWithMessageHistory`？

最常见原因是：你的知识库里**并没有入库包含该标识符的文档**。这种情况下不管向量/FTS 怎么调，RAG 都不可能“搜出不存在的内容”。

### 2) CamelCase / 下划线写法会影响 FTS 命中吗？

会。比如：

- `RunnableWithMessageHistory`
- `runnable with message history`

它们在 FTS 的 token 化结果可能不同，因此需要：

- B2（fts_tokens alias）在索引层增强命中稳定性
- 或 query-side 做归一化与候选扩展

