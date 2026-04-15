<!-- source_url: https://docs.langchain.com/oss/python/langchain/observability -->
<!-- captured_at_utc: 2026-04-12T13:33:29.793215+00:00 -->

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

- [Prerequisites](#prerequisites)
- [Enable tracing](#enable-tracing)
- [Quickstart](#quickstart)
- [Trace selectively](#trace-selectively)
- [Log to a project](#log-to-a-project)
- [Add metadata to traces](#add-metadata-to-traces)

As you build and run agents with LangChain, you need visibility into how they behave: which [tools](/oss/python/langchain/tools) they call, what prompts they generate, and how they make decisions. LangChain agents built with [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent) automatically support tracing through [LangSmith](/langsmith/home), a platform for capturing, debugging, evaluating, and monitoring LLM application behavior.
[*Traces*](/langsmith/observability-concepts#traces) record every step of your agent’s execution, from the initial user input to the final response, including all tool calls, model interactions, and decision points. This execution data helps you debug issues, evaluate performance across different inputs, and monitor usage patterns in production.
This guide shows you how to enable tracing for your LangChain agents and use LangSmith to analyze their execution.

## [​](#prerequisites) Prerequisites

Before you begin, ensure you have the following:

- **A LangSmith account**: Sign up (for free) or log in at [smith.langchain.com](https://smith.langchain.com).
- **A LangSmith API key**: Follow the [Create an API key](/langsmith/create-account-api-key#create-an-api-key) guide.

## [​](#enable-tracing) Enable tracing

All LangChain agents automatically support LangSmith tracing. To enable it, set the following environment variables:

```
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
```

## [​](#quickstart) Quickstart

No extra code is needed to log a trace to LangSmith. Just run your agent code as you normally would:

```
from langchain.agents import create_agent

def send_email(to: str, subject: str, body: str):
 """Send an email to a recipient."""
 # ... email sending logic
 return f"Email sent to {to}"

def search_web(query: str):
 """Search the web for information."""
 # ... web search logic
 return f"Search results for: {query}"

agent = create_agent(
 model="gpt-4.1",
 tools=[send_email, search_web],
 system_prompt="You are a helpful assistant that can send emails and search the web."
)

# Run the agent - all steps will be traced automatically
response = agent.invoke({
 "messages": [{"role": "user", "content": "Search for the latest AI news and email a summary to john@example.com"}]
})
```

By default, the trace will be logged to the project with the name `default`. To configure a custom project name, see [Log to a project](/langsmith/log-traces-to-project).

## [​](#trace-selectively) Trace selectively

You may opt to trace specific invocations or parts of your application using LangSmith’s `tracing_context` context manager:

```
import langsmith as ls

# This WILL be traced
with ls.tracing_context(enabled=True):
 agent.invoke({"messages": [{"role": "user", "content": "Send a test email to alice@example.com"}]})

# This will NOT be traced (if LANGSMITH_TRACING is not set)
agent.invoke({"messages": [{"role": "user", "content": "Send another email"}]})
```

## [​](#log-to-a-project) Log to a project

Statically

You can set a custom project name for your entire application by setting the `LANGSMITH_PROJECT` environment variable:

```
export LANGSMITH_PROJECT=my-agent-project
```

Dynamically

You can set the project name programmatically for specific operations:

```
import langsmith as ls

with ls.tracing_context(project_name="email-agent-test", enabled=True):
 response = agent.invoke({
 "messages": [{"role": "user", "content": "Send a welcome email"}]
 })
```

## [​](#add-metadata-to-traces) Add metadata to traces

You can annotate your traces with custom metadata and tags:

```
response = agent.invoke(
 {"messages": [{"role": "user", "content": "Send a welcome email"}]},
 config={
 "tags": ["production", "email-assistant", "v1.0"],
 "metadata": {
 "user_id": "user_123",
 "session_id": "session_456",
 "environment": "production"
 }
 }
)
```

`tracing_context` also accepts tags and metadata for fine-grained control:

```
with ls.tracing_context(
 project_name="email-agent-test",
 enabled=True,
 tags=["production", "email-assistant", "v1.0"],
 metadata={"user_id": "user_123", "session_id": "session_456", "environment": "production"}):
 response = agent.invoke(
 {"messages": [{"role": "user", "content": "Send a welcome email"}]}
 )
```

This custom metadata and tags will be attached to the trace in LangSmith.

To learn more about how to use traces to debug, evaluate, and monitor your agents, see the [LangSmith documentation](/langsmith/home).

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/observability.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[LangSmith Deployment

Previous](/oss/python/langchain/deploy)

⌘I