<!-- source_url: https://docs.langchain.com/oss/python/integrations/providers/overview -->
<!-- captured_at_utc: 2026-04-12T13:30:37.200928+00:00 -->

Python

- [LangChain integrations](/oss/python/integrations/providers/overview)

- [All providers](/oss/python/integrations/providers/all_providers)

##### Popular Providers

- [OpenAI](/oss/python/integrations/providers/openai)
- [Anthropic](/oss/python/integrations/providers/anthropic)
- [Google](/oss/python/integrations/providers/google)
- [AWS](/oss/python/integrations/providers/aws)
- [NVIDIA](/oss/python/integrations/providers/nvidia)
- [Hugging Face](/oss/python/integrations/providers/huggingface)
- [Microsoft](/oss/python/integrations/providers/microsoft)
- [Ollama](/oss/python/integrations/providers/ollama)
- [Groq](/oss/python/integrations/providers/groq)

##### Integrations by component

- [Chat models](/oss/python/integrations/chat)
- [Tools and toolkits](/oss/python/integrations/tools)
- [Middleware](/oss/python/integrations/middleware)
- [Sandboxes](/oss/python/integrations/sandboxes)
- [Checkpointers](/oss/python/integrations/checkpointers)
- [Retrievers](/oss/python/integrations/retrievers)
- [Text splitters](/oss/python/integrations/splitters)
- [Embedding models](/oss/python/integrations/embeddings)
- [Vector stores](/oss/python/integrations/vectorstores)
- [Document loaders](/oss/python/integrations/document_loaders)

LangChain offers an extensive ecosystem with 1000+ integrations across chat & embedding models, tools & toolkits, document loaders, vector stores, and more.
A **provider** is a company or platform that hosts AI models and exposes them through an API (e.g., OpenAI, Anthropic, Google). Many providers have a dedicated `langchain-<provider>` package that implements one or more of LangChain’s standard interfaces—chat models, embedding models, vector stores, and more—giving you a consistent API regardless of the underlying provider. Install the package, pick a model name, and swap providers without changing your code.

## Chat models

## Embedding models

## Tools and toolkits

## Middleware

## Checkpointers

## Sandboxes

To see a full list of integrations by component type, refer to the categories in the sidebar.

For a conceptual overview of how providers and models work in LangChain, including how to find model names, use new models immediately, and work with routers—see [Providers and models](/oss/python/concepts/providers-and-models).

## [​](#popular-providers) Popular providers

