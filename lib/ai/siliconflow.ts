type SiliconFlowEmbeddingResponse = {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
};

function mustGetEnv(key: string) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

export async function embedTexts(texts: string[]) {
  const apiKey = mustGetEnv("SILICONFLOW_API_KEY");

  // 兼容：允许用户通过环境变量覆盖 endpoint/model（不同账号/区域可能不同）
  const endpoint =
    process.env.SILICONFLOW_EMBEDDING_ENDPOINT ??
    "https://api.siliconflow.cn/v1/embeddings";
  const model = process.env.SILICONFLOW_EMBEDDING_MODEL ?? "BAAI/bge-m3";

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

