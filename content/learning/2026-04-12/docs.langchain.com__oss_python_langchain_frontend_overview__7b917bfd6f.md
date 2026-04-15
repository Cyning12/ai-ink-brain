<!-- source_url: https://docs.langchain.com/oss/python/langchain/frontend/overview -->
<!-- captured_at_utc: 2026-04-12T13:31:50.865853+00:00 -->

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

- [Architecture](#architecture)
- [Patterns](#patterns)
- [Render messages and output](#render-messages-and-output)
- [Display agent actions](#display-agent-actions)
- [Manage conversations](#manage-conversations)
- [Advanced streaming](#advanced-streaming)
- [Integrations](#integrations)

Build rich, interactive frontends for agents created with `createAgent`. These patterns cover everything from basic message rendering to advanced workflows like human-in-the-loop approval and time travel debugging.

## [​](#architecture) Architecture

Every pattern follows the same architecture: a `createAgent` backend streams state to a frontend via the `useStream` hook.

On the backend, `createAgent` produces a compiled LangGraph graph that exposes a streaming API. On the frontend, the `useStream` hook connects to that API and provides reactive state — messages, tool calls, interrupts, history, and more — that you render with any framework.

agent.py

types.ts

Chat.tsx

```
from langchain import create_agent
from langgraph.checkpoint.memory import MemorySaver

agent = create_agent(
 model="openai:gpt-5.4",
 tools=[get_weather, search_web],
 checkpointer=MemorySaver(),
)
```

`useStream` is available for React, Vue, Svelte, and Angular:

```
import { useStream } from "@langchain/react"; // React
import { useStream } from "@langchain/vue"; // Vue
import { useStream } from "@langchain/svelte"; // Svelte
import { useStream } from "@langchain/angular";  // Angular
```

## [​](#patterns) Patterns

### [​](#render-messages-and-output) Render messages and output

## Markdown messages

Parse and render streamed markdown with proper formatting and code highlighting.

## Structured output

Render typed agent responses as custom UI components instead of plain text.

## Reasoning tokens

Display model thinking processes in collapsible blocks.

## Generative UI

Render AI-generated user interfaces from natural language prompts using json-render.

### [​](#display-agent-actions) Display agent actions

## Tool calling

Show tool calls as rich, type-safe UI cards with loading and error states.

## Human-in-the-loop

Pause the agent for human review with approve, reject, and edit workflows.

### [​](#manage-conversations) Manage conversations

## Branching chat

Edit messages, regenerate responses, and navigate conversation branches.

## Message queues

Queue multiple messages while the agent processes them sequentially.

### [​](#advanced-streaming) Advanced streaming

## Join & rejoin streams

Disconnect from and reconnect to running agent streams without losing progress.

## Time travel

Inspect, navigate, and resume from any checkpoint in the conversation history.

## [​](#integrations) Integrations

`useStream` is UI-agnostic. Use it to any component library or generative UI framework.

## AI Elements

Composable shadcn/ui components for AI chat: `Conversation`, `Message`, `Tool`, `Reasoning`.

## assistant-ui

Headless React framework with built-in thread management, branching, and attachment support.

## OpenUI

Generative UI library for data-rich reports and dashboards using the openui-lang component DSL.

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Custom middleware

Previous](/oss/python/langchain/middleware/custom)[Markdown messages

Next](/oss/python/langchain/frontend/markdown-messages)

⌘I