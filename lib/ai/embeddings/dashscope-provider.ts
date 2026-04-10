import { getExpectedEmbeddingDimension } from "@/lib/ai/embeddings/dimension";

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

/** 中国大陆；新加坡等国际站见百炼文档，可用 DASHSCOPE_EMBEDDING_BASE_URL 覆盖 */
const DEFAULT_DASHSCOPE_COMPAT_BASE =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";

const DEFAULT_DASHSCOPE_MODEL = "text-embedding-v3";

/** 百炼兼容 OpenAI 的 embeddings 接口单次条数保守上限 */
const DASHSCOPE_INPUT_BATCH = 25;

/**
 * 阿里云百炼 / DashScope（OpenAI-compatible `/v1/embeddings`）。
 * 需 DASHSCOPE_API_KEY；模型默认 text-embedding-v3，维度由 EMBEDDING_DIM（默认 1024）与库表对齐。
 */
export async function embedTextsDashScope(texts: string[]): Promise<number[][]> {
  const apiKey = mustGetEnv("DASHSCOPE_API_KEY");
  const base =
    process.env.DASHSCOPE_EMBEDDING_BASE_URL?.trim() || DEFAULT_DASHSCOPE_COMPAT_BASE;
  const endpoint = `${base.replace(/\/$/, "")}/embeddings`;
  const model =
    process.env.DASHSCOPE_EMBEDDING_MODEL?.trim() || DEFAULT_DASHSCOPE_MODEL;
  const dimensions = getExpectedEmbeddingDimension();

  const all: number[][] = [];

  for (let i = 0; i < texts.length; i += DASHSCOPE_INPUT_BATCH) {
    const slice = texts.slice(i, i + DASHSCOPE_INPUT_BATCH);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: slice,
        dimensions,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `DashScope(百炼) embedding 请求失败: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
      );
    }

    const json = (await res.json()) as OpenAiLikeEmbeddingResponse;
    const batchVectors = json.data
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);

    if (batchVectors.length !== slice.length) {
      throw new Error(
        `DashScope Embedding 条数不一致: 得到 ${batchVectors.length}，期望 ${slice.length}`,
      );
    }
    all.push(...batchVectors);
  }

  return all;
}
