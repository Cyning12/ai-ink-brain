<!-- source_url: https://docs.langchain.com/oss/python/langchain/middleware/overview -->
<!-- captured_at_utc: 2026-04-12T13:31:38.322932+00:00 -->

Python

- [Overview](/oss/python/langchain/overview)

##### Get started

- [Install](/oss/python/langchain/install)
- [Quickstart](/oss/python/langchain/quickstart)
- [Changelog](https://docs.langchain.com/oss/python/releases/changelog)
- [Philosophy](/oss/python/langchain/philosophy)

##### Core components

- [Agents](/oss/python/langchain/agents)
- [Models](/oss/python/langchain/models)
- [Messages](/oss/python/langchain/messages)
- [Tools](/oss/python/langchain/tools)
- [Short-term memory](/oss/python/langchain/short-term-memory)
- [Streaming](/oss/python/langchain/streaming)
- [Structured output](/oss/python/langchain/structured-output)

##### Middleware

- [Overview](/oss/python/langchain/middleware/overview)
- [Prebuilt middleware](/oss/python/langchain/middleware/built-in)
- [Custom middleware](/oss/python/langchain/middleware/custom)

##### Frontend

- [Overview](/oss/python/langchain/frontend/overview)
- Patterns
- Integrations

##### Advanced usage

- [Guardrails](/oss/python/langchain/guardrails)
- [Runtime](/oss/python/langchain/runtime)
- [Context engineering](/oss/python/langchain/context-engineering)
- [Model Context Protocol (MCP)](/oss/python/langchain/mcp)
- [Human-in-the-loop](/oss/python/langchain/human-in-the-loop)
- Multi-agent
- [Retrieval](/oss/python/langchain/retrieval)
- [Long-term memory](/oss/python/langchain/long-term-memory)

##### Agent development

- [LangSmith Studio](/oss/python/langchain/studio)
- Test
- [Agent Chat UI](/oss/python/langchain/ui)

##### Deploy with LangSmith

- [Deployment](/oss/python/langchain/deploy)
- [Observability](/oss/python/langchain/observability)

On this page

- [The agent loop](#the-agent-loop)
- [Additional resources](#additional-resources)

Middleware provides a way to more tightly control what happens inside the agent. Middleware is useful for the following:

- Tracking agent behavior with logging, analytics, and debugging.
- Transforming prompts, [tool selection](/oss/python/langchain/middleware/built-in#llm-tool-selector), and output formatting.
- Adding [retries](/oss/python/langchain/middleware/built-in#tool-retry), [fallbacks](/oss/python/langchain/middleware/built-in#model-fallback), and early termination logic.
- Applying [rate limits](/oss/python/langchain/middleware/built-in#model-call-limit), guardrails, and [PII detection](/oss/python/langchain/middleware/built-in#pii-detection).

Add middleware by passing them to [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent):

```
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware, HumanInTheLoopMiddleware

agent = create_agent(
 model="gpt-4.1",
 tools=[...],
 middleware=[
 SummarizationMiddleware(...),
 HumanInTheLoopMiddleware(...)
 ],
)
```

## [​](#the-agent-loop) The agent loop

The core agent loop involves calling a model, letting it choose tools to execute, and then finishing when it calls no more tools:
![Core agent loop diagram](https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=ac72e48317a9ced68fd1be64e89ec063)
Middleware exposes hooks before and after each of those steps:
![Middleware flow diagram](https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=eb4404b137edec6f6f0c8ccb8323eaf1)

## [​](#additional-resources) Additional resources

## Built-in middleware

Explore built-in middleware for common use cases.

## Custom middleware

Build your own middleware with hooks and decorators.

## Middleware API reference

Complete API reference for middleware.

## Middleware integrations

Provider-specific middleware for Anthropic, AWS, OpenAI, and more.

## Testing agents

Test your agents with LangSmith.

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/middleware/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Structured output

Previous](/oss/python/langchain/structured-output)[Prebuilt middleware

Next](/oss/python/langchain/middleware/built-in)

⌘I