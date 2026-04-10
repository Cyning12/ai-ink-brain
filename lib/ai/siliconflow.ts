type SiliconFlowEmbeddingResponse = {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
};

function mustGetEnv(key: string) {
  const v = process.env[key]?.trim();
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

const DEFAULT_EMBEDDING_ENDPOINT = "https://api.siliconflow.cn/v1/embeddings";
const DEFAULT_EMBEDDING_MODEL = "BAAI/bge-m3";

export async function embedTexts(texts: string[]) {
  const apiKey = mustGetEnv("SILICONFLOW_API_KEY");

  // 空字符串须视为未配置（.env 里常写 SILICONFLOW_EMBEDDING_ENDPOINT= 占位）
  const endpoint =
    process.env.SILICONFLOW_EMBEDDING_ENDPOINT?.trim() || DEFAULT_EMBEDDING_ENDPOINT;
  const model =
    process.env.SILICONFLOW_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `SiliconFlow embedding request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  const json = (await res.json()) as SiliconFlowEmbeddingResponse;
  const vectors = json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);

  if (vectors.length !== texts.length) {
    throw new Error(
      `Embedding count mismatch: got ${vectors.length}, expected ${texts.length}`,
    );
  }
  return vectors;
}

