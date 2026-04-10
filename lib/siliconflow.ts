/**
 * 向量调用统一出口（历史文件名保留；实际支持 SiliconFlow / 百炼 DashScope）。
 */
export {
  embedTexts,
  getExpectedEmbeddingDimension,
} from "@/lib/ai/siliconflow";

type OpenAiLikeEmbeddingResponse = {
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

/**
 * 获取单条文本向量（SiliconFlow）。
 *
 * - endpoint: 默认 https://api.siliconflow.cn/v1/embeddings，可用 SILICONFLOW_EMBEDDING_ENDPOINT 覆盖
 * - model: 默认 BAAI/bge-m3，可用 SILICONFLOW_EMBEDDING_MODEL 覆盖
 */
export async function getEmbedding(input: string): Promise<number[]> {
  const apiKey = mustGetEnv("SILICONFLOW_API_KEY");

  const endpoint =
    process.env.SILICONFLOW_EMBEDDING_ENDPOINT?.trim() ||
    DEFAULT_EMBEDDING_ENDPOINT;
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
      input: [input],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `SiliconFlow embedding 请求失败: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  const json = (await res.json()) as OpenAiLikeEmbeddingResponse;
  const vec = json.data?.[0]?.embedding;
  if (!vec || !Array.isArray(vec)) {
    throw new Error("SiliconFlow embedding 响应缺少 data[0].embedding");
  }
  return vec;
}
