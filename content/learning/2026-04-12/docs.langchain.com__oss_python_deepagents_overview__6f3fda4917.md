<!-- source_url: https://docs.langchain.com/oss/python/deepagents/overview -->
<!-- captured_at_utc: 2026-04-12T13:30:25.894879+00:00 -->

Python

- [Overview](/oss/python/deepagents/overview)

##### Get started

- [Quickstart](/oss/python/deepagents/quickstart)
- [Customization](/oss/python/deepagents/customization)
- [Comparison](/oss/python/deepagents/comparison)
- [Changelog](https://docs.langchain.com/oss/python/releases/changelog)

##### Deployment

- [Deploy with the CLI](/oss/python/deepagents/deploy)
- [Going to production](/oss/python/deepagents/going-to-production)

##### Core capabilities

- [Overview](/oss/python/deepagents/harness)
- [Models](/oss/python/deepagents/models)
- [Context engineering](/oss/python/deepagents/context-engineering)
- [Backends](/oss/python/deepagents/backends)
- [Subagents](/oss/python/deepagents/subagents)
- [Async subagents](/oss/python/deepagents/async-subagents)
- [Human-in-the-loop](/oss/python/deepagents/human-in-the-loop)
- [Permissions](/oss/python/deepagents/permissions)
- [Memory](/oss/python/deepagents/memory)
- [Skills](/oss/python/deepagents/skills)
- [Sandboxes](/oss/python/deepagents/sandboxes)
- [Streaming](/oss/python/deepagents/streaming)

##### Frontend

- [Overview](/oss/python/deepagents/frontend/overview)
- Patterns

##### Protocols

- [Agent Client Protocol (ACP)](/oss/python/deepagents/acp)

##### Command line interface

- [Use the CLI](/oss/python/deepagents/cli/overview)
- [Model providers](/oss/python/deepagents/cli/providers)
- [Configuration](/oss/python/deepagents/cli/configuration)
- [MCP Tools](/oss/python/deepagents/cli/mcp-tools)

On this page

- [Create a deep agent](#create-a-deep-agent)
- [When to use the Deep Agents](#when-to-use-the-deep-agents)
- [Core capabilities](#core-capabilities)
- [Get started](#get-started)

The easiest way to start building agents and applications powered by LLMs—with built-in capabilities for task planning, file systems for context management, subagent-spawning, and long-term memory.
You can use deep agents for any task, including complex, multi-step tasks.
We think of `deepagents` as an [“agent harness”](/oss/python/concepts/products#agent-harnesses-like-the-deep-agents-sdk). It is the same core tool calling loop as other agent frameworks, but with built-in tools and capabilities.
[`deepagents`](https://pypi.org/project/deepagents/) is a standalone library built on top of [LangChain](/oss/python/langchain)’s core building blocks for agents. It uses the [LangGraph](/oss/python/langgraph) runtime for durable execution, streaming, human-in-the-loop, and other features.
The [`deepagents` repository](https://github.com/langchain-ai/deepagents) contains:

- **Deep Agents SDK**: A package for building agents that can handle any task
- [**Deep Agents CLI**](/oss/python/deepagents/cli): A terminal coding agent built on the Deep Agents SDK
- [**ACP integration**](/oss/python/deepagents/acp): An Agent Client Protocol connector for using deep agents in code editors like Zed

[LangChain](/oss/python/langchain) is the framework that provides the core building blocks for your agents.
To learn more about the differences between LangChain, LangGraph, and Deep Agents, see [Frameworks, runtimes, and harnesses](/oss/python/concepts/products).

## [​](#create-a-deep-agent) Create a deep agent

```
# pip install -qU deepagents
from deepagents import create_deep_agent

def get_weather(city: str) -> str:
 """Get weather for a given city."""
 return f"It's always sunny in {city}!"

agent = create_deep_agent(
 tools=[get_weather],
 system_prompt="You are a helpful assistant",
)

# Run the agent
agent.invoke(
 {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)
```

See the [Quickstart](/oss/python/deepagents/quickstart) and [Customization guide](/oss/python/deepagents/customization) to get started building your own agents and applications with Deep Agents.

Use [LangSmith](/langsmith/home) to trace requests, debug agent behavior, and evaluate outputs. Set `LANGSMITH_TRACING=true` and your API key to get started.

## [​](#when-to-use-the-deep-agents) When to use the Deep Agents

Use the **Deep Agents SDK** when you want to build agents that can:

- **Handle complex, multi-step tasks** that require planning and decomposition
- **Manage large amounts of context** through file system tools and [summarization](/oss/python/deepagents/context-engineering#summarization)
- **Swap filesystem backends** to use in-memory state, local disk, durable stores, [sandboxes](/oss/python/deepagents/sandboxes), or [your own custom backend](/oss/python/deepagents/backends)
- **Execute shell commands** via the `execute` tool when using a [sandbox backend](/oss/python/deepagents/sandboxes)
- **Delegate work** to specialized subagents for context isolation
- **Persist memory** across conversations and threads
- **Control filesystem access** with declarative [permission rules](/oss/python/deepagents/permissions) that restrict which files agents can read or write
- **Require human approval** for sensitive operations with [human-in-the-loop](/oss/python/deepagents/human-in-the-loop) workflows
- **Use any model** that supports tool calling — [provider agnostic](/oss/python/deepagents/models) across frontier and open models

For building simpler agents, consider using LangChain’s [`create_agent`](/oss/python/langchain/agents) or building a custom [LangGraph](/oss/python/langgraph/overview) workflow.

## [​](#core-capabilities) Core capabilities

## Planning and task decomposition

Deep Agents include a built-in [`write_todos`](/oss/python/langchain/middleware/built-in#to-do-list) tool that enables agents to break down complex tasks into discrete steps, track progress, and adapt plans as new information emerges.

## Context management

File system tools ([`ls`](/oss/python/deepagents/harness#virtual-filesystem-access), [`read_file`](/oss/python/deepagents/harness#virtual-filesystem-access), [`write_file`](/oss/python/deepagents/harness#virtual-filesystem-access), [`edit_file`](/oss/python/deepagents/harness#virtual-filesystem-access)) allow agents to offload large context to in-memory or filesystem storage, preventing context window overflow and enabling work with variable-length tool results. Auto-summarization compacts older conversation messages when the context window grows long, keeping the agent effective across extended sessions.

## Shell execution

When using a [sandbox backend](/oss/python/deepagents/sandboxes), agents get an `execute` tool to run shell commands for tests, builds, git operations, and system tasks. Sandbox backends provide isolation so agents can execute code without compromising your host system.

## Pluggable filesystem backends

The virtual filesystem is powered by [pluggable backends](/oss/python/deepagents/backends) that you can swap to fit your use case. Choose from in-memory state, local disk, LangGraph store for cross-thread persistence, [sandboxes](/oss/python/deepagents/sandboxes) for isolated code execution (Modal, Daytona, Deno), or combine multiple backends with composite routing. You can also implement your own custom backend.

## Subagent spawning

A built-in `task` tool enables agents to spawn specialized subagents for context isolation. This keeps the main agent’s context clean while still going deep on specific subtasks.

## Long-term memory

Extend agents with persistent memory across threads using LangGraph’s [Memory Store](/oss/python/langgraph/persistence#memory-store). Agents can save and retrieve information from previous conversations.

## Filesystem permissions

Declare [permission rules](/oss/python/deepagents/permissions) that control which files and directories agents can read or write. Subagents can inherit or override the parent’s rules.

## Human-in-the-loop

Configure [human approval](/oss/python/deepagents/human-in-the-loop) for sensitive tool operations using LangGraph’s interrupt capabilities. Control which tools require confirmation before execution.

## Skills

Extend agents with reusable [skills](/oss/python/deepagents/skills) that provide specialized workflows, domain knowledge, and custom instructions.

## Smart defaults

Ships with opinionated system prompts that teach the model how to use its tools effectively — plan before acting, verify work, and manage context. Customize or replace the defaults as needed.

## [​](#get-started) Get started

## SDK Quickstart

Build your first deep agent

## Customization

Learn about customization options for the SDK

## Models

Configure models and providers

## Backends

Choose and configure pluggable filesystem backends

## Sandboxes

Execute code in isolated environments

## Permissions

Control filesystem access with permission rules

## Human-in-the-loop

Configure approval for sensitive operations

## CLI

Use the Deep Agents CLI

## ACP

Use deep agents in code editors via ACP

## Reference

See the `deepagents` API reference

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Quickstart

Next](/oss/python/deepagents/quickstart)

⌘I