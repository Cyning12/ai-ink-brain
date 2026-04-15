<!-- source_url: https://docs.langchain.com/oss/python/langchain/deploy -->
<!-- captured_at_utc: 2026-04-12T13:33:26.516033+00:00 -->

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
- [Deploy your agent](#deploy-your-agent)
- [1. Create a repository on GitHub](#1-create-a-repository-on-github)
- [2. Deploy to LangSmith](#2-deploy-to-langsmith)
- [3. Test your application in Studio](#3-test-your-application-in-studio)
- [4. Get the API URL for your deployment](#4-get-the-api-url-for-your-deployment)
- [5. Test the API](#5-test-the-api)

When you’re ready to deploy your LangChain agent to production, LangSmith provides a managed hosting platform designed for agent workloads. Traditional hosting platforms are built for stateless, short-lived web applications, while LangGraph is **purpose-built for stateful, long-running agents** that require persistent state and background execution. LangSmith handles the infrastructure, scaling, and operational concerns so you can deploy directly from your repository.

## [​](#prerequisites) Prerequisites

Before you begin, ensure you have the following:

- A [GitHub account](https://github.com/)
- A [LangSmith account](https://smith.langchain.com/) (free to sign up)

## [​](#deploy-your-agent) Deploy your agent

### [​](#1-create-a-repository-on-github) 1. Create a repository on GitHub

Your application’s code must reside in a GitHub repository to be deployed on LangSmith. Both public and private repositories are supported. For this quickstart, first make sure your app is LangGraph-compatible by following the [local server setup guide](/oss/python/langchain/studio). Then, push your code to the repository.

### [​](#2-deploy-to-langsmith) 2. Deploy to LangSmith

1

Navigate to LangSmith Deployment

Log in to [LangSmith](https://smith.langchain.com/). In the left sidebar, select **Deployments**.

2

Create new deployment

Click the **+ New Deployment** button. A pane will open where you can fill in the required fields.

3

Link repository

If you are a first time user or adding a private repository that has not been previously connected, click the **Add new account** button and follow the instructions to connect your GitHub account.

4

Deploy repository

Select your application’s repository. Click **Submit** to deploy. This may take about 15 minutes to complete. You can check the status in the **Deployment details** view.

### [​](#3-test-your-application-in-studio) 3. Test your application in Studio

Once your application is deployed:

1. Select the deployment you just created to view more details.
2. Click the **Studio** button in the top right corner. Studio will open to display your graph.

### [​](#4-get-the-api-url-for-your-deployment) 4. Get the API URL for your deployment

1. In the **Deployment details** view in LangGraph, click the **API URL** to copy it to your clipboard.
2. Click the `URL` to copy it to the clipboard.

### [​](#5-test-the-api) 5. Test the API

You can now test the API:

- Python
- Rest API

1. Install LangGraph Python:

```
pip install langgraph-sdk
```

2. Send a message to the agent:

```
from langgraph_sdk import get_sync_client # or get_client for async

client = get_sync_client(url="your-deployment-url", api_key="your-langsmith-api-key")

for chunk in client.runs.stream(
 None, # Threadless run
 "agent", # Name of agent. Defined in langgraph.json.
 input={
 "messages": [{
 "role": "human",
 "content": "What is LangGraph?",
 }],
 },
 stream_mode="updates",
):
 print(f"Receiving new event of type: {chunk.event}...")
 print(chunk.data)
 print("\n\n")
```

```
curl -s --request POST \
 --url <DEPLOYMENT_URL>/runs/stream \
 --header 'Content-Type: application/json' \
 --header "X-Api-Key: <LANGSMITH API KEY> \
 --data "{
 \"assistant_id\": \"agent\", `# Name of agent. Defined in langgraph.json.`
 \"input\": {
 \"messages\": [
 {
 \"role\": \"human\",
 \"content\": \"What is LangGraph?\"
 }
 ]
 },
 \"stream_mode\": \"updates\"
 }"
```

LangSmith offers additional hosting options, including self-hosted and hybrid. For more information, please see the [Platform setup overview](/langsmith/platform-setup).

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/deploy.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[Agent Chat UI

Previous](/oss/python/langchain/ui)[LangSmith Observability

Next](/oss/python/langchain/observability)

⌘I