| Provider | Package | Downloads | Latest version | JS/TS support |
| --- | --- | --- | --- | --- |
| [OpenAI](/oss/python/integrations/providers/openai) | [`langchain-openai`](https://reference.langchain.com/python/integrations/langchain_openai/) | [Downloads per month](https://pypi.org/project/langchain-openai/) | [PyPI - Latest version](https://pypi.org/project/langchain-openai/) | [✅](https://www.npmjs.com/package/@langchain/openai) |
| [Google (Vertex AI)](/oss/python/integrations/providers/google) | [`langchain-google-vertexai`](https://reference.langchain.com/python/integrations/langchain_google_vertexai/) | [Downloads per month](https://pypi.org/project/langchain-google-vertexai/) | [PyPI - Latest version](https://pypi.org/project/langchain-google-vertexai/) | [✅](https://www.npmjs.com/package/@langchain/google-vertexai) |
| [Anthropic (Claude)](/oss/python/integrations/providers/anthropic) | [`langchain-anthropic`](https://reference.langchain.com/python/integrations/langchain_anthropic/) | [Downloads per month](https://pypi.org/project/langchain-anthropic/) | [PyPI - Latest version](https://pypi.org/project/langchain-anthropic/) | [✅](https://www.npmjs.com/package/@langchain/anthropic) |
| [Google (GenAI)](/oss/python/integrations/providers/google) | [`langchain-google-genai`](https://reference.langchain.com/python/integrations/langchain_google_genai/) | [Downloads per month](https://pypi.org/project/langchain-google-genai/) | [PyPI - Latest version](https://pypi.org/project/langchain-google-genai/) | [✅](https://www.npmjs.com/package/@langchain/google-genai) |
| [AWS](/oss/python/integrations/providers/aws) | [`langchain-aws`](https://reference.langchain.com/python/integrations/langchain_aws/) | [Downloads per month](https://pypi.org/project/langchain-aws/) | [PyPI - Latest version](https://pypi.org/project/langchain-aws/) | [✅](https://www.npmjs.com/package/@langchain/aws) |
| [Ollama](/oss/python/integrations/providers/ollama) | [`langchain-ollama`](https://reference.langchain.com/python/integrations/langchain_ollama/) | [Downloads per month](https://pypi.org/project/langchain-ollama/) | [PyPI - Latest version](https://pypi.org/project/langchain-ollama/) | [✅](https://www.npmjs.com/package/@langchain/ollama) |
| [MongoDB](/oss/python/integrations/providers/mongodb_atlas) | [`langchain-mongodb`](https://reference.langchain.com/python/integrations/langchain_mongodb/) | [Downloads per month](https://pypi.org/project/langchain-mongodb/) | [PyPI - Latest version](https://pypi.org/project/langchain-mongodb/) | [✅](https://www.npmjs.com/package/@langchain/mongodb) |
| [Groq](/oss/python/integrations/providers/groq) | [`langchain-groq`](https://reference.langchain.com/python/integrations/langchain_groq/) | [Downloads per month](https://pypi.org/project/langchain-groq/) | [PyPI - Latest version](https://pypi.org/project/langchain-groq/) | [✅](https://www.npmjs.com/package/@langchain/groq) |
| [Databricks](/oss/python/integrations/providers/databricks) | [`databricks-langchain`](https://pypi.org/project/databricks-langchain/) | [Downloads per month](https://pypi.org/project/databricks-langchain/) | [PyPI - Latest version](https://pypi.org/project/databricks-langchain/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Chroma](/oss/python/integrations/providers/chroma) | [`langchain-chroma`](https://reference.langchain.com/python/integrations/langchain_chroma/) | [Downloads per month](https://pypi.org/project/langchain-chroma/) | [PyPI - Latest version](https://pypi.org/project/langchain-chroma/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Huggingface](/oss/python/integrations/providers/huggingface) | [`langchain-huggingface`](https://reference.langchain.com/python/integrations/langchain_huggingface/) | [Downloads per month](https://pypi.org/project/langchain-huggingface/) | [PyPI - Latest version](https://pypi.org/project/langchain-huggingface/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Nvidia AI Endpoints](/oss/python/integrations/providers/nvidia) | [`langchain-nvidia-ai-endpoints`](https://reference.langchain.com/python/integrations/langchain_nvidia_ai_endpoints/) | [Downloads per month](https://pypi.org/project/langchain-nvidia-ai-endpoints/) | [PyPI - Latest version](https://pypi.org/project/langchain-nvidia-ai-endpoints/) | ❌ |
| [Postgres](/oss/python/integrations/providers/pgvector) | [`langchain-postgres`](https://reference.langchain.com/python/integrations/langchain_postgres/) | [Downloads per month](https://pypi.org/project/langchain-postgres/) | [PyPI - Latest version](https://pypi.org/project/langchain-postgres/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [MistralAI](/oss/python/integrations/providers/mistralai) | [`langchain-mistralai`](https://reference.langchain.com/python/integrations/langchain_mistralai/) | [Downloads per month](https://pypi.org/project/langchain-mistralai/) | [PyPI - Latest version](https://pypi.org/project/langchain-mistralai/) | [✅](https://www.npmjs.com/package/@langchain/mistralai) |
| [Pinecone](/oss/python/integrations/providers/pinecone) | [`langchain-pinecone`](https://reference.langchain.com/python/integrations/langchain_pinecone/) | [Downloads per month](https://pypi.org/project/langchain-pinecone/) | [PyPI - Latest version](https://pypi.org/project/langchain-pinecone/) | [✅](https://www.npmjs.com/package/@langchain/pinecone) |
| [Cohere](/oss/python/integrations/providers/cohere) | [`langchain-cohere`](https://reference.langchain.com/python/integrations/langchain_cohere/) | [Downloads per month](https://pypi.org/project/langchain-cohere/) | [PyPI - Latest version](https://pypi.org/project/langchain-cohere/) | [✅](https://www.npmjs.com/package/@langchain/cohere) |
| [LiteLLM](/oss/python/integrations/providers/litellm) | [`langchain-litellm`](https://pypi.org/project/langchain-litellm/) | [Downloads per month](https://pypi.org/project/langchain-litellm/) | [PyPI - Latest version](https://pypi.org/project/langchain-litellm/) | N/A |
| [xAI (Grok)](/oss/python/integrations/providers/xai) | [`langchain-xai`](https://reference.langchain.com/python/integrations/langchain_xai/) | [Downloads per month](https://pypi.org/project/langchain-xai/) | [PyPI - Latest version](https://pypi.org/project/langchain-xai/) | [✅](https://www.npmjs.com/package/@langchain/xai) |
| [DeepSeek](/oss/python/integrations/providers/deepseek) | [`langchain-deepseek`](https://reference.langchain.com/python/integrations/langchain_deepseek/) | [Downloads per month](https://pypi.org/project/langchain-deepseek/) | [PyPI - Latest version](https://pypi.org/project/langchain-deepseek/) | [✅](https://www.npmjs.com/package/@langchain/deepseek) |
| [Fireworks](/oss/python/integrations/providers/fireworks) | [`langchain-fireworks`](https://reference.langchain.com/python/integrations/langchain_fireworks/) | [Downloads per month](https://pypi.org/project/langchain-fireworks/) | [PyPI - Latest version](https://pypi.org/project/langchain-fireworks/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Qdrant](/oss/python/integrations/providers/qdrant) | [`langchain-qdrant`](https://reference.langchain.com/python/integrations/langchain_qdrant/) | [Downloads per month](https://pypi.org/project/langchain-qdrant/) | [PyPI - Latest version](https://pypi.org/project/langchain-qdrant/) | [✅](https://www.npmjs.com/package/@langchain/qdrant) |
| [Tavily](/oss/python/integrations/providers/tavily) | [`langchain-tavily`](https://reference.langchain.com/python/integrations/langchain_tavily/) | [Downloads per month](https://pypi.org/project/langchain-tavily/) | [PyPI - Latest version](https://pypi.org/project/langchain-tavily/) | [✅](https://www.npmjs.com/package/@langchain/tavily) |
| [Milvus](/oss/python/integrations/providers/milvus) | [`langchain-milvus`](https://reference.langchain.com/python/integrations/langchain_milvus/) | [Downloads per month](https://pypi.org/project/langchain-milvus/) | [PyPI - Latest version](https://pypi.org/project/langchain-milvus/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [IBM](/oss/python/integrations/providers/ibm) | [`langchain-ibm`](https://reference.langchain.com/python/integrations/langchain_ibm/) | [Downloads per month](https://pypi.org/project/langchain-ibm/) | [PyPI - Latest version](https://pypi.org/project/langchain-ibm/) | [✅](https://www.npmjs.com/package/@langchain/ibm) |
| [Azure AI](/oss/python/integrations/providers/azure_ai) | [`langchain-azure-ai`](https://reference.langchain.com/python/integrations/langchain_azure_ai/) | [Downloads per month](https://pypi.org/project/langchain-azure-ai/) | [PyPI - Latest version](https://pypi.org/project/langchain-azure-ai/) | [✅](https://www.npmjs.com/package/@langchain/openai) |
| [Elasticsearch](/oss/python/integrations/providers/elasticsearch) | [`langchain-elasticsearch`](https://reference.langchain.com/python/integrations/langchain_elasticsearch/) | [Downloads per month](https://pypi.org/project/langchain-elasticsearch/) | [PyPI - Latest version](https://pypi.org/project/langchain-elasticsearch/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [DataStax Astra DB](/oss/python/integrations/providers/astradb) | [`langchain-astradb`](https://reference.langchain.com/python/integrations/langchain_astradb/) | [Downloads per month](https://pypi.org/project/langchain-astradb/) | [PyPI - Latest version](https://pypi.org/project/langchain-astradb/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Perplexity](/oss/python/integrations/providers/perplexity) | [`langchain-perplexity`](https://reference.langchain.com/python/integrations/langchain_perplexity/) | [Downloads per month](https://pypi.org/project/langchain-perplexity/) | [PyPI - Latest version](https://pypi.org/project/langchain-perplexity/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Redis](/oss/python/integrations/providers/redis) | [`langchain-redis`](https://reference.langchain.com/python/integrations/langchain_redis/) | [Downloads per month](https://pypi.org/project/langchain-redis/) | [PyPI - Latest version](https://pypi.org/project/langchain-redis/) | [✅](https://www.npmjs.com/package/@langchain/redis) |
| [Together](/oss/python/integrations/providers/together) | [`langchain-together`](https://reference.langchain.com/python/integrations/langchain_together/) | [Downloads per month](https://pypi.org/project/langchain-together/) | [PyPI - Latest version](https://pypi.org/project/langchain-together/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [OpenRouter](/oss/python/integrations/providers/openrouter) | [`langchain-openrouter`](https://reference.langchain.com/python/integrations/langchain_openrouter/) | [Downloads per month](https://pypi.org/project/langchain-openrouter/) | [PyPI - Latest version](https://pypi.org/project/langchain-openrouter/) | ❌ |
| [MCP Toolbox (Google)](/oss/python/integrations/providers/toolbox) | [`toolbox-langchain`](https://pypi.org/project/toolbox-langchain/) | [Downloads per month](https://pypi.org/project/toolbox-langchain/) | [PyPI - Latest version](https://pypi.org/project/toolbox-langchain/) | ❌ |
| [Google (Community)](/oss/python/integrations/providers/google) | [`langchain-google-community`](https://reference.langchain.com/python/integrations/langchain_google_community/) | [Downloads per month](https://pypi.org/project/langchain-google-community/) | [PyPI - Latest version](https://pypi.org/project/langchain-google-community/) | ❌ |
| [Nebius](/oss/python/integrations/providers/nebius) | [`langchain-nebius`](https://pypi.org/project/langchain-nebius/) | [Downloads per month](https://pypi.org/project/langchain-nebius/) | [PyPI - Latest version](https://pypi.org/project/langchain-nebius/) | ❌ |
| [Unstructured](/oss/python/integrations/providers/unstructured) | [`langchain-unstructured`](https://reference.langchain.com/python/integrations/langchain_unstructured/) | [Downloads per month](https://pypi.org/project/langchain-unstructured/) | [PyPI - Latest version](https://pypi.org/project/langchain-unstructured/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Neo4J](/oss/python/integrations/providers/neo4j) | [`langchain-neo4j`](https://reference.langchain.com/python/integrations/langchain_neo4j/) | [Downloads per month](https://pypi.org/project/langchain-neo4j/) | [PyPI - Latest version](https://pypi.org/project/langchain-neo4j/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Sambanova](/oss/python/integrations/providers/sambanova) | [`langchain-sambanova`](https://pypi.org/project/langchain-sambanova/) | [Downloads per month](https://pypi.org/project/langchain-sambanova/) | [PyPI - Latest version](https://pypi.org/project/langchain-sambanova/) | ❌ |
| [Graph RAG](/oss/python/integrations/providers/graph_rag) | [`langchain-graph-retriever`](https://pypi.org/project/langchain-graph-retriever/) | [Downloads per month](https://pypi.org/project/langchain-graph-retriever/) | [PyPI - Latest version](https://pypi.org/project/langchain-graph-retriever/) | ❌ |
| [Cerebras](/oss/python/integrations/providers/cerebras) | [`langchain-cerebras`](https://reference.langchain.com/python/integrations/langchain_cerebras/) | [Downloads per month](https://pypi.org/project/langchain-cerebras/) | [PyPI - Latest version](https://pypi.org/project/langchain-cerebras/) | [✅](https://www.npmjs.com/package/@langchain/cerebras) |

## [​](#all-providers) All providers

See [all providers](/oss/python/integrations/providers/all_providers) or search for a provider using the search field.
Community integrations can be found in [`langchain-community`](https://github.com/langchain-ai/langchain-community).

Want to build your own integration? See [how to create a custom integration package](/oss/python/contributing/integrations-langchain).

---

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).

[Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.

Was this page helpful?

YesNo

[All LangChain Python integration providers

Next](/oss/python/integrations/providers/all_providers)

⌘I