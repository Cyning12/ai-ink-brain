<!-- source_url: https://docs.langchain.com/oss/python/langchain/ui -->
<!-- captured_at_utc: 2026-04-12T13:33:23.744353+00:00 -->

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

- [Quick start](#quick-start)
- [Local development](#local-development)
- [Connect to your agent](#connect-to-your-agent)

[Agent Chat UI](https://github.com/langchain-ai/agent-chat-ui) is a Next.js application that provides a conversational interface for interacting with any LangChain agent. It supports real-time chat, tool visualization, and advanced features like time-travel debugging and state forking. Agent Chat UI works seamlessly with agents created using [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent) and provides interactive experiences for your agents with minimal setup, whether you’re running locally or in a deployed context (such as [LangSmith](/langsmith/home)).
Agent Chat UI is open source and can be adapted to your application needs.

You can use generative UI in the Agent Chat UI. For more information, see [Implement generative user interfaces with LangGraph](/langsmith/generative-ui-react).

### [​](#quick-start) Quick start

The fastest way to get started is using the hosted version:

1. **Visit [Agent Chat UI](https://agentchat.vercel.app)**
2. **Connect your agent** by entering your deployment URL or local server address
3. **Start chatting** - the UI will automatically detect and render tool calls and interrupts

### [​](#local-development) Local development

For customization or local development, you can run Agent Chat UI locally:

Use npx

Clone repository

```
# Create a new Agent Chat UI project
npx create-agent-chat-app --project-name my-chat-ui
cd my-chat-ui

# Install dependencies and start
pnpm install
pnpm dev
```

### [​](#connect-to-your-agent) Connect to your agent

Agent Chat UI can connect to both [local](/oss/python/langchain/studio) and [deployed agents](/oss/python/langchain/deploy).
After starting Agent Chat UI, you’ll need to configure it to connect to your agent:

1. **Graph ID**: Enter your graph name (find this under `graphs` in your `langgraph.json` file)
2. **Deployment URL**: Your Agent server’s endpoint (e.g., `http://localhost:2024` for local development, or your deployed agent’s URL)
3. **LangSmith API key (optional)**: Add your LangSmith API key (not required if you’re using a local Agent server)

Once configured, Agent Chat UI will automatically fetch and display any interrupted threads from your agent.

Agent Chat UI has out-of-the-box support for rendering tool calls and tool result messages. To customize what messages are shown, see [Hiding Messages in the Chat](https://github.com/langchain-ai/agent-chat-ui?tab=readme-ov-file#hiding-messages-in-the-chat).

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/ui.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Agent Evals

Previous](/oss/python/langchain/test/evals)[LangSmith Deployment

Next](/oss/python/langchain/deploy)

⌘I