<!-- source_url: https://docs.langchain.com/oss/python/langchain/studio -->
<!-- captured_at_utc: 2026-04-12T13:33:20.656344+00:00 -->

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
- [Set up local Agent server](#set-up-local-agent-server)
- [1. Install the LangGraph CLI](#1-install-the-langgraph-cli)
- [2. Prepare your agent](#2-prepare-your-agent)
- [3. Environment variables](#3-environment-variables)
- [4. Create a LangGraph config file](#4-create-a-langgraph-config-file)
- [5. Install dependencies](#5-install-dependencies)
- [6. View your agent in Studio](#6-view-your-agent-in-studio)
- [Video guide](#video-guide)

When building agents with LangChain locally, it’s helpful to visualize what’s happening inside your agent, interact with it in real-time, and debug issues as they occur. **LangSmith Studio** is a free visual interface for developing and testing your LangChain agents from your local machine.
Studio connects to your locally running agent to show you each step your agent takes: the prompts sent to the model, tool calls and their results, and the final output. You can test different inputs, inspect intermediate states, and iterate on your agent’s behavior without additional code or deployment.
This pages describes how to set up Studio with your local LangChain agent.

## [​](#prerequisites) Prerequisites

Before you begin, ensure you have the following:

- **A LangSmith account**: Sign up (for free) or log in at [smith.langchain.com](https://smith.langchain.com).
- **A LangSmith API key**: Follow the [Create an API key](/langsmith/create-account-api-key#create-an-api-key) guide.
- If you don’t want data [traced](/langsmith/observability-concepts#traces) to LangSmith, set `LANGSMITH_TRACING=false` in your application’s `.env` file. With tracing disabled, no data leaves your local server.

## [​](#set-up-local-agent-server) Set up local Agent server

### [​](#1-install-the-langgraph-cli) 1. Install the LangGraph CLI

The [LangGraph CLI](/langsmith/cli) provides a local development server (also called [Agent Server](/langsmith/agent-server)) that connects your agent to Studio.

```
# Python >= 3.11 is required.
pip install --upgrade "langgraph-cli[inmem]"
```

### [​](#2-prepare-your-agent) 2. Prepare your agent

If you already have a LangChain agent, you can use it directly. This example uses a simple email agent:

agent.py

```
from langchain.agents import create_agent

def send_email(to: str, subject: str, body: str):
 """Send an email"""
 email = {
 "to": to,
 "subject": subject,
 "body": body
 }
 # ... email sending logic

 return f"Email sent to {to}"

agent = create_agent(
 "gpt-5.2",
 tools=[send_email],
 system_prompt="You are an email assistant. Always use the send_email tool.",
)
```

### [​](#3-environment-variables) 3. Environment variables

Studio requires a LangSmith API key to connect your local agent. Create a `.env` file in the root of your project and add your API key from [LangSmith](https://smith.langchain.com/settings).

Ensure your `.env` file is not committed to version control, such as Git.

.env

```
LANGSMITH_API_KEY=lsv2...
```

### [​](#4-create-a-langgraph-config-file) 4. Create a LangGraph config file

The LangGraph CLI uses a configuration file to locate your agent and manage dependencies. Create a `langgraph.json` file in your app’s directory:

langgraph.json

```
{
  "dependencies": ["."],
  "graphs": {
 "agent": "./src/agent.py:agent"
  },
  "env": ".env"
}
```

The [`create_agent`](https://reference.langchain.com/python/langchain/agents/factory/create_agent) function automatically returns a compiled LangGraph graph, which is what the `graphs` key expects in the configuration file.

For detailed explanations of each key in the JSON object of the configuration file, refer to the [LangGraph configuration file reference](/langsmith/cli#configuration-file).

At this point, the project structure will look like this:

```
my-app/
├── src
│ └── agent.py
├── .env
└── langgraph.json
```

### [​](#5-install-dependencies) 5. Install dependencies

Install your project dependencies from the root directory:

pip

uv

```
pip install langchain langchain-openai
```

### [​](#6-view-your-agent-in-studio) 6. View your agent in Studio

Start the development server to connect your agent to Studio:

```
langgraph dev
```

Safari blocks `localhost` connections to Studio. To work around this, run the above command with `--tunnel` to access Studio via a secure tunnel.

Once the server is running, your agent is accessible both via API at `http://127.0.0.1:2024` and through the Studio UI at `https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`:

![Agent view in the Studio UI](https://mintcdn.com/langchain-5e9cc07a/TCDks4pdsHdxWmuJ/oss/images/studio_create-agent.png?fit=max&auto=format&n=TCDks4pdsHdxWmuJ&q=85&s=ebd259e9fa24af7d011dfcc568f74be2)

With Studio connected to your local agent, you can iterate quickly on your agent’s behavior. Run a test input, inspect the full execution trace including prompts, tool arguments, return values, and token/latency metrics. When something goes wrong, Studio captures exceptions with the surrounding state to help you understand what happened.
The development server supports hot-reloading—make changes to prompts or tool signatures in your code, and Studio reflects them immediately. Re-run conversation threads from any step to test your changes without starting over. This workflow scales from simple single-tool agents to complex multi-node graphs.
For more information on how to run Studio, refer to the following guides in the [LangSmith docs](/langsmith/home):

- [Run application](/langsmith/use-studio#run-application)
- [Manage assistants](/langsmith/use-studio#manage-assistants)
- [Manage threads](/langsmith/use-studio#manage-threads)
- [Iterate on prompts](/langsmith/observability-studio)
- [Debug LangSmith traces](/langsmith/observability-studio#debug-langsmith-traces)
- [Add node to dataset](/langsmith/observability-studio#add-node-to-dataset)

## [​](#video-guide) Video guide

For more information about deployed agents, see [Deploy](/oss/python/langchain/deploy).

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/studio.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Long-term memory

Previous](/oss/python/langchain/long-term-memory)[Test

Next](/oss/python/langchain/test)

⌘I