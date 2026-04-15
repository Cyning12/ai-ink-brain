<!-- source_url: https://docs.langchain.com/oss/python/langchain/runtime -->
<!-- captured_at_utc: 2026-04-12T13:32:12.671192+00:00 -->

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

- [Overview](#overview)
- [Access](#access)
- [Inside tools](#inside-tools)
- [Execution info and server info inside tools](#execution-info-and-server-info-inside-tools)
- [Inside middleware](#inside-middleware)
- [Execution info and server info inside middleware](#execution-info-and-server-info-inside-middleware)

## [​](#overview) Overview

LangChain’s [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent) runs on LangGraph’s runtime under the hood.
LangGraph exposes a [`Runtime`](https://reference.langchain.com/python/langgraph/runtime/Runtime) object with the following information:

1. **Context**: static information like user id, db connections, or other dependencies for an agent invocation
2. **Store**: a [BaseStore](https://reference.langchain.com/python/langchain-core/stores/BaseStore) instance used for [long-term memory](/oss/python/langchain/long-term-memory)
3. **Stream writer**: an object used for streaming information via the `"custom"` stream mode
4. **Execution info**: identity and retry information for the current execution (thread ID, run ID, attempt number)
5. **Server info**: server-specific metadata when running on LangGraph Server (assistant ID, graph ID, authenticated user)

Runtime context provides **dependency injection** for your tools and middleware. Instead of hardcoding values or using global state, you can inject runtime dependencies (like database connections, user IDs, or configuration) when invoking your agent. This makes your tools more testable, reusable, and flexible.

You can access the runtime information within [tools](#inside-tools) and [middleware](#inside-middleware).

## [​](#access) Access

When creating an agent with [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent), you can specify a `context_schema` to define the structure of the `context` stored in the agent [`Runtime`](https://reference.langchain.com/python/langgraph/runtime/Runtime).
When invoking the agent, pass the `context` argument with the relevant configuration for the run:

```
from dataclasses import dataclass

from langchain.agents import create_agent

@dataclass
class Context:
 user_name: str

agent = create_agent(
 model="gpt-5-nano",
 tools=[...],
 context_schema=Context  
)

agent.invoke(
 {"messages": [{"role": "user", "content": "What's my name?"}]},
 context=Context(user_name="John Smith")
)
```

### [​](#inside-tools) Inside tools

You can access the runtime information inside tools to:

- Access the context
- Read or write long-term memory
- Write to the [custom stream](/oss/python/langchain/streaming#custom-updates) (ex, tool progress / updates)

Use the `ToolRuntime` parameter to access the [`Runtime`](https://reference.langchain.com/python/langgraph/runtime/Runtime) object inside a tool.

```
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime  

@dataclass
class Context:
 user_id: str

@tool
def fetch_user_email_preferences(runtime: ToolRuntime[Context]) -> str:
 """Fetch the user's email preferences from the store."""
 user_id = runtime.context.user_id  

 preferences: str = "The user prefers you to write a brief and polite email."
 if runtime.store:
 if memory := runtime.store.get(("users",), user_id):
 preferences = memory.value["preferences"]

 return preferences
```

### [​](#execution-info-and-server-info-inside-tools) Execution info and server info inside tools

Access execution identity (thread ID, run ID) via `runtime.execution_info`, and server-specific metadata (assistant ID, authenticated user) via `runtime.server_info` when running on LangGraph Server:

```
from langchain.tools import tool, ToolRuntime

@tool
def context_aware_tool(runtime: ToolRuntime) -> str:
 """A tool that uses execution and server info."""
 # Access thread and run IDs
 info = runtime.execution_info
 print(f"Thread: {info.thread_id}, Run: {info.run_id}")

 # Access server info (only available on LangGraph Server)
 server = runtime.server_info
 if server is not None:
 print(f"Assistant: {server.assistant_id}")
 if server.user is not None:
 print(f"User: {server.user.identity}")

 return "done"
```

`server_info` is `None` when not running on LangGraph Server (e.g., during local development).

Requires `deepagents>=0.5.0` (or `langgraph>=1.1.5`) for `runtime.execution_info` and `runtime.server_info`.

### [​](#inside-middleware) Inside middleware

You can access runtime information in middleware to create dynamic prompts, modify messages, or control agent behavior based on user context.
Use the `Runtime` parameter to access the [`Runtime`](https://reference.langchain.com/python/langgraph/runtime/Runtime) object inside [node-style hooks](/oss/python/langchain/middleware/custom#node-style-hooks). For [wrap-style hooks](/oss/python/langchain/middleware/custom#wrap-style-hooks), the `Runtime` object is available inside the [`ModelRequest`](https://reference.langchain.com/python/langchain/agents/middleware/types/ModelRequest) parameter.

```
from dataclasses import dataclass

from langchain.messages import AnyMessage
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import dynamic_prompt, ModelRequest, before_model, after_model
from langgraph.runtime import Runtime

@dataclass
class Context:
 user_name: str

# Dynamic prompts
@dynamic_prompt
def dynamic_system_prompt(request: ModelRequest) -> str:
 user_name = request.runtime.context.user_name  
 system_prompt = f"You are a helpful assistant. Address the user as {user_name}."
 return system_prompt

# Before model hook
@before_model
def log_before_model(state: AgentState, runtime: Runtime[Context]) -> dict | None:
 print(f"Processing request for user: {runtime.context.user_name}")
 return None

# After model hook
@after_model
def log_after_model(state: AgentState, runtime: Runtime[Context]) -> dict | None:
 print(f"Completed request for user: {runtime.context.user_name}")
 return None

agent = create_agent(
 model="gpt-5-nano",
 tools=[...],
 middleware=[dynamic_system_prompt, log_before_model, log_after_model],
 context_schema=Context
)

agent.invoke(
 {"messages": [{"role": "user", "content": "What's my name?"}]},
 context=Context(user_name="John Smith")
)
```

### [​](#execution-info-and-server-info-inside-middleware) Execution info and server info inside middleware

Middleware hooks can also access `runtime.execution_info` and `runtime.server_info`:

```
from langchain.agents import AgentState
from langchain.agents.middleware import before_model
from langgraph.runtime import Runtime

@before_model
def auth_gate(state: AgentState, runtime: Runtime) -> dict | None:
 """Block unauthenticated users when running on LangGraph Server."""
 server = runtime.server_info
 if server is not None and server.user is None:
 raise ValueError("Authentication required")
 print(f"Thread: {runtime.execution_info.thread_id}")
 return None
```

Requires `deepagents>=0.5.0` (or `langgraph>=1.1.5`).

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/runtime.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Guardrails

Previous](/oss/python/langchain/guardrails)[Context engineering in agents

Next](/oss/python/langchain/context-engineering)

⌘I